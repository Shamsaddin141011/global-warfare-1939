import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, X, Ship, AlertTriangle } from 'lucide-react';
import { GameState } from '@shared/types';
import { findCorridor, isNavalAttack } from '@shared/routing';

interface Props {
  source: string;
  target: string;
  gameState: GameState;
  myCountryId: string | null;
  onConfirm: (force: number) => void;
  onCancel: () => void;
}

const AttackModal: React.FC<Props> = ({ source, target, gameState, myCountryId, onConfirm, onCancel }) => {
  const fromT = gameState.territories[source];
  const toT = gameState.territories[target];
  const fromOwner = fromT ? gameState.countries[fromT.ownerId] : null;
  const toOwner = toT ? gameState.countries[toT.ownerId] : null;

  const maxForce = Math.max(1, (fromT?.garrison ?? 1) - 1);
  const [force, setForce] = useState(Math.max(1, Math.floor(maxForce / 2)));

  useEffect(() => {
    setForce(Math.max(1, Math.floor(maxForce / 2)));
  }, [source, target, maxForce]);

  if (!fromT || !toT) {
    return null;
  }

  const isFriendly = toT.ownerId === myCountryId ||
    !!(myCountryId && gameState.countries[myCountryId]?.alliedWith?.includes(toT.ownerId));
  const corridor = myCountryId ? findCorridor(gameState, source, target, myCountryId) : null;
  const launchPoint = corridor ? gameState.territories[corridor[corridor.length - 1]] : null;
  const reachable = corridor !== null;
  const isNaval = reachable && !!launchPoint && isNavalAttack(launchPoint, toT);
  const wouldDeclareWar = !isFriendly && toOwner && !gameState.countries[myCountryId ?? '']?.atWarWith.includes(toT.ownerId);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="bg-gray-950 border border-yellow-800 rounded-xl shadow-2xl w-full max-w-md"
        initial={{ scale: 0.85, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            {isNaval ? <Ship size={16} className="text-blue-400" /> : <Swords size={16} className="text-yellow-400" />}
            <h2 className="text-yellow-400 font-bold text-base">
              {isFriendly ? 'Move Troops' : isNaval ? 'Naval Invasion' : 'Attack'}
            </h2>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {!reachable && (
            <div className="flex items-start gap-2 bg-red-950 border border-red-800 rounded p-2.5 text-xs text-red-200">
              <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
              <span>{fromT.name} cannot reach {toT.name} — no land or naval route.</span>
            </div>
          )}

          {/* Source/target visualization */}
          <div className="flex items-center justify-between gap-3 text-center">
            <div className="flex-1">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">From</div>
              <div className="text-2xl mb-0.5">{fromOwner?.flag}</div>
              <div className="text-white text-sm font-semibold">{fromT.name}</div>
              <div className="text-gray-400 text-xs">{fromT.garrison} div. garrison</div>
            </div>
            <div className={`text-2xl font-bold ${isFriendly ? 'text-blue-400' : 'text-red-400'}`}>
              {isFriendly ? '→' : '⚔'}
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">To</div>
              <div className="text-2xl mb-0.5">{toOwner?.flag}</div>
              <div className="text-white text-sm font-semibold">{toT.name}</div>
              <div className="text-gray-400 text-xs">{toT.garrison} div. {isFriendly ? 'garrison' : 'defending'}</div>
            </div>
          </div>

          {/* Naval / war notices */}
          {isNaval && (
            <div className="flex items-start gap-2 bg-blue-950 border border-blue-800 rounded p-2 text-xs text-blue-200">
              <Ship size={12} className="text-blue-400 shrink-0 mt-0.5" />
              <span>Naval invasion — attacker strength reduced 25%.</span>
            </div>
          )}
          {wouldDeclareWar && (
            <div className="flex items-start gap-2 bg-yellow-950 border border-yellow-800 rounded p-2 text-xs text-yellow-200">
              <AlertTriangle size={12} className="text-yellow-400 shrink-0 mt-0.5" />
              <span>Will auto-declare war on {toOwner?.name}.</span>
            </div>
          )}

          {/* Force slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Force size</span>
              <span className="text-yellow-300 font-mono font-bold">{force} / {maxForce} max</span>
            </div>
            <input
              type="range"
              min={1}
              max={maxForce}
              value={force}
              onChange={e => setForce(parseInt(e.target.value, 10))}
              className="w-full accent-yellow-500"
              disabled={!reachable}
            />
            <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
              <span>1</span>
              <span>{Math.floor(maxForce / 2)}</span>
              <span>{maxForce}</span>
            </div>
          </div>

          {/* Quick-set buttons */}
          <div className="flex gap-2">
            {[
              { label: 'Min', val: 1 },
              { label: 'Half', val: Math.max(1, Math.floor(maxForce / 2)) },
              { label: '3/4', val: Math.max(1, Math.floor(maxForce * 0.75)) },
              { label: 'Max', val: maxForce },
            ].map(b => (
              <button
                key={b.label}
                onClick={() => setForce(b.val)}
                disabled={!reachable}
                className="flex-1 px-2 py-1 text-xs rounded border border-gray-700 bg-gray-900 hover:bg-gray-800 hover:border-yellow-700 text-gray-300 disabled:opacity-40"
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-800 px-5 py-3 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(force)}
            disabled={!reachable}
            className={`px-4 py-1.5 rounded font-bold text-sm ${
              isFriendly
                ? 'bg-blue-700 hover:bg-blue-600 text-white'
                : 'bg-red-700 hover:bg-red-600 text-white'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isFriendly ? `Move ${force}` : `Attack with ${force}`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AttackModal;
