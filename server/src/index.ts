import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import {
  ServerToClientEvents, ClientToServerEvents,
  PlayerAction, ChatMessage, GameSettings, GameState
} from '../../shared/src/types';
import * as LobbyService from './lobby';
import { advanceTurn } from './gameEngine';
import { buildInitialGameState } from './seed';
import { saveGame } from './db';
import { generateNarration } from './narration';
import { interpretCommand } from './commandInterpreter';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// In-memory game states
const games = new Map<string, GameState>();
// Timer per room
const turnTimers = new Map<string, ReturnType<typeof setInterval>>();

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/', (_req, res) => {
  res.send('<html><body style="font:16px monospace;background:#0d1117;color:#e2e8f0;padding:2rem"><h2>Global Warfare 1939 — Game Server</h2><p>The game UI runs at: <a href="http://localhost:5173" style="color:#f6e05e">http://localhost:5173</a></p><p>This port (3001) is the Socket.IO API server only.</p></body></html>');
});

io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
  const playerId = uuidv4();
  console.log(`Client connected: ${playerId}`);
  socket.emit('connected', playerId);

  socket.on('lobby:create', (username, settings, callback) => {
    const lobby = LobbyService.createLobby(playerId, settings);
    LobbyService.setUsername(playerId, username);
    socket.join(lobby.roomCode);
    const updated = LobbyService.getLobby(lobby.roomCode)!;
    callback(updated);
    io.to(lobby.roomCode).emit('lobby:updated', updated);
  });

  socket.on('lobby:join', (username, roomCode, callback) => {
    const lobby = LobbyService.joinLobby(playerId, roomCode);
    if (!lobby) { callback(null, 'Room not found or game already started'); return; }
    LobbyService.setUsername(playerId, username);
    socket.join(lobby.roomCode);
    const updated = LobbyService.getLobby(lobby.roomCode)!;
    callback(updated);
    io.to(lobby.roomCode).emit('lobby:updated', updated);
  });

  socket.on('lobby:solo', (username, callback) => {
    // Create a solo lobby, assign Germany to host, start immediately
    const lobby = LobbyService.createLobby(playerId, { maxPlayers: 1 });
    LobbyService.setUsername(playerId, username);
    socket.join(lobby.roomCode);

    LobbyService.pickCountry(playerId, 'germany');
    LobbyService.setReady(playerId, true);

    const result = LobbyService.startGame(playerId);
    if (!result) {
      callback(LobbyService.getLobby(lobby.roomCode)!);
      return;
    }

    const { lobby: startedLobby, gameId } = result;
    const gameState = buildInitialGameState(startedLobby.roomCode, gameId);

    // Mark the human player's country
    gameState.countries['germany'].isHuman = true;

    games.set(gameId, gameState);
    saveGame(gameState);

    callback(startedLobby);
    io.to(startedLobby.roomCode).emit('lobby:updated', startedLobby);
    io.to(startedLobby.roomCode).emit('game:state', gameState);

    startTurnTimer(startedLobby.roomCode, gameId, gameState.turnTimerSeconds);
  });

  socket.on('lobby:pick-country', (countryId) => {
    const lobby = LobbyService.pickCountry(playerId, countryId);
    if (lobby) io.to(lobby.roomCode).emit('lobby:updated', lobby);
  });

  socket.on('lobby:ready', () => {
    const lobby = LobbyService.getLobbyForPlayer(playerId);
    if (!lobby) return;
    const player = lobby.players[playerId];
    LobbyService.setReady(playerId, !player?.isReady);
    const updated = LobbyService.getLobby(lobby.roomCode)!;
    io.to(lobby.roomCode).emit('lobby:updated', updated);
  });

  socket.on('lobby:start', () => {
    const result = LobbyService.startGame(playerId);
    if (!result) return;
    const { lobby, gameId } = result;

    const gameState = buildInitialGameState(lobby.roomCode, gameId);

    // Mark human players' countries
    for (const player of Object.values(lobby.players)) {
      if (player.countryId && gameState.countries[player.countryId]) {
        gameState.countries[player.countryId].isHuman = true;
      }
    }

    games.set(gameId, gameState);
    saveGame(gameState);

    io.to(lobby.roomCode).emit('lobby:updated', lobby);
    io.to(lobby.roomCode).emit('game:state', gameState);

    startTurnTimer(lobby.roomCode, gameId, gameState.turnTimerSeconds);
  });

  socket.on('game:submit-actions', (actions: PlayerAction[]) => {
    const lobby = LobbyService.getLobbyForPlayer(playerId);
    if (!lobby?.gameId) return;
    const state = games.get(lobby.gameId);
    if (!state || state.phase !== 'planning') return;

    if (!state.submittedPlayers.includes(playerId)) {
      state.submittedPlayers.push(playerId);
      state.pendingActions.push(...actions);
    }

    io.to(lobby.roomCode).emit('lobby:updated', lobby);

    const humanCountries = Object.values(state.countries).filter(c => c.isHuman);
    if (state.submittedPlayers.length >= humanCountries.length) {
      resolveTurn(lobby.roomCode, lobby.gameId);
    }
  });

  socket.on('game:command', ({ reqId, text }) => {
    const reply = (ok: boolean, message: string, action?: any) => {
      socket.emit('game:command:result', { reqId, ok, message, action });
    };
    try {
      const lobby = LobbyService.getLobbyForPlayer(playerId);
      if (!lobby?.gameId) { reply(false, 'No active game.'); return; }
      const state = games.get(lobby.gameId);
      if (!state || state.phase !== 'planning') { reply(false, 'Not in planning phase.'); return; }
      const player = lobby.players[playerId];
      if (!player?.countryId) { reply(false, 'No country assigned.'); return; }

      const result = interpretCommand(text, state, player.countryId);
      reply(result.ok, result.message, result.action);
    } catch (err: any) {
      reply(false, `Error: ${err?.message ?? 'unknown'}`);
    }
  });

  socket.on('chat:send', ({ channel, text }) => {
    const lobby = LobbyService.getLobbyForPlayer(playerId);
    if (!lobby) return;
    const player = lobby.players[playerId];
    const msg: ChatMessage = {
      id: uuidv4(),
      senderId: playerId,
      senderName: player?.username ?? 'Unknown',
      channel,
      text: text.slice(0, 500),
      timestamp: Date.now(),
    };
    io.to(lobby.roomCode).emit('chat:message', msg);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${playerId}`);
    const lobby = LobbyService.setPlayerOnline(playerId, false);
    if (lobby) io.to(lobby.roomCode).emit('lobby:updated', lobby);
  });
});

function startTurnTimer(roomCode: string, gameId: string, seconds: number): void {
  clearInterval(turnTimers.get(roomCode));
  let remaining = seconds;

  const interval = setInterval(() => {
    remaining -= 1;
    io.to(roomCode).emit('game:timer', remaining);
    if (remaining <= 0) {
      clearInterval(interval);
      turnTimers.delete(roomCode);
      resolveTurn(roomCode, gameId);
    }
  }, 1000);

  turnTimers.set(roomCode, interval);
}

async function resolveTurn(roomCode: string, gameId: string): Promise<void> {
  const state = games.get(gameId);
  if (!state || state.phase !== 'planning') return;

  state.phase = 'resolving';
  io.to(roomCode).emit('game:state', state);

  const { combatResults, events } = advanceTurn(state);

  for (const result of combatResults) {
    io.to(roomCode).emit('game:combat', result);
  }
  for (const event of events) {
    io.to(roomCode).emit('game:event', event);
  }

  saveGame(state);
  io.to(roomCode).emit('game:state', state);

  // Optional LLM narration
  if (events.length > 0) {
    generateNarration(state, events).then(text => {
      if (text) {
        const narrationEvent = {
          turn: state.turn,
          date: `${state.year}-${String(state.month + 1).padStart(2, '0')}`,
          type: 'narration' as const,
          message: text,
          involvedCountries: [],
        };
        io.to(roomCode).emit('game:event', narrationEvent);
      }
    }).catch(() => {});
  }

  if (state.phase === 'planning') {
    const lobby = LobbyService.getLobby(roomCode);
    startTurnTimer(roomCode, gameId, lobby?.settings.turnTimerSeconds ?? 90);
  }
}

const PORT = process.env.PORT ?? 3001;
httpServer.listen(PORT, () => {
  console.log(`Global Warfare 1939 server running on port ${PORT}`);
});
