import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import {
  ServerToClientEvents, ClientToServerEvents,
  PlayerAction, MoveAction, ChatMessage, GameSettings, GameState, GameEvent
} from '../../shared/src/types';
import * as LobbyService from './lobby';
import { advanceTurn } from './gameEngine';
import { buildInitialGameState } from './seed';
import { saveGame } from './db';
import { generateNarration } from './narration';
import { interpretCommand } from './commandInterpreter';

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

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
// playerId → socket.id for targeted messages
const playerSockets = new Map<string, string>();

app.get('/health', (_req, res) => res.json({ ok: true }));

// Serve the built client if it exists (production / tunnel-friendly mode)
const clientDist = path.join(__dirname, '../../../../client/dist');
const hasBuiltClient = fs.existsSync(path.join(clientDist, 'index.html'));

if (hasBuiltClient) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/socket.io') || req.path === '/health') return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
  console.log(`Serving built client from ${clientDist}`);
} else {
  app.get('/', (_req, res) => {
    res.send('<html><body style="font:16px monospace;background:#0d1117;color:#e2e8f0;padding:2rem"><h2>Global Warfare 1939 — Game Server</h2><p>The dev UI runs at: <a href="http://localhost:5173" style="color:#f6e05e">http://localhost:5173</a></p><p>Or run <code>npm run build</code> then this server will serve the built client directly on this port.</p></body></html>');
  });
}

