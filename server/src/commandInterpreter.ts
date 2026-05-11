import { GameState, PlayerAction, CommandResult } from '../../shared/src/types';

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

  function findTerritory(s: string): string | null {
    // Try progressively: exact → strip punctuation → substring scan longest-first
    const stripped = s.replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
    if (tMap.has(stripped)) return tMap.get(stripped)!;
    if (tMap.has(stripped.replace(/\s/g, ''))) return tMap.get(stripped.replace(/\s/g, ''))!;
    // substring scan longest match first
    const entries = [...tMap.entries()].sort((a, b) => b[0].length - a[0].length);
    for (const [key, id] of entries) {
      if (key.length >= 3 && stripped.includes(key)) return id;
    }
    return null;
  }

  function findCountry(s: string): string | null {
    const stripped = s.replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
    if (cMap.has(stripped)) return cMap.get(stripped)!;
    const entries = [...cMap.entries()].sort((a, b) => b[0].length - a[0].length);
    for (const [key, id] of entries) {
      if (key.length >= 3 && stripped.includes(key)) return id;
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
  // patterns: "attack France", "invade Poland with 15", "push into Denmark", "send 10 to France"
  const isAttack = /\b(attack|invade|assault|strike|push|blitz|march|advance|move troops|send troops|capture|take)\b/.test(lower);
  const isMove   = /\b(move|send|transfer|deploy)\b/.test(lower) && /\b(to|into|toward)\b/.test(lower);

  if (isAttack || isMove) {
    const targetId = findTerritory(lower);
    if (!targetId) return { ok: false, message: `Couldn't find a territory to target. Try: "attack France" or "invade Poland"` };

    const target = state.territories[targetId];

    // Find best source: my adjacent territory with most garrison
    const sources = country.territories
      .map(id => state.territories[id])
      .filter(t => t && t.adjacentTo.includes(targetId) && t.garrison >= 2)
      .sort((a, b) => b.garrison - a.garrison);

    if (sources.length === 0) {
      return { ok: false, message: `No adjacent territory with enough troops to attack ${target.name}. Move troops closer first.` };
    }

    const fromT = sources[0];

    // Allow moving to own territory too
    if (target.ownerId === myCountryId) {
      const num = extractNum(lower) ?? Math.floor(fromT.garrison / 2);
      const force = Math.min(Math.max(1, num), fromT.garrison - 1);
      return {
        ok: true,
        message: `Moving ${force} divisions from ${fromT.name} → ${target.name}`,
        action: action('move', { fromTerritoryId: fromT.id, toTerritoryId: targetId, forceSize: force }),
      };
    }

    const num = extractNum(lower) ?? Math.floor(fromT.garrison / 2);
    const force = Math.min(Math.max(1, num), fromT.garrison - 1);
    const warNotice = country.atWarWith.includes(target.ownerId) ? '' : ` (auto-declares war on ${state.countries[target.ownerId]?.name})`;

    return {
      ok: true,
      message: `Attacking ${target.name} from ${fromT.name} with ${force} divisions${warNotice}`,
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
    const divisions = Math.max(1, num);
    return {
      ok: true,
      message: `Reinforcing ${state.territories[targetId]?.name} with ${divisions} divisions`,
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
    const qty = Math.max(1, extractNum(lower) ?? 3);
    return {
      ok: true,
      message: `Queuing ${qty}× ${buildType} production`,
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
    return {
      ok: true,
      message: `Researching ${category} technology`,
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
