import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Swords, Clock, CheckCircle, Circle, FastForward, Crosshair, MoveRight } from 'lucide-react';
import { GameState, Lobby } from '@shared/types';
import { GAME_VERSION } from '@shared/constants';
import { MONTH_NAMES } from '../lib/mapColors';

type MapMode = 'inspect' | 'attack' | 'move';

interface Props {
  gameState: GameState | null;
  lobby: Lobby | null;
  myPlayerId: string | null;
  timerSeconds: number;
  pendingActionsCount: number;
  onEndTurn: () => void;
  onForceEnd?: () => void;
  mapMode?: MapMode;
  onSetMode?: (m: MapMode) => void;
}

const TopBar: React.FC<Props> = ({ gameState, lobby, myPlayerId, timerSeconds, pendingActionsCount, onEndTurn, onForceEnd, mapMode, onSetMode }) => {
  const myPlayer = myPlayerId && lobby ? lobby.players[myPlayerId] : null;
  const myCountry = myPlayer?.countryId && gameState ? gameState.countries[myPlayer.countryId] : null;
  const submitted = gameState?.submittedPlayers.includes(myPlayerId ?? '');
  const isHost = !!myPlayer?.isHost;

  const urgent = timerSeconds <= 15;
  const month = gameState ? MONTH_NAMES[gameState.month] : '';
  const year = gameState?.year ?? 1939;

  const humanPlayers = lobby ? Object.values(lobby.players).filter(p => !p.isSpectator) : [];

  // Faction territory counts
  const factionStats = useMemo(() => {
    if (!gameState) return null;
    let axis = 0, allies = 0, neutral = 0, total = 0;
    for (const t of Object.values(gameState.territories)) {
      const owner = gameState.countries[t.ownerId];
      total++;
      if (owner?.faction === 'axis') axis++;
      else if (owner?.faction === 'allies') allies++;
      else neutral++;
    }
    return { axis, allies, neutral, total };
  }, [gameState]);

  return (
    <header className="flex flex-col bg-gray-950 border-b border-yellow-900 z-10 shrink-0">
      <div className="flex items-center justify-between px-4 py-2 h-14">
        {/* Logo + date */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Swords size={20} className="text-yellow-500" />
            <span className="text-yellow-400 font-bold tracking-widest text-sm uppercase">Global Warfare</span>
            <span className="text-gray-600 text-[9px] font-mono ml-1">{GAME_VERSION}</span>
          </div>
          {gameState && (
            <div className="text-gray-300 text-sm font-mono border-l border-gray-700 pl-4">
              <span className="text-yellow-300">{month} {year}</span>
              <span className="text-gray-500 ml-2">Turn {gameState.turn + 1}</span>
            </div>
          )}
        </div>

        {/* Player badges */}
        <div className="flex items-center gap-2">
          {humanPlayers.map(player => {
            const country = player.countryId && gameState ? gameState.countries[player.countryId] : null;
            const isSubmitted = gameState?.submittedPlayers.includes(player.id);
            return (
              <motion.div
                key={player.id}
                className="flex items-center gap-1 px-2 py-1 rounded border text-xs"
                style={{
                  borderColor: country ? country.color + '88' : '#374151',
                  backgroundColor: country ? country.color + '22' : '#1f2937',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className={player.isOnline ? 'text-green-400 online-dot' : 'text-gray-600'} style={{ fontSize: 8 }}>●</span>
                <span className="text-gray-200">{player.username || 'Player'}</span>
                {country && <span className="text-xs">{country.flag}</span>}
                {isSubmitted ? (
                  <CheckCircle size={10} className="text-green-400" />
                ) : (
                  <Circle size={10} className="text-gray-500" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Timer + End Turn + My Country */}
        <div className="flex items-center gap-3">
          {gameState?.phase === 'planning' && onSetMode && (
            <div className="flex items-center gap-1.5">
              <motion.button
                onClick={() => onSetMode('attack')}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold text-xs border transition-all ${
                  mapMode === 'attack'
                    ? 'bg-red-700 border-red-500 text-white animate-pulse'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-red-700 hover:text-red-300'
                }`}
                title="Click-to-attack: pick your territory then click an enemy"
              >
                <Crosshair size={12} />
                {mapMode === 'attack' ? 'Attack ON' : 'Attack'}
              </motion.button>
              <motion.button
                onClick={() => onSetMode('move')}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold text-xs border transition-all ${
                  mapMode === 'move'
                    ? 'bg-blue-700 border-blue-500 text-white animate-pulse'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-blue-700 hover:text-blue-300'
                }`}
                title="Click-to-move: pick your territory then click another of your territories"
              >
                <MoveRight size={12} />
                {mapMode === 'move' ? 'Move ON' : 'Move'}
              </motion.button>
            </div>
          )}

          {gameState?.phase === 'planning' && (
            <>
              <div className={`flex items-center gap-1 font-mono text-lg font-bold ${urgent ? 'timer-urgent' : 'text-gray-200'}`}>
                <Clock size={16} className={urgent ? 'text-red-400' : 'text-gray-400'} />
                {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:{String(timerSeconds % 60).padStart(2, '0')}
              </div>

              <motion.button
                className={`flex items-center gap-2 px-4 py-1.5 rounded font-semibold text-sm border transition-all ${
                  submitted
                    ? 'bg-green-900 border-green-700 text-green-300 cursor-default'
                    : 'bg-yellow-700 border-yellow-600 text-white hover:bg-yellow-600 cursor-pointer'
                }`}
                onClick={!submitted ? onEndTurn : undefined}
                whileTap={!submitted ? { scale: 0.97 } : {}}
                title="End Turn (Enter)"
              >
                <CheckCircle size={14} />
                {submitted ? 'Submitted' : `End Turn${pendingActionsCount > 0 ? ` (${pendingActionsCount})` : ''}`}
              </motion.button>

              {isHost && onForceEnd && (
                <motion.button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold text-xs border bg-red-900 border-red-700 text-red-200 hover:bg-red-800 cursor-pointer"
                  onClick={onForceEnd}
                  whileTap={{ scale: 0.97 }}
                  title="Force-resolve turn now for all players (host only)"
                >
                  <FastForward size={12} />
                  Resolve All
                </motion.button>
              )}
            </>
          )}

          {gameState?.phase === 'resolving' && (
            <div className="text-yellow-400 text-sm font-semibold animate-pulse">Resolving turn…</div>
          )}

          {gameState?.phase === 'ended' && (
            <div className="text-red-400 text-sm font-bold">GAME OVER</div>
          )}

          {myCountry && (
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-700">
              <span className="text-lg">{myCountry.flag}</span>
              <div className="text-xs">
                <div className="text-gray-200 font-semibold">{myCountry.name}</div>
                <div className="text-gray-400">
                  ⚔️ {myCountry.army} · ✈️ {myCountry.airPower} · 🚢 {myCountry.navalPower}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Faction progress bar */}
      {factionStats && factionStats.total > 0 && (
        <div className="h-1.5 flex w-full" title={`Axis: ${factionStats.axis} | Allies: ${factionStats.allies} | Neutral: ${factionStats.neutral}`}>
          <motion.div
            className="bg-red-700 h-full"
            style={{ width: `${(factionStats.axis / factionStats.total) * 100}%` }}
            layout
            transition={{ duration: 0.6 }}
          />
          <motion.div
            className="bg-blue-700 h-full"
            style={{ width: `${(factionStats.allies / factionStats.total) * 100}%` }}
            layout
            transition={{ duration: 0.6 }}
          />
          <motion.div
            className="bg-gray-600 h-full flex-1"
            layout
            transition={{ duration: 0.6 }}
          />
        </div>
      )}
    </header>
  );
};

export default TopBar;
