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
import RecapModal from './components/RecapModal';
import TutorialModal from './components/TutorialModal';
import CommandBar from './components/CommandBar';
import AttackModal from './components/AttackModal';
import CapitalPanel from './components/CapitalPanel';
import AllianceRequestModal from './components/AllianceRequestModal';

const TAB_KEYS: Record<string, 'country' | 'territory' | 'diplomacy' | 'research' | 'production'> = {
  '1': 'country', '2': 'territory', '3': 'diplomacy', '4': 'research', '5': 'production',
};

export default function App() {
  const {
    connected, playerId, lobby, gameState,
    combatQueue, chatMessages, timerSeconds, lastEvents,
    lastRoundRecap, nukeAnimation, cheatNotification, allianceRequest, allyTroopsNotification,
    isRejoining, overflowNotification,
    createLobby, joinLobby, pickCountry, toggleReady, startGame, quickStart,
    submitActions, forceEndTurn, sendCommand, sendChat, clearCombatQueue, dismissRecap, launchNuke,
    proposeAlliance, respondToAlliance, breakAlliance, leaveGame, kickPlayer,
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
  const [shownRecapTurn, setShownRecapTurn] = useState<number>(-1);
  const [nukingMode, setNukingMode] = useState(false);

  // Map interaction mode: inspect (default), attack (click own → enemy), move (click own → own)
  const [mapMode, setMapMode] = useState<'inspect' | 'attack' | 'move'>('inspect');
  const [attackSource, setAttackSource] = useState<string | null>(null);
  const [attackTarget, setAttackTarget] = useState<string | null>(null);
  const [capitalPanel, setCapitalPanel] = useState<string | null>(null);

  function setMode(next: 'inspect' | 'attack' | 'move') {
    setMapMode(prev => {
      if (prev === next) return 'inspect'; // toggle off
      return next;
    });
    setAttackSource(null);
    setAttackTarget(null);
  }

  const myNukeBuildProgress = gameState?.countries[myCountryId ?? '']?.nukeBuildProgress ?? 0;

  function onMapClick(territoryId: string) {
    if (!gameState) return;
    if (nukingMode) {
      launchNuke(territoryId);
      setNukingMode(false);
      return;
    }

    const t = gameState.territories[territoryId];
    if (!t) return;
    const isOwn = t.ownerId === myCountryId;
    const isAllied = !!(myCountryId && gameState.countries[myCountryId]?.alliedWith?.includes(t.ownerId));
    const ownerCountry = gameState.countries[t.ownerId];
    const isCapital = ownerCountry?.capital === territoryId;

    // In inspect mode: show capital panel for other countries' capitals
    if (mapMode === 'inspect') {
      if (isCapital && !isOwn && myCountryId) {
        setCapitalPanel(territoryId);
      } else {
        setCapitalPanel(null);
      }
      handleTerritoryClick(territoryId, gameState);
      return;
    }

    // Source must be one of yours
    if (!attackSource) {
      if (isOwn) {
        setAttackSource(territoryId);
        setAttackTarget(null);
      }
      return;
    }

    // Already have source — interpret this click as target
    if (mapMode === 'attack') {
      if (isOwn) {
        setAttackSource(territoryId);
        setAttackTarget(null);
      } else {
        setAttackTarget(territoryId);
      }
    } else if (mapMode === 'move') {
      if (isOwn) {
        if (territoryId === attackSource) {
          setAttackSource(null);
          setAttackTarget(null);
        } else {
          setAttackTarget(territoryId);
        }
      } else if (isAllied) {
        // Allow sending troops to allied territory
        setAttackTarget(territoryId);
      }
    }
  }

  function confirmAttack(force: number) {
    if (!attackSource || !attackTarget || !myCountryId) return;
    addAction({
      playerId: '',
      countryId: myCountryId,
      type: 'move',
      data: { fromTerritoryId: attackSource, toTerritoryId: attackTarget, forceSize: force },
    });
    setAttackTarget(null);
    // keep source so user can chain orders from the same territory
  }

  const showRecap =
    !!lastRoundRecap &&
    combatQueue.length === 0 &&
    shownRecapTurn !== lastRoundRecap.turn;

  useEffect(() => {
    if (gameState && !sessionStorage.getItem('gw1939-tutorial-seen')) {
      setShowTutorial(true);
      sessionStorage.setItem('gw1939-tutorial-seen', '1');
    }
  }, [gameState?.id]);

  const submitted = !!(myCountryId && gameState?.submittedPlayers.includes(myCountryId));

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

  if (isRejoining) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white gap-4">
        <div className="text-4xl animate-pulse">⚔</div>
        <div className="text-xl font-bold text-yellow-300">Reconnecting to game...</div>
        <div className="text-gray-400 text-sm">Restoring your session</div>
        <button
          onClick={leaveGame}
          className="mt-6 text-xs text-gray-500 hover:text-gray-300 underline"
        >
          Cancel and return to menu
        </button>
      </div>
    );
  }

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
          onForceEnd={forceEndTurn}
          mapMode={mapMode}
          onSetMode={setMode}
          onLeave={leaveGame}
          onKickPlayer={kickPlayer}
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
                  selectedTerritoryId={mapMode !== 'inspect' ? attackSource : selectedTerritoryId}
                  targetTerritoryId={mapMode !== 'inspect' ? attackTarget : null}
                  pendingActions={pendingActions}
                  myCountryId={myCountryId}
                  zoom={zoom}
                  center={center}
                  onZoomChange={setZoom}
                  onCenterChange={setCenter}
                  onTerritoryClick={onMapClick}
                  nukingMode={nukingMode}
                  nukeUnlocked={myNukeBuildProgress >= 100}
                  nukeReady={myNukeBuildProgress >= 100}
                  nukeBuildProgress={myNukeBuildProgress}
                  nukeAnimation={nukeAnimation ?? null}
                  onNukeButtonClick={() => setNukingMode(m => !m)}
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
            onLeave={leaveGame}
            onKickPlayer={kickPlayer}
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
        {showRecap && lastRoundRecap && (
          <RecapModal
            recap={lastRoundRecap}
            gameState={gameState}
            onDismiss={() => {
              setShownRecapTurn(lastRoundRecap.turn);
              dismissRecap();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {cheatNotification && (
          <motion.div
            key="cheat-notif"
            initial={{ scale: 0.3, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.3, opacity: 0, rotate: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #001a00, #003300, #001a00)',
              border: '4px solid #00ff44',
              borderRadius: 20,
              padding: '40px 60px',
              textAlign: 'center',
              boxShadow: '0 0 60px 20px #00ff44, 0 0 120px 40px #00cc33, inset 0 0 40px rgba(0,255,68,0.1)',
              maxWidth: 680,
            }}>
              <div style={{
                fontSize: 64,
                fontWeight: 900,
                color: '#00ff44',
                textShadow: '0 0 20px #00ff44, 0 0 40px #00cc33, 0 0 80px #009922',
                letterSpacing: '0.06em',
                fontFamily: 'Impact, Arial Black, sans-serif',
                lineHeight: 1.1,
                marginBottom: 16,
              }}>
                NAZMI IS PEYSER!
              </div>
              <div style={{
                fontSize: 26,
                fontWeight: 700,
                color: '#66ff88',
                textShadow: '0 0 12px #00ff44',
                fontFamily: 'monospace',
                letterSpacing: '0.04em',
              }}>
                {cheatNotification.countryFlag} Commander <span style={{ color: '#ffffff', textShadow: '0 0 10px #00ff44' }}>{cheatNotification.username}</span>
                {' '}({cheatNotification.countryName})
              </div>
              <div style={{
                marginTop: 12,
                fontSize: 32,
                fontWeight: 900,
                color: '#ffff00',
                textShadow: '0 0 16px #ffff00, 0 0 32px #ff8800',
                fontFamily: 'Impact, Arial Black, sans-serif',
                letterSpacing: '0.08em',
              }}>
                IS NOW OP!! 💀⚡🔥
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mapMode !== 'inspect' && attackSource && attackTarget && gameState && (
          <AttackModal
            source={attackSource}
            target={attackTarget}
            gameState={gameState}
            myCountryId={myCountryId}
            onConfirm={confirmAttack}
            onCancel={() => setAttackTarget(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {capitalPanel && gameState && myCountryId && (
          <CapitalPanel
            gameState={gameState}
            myCountryId={myCountryId}
            capitalTerritoryId={capitalPanel}
            onPropose={proposeAlliance}
            onBreak={breakAlliance}
            onClose={() => setCapitalPanel(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {allianceRequest && (
          <AllianceRequestModal
            request={allianceRequest}
            onAccept={() => respondToAlliance(allianceRequest.fromCountryId, true)}
            onDecline={() => respondToAlliance(allianceRequest.fromCountryId, false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {allyTroopsNotification && (
          <motion.div
            key="ally-troops-notif"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-4 z-50 w-72 bg-gray-950 border border-green-700 rounded-xl shadow-2xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="bg-green-900 rounded-full p-2 shrink-0">
                <span className="text-lg">🤝</span>
              </div>
              <div>
                <div className="text-green-400 font-bold text-xs uppercase tracking-wider mb-0.5">Allied Reinforcements</div>
                <div className="text-white text-sm">
                  <span className="font-semibold text-green-300">{allyTroopsNotification.fromCountryName}</span> sent{' '}
                  <span className="font-bold text-yellow-300">{allyTroopsNotification.forceSize} troops</span> to your{' '}
                  <span className="font-semibold">{allyTroopsNotification.territoryName}</span> province!
                </div>
              </div>
            </div>
            <div className="mt-2 h-0.5 bg-green-900 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-500"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 6, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {overflowNotification && (
          <motion.div
            key="overflow-notif"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-40 right-4 z-50 w-72 bg-gray-950 border border-yellow-700 rounded-xl shadow-2xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="bg-yellow-900 rounded-full p-2 shrink-0">
                <span className="text-lg">⚠️</span>
              </div>
              <div>
                <div className="text-yellow-400 font-bold text-xs uppercase tracking-wider mb-0.5">Province at Capacity</div>
                <div className="text-white text-sm">{overflowNotification}</div>
              </div>
            </div>
            <div className="mt-2 h-0.5 bg-yellow-900 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-yellow-500"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 7, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode banner */}
      {mapMode !== 'inspect' && inGame && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full text-xs shadow-lg pointer-events-none border ${
          mapMode === 'attack'
            ? 'bg-red-900 border-red-700 text-red-100'
            : 'bg-blue-900 border-blue-700 text-blue-100'
        }`}>
          {mapMode === 'attack' ? '⚔ Attack Mode' : '→ Move Mode'} —{' '}
          {!attackSource
            ? 'click YOUR territory to set source'
            : mapMode === 'attack'
              ? 'click an enemy/neutral territory'
              : 'click your territory or an ally\'s territory'}
        </div>
      )}
    </div>
  );
}
