import { CountryStats, TerritoryState, CombatResult } from './types';
import {
  TERRAIN_MULTIPLIERS, FORT_MULT_PER_LEVEL, ATK_LOSS_RATE, DEF_LOSS_RATE,
  FOG_MIN, FOG_MAX, CAPTURE_THRESHOLD, AIR_SUP_RATIO, AIR_SUP_BONUS
} from './constants';

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
  actionIndex: number = 0
): CombatResult {
  const terrainMult = TERRAIN_MULTIPLIERS[to.terrain] ?? 1.0;
  const fortMult = 1 + FORT_MULT_PER_LEVEL * to.fortLevel;
  const supplyFactor = Math.max(0.3, to.supplyLevel);
  const defenderForce = to.garrison;

  const atkAirBonus = attacker.airPower > defender.airPower * AIR_SUP_RATIO ? AIR_SUP_BONUS : 0;
  const defAirBonus = defender.airPower > attacker.airPower * AIR_SUP_RATIO ? AIR_SUP_BONUS : 0;

  let atkStr = (attackerForce * attacker.techLevel * (attacker.morale / 100) + attacker.airPower * 0.4) * (1 + atkAirBonus);
  let defStr = (defenderForce * defender.techLevel * (defender.morale / 100) * terrainMult * fortMult * supplyFactor + defender.airPower * 0.4) * (1 + defAirBonus);

  const seed = turn * 10000 + actionIndex;
  const atkFog = FOG_MIN + seededRng(seed) * (FOG_MAX - FOG_MIN);
  const defFog = FOG_MIN + seededRng(seed + 1) * (FOG_MAX - FOG_MIN);
  atkStr *= atkFog;
  defStr *= defFog;

  const total = atkStr + defStr;
  const atkLosses = Math.max(0, Math.round((defStr / total) * attackerForce * ATK_LOSS_RATE));
  const defLosses = Math.max(0, Math.round((atkStr / total) * defenderForce * DEF_LOSS_RATE));
  const remainingAtk = attackerForce - atkLosses;
  const captured = atkStr > defStr * CAPTURE_THRESHOLD && remainingAtk > 1;

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
