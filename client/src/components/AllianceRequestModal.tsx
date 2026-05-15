import React from 'react';
import { motion } from 'framer-motion';
import { Handshake } from 'lucide-react';
import { AllianceRequest } from '../hooks/useSocket';

interface Props {
  request: AllianceRequest;
  onAccept: () => void;
  onDecline: () => void;
}

const AllianceRequestModal: React.FC<Props> = ({ request, onAccept, onDecline }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-950 border-2 border-green-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
        initial={{ scale: 0.8, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="flex justify-center mb-3">
          <div className="bg-green-900 rounded-full p-3">
            <Handshake size={28} className="text-green-400" />
          </div>
        </div>

        <div className="text-4xl mb-2">{request.fromCountryFlag}</div>
        <h2 className="text-white font-bold text-lg mb-1">{request.fromCountryName}</h2>
        <p className="text-gray-300 text-sm mb-6">wants to form an alliance with you!</p>

        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 py-2.5 rounded-lg bg-red-900 hover:bg-red-800 border border-red-700 text-red-200 font-bold text-sm transition-colors"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-2.5 rounded-lg bg-green-800 hover:bg-green-700 border border-green-600 text-green-100 font-bold text-sm transition-colors"
          >
            Accept
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AllianceRequestModal;
