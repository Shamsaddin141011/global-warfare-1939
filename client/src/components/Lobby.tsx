import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Users, Plus, LogIn, Check, Crown, Circle, Zap } from 'lucide-react';
import { Lobby as LobbyType } from '@shared/types';

interface Props {
  lobby: LobbyType | null;
  myPlayerId: string | null;
  onCreateLobby: (username: string) => void;
  onJoinLobby: (username: string, code: string) => void;
  onPickCountry: (countryId: string) => void;
  onToggleReady: () => void;
  onStartGame: () => void;
  onQuickStart: (username: string) => void;
}

const MAJOR_POWERS = [
  { id: 'germany', name: 'Germany', flag: '🇩🇪', faction: 'axis', desc: 'Aggressive continental power. Starts at war with Poland.' },
  { id: 'italy', name: 'Italy', flag: '🇮🇹', faction: 'axis', desc: 'Mediterranean power. Opportunist — enters when advantageous.' },
  { id: 'japan', name: 'Japan', flag: '🇯🇵', faction: 'axis', desc: 'Pacific empire. Already fighting China in 1939.' },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', faction: 'allies', desc: 'Global empire. Naval powerhouse with many colonies.' },
  { id: 'france', name: 'France', flag: '🇫🇷', faction: 'allies', desc: 'Continental defender. Massive colonial empire.' },
  { id: 'usa', name: 'United States', flag: '🇺🇸', faction: 'neutral', desc: 'Industrial giant. Starts isolationist but can dominate if mobilized.' },
  { id: 'ussr', name: 'Soviet Union', flag: '🇷🇺', faction: 'neutral', desc: 'Massive manpower and industry. Non-aggression pact with Germany.' },
  { id: 'china', name: 'China', flag: '🇨🇳', faction: 'allies', desc: 'Enormous population. Weakly equipped but resilient against Japan.' },
];

