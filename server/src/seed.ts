import * as fs from 'fs';
import * as path from 'path';
import { GameState, CountryStats, TerritoryState, Resources, ResearchCategory, ProductionItem } from '../../shared/src/types';
import { DEFAULT_SETTINGS } from '../../shared/src/constants';
import { WILDERNESS_REGIONS } from '../../shared/src/wildernessData';
import { PROVINCES, RENAMED_CAPITALS, CAPITAL_STAT_OVERRIDES } from '../../shared/src/provinceData';

const DATA_DIR = path.join(__dirname, '../../../../data');

interface CountryJson {
  id: string; name: string; fullName: string;
  faction: string; aiPersonality: string; color: string; flag: string;
  army: number; airPower: number; navalPower: number;
  manpower: number; industry: number; resources: Resources;
  money: number; morale: number; techLevel: number;
  researchPoints: number; warExhaustion: number;
  atWarWith: string[]; alliedWith: string[];
  capital: string; startingTerritories: string[];
}

interface TerritoryJson {
  id: string; name: string; ownerId: string; originalOwnerId: string;
  terrain: string; isCoastal: boolean; geoId: string;
  centroid: [number, number];
  industryOutput: number; manpowerOutput: number;
  resourceOutput: Partial<Resources>;
  garrison: number; fortLevel: number; supplyLevel: number;
  adjacentTo: string[];
}

const RESEARCH_CATEGORIES: ResearchCategory[] = ['infantry', 'armor', 'aircraft', 'naval', 'radar', 'rockets', 'nuclear'];

function makeResearchProgress(): Record<ResearchCategory, number> {
  return Object.fromEntries(RESEARCH_CATEGORIES.map(c => [c, 0])) as Record<ResearchCategory, number>;
}

function makeResearchLevel(): Record<ResearchCategory, number> {
  return Object.fromEntries(RESEARCH_CATEGORIES.map(c => [c, 0])) as Record<ResearchCategory, number>;
}

