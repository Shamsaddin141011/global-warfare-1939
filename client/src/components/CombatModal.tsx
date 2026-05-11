import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Shield, X } from 'lucide-react';
import { CombatResult, GameState } from '@shared/types';

interface Props {
  results: CombatResult[];
  gameState: GameState | null;
  onDismiss: () => void;
}

const CombatModal: React.FC<Props> = ({ results, gameState, onDismiss }) => {
  const [index, setIndex] = useState(0);
  const [animDone, setAnimDone] = useState(false);
  const [atkDisplay, setAtkDisplay] = useState(0);
  const [defDisplay, setDefDisplay] = useState(0);

  const result = results[index];

  useEffect(() => {
    if (!result) return;
    setAnimDone(false);
    setAtkDisplay(0);
    setDefDisplay(0);

    const duration = 1200;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const pct = step / steps;
      setAtkDisplay(Math.round(result.attackerStrength * pct));
      setDefDisplay(Math.round(result.defenderStrength * pct));
      if (step >= steps) {
        clearInterval(timer);
        setAnimDone(true);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [index, result]);

  if (!result) return null;

  const attacker = gameState?.countries[result.attackerId];
  const defender = gameState?.countries[result.defenderId];
  const fromT = gameState?.territories[result.fromTerritoryId];
  const toT = gameState?.territories[result.toTerritoryId];

  function next() {
    if (index < results.length - 1) {
      setIndex(i => i + 1);
    } else {
      onDismiss();
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={animDone ? next : undefined}
      >
        <motion.div
          className="bg-gray-950 border border-yellow-800 rounded-xl p-6 w-full max-w-md shadow-2xl"
          initial={{ scale: 0.8, y: -30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-yellow-400 font-bold text-lg flex items-center gap-2">
              <Swords size={18} />
              {result.captured ? 'Territory Captured!' : 'Battle Report'}
            </h2>
            <button onClick={onDismiss} className="text-gray-500 hover:text-white"><X size={16} /></button>
          </div>

          <div className="text-center text-gray-300 text-sm mb-4">
            {fromT?.name} → <span className={result.captured ? 'text-red-400' : 'text-yellow-400'}>{toT?.name}</span>
          </div>

          {/* VS panel */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 text-center">
              <div className="text-2xl mb-1">{attacker?.flag}</div>
              <div className="text-white font-semibold text-sm">{attacker?.name}</div>
              <div className="text-gray-400 text-xs">Force: {result.attackerForce}</div>
              <motion.div
                className="text-3xl font-bold text-red-400 mt-2"
                key={`atk-${index}`}
              >{atkDisplay}</motion.div>
              <div className="text-xs text-gray-500">strength</div>
            </div>

            <div className="text-yellow-500 text-2xl font-bold">VS</div>

            <div className="flex-1 text-center">
              <div className="text-2xl mb-1">{defender?.flag}</div>
              <div className="text-white font-semibold text-sm">{defender?.name}</div>
              <div className="text-gray-400 text-xs">Garrison: {result.defenderForce}</div>
              <motion.div
                className="text-3xl font-bold text-blue-400 mt-2"
                key={`def-${index}`}
              >{defDisplay}</motion.div>
              <div className="text-xs text-gray-500">strength</div>
            </div>
          </div>

          {animDone && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="border-t border-gray-800 pt-3 mb-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-400">Terrain bonus: <span className="text-white">×{result.terrainMultiplier}</span></div>
                  <div className="text-gray-400">Fort bonus: <span className="text-white">×{result.fortMultiplier}</span></div>
                  <div className="text-gray-400">Fog factor: <span className="text-white">{result.fogFactor}</span></div>
                  <div className="text-gray-400">Supply: <span className="text-white">{Math.round(result.supplyFactor * 100)}%</span></div>
                </div>
              </div>

              <div className="flex gap-4 text-center mb-4">
                <div className="flex-1 bg-red-950 border border-red-800 rounded p-2">
                  <div className="text-red-400 text-xs">Attacker Losses</div>
                  <div className="text-white font-bold text-xl">{result.attackerLosses}</div>
                </div>
                <div className="flex-1 bg-blue-950 border border-blue-800 rounded p-2">
                  <div className="text-blue-400 text-xs">Defender Losses</div>
                  <div className="text-white font-bold text-xl">{result.defenderLosses}</div>
                </div>
              </div>

              <div className={`text-center text-lg font-bold mb-4 ${result.captured ? 'text-red-400' : 'text-yellow-400'}`}>
                {result.captured ? `${toT?.name} CAPTURED!` : 'Attack repelled!'}
              </div>

              <button className="btn-primary w-full" onClick={next}>
                {index < results.length - 1 ? `Next Battle (${index + 1}/${results.length})` : 'Close'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CombatModal;
