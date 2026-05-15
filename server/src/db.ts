import * as fs from 'fs';
import * as path from 'path';
import { GameState } from '../../shared/src/types';

function getSavesDir(): string {
  let dir = __dirname;
  for (let i = 0; i < 8; i++) {
    const dataDir = path.join(dir, 'data');
    if (fs.existsSync(path.join(dataDir, 'countries.json'))) {
      const saves = path.join(dataDir, 'saves');
      if (!fs.existsSync(saves)) fs.mkdirSync(saves, { recursive: true });
      return saves;
    }
    dir = path.dirname(dir);
  }
  throw new Error('Cannot locate data/ directory for game saves');
}

export function saveGame(state: GameState): void {
  try {
    fs.writeFileSync(path.join(getSavesDir(), `${state.id}.json`), JSON.stringify(state));
  } catch (e) {
    console.error('saveGame failed:', e);
  }
}

export function loadGame(gameId: string): GameState | null {
  try {
    const raw = fs.readFileSync(path.join(getSavesDir(), `${gameId}.json`), 'utf-8');
    return JSON.parse(raw);
  } catch { return null; }
}

export function loadAllGames(): GameState[] {
  try {
    const dir = getSavesDir();
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .flatMap(f => {
        try {
          return [JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')) as GameState];
        } catch { return []; }
      });
  } catch { return []; }
}
