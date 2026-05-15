export type Terrain = 'plains' | 'forest' | 'mountain' | 'desert' | 'urban' | 'coast' | 'jungle' | 'tundra';
export type FactionType = 'axis' | 'allies' | 'neutral';
export type AIPersonality = 'aggressive' | 'defensive' | 'opportunist' | 'isolationist';
export type TurnMode = 'simultaneous' | 'sequential';
export type ActionType = 'move' | 'reinforce' | 'build' | 'research' | 'diplomacy' | 'espionage' | 'nuke';
export type ResearchCategory = 'infantry' | 'armor' | 'aircraft' | 'naval' | 'radar' | 'rockets' | 'nuclear';
export type BuildType = 'infantry' | 'armor' | 'aircraft' | 'ships' | 'fortification';
export type DiplomacyAction = 'propose_alliance' | 'declare_war' | 'propose_peace' | 'embargo' | 'trade';
export type EspionageAction = 'sabotage' | 'spy' | 'false_flag';
export type VictoryCondition = 'domination' | 'faction' | 'survival' | 'historical' | 'custom';
export type GamePhase = 'lobby' | 'planning' | 'resolving' | 'ended';

export interface Resources {
  oil: number;
  steel: number;
  food: number;
}

export interface ProductionItem {
  type: BuildType;
  quantity: number;
  turnsLeft: number;
  targetTerritoryId?: string;
}

export interface CountryStats {
  id: string;
  name: string;
  fullName: string;
  faction: FactionType;
  aiPersonality: AIPersonality;
  color: string;
  flag: string;
  isHuman: boolean;

  army: number;
  airPower: number;
  navalPower: number;
  manpower: number;
  industry: number;
  resources: Resources;
  money: number;
  morale: number;
  techLevel: number;
  researchPoints: number;
  warExhaustion: number;
  researchProgress: Record<ResearchCategory, number>;
  researchLevel: Record<ResearchCategory, number>;
  productionQueue: ProductionItem[];
  nukeBuildProgress?: number; // 0–100, charges when nuclear research >= 3

  atWarWith: string[];
  alliedWith: string[];
  relations: Record<string, number>;

  territories: string[];
  capital: string;
}

export interface TerritoryState {
  id: string;
  name: string;
  ownerId: string;
  originalOwnerId: string;
  terrain: Terrain;
  adjacentTo: string[];
  navalAdjacentTo?: string[];
  isCoastal: boolean;
  industryOutput: number;
  manpowerOutput: number;
  resourceOutput: Partial<Resources>;
  garrison: number;
  fortLevel: number;
  supplyLevel: number;
  geoId: string;
  centroid: [number, number];
  isNuclearWasteland?: boolean;
}

export interface MoveAction {
  fromTerritoryId: string;
  toTerritoryId: string;
  forceSize: number;
}

export interface ReinforceAction {
  territoryId: string;
  divisions: number;
}

export interface BuildAction {
  buildType: BuildType;
  quantity: number;
  territoryId?: string;
}

export interface ResearchAction {
  category: ResearchCategory;
}

export interface DiplomacyActionData {
  action: DiplomacyAction;
  targetCountryId: string;
  terms?: { territories?: string[]; resources?: Partial<Resources>; money?: number };
}

export interface EspionageActionData {
  action: EspionageAction;
  targetCountryId: string;
}

export interface PlayerAction {
  playerId: string;
  countryId: string;
  type: ActionType;
  data: MoveAction | ReinforceAction | BuildAction | ResearchAction | DiplomacyActionData | EspionageActionData;
}

export interface CombatResult {
  attackerId: string;
  defenderId: string;
  fromTerritoryId: string;
  toTerritoryId: string;
  attackerForce: number;
  defenderForce: number;
  attackerStrength: number;
  defenderStrength: number;
  fogFactor: number;
  attackerLosses: number;
  defenderLosses: number;
  captured: boolean;
  terrainMultiplier: number;
  fortMultiplier: number;
  supplyFactor: number;
}

export interface GameEvent {
  turn: number;
  date: string;
  type: 'combat' | 'diplomacy' | 'research' | 'production' | 'ai' | 'narration' | 'nuke' | 'overflow';
  message: string;
  involvedCountries: string[];
}

export interface GameState {
  id: string;
  roomCode: string;
  turn: number;
  year: number;
  month: number;
  phase: GamePhase;
  turnMode: TurnMode;
  turnTimerSeconds: number;
  turnStartTime: number;
  fogOfWar: boolean;
  victoryCondition: VictoryCondition;

  countries: Record<string, CountryStats>;
  territories: Record<string, TerritoryState>;

  submittedPlayers: string[];
  pendingActions: PlayerAction[];
  combatLog: CombatResult[];
  eventLog: GameEvent[];
  winner?: string;
}

export interface Player {
  id: string;
  username: string;
  countryId: string | null;
  isHost: boolean;
  isReady: boolean;
  isSpectator: boolean;
  isOnline: boolean;
  submittedTurn: boolean;
}

export interface GameSettings {
  turnMode: TurnMode;
  turnTimerSeconds: number;
  aiDifficulty: 'easy' | 'normal' | 'hard';
  fogOfWar: boolean;
  victoryCondition: VictoryCondition;
  maxPlayers: number;
}

export interface Lobby {
  roomCode: string;
  hostId: string;
  players: Record<string, Player>;
  settings: GameSettings;
  status: 'waiting' | 'starting' | 'in_game';
  gameId?: string;
  availableCountries: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  channel: string;
  text: string;
  timestamp: number;
}

export interface ServerToClientEvents {
  'lobby:updated': (lobby: Lobby) => void;
  'game:state': (state: GameState) => void;
  'game:combat': (result: CombatResult) => void;
  'game:event': (event: GameEvent) => void;
  'game:timer': (secondsLeft: number) => void;
  'game:command:result': (payload: CommandResult & { reqId: string }) => void;
  'chat:message': (msg: ChatMessage) => void;
  'error': (msg: string) => void;
  'connected': (playerId: string) => void;
}

export interface ClientToServerEvents {
  'lobby:create': (username: string, settings: Partial<GameSettings>, callback: (lobby: Lobby) => void) => void;
  'lobby:join': (username: string, roomCode: string, callback: (lobby: Lobby | null, error?: string) => void) => void;
  'lobby:pick-country': (countryId: string) => void;
  'lobby:ready': () => void;
  'lobby:start': () => void;
  'lobby:solo': (username: string, callback: (lobby: Lobby) => void) => void;
  'game:submit-actions': (actions: PlayerAction[]) => void;
  'game:command': (payload: { reqId: string; text: string }) => void;
  'game:force-end': () => void;
  'chat:send': (msg: { channel: string; text: string }) => void;
}

export interface CommandResult {
  ok: boolean;
  message: string;
  action?: PlayerAction;
}
