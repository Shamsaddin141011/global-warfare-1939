import * as fs from 'fs';
import * as path from 'path';
import { GameState, CountryStats, TerritoryState, Resources, ResearchCategory, ProductionItem } from '../../shared/src/types';
import { DEFAULT_SETTINGS } from '../../shared/src/constants';

const DATA_DIR = path.join(__dirname, '../../data');

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
