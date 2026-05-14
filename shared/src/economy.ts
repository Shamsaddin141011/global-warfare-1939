import { GameState, CountryStats, TerritoryState, Resources } from './types';

export function tickEconomy(state: GameState): void {
  for (const country of Object.values(state.countries)) {
    const ownedTerritories = country.territories.map(id => state.territories[id]).filter(Boolean);

    // Collect territory outputs
    let industryGain = 0;
    let manpowerGain = 0;
    const resourceGain: Resources = { oil: 0, steel: 0, food: 0 };

    for (const t of ownedTerritories) {
      const supply = t.supplyLevel;
      industryGain += t.industryOutput * supply;
      manpowerGain += t.manpowerOutput * supply;
      // Base +1 oil/steel/food per territory + any specialized output, all scaled by supply
      resourceGain.oil   += ((t.resourceOutput.oil   ?? 0) + 1) * supply;
      resourceGain.steel += ((t.resourceOutput.steel ?? 0) + 1) * supply;
      resourceGain.food  += ((t.resourceOutput.food  ?? 0) + 1) * supply;
    }

    country.industry = Math.round(industryGain);
    country.manpower = Math.min(country.manpower + Math.round(manpowerGain), 9999999);
    country.resources.oil   = Math.max(0, country.resources.oil   + Math.round(resourceGain.oil));
    country.resources.steel = Math.max(0, country.resources.steel + Math.round(resourceGain.steel));
    country.resources.food  = Math.max(0, country.resources.food  + Math.round(resourceGain.food));

    // Money: industry tax + flat per-territory base (every owned territory generates +5)
    country.money += Math.round(country.industry * 0.5) + ownedTerritories.length * 5;

    // War exhaustion effect
    if (country.atWarWith.length > 0) {
      country.warExhaustion = Math.min(100, country.warExhaustion + 0.5);
      country.morale = Math.max(10, country.morale - country.warExhaustion * 0.05);
    } else {
      country.warExhaustion = Math.max(0, country.warExhaustion - 1);
      country.morale = Math.min(100, country.morale + 0.3);
    }

    // Research progress
    const rp = Math.round(country.industry * 0.1 + 5);
    country.researchPoints += rp;

    // Nuke charging: auto-ticks every turn (~5% per turn = 20 turns to arm)
    const progress = country.nukeBuildProgress ?? 0;
    if (progress < 100) {
      country.nukeBuildProgress = Math.min(100, progress + 5);
    }

    // Process production queue
    tickProduction(country, state);
  }

  // Update supply levels
  updateSupply(state);
}

function tickProduction(country: CountryStats, state: GameState): void {
  const queue = country.productionQueue;
  if (queue.length === 0) return;

  const item = queue[0];
  item.turnsLeft -= 1;

  if (item.turnsLeft <= 0) {
    // Resolve spawn territory: prefer the queued target; if lost, use capital; if that's lost too, fallback to any owned territory.
    let target = item.targetTerritoryId ? state.territories[item.targetTerritoryId] : undefined;
    if (!target || target.ownerId !== country.id) {
      target = state.territories[country.capital];
      if (!target || target.ownerId !== country.id) {
        target = country.territories.map(id => state.territories[id]).find(t => t && t.ownerId === country.id);
      }
    }

    switch (item.type) {
      case 'infantry': {
        country.army += item.quantity;
        if (target) target.garrison += item.quantity;
        break;
      }
      case 'armor': {
        country.army += item.quantity;
        if (target) target.garrison += item.quantity;
        break;
      }
      case 'aircraft': country.airPower += item.quantity; break;
      case 'ships':    country.navalPower += item.quantity; break;
      case 'fortification': {
        if (target) target.fortLevel = Math.min(5, target.fortLevel + item.quantity);
        break;
      }
    }
    queue.shift();
  }
}

function updateSupply(state: GameState): void {
  for (const territory of Object.values(state.territories)) {
    const owner = state.countries[territory.ownerId];
    if (!owner) continue;

    // Supply based on distance to capital (simplified: direct ownership = full supply)
    const capital = state.territories[owner.capital];
    if (!capital || capital.ownerId !== owner.id) {
      territory.supplyLevel = 0.3;
      continue;
    }

    // BFS distance would be ideal; for now use a simplified model
    const isCapital = territory.id === owner.capital;
    territory.supplyLevel = isCapital ? 1.0 : Math.min(1.0, 0.5 + territory.garrison * 0.02);
  }
}
