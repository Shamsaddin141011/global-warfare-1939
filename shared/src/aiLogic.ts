import { GameState, CountryStats, PlayerAction, AIPersonality } from './types';

export function generateAIActions(countryId: string, state: GameState): PlayerAction[] {
  const country = state.countries[countryId];
  if (!country || country.isHuman) return [];

  switch (country.aiPersonality) {
    case 'aggressive': return aggressiveAI(country, state);
    case 'defensive':  return defensiveAI(country, state);
    case 'opportunist': return opportunistAI(country, state);
    case 'isolationist': return isolationistAI(country, state);
    default: return [];
  }
}

function aggressiveAI(country: CountryStats, state: GameState): PlayerAction[] {
  const actions: PlayerAction[] = [];

  // Find weakest enemy neighbor
  const myTerritories = country.territories.map(id => state.territories[id]).filter(Boolean);
  for (const t of myTerritories) {
    for (const adjId of t.adjacentTo) {
      const adj = state.territories[adjId];
      if (!adj || adj.ownerId === country.id) continue;
      if (country.alliedWith.includes(adj.ownerId)) continue;
      const adjOwner = state.countries[adj.ownerId];
      if (!adjOwner) continue;

      const atWar = country.atWarWith.includes(adj.ownerId);
      if (!atWar) {
        // Declare war if we have enough force ratio
        const myForce = country.army;
        const theirForce = adjOwner.army;
        if (myForce > theirForce * 1.6 && Math.random() < 0.3) {
          actions.push({
            playerId: `ai_${country.id}`,
            countryId: country.id,
            type: 'diplomacy',
            data: { action: 'declare_war', targetCountryId: adj.ownerId },
          });
        }
        continue;
      }

      // Attack if at war
      const forceToSend = Math.floor(t.garrison * 0.6);
      if (forceToSend >= 1) {
        actions.push({
          playerId: `ai_${country.id}`,
          countryId: country.id,
          type: 'move',
          data: { fromTerritoryId: t.id, toTerritoryId: adjId, forceSize: forceToSend },
        });
      }
    }
  }

  // Always build more infantry
  if (country.manpower > 5000 && country.industry > 10) {
    actions.push({
      playerId: `ai_${country.id}`,
      countryId: country.id,
      type: 'build',
      data: { buildType: 'infantry', quantity: 3 },
    });
  }

  return actions.slice(0, 5);
}

function defensiveAI(country: CountryStats, state: GameState): PlayerAction[] {
  const actions: PlayerAction[] = [];

  // Reinforce threatened borders
  const myTerritories = country.territories.map(id => state.territories[id]).filter(Boolean);
  for (const t of myTerritories) {
    const isFrontline = t.adjacentTo.some(adjId => {
      const adj = state.territories[adjId];
      return adj && adj.ownerId !== country.id && country.atWarWith.includes(adj.ownerId);
    });

    if (isFrontline && t.garrison < 5) {
      actions.push({
        playerId: `ai_${country.id}`,
        countryId: country.id,
        type: 'reinforce',
        data: { territoryId: t.id, divisions: 3 },
      });
    }
  }

  actions.push({
    playerId: `ai_${country.id}`,
    countryId: country.id,
    type: 'build',
    data: { buildType: 'infantry', quantity: 2 },
  });

  return actions.slice(0, 5);
}

function opportunistAI(country: CountryStats, state: GameState): PlayerAction[] {
  const actions: PlayerAction[] = [];

  // Attack only clearly weaker neighbors
  const myTerritories = country.territories.map(id => state.territories[id]).filter(Boolean);
  for (const t of myTerritories) {
    for (const adjId of t.adjacentTo) {
      const adj = state.territories[adjId];
      if (!adj || adj.ownerId === country.id) continue;
      if (country.alliedWith.includes(adj.ownerId)) continue;
      const adjOwner = state.countries[adj.ownerId];
      if (!adjOwner) continue;

      const atWar = country.atWarWith.includes(adj.ownerId);
      if (atWar && adj.garrison < t.garrison * 0.5) {
        const force = Math.floor(t.garrison * 0.7);
        if (force >= 1) {
          actions.push({
            playerId: `ai_${country.id}`,
            countryId: country.id,
            type: 'move',
            data: { fromTerritoryId: t.id, toTerritoryId: adjId, forceSize: force },
          });
        }
      }
    }
  }

  actions.push({
    playerId: `ai_${country.id}`,
    countryId: country.id,
    type: 'research',
    data: { category: 'infantry' },
  });

  return actions.slice(0, 5);
}

function isolationistAI(country: CountryStats, state: GameState): PlayerAction[] {
  return [
    {
      playerId: `ai_${country.id}`,
      countryId: country.id,
      type: 'build',
      data: { buildType: 'infantry', quantity: 2 },
    },
    {
      playerId: `ai_${country.id}`,
      countryId: country.id,
      type: 'research',
      data: { category: 'armor' },
    },
  ];
}
