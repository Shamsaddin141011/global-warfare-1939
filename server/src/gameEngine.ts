import { GameState, PlayerAction, MoveAction, ReinforceAction, BuildAction, ResearchAction, DiplomacyActionData, CombatResult, GameEvent } from '../../shared/src/types';
import { resolveCombat } from '../../shared/src/combat';
import { tickEconomy } from '../../shared/src/economy';
import { generateAIActions } from '../../shared/src/aiLogic';
import { RESEARCH_CATEGORIES } from '../../shared/src/constants';

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export function advanceTurn(state: GameState): { combatResults: CombatResult[]; events: GameEvent[] } {
  const combatResults: CombatResult[] = [];
  const events: GameEvent[] = [];

  // Collect AI actions
  for (const country of Object.values(state.countries)) {
    if (!country.isHuman) {
      const aiActions = generateAIActions(country.id, state);
      state.pendingActions.push(...aiActions);
    }
  }

  // Process all actions
  let actionIndex = 0;
  for (const action of state.pendingActions) {
    processAction(action, state, combatResults, events, actionIndex++);
  }

  // Economy tick
  tickEconomy(state);

  // Advance date
  state.month += 1;
  if (state.month > 12) {
    state.month = 1;
    state.year += 1;
  }

  // Check victory
  checkVictory(state, events);

  state.turn += 1;
  state.phase = state.year >= 1945 ? 'ended' : 'planning';
  state.submittedPlayers = [];
  state.pendingActions = [];
  state.turnStartTime = Date.now();
  state.combatLog.push(...combatResults);
  state.eventLog.push(...events);

  return { combatResults, events };
}

