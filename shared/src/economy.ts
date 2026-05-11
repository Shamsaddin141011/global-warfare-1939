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
      resourceGain.oil += (t.resourceOutput.oil ?? 0) * supply;
      resourceGain.steel += (t.resourceOutput.steel ?? 0) * supply;
      resourceGain.food += (t.resourceOutput.food ?? 0) * supply;
    }

    country.industry = Math.round(industryGain);
    country.manpower = Math.min(country.manpower + Math.round(manpowerGain), 9999999);
    country.resources.oil = Math.max(0, country.resources.oil + Math.round(resourceGain.oil));
    country.resources.steel = Math.max(0, country.resources.steel + Math.round(resourceGain.steel));
    country.resources.food = Math.max(0, country.resources.food + Math.round(resourceGain.food));

    // Money from industry
    country.money += Math.round(country.industry * 0.5);

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

    // Process production queue
    tickProduction(country);
  }

  // Update supply levels
  updateSupply(state);
}

function tickProduction(country: CountryStats): void {
  const queue = country.productionQueue;
  if (queue.length === 0) return;

  const item = queue[0];
  item.turnsLeft -= 1;

  if (item.turnsLeft <= 0) {
    switch (item.type) {
      case 'infantry': country.army += item.quantity * 2; break;
      case 'armor': country.army += item.quantity; break;
      case 'aircraft': country.airPower += item.quantity; break;
      case 'ships': country.navalPower += item.quantity; break;
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
