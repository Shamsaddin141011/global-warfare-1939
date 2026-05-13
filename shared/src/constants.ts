export const TERRAIN_MULTIPLIERS: Record<string, number> = {
  plains: 1.0,
  forest: 1.15,
  mountain: 1.35,
  desert: 0.9,
  urban: 1.25,
  coast: 1.0,
  jungle: 1.2,
  tundra: 1.1,
};

export const FORT_MULT_PER_LEVEL = 0.22;
export const ATK_LOSS_RATE = 0.65;
export const DEF_LOSS_RATE = 0.50;
export const FOG_MIN = 0.85;
export const FOG_MAX = 1.15;
export const CAPTURE_THRESHOLD = 1.40;
export const HOMELAND_DEF_BONUS = 0.30;
export const MAJOR_POWER_DEF_BONUS = 0.25;
export const NAVAL_INVASION_ATK_PENALTY = 0.25;
export const AIR_SUP_RATIO = 2.0;
export const AIR_SUP_BONUS = 0.2;
export const NAVAL_INVASION_MULT = 2;
export const VICTORY_DOMINATION = 0.6;
export const VICTORY_FACTION = 0.7;
export const AI_WAR_THRESHOLD = 1.6;
export const NUCLEAR_TURNS = 30;
export const RESOURCE_STARVATION_MULT = 0.55; // -45% combat strength when all resources at 0

export const MAJOR_POWERS = ['germany', 'italy', 'japan', 'uk', 'france', 'usa', 'ussr', 'china'] as const;

/**
 * Max units that can be ordered in a single build/reinforce action.
 * Scales down as your army grows — wealth can't bypass logistics.
 *   army=0   → 25   army=80  → 12   army=200 → 7   army=400 → 5
 */
export function productionCap(armySize: number): number {
  return Math.max(5, Math.round(25 / (1 + armySize / 80)));
}

export const FACTION_BASE_COLORS: Record<string, string> = {
  axis: '#8B3A3A',
  allies: '#2C4A7C',
  neutral: '#5C6B3A',
};

export const COUNTRY_COLORS: Record<string, string> = {
  // Axis — red/orange palette
  germany:   '#b8392b',
  italy:     '#d4861a',
  japan:     '#e63838',
  austria:   '#c87045',
  hungary:   '#a55a3a',
  romania:   '#c08550',
  bulgaria:  '#a8704a',
  slovakia:  '#b85a35',
  finland:   '#7da9c4',
  // Allies — blue palette
  uk:        '#1a4a8c',
  france:    '#2f6bbf',
  usa:       '#0e3a78',
  ussr:      '#8b1a4a',
  china:     '#c8801c',
  poland:    '#3e7a5a',
  yugoslavia:'#5a6fa8',
  greece:    '#3a8a8a',
  norway:    '#3a78b0',
  denmark:   '#5878b8',
  netherlands:'#d18a30',
  belgium:   '#5e7a8c',
  // Neutrals / minors — muted varied tones
  spain:     '#a78a4a',
  turkey:    '#6b8a4a',
  sweden:    '#4a8aa8',
  switzerland:'#9c9c9c',
  albania:   '#8a6f3a',
  portugal:  '#3e8a4a',
  mongolia:  '#a89478',
  thailand:  '#8a6b1f',
  iran:      '#7a6a45',
  iraq:      '#a89030',
  'saudi-arabia': '#c8a050',
  brazil:    '#2f7a2f',
  mexico:    '#4a8a3a',
  argentina: '#4a78a8',
  australia: '#4a6878',
  wilderness:'#5a5a5a',
};

export const STARTING_YEAR = 1939;
export const STARTING_MONTH = 9;
export const ENDING_YEAR = 1945;

export const RESEARCH_CATEGORIES: ResearchCategory[] = ['infantry', 'armor', 'aircraft', 'naval', 'radar', 'rockets', 'nuclear'];

export const RESEARCH_DESCRIPTIONS: Record<ResearchCategory, { label: string; effect: string }> = {
  infantry:  { label: 'Offensive Training',    effect: '+5% ground attack per level' },
  armor:     { label: 'Armored Doctrine',       effect: '+8% defense per level' },
  aircraft:  { label: 'Air Superiority',        effect: '+15% air power per level' },
  naval:     { label: 'Fleet Operations',       effect: '+15% naval strength per level' },
  radar:     { label: 'Intelligence Network',   effect: '+3% defense per level' },
  rockets:   { label: 'V-Weapons Program',      effect: '+5% attack bonus per level' },
  nuclear:   { label: 'Manhattan Project',      effect: 'Level 3 unlocks nuclear strike' },
};

type ResearchCategory = 'infantry' | 'armor' | 'aircraft' | 'naval' | 'radar' | 'rockets' | 'nuclear';

export const DEFAULT_SETTINGS = {
  turnMode: 'simultaneous' as const,
  turnTimerSeconds: 300,
  aiDifficulty: 'normal' as const,
  fogOfWar: false,
  victoryCondition: 'domination' as const,
  maxPlayers: 8,
};
