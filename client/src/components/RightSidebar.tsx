import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Map, Globe, FlaskConical, Factory, HelpCircle } from 'lucide-react';
import { GameState, CountryStats, TerritoryState } from '@shared/types';

type Tab = 'country' | 'territory' | 'diplomacy' | 'research' | 'production';

interface Props {
  gameState: GameState | null;
  myCountryId: string | null;
  selectedTerritoryId: string | null;
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  onShowTutorial: () => void;
}

const TABS: { id: Tab; icon: React.ReactNode; label: string; key: string }[] = [
  { id: 'country',    icon: <Flag size={14} />,         label: 'Nation',     key: '1' },
  { id: 'territory',  icon: <Map size={14} />,           label: 'Territory',  key: '2' },
  { id: 'diplomacy',  icon: <Globe size={14} />,         label: 'Diplomacy',  key: '3' },
  { id: 'research',   icon: <FlaskConical size={14} />,  label: 'Research',   key: '4' },
  { id: 'production', icon: <Factory size={14} />,       label: 'Production', key: '5' },
];

const RightSidebar: React.FC<Props> = ({
  gameState, myCountryId, selectedTerritoryId, activeTab, setActiveTab, onShowTutorial,
}) => {
  const myCountry = myCountryId ? gameState?.countries[myCountryId] : null;
  const selectedTerritory = selectedTerritoryId ? gameState?.territories[selectedTerritoryId] : null;

  return (
    <aside className="flex flex-col w-72 shrink-0 bg-gray-950 border-l border-gray-800 overflow-hidden">
      <div className="flex border-b border-gray-800">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors relative ${
              activeTab === tab.id
                ? 'text-yellow-400 border-b-2 border-yellow-500 bg-gray-900'
                : 'text-gray-500 hover:text-gray-300'
            }`}
            title={`${tab.label} (${tab.key})`}
          >
            {tab.icon}
            <span className="hidden sm:block">{tab.label}</span>
            <span className="absolute top-0.5 right-1 text-[8px] text-gray-700">{tab.key}</span>
          </button>
        ))}
        <button onClick={onShowTutorial} className="px-2 text-gray-700 hover:text-gray-400 transition-colors" title="How to play">
          <HelpCircle size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.12 }}
          >
            {activeTab === 'country'    && <CountryTab country={myCountry} />}
            {activeTab === 'territory'  && <TerritoryTab territory={selectedTerritory} gameState={gameState} />}
            {activeTab === 'diplomacy'  && <DiplomacyTab gameState={gameState} myCountryId={myCountryId} />}
            {activeTab === 'research'   && <ResearchTab country={myCountry} />}
            {activeTab === 'production' && <ProductionTab country={myCountry} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
};

// ── Country Tab ───────────────────────────────────────────────────────────────

const CountryTab: React.FC<{ country: CountryStats | null | undefined }> = ({ country }) => {
  if (!country) return <Placeholder text="No country assigned." />;

  const stats = [
    { label: '⚔️ Army',      value: `${country.army} div.`,              color: 'text-red-400' },
    { label: '✈️ Air',       value: country.airPower.toLocaleString(),    color: 'text-sky-400' },
    { label: '🚢 Navy',      value: country.navalPower.toLocaleString(),  color: 'text-blue-400' },
    { label: '👥 Manpower',  value: `${country.manpower.toLocaleString()}k`, color: 'text-green-400' },
    { label: '🏭 Industry',  value: country.industry.toLocaleString(),    color: 'text-yellow-400' },
    { label: '💰 Money',     value: `$${country.money}`,                  color: 'text-yellow-300' },
    { label: '🛢 Oil',       value: country.resources.oil.toLocaleString(),   color: 'text-orange-400' },
    { label: '⚙️ Steel',    value: country.resources.steel.toLocaleString(),  color: 'text-gray-300' },
    { label: '🌾 Food',      value: country.resources.food.toLocaleString(),   color: 'text-lime-400' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{country.flag}</span>
        <div>
          <div className="text-white font-bold text-base">{country.name}</div>
          <div className="text-gray-400 text-xs">{country.fullName}</div>
          <div className={`text-xs font-bold mt-0.5 ${
            country.faction === 'axis' ? 'text-red-400' :
            country.faction === 'allies' ? 'text-blue-400' : 'text-gray-400'
          }`}>{country.faction.toUpperCase()}</div>
        </div>
      </div>

      <BarStat label="Morale"        value={country.morale}         max={100} color="bg-green-600" />
      <BarStat label="War Exhaustion" value={country.warExhaustion}  max={100} color="bg-red-700" />
      <BarStat label="Tech Level"    value={(country.techLevel-1)*25} max={100} color="bg-purple-600"
        displayValue={country.techLevel.toFixed(1)} />

      <div className="border-t border-gray-800 mt-3 pt-3 space-y-1">
        {stats.map(s => (
          <div key={s.label} className="flex justify-between text-xs">
            <span className="text-gray-500">{s.label}</span>
            <span className={`${s.color} font-semibold`}>{s.value}</span>
          </div>
        ))}
      </div>

      {country.atWarWith.length > 0 && (
        <div className="mt-3 p-2 rounded-lg bg-red-950 border border-red-800 text-xs">
          <div className="text-red-400 font-semibold mb-1">AT WAR WITH</div>
          {country.atWarWith.map(id => <div key={id} className="text-red-300">• {id}</div>)}
        </div>
      )}
      {country.alliedWith.length > 0 && (
        <div className="mt-2 p-2 rounded-lg bg-blue-950 border border-blue-800 text-xs">
          <div className="text-blue-400 font-semibold mb-1">ALLIED WITH</div>
          {country.alliedWith.map(id => <div key={id} className="text-blue-300">• {id}</div>)}
        </div>
      )}

      <div className="mt-3 p-2 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-500">
        💬 Use the command bar below to issue orders.
      </div>
    </div>
  );
};

const BarStat: React.FC<{ label: string; value: number; max: number; color: string; displayValue?: string }> = ({
  label, value, max, color, displayValue,
}) => (
  <div className="mb-2">
    <div className="flex justify-between text-xs mb-0.5">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300">{displayValue ?? Math.round(value)}</span>
    </div>
    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
      <motion.div className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        transition={{ duration: 0.5 }} />
    </div>
  </div>
);

// ── Territory Tab ─────────────────────────────────────────────────────────────

const TerritoryTab: React.FC<{ territory: TerritoryState | null | undefined; gameState: GameState | null }> = ({
  territory, gameState,
}) => {
  if (!territory) return (
    <Placeholder text="Click any territory on the map to inspect it." />
  );

  const owner = gameState?.countries[territory.ownerId];

  return (
    <div>
      <div className="mb-3">
        <div className="text-white font-bold text-lg">{territory.name}</div>
        <div className="text-xs" style={{ color: owner?.color ?? '#9ca3af' }}>
          {owner?.flag} {owner?.name ?? territory.ownerId}
        </div>
        <div className="text-gray-500 text-xs capitalize mt-0.5">{territory.terrain} · {territory.isCoastal ? 'Coastal' : 'Inland'}</div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-xs mb-3">
        {[
          { label: 'Garrison',  value: `${territory.garrison} div.`,                              color: 'text-white' },
          { label: 'Fort',      value: '★'.repeat(territory.fortLevel)+'☆'.repeat(5-territory.fortLevel), color: 'text-yellow-400' },
          { label: 'Industry',  value: String(territory.industryOutput),                          color: 'text-blue-400' },
          { label: 'Manpower',  value: `${territory.manpowerOutput}k`,                            color: 'text-green-400' },
          { label: 'Supply',    value: `${Math.round(territory.supplyLevel*100)}%`,               color: territory.supplyLevel > 0.7 ? 'text-green-400' : 'text-yellow-400' },
          ...(territory.resourceOutput.oil   ? [{ label: 'Oil',   value: String(territory.resourceOutput.oil),   color: 'text-orange-400' }] : []),
          ...(territory.resourceOutput.steel ? [{ label: 'Steel', value: String(territory.resourceOutput.steel), color: 'text-gray-300' }] : []),
        ].map(row => (
          <div key={row.label} className="bg-gray-900 rounded-lg p-2">
            <div className="text-gray-600">{row.label}</div>
            <div className={`font-bold ${row.color}`}>{row.value}</div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-600">
        Adjacent: {territory.adjacentTo.join(', ')}
      </div>
    </div>
  );
};

// ── Diplomacy Tab ─────────────────────────────────────────────────────────────

const DiplomacyTab: React.FC<{ gameState: GameState | null; myCountryId: string | null }> = ({
  gameState, myCountryId,
}) => {
  if (!gameState || !myCountryId) return <Placeholder text="Not in a game." />;
  const myCountry = gameState.countries[myCountryId];
  const others = Object.values(gameState.countries).filter(c => c.id !== myCountryId);

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-600 mb-2 p-2 bg-gray-900 rounded-lg">
        Use the command bar: <span className="text-gray-400 italic">"declare war on France"</span>
      </div>
      {others.map(c => {
        const atWar   = myCountry.atWarWith.includes(c.id);
        const allied  = myCountry.alliedWith.includes(c.id);
        const rel     = myCountry.relations[c.id] ?? 0;
        const label   = atWar ? 'AT WAR' : allied ? 'ALLIED' : rel > 50 ? 'Friendly' : rel < -50 ? 'Hostile' : 'Neutral';
        const lColor  = atWar ? 'text-red-400' : allied ? 'text-blue-400' : rel > 50 ? 'text-green-400' : rel < -50 ? 'text-orange-400' : 'text-gray-400';
        const bg      = atWar ? 'bg-red-950 border-red-900' : allied ? 'bg-blue-950 border-blue-900' : 'bg-gray-900 border-gray-800';
        return (
          <div key={c.id} className={`rounded-lg p-2.5 border text-xs ${bg}`}>
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">{c.flag} {c.name}</span>
              <span className={`${lColor} font-bold text-[10px]`}>{label}</span>
            </div>
            <div className="text-gray-500 mt-0.5">
              {c.territories.length} territories · {c.faction}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Research Tab ──────────────────────────────────────────────────────────────

const RESEARCH_ITEMS = [
  { id: 'infantry',  label: '⚔️ Infantry Doctrine' },
  { id: 'armor',     label: '🛡 Armored Warfare' },
  { id: 'aircraft',  label: '✈️ Aviation' },
  { id: 'naval',     label: '🚢 Naval Doctrine' },
  { id: 'radar',     label: '📡 Radar' },
  { id: 'rockets',   label: '🚀 Rocketry' },
  { id: 'nuclear',   label: '☢️ Nuclear' },
];

const ResearchTab: React.FC<{ country: CountryStats | null | undefined }> = ({ country }) => {
  if (!country) return <Placeholder text="No country assigned." />;
  return (
    <div>
      <div className="text-xs text-gray-600 mb-3 p-2 bg-gray-900 rounded-lg">
        Use the command bar: <span className="text-gray-400 italic">"research armor"</span>
      </div>
      <div className="text-xs text-gray-400 mb-2">
        Research Points: <span className="text-yellow-400 font-bold">{country.researchPoints}</span>
        &nbsp;· Tech: <span className="text-purple-400 font-bold">{country.techLevel.toFixed(1)}</span>
      </div>
      <div className="space-y-2">
        {RESEARCH_ITEMS.map(item => {
          const pct = country.researchProgress[item.id as keyof typeof country.researchProgress] ?? 0;
          return (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-lg p-2">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-white text-xs">{item.label}</span>
                <span className="text-gray-500 text-[10px]">{pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-purple-600 rounded-full"
                  animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Production Tab ────────────────────────────────────────────────────────────

const ProductionTab: React.FC<{ country: CountryStats | null | undefined }> = ({ country }) => {
  if (!country) return <Placeholder text="No country assigned." />;
  return (
    <div>
      <div className="text-xs text-gray-600 mb-3 p-2 bg-gray-900 rounded-lg">
        Use the command bar: <span className="text-gray-400 italic">"build 5 infantry"</span>
      </div>
      <div className="space-y-1.5 text-xs mb-3">
        {[
          { label: '💰 Money',  value: `$${country.money}` },
          { label: '⚙️ Steel', value: String(country.resources.steel) },
          { label: '🛢 Oil',   value: String(country.resources.oil) },
        ].map(r => (
          <div key={r.label} className="flex justify-between bg-gray-900 rounded px-2 py-1.5">
            <span className="text-gray-500">{r.label}</span>
            <span className="text-white font-semibold">{r.value}</span>
          </div>
        ))}
      </div>

      {country.productionQueue.length > 0 ? (
        <div>
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Queue</div>
          {country.productionQueue.map((item, i) => (
            <div key={i} className="flex justify-between text-xs bg-gray-900 border border-gray-800 rounded px-2 py-1.5 mb-1">
              <span className="text-gray-300 capitalize">{item.type} ×{item.quantity}</span>
              <span className="text-yellow-400 font-semibold">{item.turnsLeft} turns</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-600 text-xs text-center py-4">No production queued.</div>
      )}
    </div>
  );
};

// ── Shared ────────────────────────────────────────────────────────────────────

const Placeholder: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center justify-center py-12 text-gray-600 text-sm text-center px-4">{text}</div>
);

export default RightSidebar;
