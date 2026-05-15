import React from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Swords, X, Megaphone, FlaskConical, Factory, Globe } from 'lucide-react';
import { GameEvent, GameState } from '@shared/types';
import { RoundRecap } from '../hooks/useSocket';

interface Props {
  recap: RoundRecap;
  gameState: GameState | null;
  onDismiss: () => void;
}

const EVENT_ICON: Record<GameEvent['type'], React.ReactNode> = {
  combat:     <Swords size={12} className="text-red-400" />,
  diplomacy:  <Globe size={12} className="text-blue-400" />,
  research:   <FlaskConical size={12} className="text-purple-400" />,
  production: <Factory size={12} className="text-yellow-400" />,
  ai:         <Megaphone size={12} className="text-gray-400" />,
  narration:  <ScrollText size={12} className="text-amber-400" />,
  nuke:       <span style={{ fontSize: 12 }}>☢</span>,
  overflow:   <span style={{ fontSize: 12 }}>⚠️</span>,
};

const RecapModal: React.FC<Props> = ({ recap, gameState, onDismiss }) => {
  const { combats, events, date } = recap;
  const combatEvents = events.filter(e => e.type === 'combat');
  const otherEvents = events.filter(e => e.type !== 'combat');

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-70 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
    >
      <motion.div
        className="bg-gray-950 border border-yellow-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        initial={{ scale: 0.85, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <ScrollText size={18} className="text-yellow-400" />
            <h2 className="text-yellow-400 font-bold text-base">Round Recap — {date}</h2>
          </div>
          <button onClick={onDismiss} className="text-gray-500 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {combats.length === 0 && events.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-6">
              No battles or events this round.
            </div>
          )}

          {combats.length > 0 && (
            <section>
              <div className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-2 flex items-center gap-1.5">
                <Swords size={12} /> Battles ({combats.length})
              </div>
              <div className="space-y-1.5">
                {combats.map((c, i) => {
                  const atk = gameState?.countries[c.attackerId];
                  const def = gameState?.countries[c.defenderId];
                  const fromT = gameState?.territories[c.fromTerritoryId];
                  const toT = gameState?.territories[c.toTerritoryId];
                  return (
                    <div
                      key={`c-${i}`}
                      className={`rounded-lg px-3 py-2 text-xs border ${
                        c.captured
                          ? 'bg-red-950 border-red-800'
                          : 'bg-gray-900 border-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-200">
                          {atk?.flag} {atk?.name ?? c.attackerId} → {toT?.name ?? c.toTerritoryId}
                          <span className="text-gray-500"> ({def?.name ?? c.defenderId})</span>
                        </span>
                        <span className={`font-bold text-[10px] uppercase ${c.captured ? 'text-red-300' : 'text-yellow-400'}`}>
                          {c.captured ? 'Captured' : 'Repelled'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-400">
                        <span>From: <span className="text-gray-300">{fromT?.name ?? c.fromTerritoryId}</span></span>
                        <span>Force: <span className="text-gray-300">{c.attackerForce}</span></span>
                        <span>Atk losses: <span className="text-red-400">{c.attackerLosses}</span></span>
                        <span>Def losses: <span className="text-blue-400">{c.defenderLosses}</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {otherEvents.length > 0 && (
            <section>
              <div className="text-xs font-semibold uppercase tracking-widest text-yellow-500 mb-2 flex items-center gap-1.5">
                <Megaphone size={12} /> Events ({otherEvents.length})
              </div>
              <div className="space-y-1">
                {otherEvents.map((e, i) => (
                  <div
                    key={`e-${i}`}
                    className="flex items-start gap-2 text-xs text-gray-300 bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5"
                  >
                    <span className="mt-0.5 shrink-0">{EVENT_ICON[e.type]}</span>
                    <span className="leading-relaxed">{e.message}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {combatEvents.length > 0 && combats.length === 0 && (
            <section>
              <div className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-2 flex items-center gap-1.5">
                <Swords size={12} /> Combat Log
              </div>
              <div className="space-y-1">
                {combatEvents.map((e, i) => (
                  <div key={`ce-${i}`} className="text-xs text-gray-300 bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5">
                    {e.message}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="border-t border-gray-800 px-5 py-3 flex justify-end">
          <button
            onClick={onDismiss}
            className="px-4 py-1.5 rounded-lg bg-yellow-700 hover:bg-yellow-600 text-white text-sm font-bold"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RecapModal;