const Lobby: React.FC<Props> = ({
  lobby, myPlayerId, onCreateLobby, onJoinLobby, onPickCountry, onToggleReady, onStartGame, onQuickStart,
}) => {
  const [screen, setScreen] = useState<'home' | 'create' | 'join' | 'waiting' | 'solo'>('home');
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [soloLoading, setSoloLoading] = useState(false);

  // If we already have a lobby, show waiting room
  const effectiveScreen = lobby ? 'waiting' : screen;

  const myPlayer = lobby && myPlayerId ? lobby.players[myPlayerId] : null;

  async function handleCreate() {
    if (!username.trim()) { setError('Enter a username'); return; }
    onCreateLobby(username.trim());
    setScreen('waiting');
  }

  async function handleJoin() {
    if (!username.trim()) { setError('Enter a username'); return; }
    if (!roomCode.trim()) { setError('Enter a room code'); return; }
    onJoinLobby(username.trim(), roomCode.trim());
  }

  async function handleSolo() {
    if (!username.trim()) { setError('Enter a commander name'); return; }
    setSoloLoading(true);
    await onQuickStart(username.trim());
    setSoloLoading(false);
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-950 overflow-auto">
      <AnimatePresence mode="wait">
        {effectiveScreen === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center max-w-lg px-6"
          >
            <div className="flex justify-center mb-4">
              <Swords size={56} className="text-yellow-500" />
            </div>
            <h1 className="text-5xl font-bold text-yellow-400 mb-2 tracking-wider font-serif">Global Warfare</h1>
            <p className="text-yellow-700 text-xl mb-2 tracking-widest uppercase">1939</p>
            <p className="text-gray-400 mb-10">Real-time multiplayer WW2 grand strategy. 2–8 players.</p>

            <div className="flex gap-4 justify-center flex-wrap">
              <motion.button
                className="btn-primary flex items-center gap-2 text-base px-8 py-3"
                onClick={() => setScreen('create')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Plus size={18} /> Create Game
              </motion.button>
              <motion.button
                className="btn-secondary flex items-center gap-2 text-base px-8 py-3"
                onClick={() => setScreen('join')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <LogIn size={18} /> Join Game
              </motion.button>
            </div>

            <div className="mt-4">
              <motion.button
                className="flex items-center gap-2 text-sm px-6 py-2.5 rounded border border-green-800 bg-green-900 bg-opacity-40 text-green-300 hover:bg-green-900 hover:bg-opacity-70 transition-all mx-auto"
                onClick={() => setScreen('solo')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Zap size={16} className="text-green-400" />
                Solo vs AI — Quick Start
              </motion.button>
            </div>

            <p className="text-gray-600 text-xs mt-8">
              September 1939 — September 1945 · 8 major powers · 60+ territories
            </p>
          </motion.div>
        )}

        {effectiveScreen === 'solo' && (
          <motion.div key="solo" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="panel p-8 w-full max-w-sm"
          >
            <h2 className="text-green-400 font-bold text-xl mb-2 flex items-center gap-2"><Zap size={18} /> Solo vs AI</h2>
            <p className="text-gray-500 text-sm mb-6">You play as Germany. 7 AI opponents. Starts immediately.</p>
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-1 block">Your name</label>
              <input
                value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Commander name…"
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                onKeyDown={e => e.key === 'Enter' && handleSolo()}
                autoFocus
              />
            </div>
            {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => { setScreen('home'); setError(''); }}>Back</button>
              <button
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded bg-green-800 hover:bg-green-700 text-white font-semibold border border-green-600 transition-all disabled:opacity-50"
                onClick={handleSolo}
                disabled={soloLoading}
              >
                {soloLoading ? (
                  <span className="animate-pulse">Starting…</span>
                ) : (
                  <><Zap size={16} /> Launch</>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {effectiveScreen === 'create' && (
          <motion.div key="create" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="panel p-8 w-full max-w-sm"
          >
            <h2 className="text-yellow-400 font-bold text-xl mb-6 flex items-center gap-2"><Plus size={18} /> Create Game</h2>
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-1 block">Your name</label>
              <input
                value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Commander name…"
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>
            {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => { setScreen('home'); setError(''); }}>Back</button>
              <button className="btn-primary flex-1" onClick={handleCreate}>Create Room</button>
            </div>
          </motion.div>
        )}

        {effectiveScreen === 'join' && (
          <motion.div key="join" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="panel p-8 w-full max-w-sm"
          >
            <h2 className="text-yellow-400 font-bold text-xl mb-6 flex items-center gap-2"><LogIn size={18} /> Join Game</h2>
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-1 block">Your name</label>
              <input
                value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Commander name…"
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white mb-3"
              />
              <label className="text-gray-400 text-sm mb-1 block">Room code</label>
              <input
                value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white font-mono text-lg tracking-widest"
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                maxLength={6}
              />
            </div>
            {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => { setScreen('home'); setError(''); }}>Back</button>
              <button className="btn-primary flex-1" onClick={handleJoin}>Join</button>
            </div>
          </motion.div>
        )}

        {effectiveScreen === 'waiting' && lobby && (
          <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full max-w-5xl px-6 py-8"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-yellow-400 font-bold text-2xl font-serif">War Room</h2>
                <p className="text-gray-400 text-sm">Share this code with allies:</p>
                <div className="font-mono text-3xl text-white tracking-widest mt-1 bg-gray-900 border border-gray-700 rounded px-4 py-2 inline-block">
                  {lobby.roomCode}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-gray-500" />
                <span className="text-gray-400 text-sm">{Object.keys(lobby.players).length} / {lobby.settings.maxPlayers}</span>
              </div>
            </div>

            {/* Country grid */}
            <div className="mb-6">
              <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">Choose Your Nation</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {MAJOR_POWERS.map(country => {
                  const takenBy = Object.values(lobby.players).find(p => p.countryId === country.id);
                  const isMine = myPlayer?.countryId === country.id;
                  const isAvailable = !takenBy;

                  return (
                    <motion.button
                      key={country.id}
                      onClick={() => isAvailable || isMine ? onPickCountry(country.id) : undefined}
                      className={`p-3 rounded-lg border text-left transition-all relative ${
                        isMine
                          ? 'border-yellow-500 bg-yellow-900 bg-opacity-30'
                          : !isAvailable
                          ? 'border-gray-700 bg-gray-900 opacity-50 cursor-not-allowed'
                          : 'border-gray-700 bg-gray-900 hover:border-gray-500 hover:bg-gray-800 cursor-pointer'
                      }`}
                      whileHover={isAvailable && !isMine ? { scale: 1.02 } : {}}
                      whileTap={isAvailable || isMine ? { scale: 0.98 } : {}}
                    >
                      {isMine && (
                        <div className="absolute top-1 right-1 text-yellow-400"><Check size={12} /></div>
                      )}
                      <div className="text-2xl mb-1">{country.flag}</div>
                      <div className="text-white font-semibold text-sm">{country.name}</div>
                      <div className={`text-[10px] font-semibold mb-1 ${
                        country.faction === 'axis' ? 'text-red-400' :
                        country.faction === 'allies' ? 'text-blue-400' : 'text-gray-400'
                      }`}>{country.faction.toUpperCase()}</div>
                      <div className="text-gray-500 text-[10px]">{country.desc}</div>
                      {takenBy && (
                        <div className="text-yellow-400 text-[10px] mt-1 font-semibold">
                          {takenBy.id === myPlayerId ? 'Your pick' : takenBy.username || 'Taken'}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Player list */}
            <div className="mb-6">
              <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">Players</div>
              <div className="flex flex-wrap gap-3">
                {Object.values(lobby.players).map(player => (
                  <div key={player.id}
                    className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded px-3 py-2"
                  >
                    {player.isHost && <Crown size={12} className="text-yellow-400" />}
                    <span className={player.isOnline ? 'text-green-400 online-dot text-[8px]' : 'text-gray-600 text-[8px]'}>●</span>
                    <span className="text-white text-sm">{player.username || 'Joining…'}</span>
                    {player.countryId && (
                      <span className="text-lg">
                        {MAJOR_POWERS.find(c => c.id === player.countryId)?.flag}
                      </span>
                    )}
                    {player.isReady
                      ? <Check size={12} className="text-green-400" />
                      : <Circle size={12} className="text-gray-600" />
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <motion.button
                className={`btn-secondary flex items-center gap-2 px-6 py-2.5 ${myPlayer?.isReady ? 'opacity-70' : ''}`}
                onClick={onToggleReady}
                whileTap={{ scale: 0.97 }}
              >
                <Check size={16} />
                {myPlayer?.isReady ? 'Unready' : 'Ready'}
              </motion.button>

              {myPlayer?.isHost && (
                <motion.button
                  className="btn-primary flex items-center gap-2 px-8 py-2.5 text-base"
                  onClick={onStartGame}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Swords size={18} /> Start Game
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lobby;
