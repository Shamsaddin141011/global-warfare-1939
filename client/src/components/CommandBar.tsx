import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { CommandResult, PlayerAction } from '@shared/types';

interface HistoryEntry {
  id: number;
  text: string;
  result: CommandResult;
}

interface Props {
  onCommand: (text: string) => Promise<CommandResult>;
  onActionQueued: (action: PlayerAction) => void;
  onRemoveAction: (index: number) => void;
  pendingActions: PlayerAction[];
  onEndTurn: () => void;
  submitted: boolean;
  disabled?: boolean;
}

const EXAMPLES = [
  'attack France with 10 divisions',
  'send 8 troops to Poland',
  'reinforce Berlin',
  'build 5 infantry units',
  'research armor technology',
  'declare war on France',
  'push all forces into Denmark',
  'move 15 divisions from Germany to Austria',
];

let _histId = 0;

const CommandBar: React.FC<Props> = ({
  onCommand, onActionQueued, onRemoveAction, pendingActions, onEndTurn, submitted, disabled,
}) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [exIdx, setExIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setInterval(() => setExIdx(i => (i + 1) % EXAMPLES.length), 3500);
    return () => clearInterval(id);
  }, []);

  async function submit() {
    const text = input.trim();
    if (!text || loading || disabled) return;
    setLoading(true);
    setInput('');
    setHistIdx(-1);

    const id = ++_histId;
    // Optimistic loading entry
    setHistory(prev => [{ id, text, result: { ok: true, message: '…' } }, ...prev].slice(0, 12));

    try {
      const result = await onCommand(text);
      setHistory(prev => prev.map(e => e.id === id ? { ...e, result } : e));
      if (result.ok && result.action) {
        onActionQueued(result.action);
      }
    } catch (err: any) {
      setHistory(prev => prev.map(e =>
        e.id === id ? { ...e, result: { ok: false, message: err?.message ?? 'Command failed. Try again.' } } : e
      ));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next);
      setInput(history[next]?.text ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? '' : (history[next]?.text ?? ''));
    }
  }

  const actionTypeLabel: Record<string, string> = {
    move: '⚔️ Attack',
    reinforce: '🛡 Reinforce',
    build: '🏭 Build',
    research: '🔬 Research',
    diplomacy: '🤝 Diplomacy',
  };

  return (
    <div className="bg-gray-950 border-t-2 border-yellow-900 flex flex-col">
      {/* Queued actions list */}
      <AnimatePresence initial={false}>
        {pendingActions.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-3 pb-1">
              <div className="text-xs text-yellow-600 font-semibold uppercase tracking-widest mb-2">
                Queued Orders ({pendingActions.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {pendingActions.map((action, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1.5 bg-gray-900 border border-gray-700 rounded-full px-3 py-1 text-xs text-gray-300"
                  >
                    <span>{actionTypeLabel[action.type] ?? action.type}</span>
                    <button
                      onClick={() => onRemoveAction(i)}
                      className="text-gray-600 hover:text-red-400 transition-colors ml-1"
                    >
                      <XCircle size={11} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command history */}
      <AnimatePresence initial={false}>
        {history.length > 0 && (
          <div className="px-4 pt-2 space-y-1 max-h-28 overflow-y-auto">
            {history.map(entry => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 text-xs leading-relaxed"
              >
                <span className="text-gray-600 font-mono shrink-0">›</span>
                <span className="text-gray-500 shrink-0 max-w-[30%] truncate">{entry.text}</span>
                <span className="text-gray-700 shrink-0">→</span>
                {entry.result.message === '…' ? (
                  <span className="text-yellow-600 flex items-center gap-1">
                    <Loader size={10} className="animate-spin" /> thinking…
                  </span>
                ) : entry.result.ok ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <CheckCircle size={10} className="shrink-0" />
                    {entry.result.message}
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1">
                    <XCircle size={10} className="shrink-0" />
                    {entry.result.message}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main input row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Prompt label */}
        <div className="text-yellow-600 font-mono text-sm shrink-0 select-none">›_</div>

        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={submitted ? 'Turn submitted — waiting…' : disabled ? 'Waiting for turn…' : EXAMPLES[exIdx]}
          disabled={disabled || loading || submitted}
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-700 disabled:opacity-40 font-mono"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Send button */}
        <motion.button
          onClick={submit}
          disabled={!input.trim() || loading || disabled || submitted}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-700 hover:bg-yellow-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shrink-0"
          whileTap={{ scale: 0.95 }}
        >
          {loading
            ? <><Loader size={14} className="animate-spin" /> Thinking…</>
            : <><Send size={14} /> Send</>}
        </motion.button>

        {/* End turn */}
        <motion.button
          onClick={onEndTurn}
          disabled={submitted}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all shrink-0 ${
            submitted
              ? 'bg-green-900 border-green-700 text-green-300 cursor-default opacity-70'
              : 'bg-gray-800 border-gray-600 hover:border-yellow-600 hover:bg-gray-700 text-white'
          }`}
          whileTap={!submitted ? { scale: 0.95 } : {}}
        >
          {submitted ? '✅ Submitted' : `End Turn${pendingActions.length > 0 ? ` (${pendingActions.length})` : ''}`}
        </motion.button>
      </div>

      {/* Hint bar */}
      <div className="px-4 pb-2 flex items-center gap-4 text-[10px] text-gray-700">
        <span>Enter = send · ↑↓ = history</span>
        <span className="text-gray-800">|</span>
        <span>Try: <span className="text-gray-600 italic">"attack Poland with 15 divisions"</span> or <span className="text-gray-600 italic">"build 3 armor"</span></span>
      </div>
    </div>
  );
};

export default CommandBar;
