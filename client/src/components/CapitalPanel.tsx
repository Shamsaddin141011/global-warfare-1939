import React from 'react';
import { motion } from 'framer-motion';
import { Handshake, Swords, X } from 'lucide-react';
import { GameState } from '@shared/types';

interface Props {
  gameState: GameState;
  myCountryId: string;
  capitalTerritoryId: string;
  onPropose: (targetCountryId: string) => void;
  onBreak: (targetCountryId: string) => void;
  onClose: () => void;
}

const CapitalPanel: React.FC<Props> = ({
  gameState, myCountryId, capitalTerritoryId, onPropose, onBreak, onClose,
}) => {
  const territory = gameState.territories[capitalTerritoryId];
  if (!territory) return null;

  const targetCountryId = territory.ownerId;
  const targetCountry = gameState.countries[targetCountryId];
  const myCountry = gameState.countries[myCountryId];
  if (!targetCountry || !myCountry || targetCountryId === myCountryId) return null;

  const isAllied = myCountry.alliedWith.includes(targetCountryId);
  const isAtWar = myCountry.atWarWith.includes(targetCountryId);

  return (
    <motion.div
      className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40 w-72"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
    >
      <div className="bg-gray-950 border border-gray-700 rounded-xl shadow-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{targetCountry.flag}</span>
            <div>
              <div className="text-white font-bold text-sm">{targetCountry.name}</div>
              <div className="text-gray-500 text-xs">{territory.name} — Capital</div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white">
            <X size={14} />
          </button>
        </div>

        {isAtWar && (
          <div className="text-red-400 text-xs text-center py-2 bg-red-950 rounded-lg border border-red-900">
            ⚔ Currently at war — cannot form alliance
          </div>
        )}

        {!isAtWar && !isAllied && (
          <button
            onClick={() => { onPropose(targetCountryId); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-900 hover:bg-green-800 border border-green-700 text-green-200 font-bold text-sm transition-colors"
          >
            <Handshake size={15} />
            Send Alliance Request
          </button>
        )}

        {isAllied && (
          <div className="space-y-2">
            <div className="text-green-400 text-xs text-center py-1.5 bg-green-950 rounded-lg border border-green-900 font-semibold">
              ✦ Allied
            </div>
            <button
              onClick={() => { onBreak(targetCountryId); onClose(); }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-sm transition-colors"
            >
              <Swords size={14} />
              Break Alliance
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CapitalPanel;