function processAction(
  action: PlayerAction,
  state: GameState,
  combatResults: CombatResult[],
  events: GameEvent[],
  idx: number
): void {
  const country = state.countries[action.countryId];
  if (!country) return;

  switch (action.type) {
    case 'move': {
      const d = action.data as MoveAction;
      const fromT = state.territories[d.fromTerritoryId];
      const toT = state.territories[d.toTerritoryId];
      if (!fromT || !toT) return;
      if (fromT.ownerId !== action.countryId) return;

      if (toT.ownerId === action.countryId) {
        // Friendly move
        const moved = Math.min(d.forceSize, fromT.garrison - 1);
        if (moved <= 0) return;
        fromT.garrison -= moved;
        toT.garrison += moved;
        return;
      }

      // Combat — auto-declare war if not already at war
      const defCountry = state.countries[toT.ownerId];
      if (!defCountry) return;

      if (!country.atWarWith.includes(toT.ownerId)) {
        country.atWarWith.push(toT.ownerId);
        if (!defCountry.atWarWith.includes(action.countryId)) {
          defCountry.atWarWith.push(action.countryId);
        }
        events.push({
          turn: state.turn,
          date: `${MONTHS[state.month]} ${state.year}`,
          type: 'diplomacy',
          message: `${country.name} declares war on ${defCountry.name}!`,
          involvedCountries: [country.id, defCountry.id],
        });
      }

      const force = Math.min(d.forceSize, fromT.garrison - 1);
      if (force <= 0) return;

      const result = resolveCombat(country, defCountry, force, fromT, toT, state.turn, idx);
      combatResults.push(result);

      fromT.garrison -= result.attackerLosses;
      country.army = Math.max(0, country.army - result.attackerLosses);
      toT.garrison = Math.max(0, toT.garrison - result.defenderLosses);
      defCountry.army = Math.max(0, defCountry.army - result.defenderLosses);

      if (result.captured) {
        const remainingForce = force - result.attackerLosses;
        fromT.garrison -= (force - result.attackerLosses);
        toT.garrison = Math.floor(remainingForce * 0.5);
        toT.ownerId = action.countryId;
        country.territories.push(toT.id);
        defCountry.territories = defCountry.territories.filter(id => id !== toT.id);

        events.push({
          turn: state.turn,
          date: `${MONTHS[state.month]} ${state.year}`,
          type: 'combat',
          message: `${country.name} captures ${toT.name} from ${defCountry.name}!`,
          involvedCountries: [country.id, defCountry.id],
        });
      } else {
        events.push({
          turn: state.turn,
          date: `${MONTHS[state.month]} ${state.year}`,
          type: 'combat',
          message: `${country.name} attacks ${toT.name} — repelled by ${defCountry.name}. Losses: ${result.attackerLosses} vs ${result.defenderLosses}.`,
          involvedCountries: [country.id, defCountry.id],
        });
      }
      break;
    }

    case 'reinforce': {
      const d = action.data as ReinforceAction;
      const t = state.territories[d.territoryId];
      if (!t || t.ownerId !== action.countryId) return;
      const added = Math.min(d.divisions, Math.floor(country.manpower / 100));
      t.garrison += added;
      country.army += added;
      country.manpower -= added * 100;
      break;
    }

    case 'build': {
      const d = action.data as BuildAction;
      const costs: Record<string, { oil?: number; steel?: number; food?: number; money?: number; turns: number }> = {
        infantry: { steel: 5, food: 2, money: 10, turns: 2 },
        armor: { steel: 20, oil: 10, money: 40, turns: 4 },
        aircraft: { steel: 10, oil: 5, money: 50, turns: 3 },
        ships: { steel: 30, oil: 20, money: 100, turns: 6 },
        fortification: { steel: 15, money: 30, turns: 3 },
      };
      const cost = costs[d.buildType];
      if (!cost) return;
      const totalMoney = cost.money ? cost.money * d.quantity : 0;
      if (country.money < totalMoney) return;
      country.money -= totalMoney;
      if (cost.steel) country.resources.steel -= cost.steel * d.quantity;
      if (cost.oil) country.resources.oil -= cost.oil * d.quantity;
      country.productionQueue.push({ type: d.buildType, quantity: d.quantity, turnsLeft: cost.turns });
      break;
    }

    case 'research': {
      const d = action.data as ResearchAction;
      country.researchProgress[d.category] = (country.researchProgress[d.category] || 0) + 10;
      if (country.researchProgress[d.category] >= 100) {
        country.techLevel = Math.min(5.0, country.techLevel + 0.1);
        country.researchProgress[d.category] = 100;
        events.push({
          turn: state.turn, date: `${MONTHS[state.month]} ${state.year}`,
          type: 'research',
          message: `${country.name} advances ${d.category} technology!`,
          involvedCountries: [country.id],
        });
      }
      break;
    }

    case 'diplomacy': {
      const d = action.data as DiplomacyActionData;
      if (d.action === 'declare_war') {
        if (!country.atWarWith.includes(d.targetCountryId)) {
          country.atWarWith.push(d.targetCountryId);
          const target = state.countries[d.targetCountryId];
          if (target && !target.atWarWith.includes(action.countryId)) {
            target.atWarWith.push(action.countryId);
          }
          events.push({
            turn: state.turn, date: `${MONTHS[state.month]} ${state.year}`,
            type: 'diplomacy',
            message: `${country.name} declares war on ${target?.name ?? d.targetCountryId}!`,
            involvedCountries: [country.id, d.targetCountryId],
          });
        }
      } else if (d.action === 'propose_peace') {
        country.atWarWith = country.atWarWith.filter(id => id !== d.targetCountryId);
        const target = state.countries[d.targetCountryId];
        if (target) target.atWarWith = target.atWarWith.filter(id => id !== action.countryId);
        events.push({
          turn: state.turn, date: `${MONTHS[state.month]} ${state.year}`,
          type: 'diplomacy',
          message: `${country.name} and ${target?.name} agree to peace.`,
          involvedCountries: [country.id, d.targetCountryId],
        });
      }
      break;
    }
  }
}

function checkVictory(state: GameState, events: GameEvent[]): void {
  const totalTerritories = Object.keys(state.territories).length;
  for (const country of Object.values(state.countries)) {
    const pct = country.territories.length / totalTerritories;
    if (pct >= 0.6) {
      state.winner = country.id;
      state.phase = 'ended';
      events.push({
        turn: state.turn, date: `${MONTHS[state.month]} ${state.year}`,
        type: 'narration',
        message: `${country.name} achieves world domination with ${Math.round(pct * 100)}% of territories!`,
        involvedCountries: [country.id],
      });
      return;
    }
  }

  if (state.year >= 1945 && state.month >= 9) {
    state.phase = 'ended';
    const leader = Object.values(state.countries).sort((a, b) => b.territories.length - a.territories.length)[0];
    state.winner = leader.id;
    events.push({
      turn: state.turn, date: 'September 1945',
      type: 'narration',
      message: `The war ends. ${leader.name} leads with ${leader.territories.length} territories.`,
      involvedCountries: [leader.id],
    });
  }
}
