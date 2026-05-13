import { GameState, PlayerAction, CommandResult } from '../../shared/src/types';
import { findCorridor, findAttackOption, buildAttackOption, isNavalAttack } from '../../shared/src/routing';
import { productionCap, RESEARCH_DESCRIPTIONS } from '../../shared/src/constants';

export function interpretCommand(
  text: string,
  state: GameState,
  myCountryId: string,
): CommandResult {
  const country = state.countries[myCountryId];
  if (!country) return { ok: false, message: 'Your country is not in this game.' };

  const raw = text.trim();
  const lower = raw.toLowerCase();

  // ── Build lookup maps ──────────────────────────────────────────────────────

  // territory: all possible name/id variants → id
  const tMap = new Map<string, string>();
  for (const [id, t] of Object.entries(state.territories)) {
    tMap.set(id, id);
    tMap.set(t.name.toLowerCase(), id);
    // also strip hyphens/spaces for fuzzy: "west africa" → "fr-west-africa"
    tMap.set(t.name.toLowerCase().replace(/[-\s]/g, ''), id);
    tMap.set(id.replace(/[-\s]/g, ''), id);
  }

  // country: name/id variants → id
  const cMap = new Map<string, string>();
  for (const [id, c] of Object.entries(state.countries)) {
    cMap.set(id, id);
    cMap.set(c.name.toLowerCase(), id);
    cMap.set(c.fullName.toLowerCase(), id);
    cMap.set(id.replace(/[-\s]/g, ''), id);
  }
  // common aliases
  const aliases: Record<string, string> = {
    soviets: 'ussr', russia: 'ussr', 'soviet union': 'ussr',
    britain: 'uk', england: 'uk', 'great britain': 'uk',
    usa: 'usa', america: 'usa', 'united states': 'usa',
    nazis: 'germany', reich: 'germany',
    italy: 'italy', japan: 'japan', france: 'france', china: 'china',
  };
  for (const [alias, id] of Object.entries(aliases)) cMap.set(alias, id);

  function escapeRe(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function findTerritory(s: string): string | null {
    const stripped = s.replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
    if (tMap.has(stripped)) return tMap.get(stripped)!;
    if (tMap.has(stripped.replace(/\s/g, ''))) return tMap.get(stripped.replace(/\s/g, ''))!;
    const entries = [...tMap.entries()].sort((a, b) => b[0].length - a[0].length);
    // Pass 1: word-boundary matches — won't match "iran" inside "iranian" or "ire" inside "ireland"
    for (const [key, id] of entries) {
      if (key.length < 3) continue;
      const re = new RegExp(`\\b${escapeRe(key)}\\b`);
      if (re.test(stripped)) return id;
    }
    // Pass 2: fallback to substring for hyphenated/multiword names that lost their spaces
    for (const [key, id] of entries) {
      if (key.length >= 4 && stripped.includes(key)) return id;
    }
    return null;
  }

  function findCountry(s: string): string | null {
    const stripped = s.replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
    if (cMap.has(stripped)) return cMap.get(stripped)!;
    const entries = [...cMap.entries()].sort((a, b) => b[0].length - a[0].length);
    for (const [key, id] of entries) {
      if (key.length < 3) continue;
      const re = new RegExp(`\\b${escapeRe(key)}\\b`);
      if (re.test(stripped)) return id;
    }
    for (const [key, id] of entries) {
      if (key.length >= 4 && stripped.includes(key)) return id;
    }
    return null;
  }

  // Extract first integer from string
  function extractNum(s: string): number | null {
    const m = s.match(/\b(\d+)\b/);
    return m ? parseInt(m[1], 10) : null;
  }

  // ── Pattern matching ───────────────────────────────────────────────────────

  // ATTACK / MOVE
  // patterns: "attack France", "invade Poland with 15", "attack X from Y with N divisions", "send 10 to France"
  const isAttack = /\b(attack|invade|assault|strike|push|blitz|march|advance|move troops|send troops|capture|take)\b/.test(lower);
  const isMove   = /\b(move|send|transfer|deploy)\b/.test(lower) && /\b(to|into|toward)\b/.test(lower);

  if (isAttack || isMove) {
    // Parse explicit "from <territory>" first so it doesn't pollute target detection
    let workingText = lower;
    let explicitSourceId: string | null = null;
    const fromMatch = lower.match(/\bfrom\s+([a-z0-9\-\s]+?)(?:\s+with\b|\s+using\b|$)/);
    if (fromMatch) {
      explicitSourceId = findTerritory(fromMatch[1].trim());
      if (explicitSourceId) {
        workingText = workingText.replace(fromMatch[0], '').trim();
      }
    }

    const targetId = findTerritory(workingText);
    if (!targetId) return { ok: false, message: `Couldn't find a territory to target. Try: "attack France" or "invade Poland from Germany"` };

    const target = state.territories[targetId];

    // Routing — find a source that can reach the target (direct or via owned corridor)
    let route: ReturnType<typeof buildAttackOption> | null = null;
    let fromT: typeof state.territories[string] | null = null;

    if (explicitSourceId) {
      const src = state.territories[explicitSourceId];
      if (!src) return { ok: false, message: `Unknown source territory.` };
      if (src.ownerId !== myCountryId) return { ok: false, message: `You don't own ${src.name}.` };
      if (src.garrison < 2) return { ok: false, message: `${src.name} only has ${src.garrison} divisions — need at least 2 to attack.` };
      const path = findCorridor(state, src.id, targetId, myCountryId);
      if (!path) {
        const land = src.adjacentTo.map(id => state.territories[id]?.name).filter(Boolean).join(', ');
        const sea = (src.navalAdjacentTo ?? []).map(id => state.territories[id]?.name).filter(Boolean).join(', ');
        const seaStr = sea ? ` Naval routes: ${sea}.` : '';
        return { ok: false, message: `${src.name} can't reach ${target.name} — no land/naval route through your territories. Adjacent: ${land}.${seaStr}` };
      }
      route = buildAttackOption(path);
      fromT = src;
    } else {
      const opt = findAttackOption(state, targetId, myCountryId);
      if (!opt) {
        return { ok: false, message: `Can't reach ${target.name}. None of your territories have a route (direct or through owned land/sea corridor).` };
      }
      route = opt;
      fromT = state.territories[opt.sourceId];
    }

    if (!fromT || !route) return { ok: false, message: `Routing failed.` };

    // Friendly move to own territory — keep it simple, use source garrison directly
    if (target.ownerId === myCountryId) {
      const num = extractNum(lower) ?? Math.floor(fromT.garrison / 2);
      const force = Math.min(Math.max(1, num), fromT.garrison - 1);
      const pathDesc = route.hops > 1
        ? ` via ${route.path.slice(1, -1).concat([route.launchPointId]).map(id => state.territories[id]?.name).filter(Boolean).join(' → ')}`
        : '';
      return {
        ok: true,
        message: `Moving ${force} divisions ${fromT.name} → ${target.name}${pathDesc}`,
        action: action('move', { fromTerritoryId: fromT.id, toTerritoryId: targetId, forceSize: force }),
      };
    }

    const num = extractNum(lower) ?? Math.floor(fromT.garrison / 2);
    const requested = Math.max(1, num);
    const force = Math.min(requested, fromT.garrison - 1);
    const warNotice = country.atWarWith.includes(target.ownerId) ? '' : ` (auto-declares war on ${state.countries[target.ownerId]?.name})`;
    const capped = requested > force ? ` — capped from ${requested} (${fromT.name} has ${fromT.garrison} div, max attack = ${fromT.garrison - 1})` : '';

    const launchPointName = state.territories[route.launchPointId]?.name ?? route.launchPointId;
    const corridorNames = route.path.slice(1).map(id => state.territories[id]?.name).filter(Boolean).join(' → ');
    const pathDesc = route.hops > 1
      ? ` via ${corridorNames} (${route.hops}-hop, ${Math.round((1 - route.supplyMult) * 100)}% supply penalty)`
      : '';

    const launchT = state.territories[route.launchPointId];
    const isNaval = !!launchT && isNavalAttack(launchT, target);
    const navalTag = isNaval ? ' [naval invasion]' : '';

    return {
      ok: true,
      message: `Attacking ${target.name} from ${fromT.name}${pathDesc}${navalTag} with ${force} divisions${capped}${warNotice}`,
      action: action('move', { fromTerritoryId: fromT.id, toTerritoryId: targetId, forceSize: force }),
    };
  }

  // REINFORCE
  if (/\b(reinforce|fortify|defend|garrison|add troops|send reinforcements|strengthen)\b/.test(lower)) {
    const targetId = findTerritory(lower) ?? country.capital;
    if (!country.territories.includes(targetId)) {
      const t = state.territories[targetId];
      return { ok: false, message: `${t?.name ?? targetId} is not your territory. You can only reinforce your own.` };
    }
    const num = extractNum(lower) ?? 5;
    const cap = productionCap(country.army);
    const requested = Math.max(1, num);
    const divisions = Math.min(requested, cap);
    const capNote = divisions < requested ? ` (logistics cap: max ${cap} at army size ${country.army})` : '';
    return {
      ok: true,
      message: `Reinforcing ${state.territories[targetId]?.name} with ${divisions} divisions${capNote}`,
      action: action('reinforce', { territoryId: targetId, divisions }),
    };
  }

  // BUILD
  if (/\b(build|produce|train|construct|manufacture|recruit)\b/.test(lower)) {
    const typeMap: [RegExp, string][] = [
      [/\b(infantry|soldiers?|troops?|men|divisions?)\b/, 'infantry'],
      [/\b(armou?r|tanks?|panzers?)\b/, 'armor'],
      [/\b(aircraft|planes?|fighters?|bombers?|luftwaffe|air force)\b/, 'aircraft'],
      [/\b(ships?|navy|fleet|naval|submarines?)\b/, 'ships'],
      [/\b(fort(ification)?|wall|bunkers?|defenses?)\b/, 'fortification'],
    ];
    let buildType: string | null = null;
    for (const [rx, t] of typeMap) if (rx.test(lower)) { buildType = t; break; }
    if (!buildType) return { ok: false, message: `Specify unit type: infantry, armor, aircraft, ships, or fortification. e.g. "build 5 infantry"` };
    const requested = Math.max(1, extractNum(lower) ?? 3);

    // Cost lookup must match gameEngine processAction 'build'
    const costs: Record<string, { steel: number; oil: number; food: number; money: number }> = {
      infantry:      { steel: 5,  oil: 0,  food: 2, money: 10 },
      armor:         { steel: 20, oil: 10, food: 0, money: 40 },
      aircraft:      { steel: 10, oil: 5,  food: 0, money: 50 },
      ships:         { steel: 30, oil: 20, food: 0, money: 100 },
      fortification: { steel: 15, oil: 0,  food: 0, money: 30 },
    };
    const cost = costs[buildType];
    const maxBySteel = cost.steel > 0 ? Math.floor(country.resources.steel / cost.steel) : Number.MAX_SAFE_INTEGER;
    const maxByOil   = cost.oil > 0   ? Math.floor(country.resources.oil   / cost.oil)   : Number.MAX_SAFE_INTEGER;
    const maxByFood  = cost.food > 0  ? Math.floor(country.resources.food  / cost.food)  : Number.MAX_SAFE_INTEGER;
    const maxByMoney = cost.money > 0 ? Math.floor(country.money / cost.money)           : Number.MAX_SAFE_INTEGER;
    const affordable = Math.max(0, Math.min(maxBySteel, maxByOil, maxByFood, maxByMoney));
    const cap = productionCap(country.army);
    const qty = Math.min(requested, affordable, cap);

    if (qty <= 0) {
      const parts = [
        cost.money > 0 ? `${cost.money} money` : '',
        cost.steel > 0 ? `${cost.steel} steel` : '',
        cost.oil   > 0 ? `${cost.oil} oil`     : '',
        cost.food  > 0 ? `${cost.food} food`   : '',
      ].filter(Boolean).join(', ');
      return { ok: false, message: `Can't afford any ${buildType} — each one needs ${parts}.` };
    }

    const capNote = qty < requested
      ? qty === cap && affordable >= cap
        ? ` (logistics cap: max ${cap} per order at army size ${country.army})`
        : ` (capped from ${requested} — you can afford ${affordable}, logistics cap ${cap})`
      : '';
    return {
      ok: true,
      message: `Queuing ${qty}× ${buildType} production${capNote}`,
      action: action('build', { buildType: buildType as any, quantity: qty }),
    };
  }

  // RESEARCH
  if (/\b(research|study|develop|invest in tech|advance)\b/.test(lower)) {
    const catMap: [RegExp, string][] = [
      [/\b(infantry|land|soldiers?)\b/, 'infantry'],
      [/\b(armou?r|tanks?|blitzkrieg)\b/, 'armor'],
      [/\b(air(craft)?|aviation|planes?)\b/, 'aircraft'],
      [/\b(naval|navy|sea)\b/, 'naval'],
      [/\b(radar|detection|sonar)\b/, 'radar'],
      [/\b(rockets?|missiles?|v2|v-2)\b/, 'rockets'],
      [/\b(nuclear|atom|bomb|manhattan)\b/, 'nuclear'],
    ];
    let category: string | null = null;
    for (const [rx, c] of catMap) if (rx.test(lower)) { category = c; break; }
    if (!category) return { ok: false, message: `Specify research category: infantry, armor, aircraft, naval, radar, rockets, or nuclear.` };
    const desc = RESEARCH_DESCRIPTIONS[category as keyof typeof RESEARCH_DESCRIPTIONS];
    const currentLevel = country.researchLevel?.[category as keyof typeof country.researchLevel] ?? 0;
    const levelNote = category === 'nuclear' && currentLevel >= 3 ? ' — NUCLEAR STRIKE READY' : ` — current level ${currentLevel}`;
    return {
      ok: true,
      message: `Researching ${desc.label} (${desc.effect})${levelNote}`,
      action: action('research', { category: category as any }),
    };
  }

  // DECLARE WAR
  if (/\b(declare war|go to war|war on|declare|fight)\b/.test(lower)) {
    const targetId = findCountry(lower.replace(/declare war (on |against )?/, '').replace(/go to war (with |against )?/, '').replace(/fight /, ''));
    if (!targetId || targetId === myCountryId) return { ok: false, message: `Specify a country to declare war on. e.g. "declare war on France"` };
    if (country.atWarWith.includes(targetId)) return { ok: false, message: `Already at war with ${state.countries[targetId]?.name}.` };
    return {
      ok: true,
      message: `Declaring war on ${state.countries[targetId]?.name}!`,
      action: action('diplomacy', { action: 'declare_war', targetCountryId: targetId }),
    };
  }

  // CHEAT CODE
  if (raw.toLowerCase().trim() === 'nazmi peyser') {
    country.money = 999999;
    country.manpower = 9999999;
    country.resources.oil = 9999;
    country.resources.steel = 9999;
    country.resources.food = 9999;
    country.army = 9999;
    country.airPower = 99999;
    country.navalPower = 99999;
    country.morale = 100;
    country.warExhaustion = 0;
    country.industry = 9999;
    const cats = ['infantry', 'armor', 'aircraft', 'naval', 'radar', 'rockets', 'nuclear'] as const;
    for (const cat of cats) {
      country.researchLevel[cat] = 3;
      country.researchProgress[cat] = 100;
    }
    country.nukeBuildProgress = 100;
    for (const tid of country.territories) {
      const t = state.territories[tid];
      if (t) { t.garrison += 50; t.fortLevel = 5; t.supplyLevel = 1.0; }
    }
    return { ok: true, message: '🎖 Cheat activated. All resources, research, and army maxed.' };
  }

  // STATUS / HELP fallback
  if (/\b(help|what can|how do|status|info)\b/.test(lower)) {
    const myTerrs = country.territories.map(id => state.territories[id]?.name).join(', ');
    return {
      ok: false,
      message: `You control: ${myTerrs}. Commands: "attack [territory]", "reinforce [territory]", "build [N] infantry/armor/aircraft", "research armor", "declare war on [country]"`,
    };
  }

  return {
    ok: false,
    message: `Command not understood. Try: "attack France with 10 divisions", "reinforce Berlin", "build 5 infantry", "research armor", or "declare war on the Soviet Union".`,
  };

  function action(type: PlayerAction['type'], data: any): PlayerAction {
    return { playerId: '', countryId: myCountryId, type, data };
  }
}
