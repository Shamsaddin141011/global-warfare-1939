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

export const FORT_MULT_PER_LEVEL = 0.12;
export const ATK_LOSS_RATE = 0.35;
export const DEF_LOSS_RATE = 0.40;
export const FOG_MIN = 0.85;
export const FOG_MAX = 1.15;
export const CAPTURE_THRESHOLD = 1.15;
export const AIR_SUP_RATIO = 2.0;
export const AIR_SUP_BONUS = 0.2;
export const NAVAL_INVASION_MULT = 2;
export const VICTORY_DOMINATION = 0.6;
export const VICTORY_FACTION = 0.7;
export const AI_WAR_THRESHOLD = 1.6;
export const NUCLEAR_TURNS = 30;

export const MAJOR_POWERS = ['germany', 'italy', 'japan', 'uk', 'france', 'usa', 'ussr', 'china'] as const;

export const FACTION_BASE_COLORS: Record<string, string> = {
  axis: '#8B3A3A',
  allies: '#2C4A7C',
  neutral: '#5C6B3A',
};

export const COUNTRY_COLORS: Record<string, string> = {
  germany: '#7B6B2F',
  austria: '#8B7B3F',
  italy: '#8B6040',
  japan: '#9B2020',
  uk: '#1A4A7B',
  france: '#2A6B9B',
  usa: '#1A4F8A',
  ussr: '#8B1010',
  china: '#B87000',
  poland: '#6B8B5B',
  romania: '#7B8B4B',
  hungary: '#8B7B4B',
  finland: '#5B7B8B',
  spain: '#9B8B4B',
  turkey: '#8B9B5B',
  sweden: '#5B8B9B',
  yugoslavia: '#8B6B8B',
  greece: '#5B8B8B',
  netherlands: '#8B7B4B',
  belgium: '#7B6B4B',
  norway: '#4B7B9B',
  denmark: '#6B4B7B',
  bulgaria: '#8B7B6B',
  switzerland: '#9B9B9B',
  slovakia: '#7B6B3B',
  albania: '#9B7B4B',
  portugal: '#6B9B5B',
  mongolia: '#9B8B6B',
  thailand: '#9B7B3B',
  iran: '#8B7B5B',
  iraq: '#9B8B4B',
  'saudi-arabia': '#C8A050',
  brazil: '#3B8B3B',
  mexico: '#5B9B4B',
  argentina: '#4B8B9B',
  australia: '#5B7B8B',
};

export const STARTING_YEAR = 1939;
export const STARTING_MONTH = 9;
export const ENDING_YEAR = 1945;

export const RESEARCH_CATEGORIES: ResearchCategory[] = ['infantry', 'armor', 'aircraft', 'naval', 'radar', 'rockets', 'nuclear'];

type ResearchCategory = 'infantry' | 'armor' | 'aircraft' | 'naval' | 'radar' | 'rockets' | 'nuclear';

export const DEFAULT_SETTINGS = {
  turnMode: 'simultaneous' as const,
  turnTimerSeconds: 90,
  aiDifficulty: 'normal' as const,
  fogOfWar: false,
  victoryCondition: 'domination' as const,
  maxPlayers: 8,
};
