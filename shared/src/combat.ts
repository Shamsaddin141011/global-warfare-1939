import { CountryStats, TerritoryState, CombatResult } from './types';
import {
  TERRAIN_MULTIPLIERS, FORT_MULT_PER_LEVEL, ATK_LOSS_RATE, DEF_LOSS_RATE,
  FOG_MIN, FOG_MAX, CAPTURE_THRESHOLD, AIR_SUP_RATIO, AIR_SUP_BONUS,
  HOMELAND_DEF_BONUS, MAJOR_POWER_DEF_BONUS, MAJOR_POWERS,
  NAVAL_INVASION_ATK_PENALTY, RESOURCE_STARVATION_MULT
} from './constants';

function isResourceStarved(c: { resources: { oil: number; steel: number; food: number } }): boolean {
  return c.resources.oil <= 0 && c.resources.steel <= 0 && c.resources.food <= 0;
}

function seededRng(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function resolveCombat(
  attacker: CountryStats,
  defender: CountryStats,
  attackerForce: number,
  from: TerritoryState,
  to: TerritoryState,
  turn: number,
  actionIndex: number = 0,
  isNavalInvasion: boolean = false,
  supplyMult: number = 1.0
): CombatResult {
  const terrainMult = TERRAIN_MULTIPLIERS[to.terrain] ?? 1.0;
  const fortMult = 1 + FORT_MULT_PER_LEVEL * to.fortLevel;
  const supplyFactor = Math.max(0.3, to.supplyLevel);
  const defenderForce = to.garrison;

  const atkAirBonus = attacker.airPower > defender.airPower * AIR_SUP_RATIO ? AIR_SUP_BONUS : 0;
  const defAirBonus = defender.airPower > attacker.airPower * AIR_SUP_RATIO ? AIR_SUP_BONUS : 0;

  // Defenders fight harder in their homeland and harder still if they're a major power
  const isHomeland = to.originalOwnerId === defender.id;
  const isMajorDefender = (MAJOR_POWERS as readonly string[]).includes(defender.id);
  const homelandBonus = isHomeland ? HOMELAND_DEF_BONUS : 0;
  const majorBonus = isMajorDefender && isHomeland ? MAJOR_POWER_DEF_BONUS : 0;
  const defNationalBonus = 1 + homelandBonus + majorBonus;

  // Air provides a multiplicative bonus (capped at +25%) so numbers still decide battles.
  // Aircraft research extends the cap by 5% per level.
  const atkAirL  = attacker.researchLevel?.aircraft ?? 0;
  const defAirL  = defender.researchLevel?.aircraft ?? 0;
  const atkAirLocal = attacker.airPower / Math.max(1, attacker.territories.length);
  const defAirLocal = defender.airPower / Math.max(1, defender.territories.length);
  const atkAirMult = 1 + Math.min(0.25 + atkAirL * 0.05, atkAirLocal / 1000);
  const defAirMult = 1 + Math.min(0.25 + defAirL * 0.05, defAirLocal / 1000);

  // Research bonuses — accumulate based on completed research levels per category
  // Infantry → offense, Rockets → offense, Nuclear → offense
  const atkInfL  = attacker.researchLevel?.infantry ?? 0;
  const atkRckL  = attacker.researchLevel?.rockets  ?? 0;
  const atkNucL  = attacker.researchLevel?.nuclear  ?? 0;
  const atkResBonus = 1 + atkInfL * 0.05 + atkRckL * 0.05 + atkNucL * 0.10;

  // Armor → defense, Radar → defense
  const defArmL  = defender.researchLevel?.armor    ?? 0;
  const defRadL  = defender.researchLevel?.radar    ?? 0;
  const defNucL  = defender.researchLevel?.nuclear  ?? 0;
  const defResBonus = 1 + defArmL * 0.08 + defRadL * 0.03 + defNucL * 0.08;

  const navalPenalty = isNavalInvasion ? (1 - NAVAL_INVASION_ATK_PENALTY) : 1;
  const atkStarvation = isResourceStarved(attacker) ? RESOURCE_STARVATION_MULT : 1;
  const defStarvation = isResourceStarved(defender) ? RESOURCE_STARVATION_MULT : 1;
  let atkStr = attackerForce * attacker.techLevel * (attacker.morale / 100) * atkAirMult * (1 + atkAirBonus) * navalPenalty * atkResBonus * supplyMult * atkStarvation;
  let defStr = defenderForce * defender.techLevel * (defender.morale / 100) * terrainMult * fortMult * supplyFactor * defNationalBonus * defAirMult * (1 + defAirBonus) * defResBonus * defStarvation;

  const seed = turn * 10000 + actionIndex;
  const atkFog = FOG_MIN + seededRng(seed) * (FOG_MAX - FOG_MIN);
  const defFog = FOG_MIN + seededRng(seed + 1) * (FOG_MAX - FOG_MIN);
  atkStr *= atkFog;
  defStr *= defFog;

  const total = atkStr + defStr;
  const atkLosses = Math.max(0, Math.round((defStr / total) * attackerForce * ATK_LOSS_RATE));
  const defLosses = Math.max(0, Math.round((atkStr / total) * defenderForce * DEF_LOSS_RATE));
  const remainingAtk = attackerForce - atkLosses;
  const captured = atkStr > defStr * CAPTURE_THRESHOLD && remainingAtk >= 1;

  return {
    attackerId: attacker.id,
    defenderId: defender.id,
    fromTerritoryId: from.id,
    toTerritoryId: to.id,
    attackerForce,
    defenderForce,
    attackerStrength: Math.round(atkStr),
    defenderStrength: Math.round(defStr),
    fogFactor: Math.round(atkFog * 100) / 100,
    attackerLosses: atkLosses,
    defenderLosses: defLosses,
    captured,
    terrainMultiplier: terrainMult,
    fortMultiplier: Math.round(fortMult * 100) / 100,
    supplyFactor,
  };
}
