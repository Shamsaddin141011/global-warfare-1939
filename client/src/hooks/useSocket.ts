import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../lib/socket';
import {
  GameState, Lobby, CombatResult, GameEvent, ChatMessage, CommandResult
} from '@shared/types';
import { v4 as uuidv4 } from 'uuid';

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export interface RoundRecap {
  turn: number;
  date: string;
  combats: CombatResult[];
  events: GameEvent[];
}

export interface NukeAnimationData {
  from: [number, number];
  to: [number, number];
  targetId: string;
}

export interface CheatNotification {
  username: string;
  countryName: string;
  countryFlag: string;
}

export interface SocketState {
  connected: boolean;
  playerId: string | null;
  lobby: Lobby | null;
  gameState: GameState | null;
  combatQueue: CombatResult[];
  chatMessages: ChatMessage[];
  timerSeconds: number;
  lastEvents: GameEvent[];
  lastRoundRecap: RoundRecap | null;
  nukeAnimation: NukeAnimationData | null;
  cheatNotification: CheatNotification | null;
}

export function useSocket() {
  const [state, setState] = useState<SocketState>({
    connected: false,
    playerId: null,
    lobby: null,
    gameState: null,
    combatQueue: [],
    chatMessages: [],
    timerSeconds: 300,
    lastEvents: [],
    lastRoundRecap: null,
    nukeAnimation: null,
    cheatNotification: null,
  });

  const socket = getSocket();
  const roundBufferRef = useRef<{ combats: CombatResult[]; events: GameEvent[]; lastTurn: number }>({
    combats: [], events: [], lastTurn: -1,
  });

  useEffect(() => {
    socket.on('connect', () => setState(s => ({ ...s, connected: true })));
    socket.on('disconnect', () => setState(s => ({ ...s, connected: false })));
    socket.on('connected', (id) => setState(s => ({ ...s, playerId: id })));
    socket.on('lobby:updated', (lobby) => setState(s => ({ ...s, lobby })));
    socket.on('game:state', (gs) => setState(s => {
      const buf = roundBufferRef.current;
      let lastRoundRecap = s.lastRoundRecap;
      if (buf.lastTurn < 0) {
        buf.lastTurn = gs.turn;
      } else if (gs.turn > buf.lastTurn) {
        lastRoundRecap = {
          turn: buf.lastTurn,
          date: `${MONTHS[gs.month] ?? ''} ${gs.year}`,
          combats: buf.combats.slice(),
          events: buf.events.slice(),
        };
        roundBufferRef.current = { combats: [], events: [], lastTurn: gs.turn };
      }
      return { ...s, gameState: gs, lastRoundRecap };
    }));
    socket.on('game:combat', (r) => {
      roundBufferRef.current.combats.push(r);
      setState(s => ({ ...s, combatQueue: [...s.combatQueue, r] }));
    });
    socket.on('game:event', (e) => {
      roundBufferRef.current.events.push(e);
      setState(s => ({ ...s, lastEvents: [e, ...s.lastEvents].slice(0, 50) }));
    });
    socket.on('game:timer', (t) => setState(s => ({ ...s, timerSeconds: t })));
    socket.on('chat:message', (m) => setState(s => ({ ...s, chatMessages: [...s.chatMessages, m] })));
    (socket as any).on('game:cheat-notification', (data: CheatNotification) => {
      setState(s => ({ ...s, cheatNotification: data }));
      setTimeout(() => setState(s => ({ ...s, cheatNotification: null })), 5000);
    });
    (socket as any).on('game:nuke-animation', (data: NukeAnimationData) => {
      setState(s => ({ ...s, nukeAnimation: data }));
      setTimeout(() => setState(s => ({ ...s, nukeAnimation: null })), 3200);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connected');
      socket.off('lobby:updated');
      socket.off('game:state');
      socket.off('game:combat');
      socket.off('game:event');
      socket.off('game:timer');
      socket.off('chat:message');
    };
  }, [socket]);

  function createLobby(username: string) {
    return new Promise<Lobby>((resolve) => {
      socket.emit('lobby:create', username, {}, resolve);
    });
  }

  function joinLobby(username: string, roomCode: string) {
    return new Promise<{ lobby: Lobby | null; error?: string }>((resolve) => {
      socket.emit('lobby:join', username, roomCode, (lobby, error) => resolve({ lobby, error }));
    });
  }

  function pickCountry(countryId: string) {
    socket.emit('lobby:pick-country', countryId);
  }

  function toggleReady() {
    socket.emit('lobby:ready');
  }

  function startGame() {
    socket.emit('lobby:start');
  }

  function submitActions(actions: Parameters<typeof socket.emit>[1]) {
    socket.emit('game:submit-actions', actions as any);
  }

  function forceEndTurn() {
    socket.emit('game:force-end');
  }

  function sendChat(channel: string, text: string) {
    socket.emit('chat:send', { channel, text });
  }

  function quickStart(username: string) {
    return new Promise<Lobby>((resolve) => {
      socket.emit('lobby:solo', username, resolve);
    });
  }

  function sendCommand(text: string): Promise<CommandResult> {
    const reqId = uuidv4();
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        socket.off('game:command:result', handler);
        resolve({ ok: false, message: 'Server did not respond. Check the server is running.' });
      }, 30000);

      function handler(payload: CommandResult & { reqId: string }) {
        if (payload.reqId !== reqId) return;
        clearTimeout(timer);
        socket.off('game:command:result', handler);
        resolve(payload);
      }

      socket.on('game:command:result', handler);
      socket.emit('game:command', { reqId, text });
    });
  }

  function clearCombatQueue() {
    setState(s => ({ ...s, combatQueue: [] }));
  }

  function dismissRecap() {
    setState(s => ({ ...s, lastRoundRecap: null }));
  }

  function launchNuke(targetTerritoryId: string) {
    (socket as any).emit('game:nuke', targetTerritoryId);
  }

  return {
    ...state,
    createLobby,
    joinLobby,
    pickCountry,
    toggleReady,
    startGame,
    quickStart,
    submitActions,
    forceEndTurn,
    sendCommand,
    sendChat,
    clearCombatQueue,
    dismissRecap,
    launchNuke,
  };
}