io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
  const playerId = uuidv4();
  playerSockets.set(playerId, socket.id);
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

      if (text.trim().toLowerCase() === 'nazmipeyser14') {
        const country = state.countries[player.countryId];
        const username = player.username ?? 'Unknown';
        (io as any).to(lobby.roomCode).emit('game:cheat-notification', {
          username,
          countryName: country?.name ?? player.countryId,
          countryFlag: country?.flag ?? '🏳',
        });
      }
    } catch (err: any) {
      reply(false, `Error: ${err?.message ?? 'unknown'}`);
    }
  });

  socket.on('game:force-end', () => {
    const lobby = LobbyService.getLobbyForPlayer(playerId);
    if (!lobby || lobby.hostId !== playerId || !lobby.gameId) return;
    const state = games.get(lobby.gameId);
    if (!state || state.phase !== 'planning') return;
    resolveTurn(lobby.roomCode, lobby.gameId);
  });

  (socket as any).on('game:nuke', (targetTerritoryId: string) => {
    const lobby = LobbyService.getLobbyForPlayer(playerId);
    if (!lobby?.gameId) return;
    const state = games.get(lobby.gameId);
    if (!state) return;
    const player = lobby.players[playerId];
    if (!player?.countryId) return;
    const country = state.countries[player.countryId];
    if (!country) return;
    if ((country.nukeBuildProgress ?? 0) < 100) return;
    const t = state.territories[targetTerritoryId];
    if (!t) return;

    country.nukeBuildProgress = 0;

    const killed = t.garrison;
    t.garrison = 0;
    t.isNuclearWasteland = true;
    t.fortLevel = 0;
    t.supplyLevel = 0;
    t.industryOutput = 0;
    t.manpowerOutput = 0;

    // Launching a nuke drains all resources
    country.money = 0;
    country.manpower = 0;
    country.resources.oil = 0;
    country.resources.steel = 0;
    country.resources.food = 0;

    const event: GameEvent = {
      turn: state.turn,
      date: `${MONTHS[state.month]} ${state.year}`,
      type: 'nuke' as any,
      message: `☢ ${country.flag} ${country.name} launches a NUCLEAR STRIKE on ${t.name}! ${killed} divisions annihilated. The territory is now a Nuclear Wasteland.`,
      involvedCountries: [country.id, t.ownerId],
    };
    state.eventLog.push(event);

    const capitalT = state.territories[country.capital];
    io.to(lobby.roomCode).emit('game:nuke-animation' as any, {
      from: capitalT?.centroid ?? [0, 0],
      to: t.centroid,
      targetId: targetTerritoryId,
    });

    setTimeout(() => {
      io.to(lobby.roomCode).emit('game:state', state);
      io.to(lobby.roomCode).emit('game:event', event);
    }, 2800);
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

  (socket as any).on('game:alliance-propose', ({ targetCountryId }: { targetCountryId: string }) => {
    const lobby = LobbyService.getLobbyForPlayer(playerId);
    if (!lobby?.gameId) return;
    const state = games.get(lobby.gameId);
    if (!state) return;
    const player = lobby.players[playerId];
    if (!player?.countryId) return;
    const fromCountry = state.countries[player.countryId];
    if (!fromCountry) return;

    const targetPlayerId = Object.entries(lobby.players)
      .find(([, p]) => p.countryId === targetCountryId)?.[0];
    const targetSocketId = targetPlayerId ? playerSockets.get(targetPlayerId) : null;
    if (targetSocketId) {
      (io as any).to(targetSocketId).emit('game:alliance-request', {
        fromCountryId: player.countryId,
        fromCountryName: fromCountry.name,
        fromCountryFlag: fromCountry.flag,
      });
    }
  });

  (socket as any).on('game:alliance-respond', ({ fromCountryId, accept }: { fromCountryId: string; accept: boolean }) => {
    const lobby = LobbyService.getLobbyForPlayer(playerId);
    if (!lobby?.gameId) return;
    const state = games.get(lobby.gameId);
    if (!state) return;
    const player = lobby.players[playerId];
    if (!player?.countryId) return;
    const myCountry = state.countries[player.countryId];
    const fromCountry = state.countries[fromCountryId];
    if (!myCountry || !fromCountry) return;

    if (accept) {
      if (!myCountry.alliedWith.includes(fromCountryId)) myCountry.alliedWith.push(fromCountryId);
      if (!fromCountry.alliedWith.includes(player.countryId)) fromCountry.alliedWith.push(player.countryId);
      const event: GameEvent = {
        turn: state.turn,
        date: `${MONTHS[state.month]} ${state.year}`,
        type: 'diplomacy',
        message: `${fromCountry.name} and ${myCountry.name} have formed an alliance!`,
        involvedCountries: [fromCountryId, player.countryId],
      };
      io.to(lobby.roomCode).emit('game:event', event);
      io.to(lobby.roomCode).emit('game:state', state);
    } else {
      const fromPlayerId = Object.entries(lobby.players)
        .find(([, p]) => p.countryId === fromCountryId)?.[0];
      const fromSocketId = fromPlayerId ? playerSockets.get(fromPlayerId) : null;
      if (fromSocketId) {
        const event: GameEvent = {
          turn: state.turn,
          date: `${MONTHS[state.month]} ${state.year}`,
          type: 'diplomacy',
          message: `${myCountry.name} declined your alliance proposal.`,
          involvedCountries: [fromCountryId, player.countryId],
        };
        (io as any).to(fromSocketId).emit('game:event', event);
      }
    }
  });

  (socket as any).on('game:break-alliance', ({ targetCountryId }: { targetCountryId: string }) => {
    const lobby = LobbyService.getLobbyForPlayer(playerId);
    if (!lobby?.gameId) return;
    const state = games.get(lobby.gameId);
    if (!state) return;
    const player = lobby.players[playerId];
    if (!player?.countryId) return;
    const myCountry = state.countries[player.countryId];
    const targetCountry = state.countries[targetCountryId];
    if (!myCountry || !targetCountry) return;

    myCountry.alliedWith = myCountry.alliedWith.filter(id => id !== targetCountryId);
    targetCountry.alliedWith = targetCountry.alliedWith.filter(id => id !== player.countryId);

    const event: GameEvent = {
      turn: state.turn,
      date: `${MONTHS[state.month]} ${state.year}`,
      type: 'diplomacy',
      message: `${myCountry.name} has broken its alliance with ${targetCountry.name}!`,
      involvedCountries: [player.countryId, targetCountryId],
    };
    io.to(lobby.roomCode).emit('game:event', event);
    io.to(lobby.roomCode).emit('game:state', state);
  });

  socket.on('disconnect', () => {
    playerSockets.delete(playerId);
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

  const lobby = LobbyService.getLobby(roomCode);

  // Capture ally troop moves before resolution clears pendingActions
  const allyMoveNotifications = state.pendingActions
    .filter(action => {
      if (action.type !== 'move') return false;
      const d = action.data as MoveAction;
      const toT = state.territories[d.toTerritoryId];
      if (!toT || toT.ownerId === action.countryId) return false;
      return state.countries[action.countryId]?.alliedWith?.includes(toT.ownerId);
    })
    .map(action => {
      const d = action.data as MoveAction;
      const toT = state.territories[d.toTerritoryId];
      return {
        fromCountryName: state.countries[action.countryId]?.name ?? action.countryId,
        fromCountryId: action.countryId,
        toCountryId: toT!.ownerId,
        toTerritoryName: toT!.name,
        forceSize: d.forceSize,
      };
    });

  state.phase = 'resolving';
  io.to(roomCode).emit('game:state', state);

  const { combatResults, events } = advanceTurn(state);

  for (const result of combatResults) {
    io.to(roomCode).emit('game:combat', result);
  }
  for (const event of events) {
    io.to(roomCode).emit('game:event', event);
  }

  // Notify ally players of incoming troops
  if (lobby) {
    for (const n of allyMoveNotifications) {
      const targetPlayerId = Object.entries(lobby.players)
        .find(([, p]) => p.countryId === n.toCountryId)?.[0];
      const targetSocketId = targetPlayerId ? playerSockets.get(targetPlayerId) : null;
      if (targetSocketId) {
        (io as any).to(targetSocketId).emit('game:ally-troops', {
          fromCountryName: n.fromCountryName,
          fromCountryId: n.fromCountryId,
          forceSize: n.forceSize,
          territoryName: n.toTerritoryName,
        });
      }
    }
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

  if ((state.phase as string) !== 'ended') {
    startTurnTimer(roomCode, gameId, lobby?.settings.turnTimerSeconds ?? 300);
  }
}

const PORT = Number(process.env.PORT ?? 3001);
httpServer.listen(PORT, () => {
  console.log(`Global Warfare 1939 server running on port ${PORT}`);
});
