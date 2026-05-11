import { Lobby, Player, GameSettings } from '../../shared/src/types';
import { DEFAULT_SETTINGS, MAJOR_POWERS } from '../../shared/src/constants';
import { v4 as uuidv4 } from 'uuid';

const lobbies = new Map<string, Lobby>();
const playerToRoom = new Map<string, string>();

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const PLAYABLE_COUNTRIES = [...MAJOR_POWERS];

export function createLobby(hostId: string, settings: Partial<GameSettings> = {}): Lobby {
  const code = generateCode();
  const hostPlayer: Player = {
    id: hostId, username: '', countryId: null,
    isHost: true, isReady: false, isSpectator: false, isOnline: true, submittedTurn: false,
  };
  const lobby: Lobby = {
    roomCode: code, hostId,
    players: { [hostId]: hostPlayer },
    settings: { ...DEFAULT_SETTINGS, ...settings },
    status: 'waiting',
    availableCountries: [...PLAYABLE_COUNTRIES],
  };
  lobbies.set(code, lobby);
  playerToRoom.set(hostId, code);
  return lobby;
}

export function joinLobby(playerId: string, code: string): Lobby | null {
  const lobby = lobbies.get(code.toUpperCase());
  if (!lobby || lobby.status !== 'waiting') return null;
  const player: Player = {
    id: playerId, username: '', countryId: null,
    isHost: false, isReady: false, isSpectator: false, isOnline: true, submittedTurn: false,
  };
  lobby.players[playerId] = player;
  playerToRoom.set(playerId, code.toUpperCase());
  return lobby;
}

export function setUsername(playerId: string, username: string): Lobby | null {
  const code = playerToRoom.get(playerId);
  if (!code) return null;
  const lobby = lobbies.get(code);
  if (!lobby || !lobby.players[playerId]) return null;
  lobby.players[playerId].username = username.slice(0, 20);
  return lobby;
}

export function pickCountry(playerId: string, countryId: string): Lobby | null {
  const code = playerToRoom.get(playerId);
  if (!code) return null;
  const lobby = lobbies.get(code);
  if (!lobby || !lobby.players[playerId]) return null;

  const alreadyPicked = Object.values(lobby.players).some(p => p.countryId === countryId && p.id !== playerId);
  if (alreadyPicked) return null;
  if (!PLAYABLE_COUNTRIES.includes(countryId as any)) return null;

  const prev = lobby.players[playerId].countryId;
  if (prev) lobby.availableCountries.push(prev);
  lobby.players[playerId].countryId = countryId;
  lobby.availableCountries = lobby.availableCountries.filter(c => c !== countryId);
  return lobby;
}

export function setReady(playerId: string, ready: boolean): Lobby | null {
  const code = playerToRoom.get(playerId);
  if (!code) return null;
  const lobby = lobbies.get(code);
  if (!lobby || !lobby.players[playerId]) return null;
  lobby.players[playerId].isReady = ready;
  return lobby;
}

export function startGame(hostId: string): { lobby: Lobby; gameId: string } | null {
  const code = playerToRoom.get(hostId);
  if (!code) return null;
  const lobby = lobbies.get(code);
  if (!lobby || lobby.hostId !== hostId) return null;

  const humanPlayers = Object.values(lobby.players).filter(p => !p.isSpectator);
  if (humanPlayers.length < 1) return null;

  const gameId = uuidv4();
  lobby.status = 'in_game';
  lobby.gameId = gameId;
  return { lobby, gameId };
}

export function getLobby(code: string): Lobby | null {
  return lobbies.get(code.toUpperCase()) ?? null;
}

export function getLobbyForPlayer(playerId: string): Lobby | null {
  const code = playerToRoom.get(playerId);
  if (!code) return null;
  return lobbies.get(code) ?? null;
}

export function setPlayerOnline(playerId: string, online: boolean): Lobby | null {
  const lobby = getLobbyForPlayer(playerId);
  if (!lobby || !lobby.players[playerId]) return null;
  lobby.players[playerId].isOnline = online;
  return lobby;
}

export function removePlayer(playerId: string): Lobby | null {
  const lobby = getLobbyForPlayer(playerId);
  if (!lobby) return null;
  const player = lobby.players[playerId];
  if (player?.countryId) lobby.availableCountries.push(player.countryId);
  delete lobby.players[playerId];
  playerToRoom.delete(playerId);
  return lobby;
}
