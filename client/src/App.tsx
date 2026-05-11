import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Swords } from 'lucide-react';
import { useSocket } from './hooks/useSocket';
import { useGameState } from './hooks/useGameState';
import Lobby from './components/Lobby';
import WorldMap from './components/WorldMap';
import TopBar from './components/TopBar';
import RightSidebar from './components/RightSidebar';
import BottomDrawer from './components/BottomDrawer';
import CombatModal from './components/CombatModal';
import TutorialModal from './components/TutorialModal';
import CommandBar from './components/CommandBar';

const TAB_KEYS: Record<string, 'country' | 'territory' | 'diplomacy' | 'research' | 'production'> = {
  '1': 'country', '2': 'territory', '3': 'diplomacy', '4': 'research', '5': 'production',
};

export default function App() {
  const {
    connected, playerId, lobby, gameState,
    combatQueue, chatMessages, timerSeconds, lastEvents,
    createLobby, joinLobby, pickCountry, toggleReady, startGame, quickStart,
    submitActions, sendCommand, sendChat, clearCombatQueue,
  } = useSocket();

  const myPlayer = playerId && lobby ? lobby.players[playerId] : null;
  const myCountryId = myPlayer?.countryId ?? null;

  const {
    selectedTerritoryId, pendingActions, activeTab, setActiveTab,
    handleTerritoryClick, addAction, removeAction, clearActions, clearSelection,
  } = useGameState(myCountryId);

  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([15, 30]);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (gameState && !sessionStorage.getItem('gw1939-tutorial-seen')) {
      setShowTutorial(true);
      sessionStorage.setItem('gw1939-tutorial-seen', '1');
    }
  }, [gameState?.id]);

  const submitted = gameState?.submittedPlayers.includes(playerId ?? '') ?? false;

  function onEndTurn() {
    submitActions(pendingActions as any);
    clearActions();
  }

  // Keyboard shortcuts
  useEffect(() => {
    if (!gameState) return;
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') clearSelection();
      else if (e.key === '?' || e.key === 'h') setShowTutorial(true);
      else if (TAB_KEYS[e.key]) setActiveTab(TAB_KEYS[e.key]);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [gameState]);

  const inGame = gameState !== null;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {!connected && (
        <div className="bg-red-900 text-red-200 text-xs text-center py-1 px-4 flex items-center justify-center gap-2">
          <span className="animate-pulse">●</span> Connecting to server…
        </div>
      )}

      {inGame && (
        <TopBar
          gameState={gameState}
          lobby={lobby}
          myPlayerId={playerId}
          timerSeconds={timerSeconds}
          pendingActionsCount={pendingActions.length}
          onEndTurn={onEndTurn}
        />
      )}

      <div className="flex flex-1 overflow-hidden min-h-0">
        {inGame ? (
          <>
            {/* Left column: map + command bar */}
            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
              {/* Map */}
              <div className="flex-1 relative overflow-hidden">
                <WorldMap
                  gameState={gameState}
                  selectedTerritoryId={selectedTerritoryId}
                  targetTerritoryId={null}
                  pendingActions={pendingActions}
                  myCountryId={myCountryId}
                  zoom={zoom}
                  center={center}
                  onZoomChange={setZoom}
                  onCenterChange={setCenter}
                  onTerritoryClick={(id) => handleTerritoryClick(id, gameState)}
                />

                {/* Queued actions badge on map */}
                <AnimatePresence>
                  {pendingActions.length > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-3 left-3 bg-yellow-700 border border-yellow-600 rounded-full px-3 py-1 text-white text-xs font-bold shadow-lg pointer-events-none"
                    >
                      {pendingActions.length} order{pendingActions.length !== 1 ? 's' : ''} queued
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Victory/defeat overlay */}
                {gameState.phase === 'ended' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-gray-950 border-2 border-yellow-600 rounded-2xl p-12 text-center"
                    >
                      <Swords size={48} className="text-yellow-500 mx-auto mb-4" />
                      <h2 className="text-4xl font-bold text-yellow-400 mb-2">
                        {gameState.winner === myCountryId ? 'VICTORY!' : 'DEFEAT'}
                      </h2>
                      {gameState.winner && (
                        <p className="text-gray-300 text-lg">
                          {gameState.countries[gameState.winner]?.flag} {gameState.countries[gameState.winner]?.name} wins!
                        </p>
                      )}
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Command bar — the primary action interface */}
              <CommandBar
                onCommand={sendCommand}
                onActionQueued={addAction}
                onRemoveAction={removeAction}
                pendingActions={pendingActions}
                onEndTurn={onEndTurn}
                submitted={submitted}
                disabled={gameState.phase !== 'planning'}
              />

              {/* War log drawer */}
              <BottomDrawer
                events={lastEvents}
                chatMessages={chatMessages}
                onSendChat={sendChat}
                myPlayerId={playerId}
              />
            </div>

            {/* Right sidebar — info only */}
            <RightSidebar
              gameState={gameState}
              myCountryId={myCountryId}
              selectedTerritoryId={selectedTerritoryId}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onShowTutorial={() => setShowTutorial(true)}
            />
          </>
        ) : (
          <Lobby
            lobby={lobby}
            myPlayerId={playerId}
            onCreateLobby={createLobby}
            onJoinLobby={(u, c) => joinLobby(u, c)}
            onPickCountry={pickCountry}
            onToggleReady={toggleReady}
            onStartGame={startGame}
            onQuickStart={quickStart}
          />
        )}
      </div>

      <AnimatePresence>
        {combatQueue.length > 0 && (
          <CombatModal
            results={combatQueue}
            gameState={gameState}
            onDismiss={clearCombatQueue}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      </AnimatePresence>
    </div>
  );
}
