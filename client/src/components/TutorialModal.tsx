import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, MousePointer, Swords, FlaskConical, Factory, Globe, Clock } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const SLIDES = [
  {
    icon: <MousePointer size={32} className="text-yellow-400" />,
    title: 'Selecting & Attacking',
    color: 'border-yellow-700',
    steps: [
      { icon: '1️⃣', text: 'Click one of your territories on the map to select it' },
      { icon: '2️⃣', text: 'Adjacent territories glow — red for enemy, blue for friendly' },
      { icon: '3️⃣', text: 'Click an enemy territory → Attack panel appears in the sidebar' },
      { icon: '4️⃣', text: 'Set your force size with the slider, then click Queue Attack' },
    ],
    tip: 'You can queue multiple attacks per turn. Troops attacking can\'t defend.',
  },
  {
    icon: <Swords size={32} className="text-red-400" />,
    title: 'Combat',
    color: 'border-red-700',
    steps: [
      { icon: '⚔️', text: 'Combat resolves when all players submit (or timer runs out)' },
      { icon: '🎲', text: 'Attacker strength = force × tech × morale × air power' },
      { icon: '🏰', text: 'Defenders get bonuses from terrain, forts, and supply lines' },
      { icon: '🔴', text: 'Need 15% advantage to capture. Both sides take losses' },
    ],
    tip: 'Mountains & urban areas are hardest to attack. Plains are easiest.',
  },
  {
    icon: <Factory size={32} className="text-blue-400" />,
    title: 'Production & Research',
    color: 'border-blue-700',
    steps: [
      { icon: '🏭', text: 'Tab 5 (Production): Build infantry, armor, aircraft, or ships each turn' },
      { icon: '🔬', text: 'Tab 4 (Research): Invest in tech trees to boost your military' },
      { icon: '💰', text: 'Industry generates money and steel — capture more to outpace enemies' },
      { icon: '📦', text: 'Production takes 2–6 turns — plan ahead!' },
    ],
    tip: 'Germany starts with strong industry. Keep it intact to stay competitive.',
  },
  {
    icon: <Globe size={32} className="text-green-400" />,
    title: 'Diplomacy & Victory',
    color: 'border-green-700',
    steps: [
      { icon: '🤝', text: 'Tab 3 (Diplomacy): Declare war on any neutral nation' },
      { icon: '⚡', text: 'Reinforce territories: click your own territory → Reinforce tab' },
      { icon: '🏆', text: 'Win by controlling 60% of all territories, or surviving to 1945' },
      { icon: '💀', text: 'If your capital is captured, you lose your country bonus' },
    ],
    tip: 'The Axis starts at war with Poland. Move fast before France and UK mobilize.',
  },
  {
    icon: <Clock size={32} className="text-purple-400" />,
    title: 'Controls & Tips',
    color: 'border-purple-700',
    steps: [
      { icon: '⌨️', text: 'Enter = Submit turn  ·  Esc = Cancel selection' },
      { icon: '🔢', text: 'Keys 1–5 switch sidebar tabs (Nation / Territory / Diplo / Research / Production)' },
      { icon: '🖱️', text: 'Scroll wheel or +/− buttons to zoom · Drag to pan the map' },
      { icon: '💬', text: 'Chat with allies in the bottom drawer during the planning phase' },
    ],
    tip: 'Hover any territory for a detailed stats tooltip.',
  },
];

const TutorialModal: React.FC<Props> = ({ onClose }) => {
  const [page, setPage] = useState(0);
  const slide = SLIDES[page];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 px-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`relative bg-gray-950 border-2 rounded-2xl shadow-2xl w-full max-w-lg ${slide.color}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-yellow-500 font-bold text-xs uppercase tracking-widest">How to Play</span>
            <span className="text-gray-600 text-xs">{page + 1}/{SLIDES.length}</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Slide content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="px-6 py-5"
          >
            <div className="flex items-center gap-3 mb-4">
              {slide.icon}
              <h2 className="text-xl font-bold text-white font-serif">{slide.title}</h2>
            </div>

            <div className="space-y-3 mb-5">
              {slide.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 bg-gray-900 rounded-lg px-3 py-2.5">
                  <span className="text-lg shrink-0 leading-snug">{step.icon}</span>
                  <p className="text-gray-200 text-sm leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>

            <div className="bg-yellow-950 border border-yellow-800 rounded-lg px-3 py-2.5">
              <span className="text-yellow-500 text-xs font-bold">💡 TIP: </span>
              <span className="text-yellow-200 text-xs">{slide.tip}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 pb-5">
          {/* Dots */}
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-1.5 rounded-full transition-all ${i === page ? 'w-5 bg-yellow-500' : 'w-1.5 bg-gray-700 hover:bg-gray-500'}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {page > 0 && (
              <button
                onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 transition-all"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            {page < SLIDES.length - 1 ? (
              <button
                onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1 px-4 py-1.5 rounded text-sm font-semibold bg-yellow-700 hover:bg-yellow-600 text-white border border-yellow-600 transition-all"
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1 px-4 py-1.5 rounded text-sm font-semibold bg-green-700 hover:bg-green-600 text-white border border-green-600 transition-all"
              >
                Let's Go! <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TutorialModal;
