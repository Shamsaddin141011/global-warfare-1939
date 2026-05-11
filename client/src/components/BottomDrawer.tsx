import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ScrollText, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { GameEvent, ChatMessage } from '@shared/types';
import { MONTH_NAMES } from '../lib/mapColors';

interface Props {
  events: GameEvent[];
  chatMessages: ChatMessage[];
  onSendChat: (channel: string, text: string) => void;
  myPlayerId: string | null;
}

const BottomDrawer: React.FC<Props> = ({ events, chatMessages, onSendChat, myPlayerId }) => {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<'log' | 'chat'>('log');
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  function handleSend() {
    const text = chatInput.trim();
    if (!text) return;
    onSendChat('global', text);
    setChatInput('');
  }

  return (
    <div className="shrink-0 border-t border-gray-800 bg-gray-950">
      {/* Toggle button */}
      <button
        className="w-full flex items-center justify-between px-4 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-900 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          {tab === 'log' ? <ScrollText size={12} /> : <MessageSquare size={12} />}
          <span>{tab === 'log' ? 'War Log' : 'Chat'}</span>
          {chatMessages.length > 0 && tab === 'log' && (
            <span className="bg-blue-700 text-white rounded-full px-1.5 text-[10px]">{chatMessages.length}</span>
          )}
        </div>
        {open ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 180 }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              <button
                className={`flex items-center gap-1 px-4 py-1.5 text-xs transition-colors ${tab === 'log' ? 'text-yellow-400 border-b border-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
                onClick={() => setTab('log')}
              >
                <ScrollText size={11} /> War Log
              </button>
              <button
                className={`flex items-center gap-1 px-4 py-1.5 text-xs transition-colors ${tab === 'chat' ? 'text-yellow-400 border-b border-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
                onClick={() => setTab('chat')}
              >
                <MessageSquare size={11} /> Chat
              </button>
            </div>

            {tab === 'log' && (
              <div className="h-32 overflow-y-auto px-4 py-2 space-y-1">
                {events.length === 0 && (
                  <div className="text-gray-600 text-xs">No events yet.</div>
                )}
                {events.map((e, i) => (
                  <div key={i} className="text-xs flex gap-2">
                    <span className="text-gray-600 shrink-0">{e.date}</span>
                    <span className={
                      e.type === 'combat' ? 'text-red-300' :
                      e.type === 'diplomacy' ? 'text-blue-300' :
                      e.type === 'research' ? 'text-purple-300' :
                      e.type === 'narration' ? 'text-yellow-300' :
                      'text-gray-300'
                    }>{e.message}</span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            )}

            {tab === 'chat' && (
              <div className="flex flex-col h-32">
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className="text-xs flex gap-2">
                      <span className={msg.senderId === myPlayerId ? 'text-yellow-400' : 'text-blue-400'}>
                        {msg.senderName}:
                      </span>
                      <span className="text-gray-300">{msg.text}</span>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2 px-4 pb-2">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Send a message…"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white placeholder-gray-600"
                  />
                  <button onClick={handleSend} className="btn-primary px-2 py-1">
                    <Send size={12} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BottomDrawer;