export function buildInitialGameState(roomCode: string, gameId: string): GameState {
  const countriesRaw: Record<string, CountryJson> = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'countries.json'), 'utf-8')
  );
  const territoriesRaw: TerritoryJson[] = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'territories.json'), 'utf-8')
  );

  const countries: Record<string, CountryStats> = {};
  for (const [id, c] of Object.entries(countriesRaw)) {
    countries[id] = {
      ...c,
      id,
      faction: c.faction as any,
      aiPersonality: c.aiPersonality as any,
      isHuman: false,
      researchProgress: makeResearchProgress(),
      researchLevel: makeResearchLevel(),
      productionQueue: [] as ProductionItem[],
      relations: {},
      territories: c.startingTerritories,
    };
  }

  // Build relation defaults
  for (const c of Object.values(countries)) {
    for (const other of Object.values(countries)) {
      if (c.id === other.id) continue;
      let rel = 0;
      if (c.alliedWith.includes(other.id)) rel = 60;
      if (c.atWarWith.includes(other.id)) rel = -100;
      if (c.faction !== 'neutral' && c.faction === other.faction) rel = Math.max(rel, 30);
      c.relations[other.id] = rel;
    }
  }

  const territories: Record<string, TerritoryState> = {};
  for (const t of territoriesRaw) {
    territories[t.id] = {
      ...t,
      terrain: t.terrain as any,
    };
  }

  // Fix asymmetric adjacencies in the raw data (both directions must be listed)
  for (const t of Object.values(territories)) {
    for (const adjId of t.adjacentTo) {
      const adj = territories[adjId];
      if (adj && !adj.adjacentTo.includes(t.id)) {
        adj.adjacentTo.push(t.id);
      }
    }
  }

  // Rename major capitals and shrink their stats so sum(capital + provinces) ≈ original
  for (const [capId, info] of Object.entries(RENAMED_CAPITALS)) {
    const t = territories[capId];
    if (!t) continue;
    t.name = info.name;
    t.centroid = info.centroid;
  }
  for (const [capId, override] of Object.entries(CAPITAL_STAT_OVERRIDES)) {
    const t = territories[capId];
    if (!t) continue;
    t.garrison = override.garrison;
    t.fortLevel = override.fortLevel;
    t.industryOutput = override.industryOutput;
    t.manpowerOutput = override.manpowerOutput;
    t.resourceOutput = override.resourceOutput;
  }

  // Add the new sub-provinces for each major
  for (const p of PROVINCES) {
    if (territories[p.id]) continue;
    territories[p.id] = {
      id: p.id,
      name: p.name,
      ownerId: p.parent,
      originalOwnerId: p.parent,
      terrain: p.terrain as any,
      adjacentTo: p.adjacentTo.slice(),
      ...(p.navalAdjacentTo ? { navalAdjacentTo: p.navalAdjacentTo.slice() } : {}),
      isCoastal: p.isCoastal,
      industryOutput: p.industryOutput,
      manpowerOutput: p.manpowerOutput,
      resourceOutput: p.resourceOutput,
      garrison: p.garrison,
      fortLevel: p.fortLevel,
      supplyLevel: p.supplyLevel,
      geoId: '',
      centroid: p.centroid,
    };
  }

  // Reciprocate adjacency so neighbors know about the new provinces
  for (const p of PROVINCES) {
    for (const adjId of p.adjacentTo) {
      const adj = territories[adjId];
      if (adj && !adj.adjacentTo.includes(p.id)) {
        adj.adjacentTo.push(p.id);
      }
    }
    if (p.navalAdjacentTo) {
      for (const adjId of p.navalAdjacentTo) {
        const adj = territories[adjId];
        if (adj) {
          if (!adj.navalAdjacentTo) adj.navalAdjacentTo = [];
          if (!adj.navalAdjacentTo.includes(p.id)) adj.navalAdjacentTo.push(p.id);
        }
      }
    }
  }

  // Auto-seed remaining wilderness territories from WILDERNESS_REGIONS
  // (every world-atlas country not already a hand-authored territory)
  for (const w of WILDERNESS_REGIONS) {
    if (territories[w.id]) continue; // already authored in territories.json
    // Compute adjacency by centroid distance — nearest 3 existing territories within 25 degrees
    const neighbors = Object.values(territories)
      .map(t => ({
        id: t.id,
        d: Math.hypot(t.centroid[0] - w.centroid[0], t.centroid[1] - w.centroid[1]),
      }))
      .filter(x => x.d < 25)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .map(x => x.id);

    territories[w.id] = {
      id: w.id,
      name: w.name,
      ownerId: 'wilderness',
      originalOwnerId: 'wilderness',
      terrain: w.terrain as any,
      adjacentTo: neighbors,
      isCoastal: w.isCoastal,
      industryOutput: 1,
      manpowerOutput: 10,
      resourceOutput: {},
      garrison: 1,
      fortLevel: 0,
      supplyLevel: 0.3,
      geoId: w.iso,
      centroid: w.centroid,
    };

    // Reciprocate adjacency on the neighbors
    for (const adjId of neighbors) {
      const adj = territories[adjId];
      if (adj && !adj.adjacentTo.includes(w.id)) {
        adj.adjacentTo.push(w.id);
      }
    }
  }

  // Assign any territories to countries that don't own them yet
  for (const t of Object.values(territories)) {
    const owner = countries[t.ownerId];
    if (owner && !owner.territories.includes(t.id)) {
      owner.territories.push(t.id);
    }
  }

  return {
    id: gameId,
    roomCode,
    turn: 0,
    year: 1939,
    month: 9,
    phase: 'planning',
    turnMode: DEFAULT_SETTINGS.turnMode,
    turnTimerSeconds: DEFAULT_SETTINGS.turnTimerSeconds,
    turnStartTime: Date.now(),
    fogOfWar: DEFAULT_SETTINGS.fogOfWar,
    victoryCondition: DEFAULT_SETTINGS.victoryCondition,
    countries,
    territories,
    submittedPlayers: [],
    pendingActions: [],
    combatLog: [],
    eventLog: [],
  };
}
