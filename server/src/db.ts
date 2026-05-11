import { GameState } from '../../shared/src/types';

// In-memory fallback store (SQLite removed for build simplicity)
const store = new Map<string, string>();

function getDb() { return null; }

export function saveGame(state: GameState): void {
  store.set(state.id, JSON.stringify(state));
}

export function loadGame(gameId: string): GameState | null {
  const raw = store.get(gameId);
  return raw ? JSON.parse(raw) : null;
}

export function listGames(roomCode: string): { id: string; updated_at: number }[] {
  return [];
}
