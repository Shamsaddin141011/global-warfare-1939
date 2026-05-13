import { GameState, TerritoryState } from './types';

function reachableNeighbors(t: TerritoryState): string[] {
  return [...t.adjacentTo, ...(t.navalAdjacentTo ?? [])];
}

function directlyAdjacent(t: TerritoryState, targetId: string): boolean {
  return t.adjacentTo.includes(targetId) || (t.navalAdjacentTo?.includes(targetId) ?? false);
}

/**
 * BFS from `fromId` through territories owned by `ownerId`. Returns the shortest
 * path (list of owned-territory ids) whose last element is directly adjacent
 * (land or naval) to `targetId`. The target itself is NOT included.
 *
 * Returns null when no path exists.
 *
 * path.length === 1 means the source is directly adjacent to the target.
 */
export function findCorridor(
  state: GameState,
  fromId: string,
  targetId: string,
  ownerId: string
): string[] | null {
  if (fromId === targetId) return null;
  const fromT = state.territories[fromId];
  if (!fromT || fromT.ownerId !== ownerId) return null;

  if (directlyAdjacent(fromT, targetId)) return [fromId];

  const queue: string[][] = [[fromId]];
  const visited = new Set<string>([fromId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const cur = state.territories[path[path.length - 1]];
    if (!cur) continue;

    for (const nId of reachableNeighbors(cur)) {
      if (visited.has(nId)) continue;
      const nT = state.territories[nId];
      if (!nT) continue;

      // Only traverse through owned territories
      if (nT.ownerId !== ownerId) continue;

      // Found a launch point — this owned territory is directly adjacent to target
      if (directlyAdjacent(nT, targetId)) {
        return [...path, nId];
      }

      visited.add(nId);
      queue.push([...path, nId]);
    }
  }

  return null;
}

export interface AttackOption {
  sourceId: string;
  launchPointId: string;
  path: string[];
  hops: number;
  supplyMult: number;
}

export function buildAttackOption(path: string[]): AttackOption {
  const hops = path.length;
  const extra = Math.max(0, hops - 1);
  const supplyMult = Math.max(0.5, 1 - extra * 0.10);
  return {
    sourceId: path[0],
    launchPointId: path[path.length - 1],
    path,
    hops,
    supplyMult,
  };
}

/**
 * Find the best attack option from any owned territory. Optionally constrained
 * to a preferred source. Returns null if nothing reachable.
 *
 * Best = the source whose corridor exists AND has the highest garrison.
 */
export function findAttackOption(
  state: GameState,
  targetId: string,
  ownerId: string,
  preferredSource?: string
): AttackOption | null {
  if (preferredSource) {
    const path = findCorridor(state, preferredSource, targetId, ownerId);
    return path ? buildAttackOption(path) : null;
  }

  let best: AttackOption | null = null;
  let bestGarrison = -1;
  for (const t of Object.values(state.territories)) {
    if (t.ownerId !== ownerId || t.garrison < 2) continue;
    const path = findCorridor(state, t.id, targetId, ownerId);
    if (!path) continue;
    if (t.garrison > bestGarrison) {
      bestGarrison = t.garrison;
      best = buildAttackOption(path);
    }
  }
  return best;
}
