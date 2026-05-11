import { COUNTRY_COLORS, FACTION_BASE_COLORS } from '@shared/constants';
import { GameState, TerritoryState, CountryStats } from '@shared/types';

export function getTerritoryFill(
  territory: TerritoryState | undefined,
  state: GameState | null,
  selectedId: string | null,
  targetId: string | null
): string {
  if (!territory || !state) return '#1e2433';

  if (territory.id === targetId) return '#6b1a1a';
  if (territory.id === selectedId) return '#4a4020';

  const owner = state.countries[territory.ownerId];
  if (!owner) return '#2a3040';

  return COUNTRY_COLORS[territory.ownerId] ?? FACTION_BASE_COLORS[owner.faction] ?? '#3a4050';
}

export function getTerritoryHover(ownerId: string): string {
  const base = COUNTRY_COLORS[ownerId] ?? '#3a4050';
  return lighten(base, 20);
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function factionBorder(faction: string): string {
  switch (faction) {
    case 'axis': return '#c0392b';
    case 'allies': return '#2980b9';
    default: return '#7f8c8d';
  }
}

export const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
