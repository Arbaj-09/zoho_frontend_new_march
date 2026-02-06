'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const toastColors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-orange-500',
  info: 'bg-blue-500',
};

export default function AnimatedToast({ message, type, isVisible, onClose }) {
  const Icon = toastIcons[type] || Info;
  const bgColor = toastColors[type] || 'bg-gray-500';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[300px]"
        >
          <motion.div
            className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <Icon size={16} className="text-white" />
          </motion.div>
          <motion.p
            className="flex-1 text-sm text-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            {message}
          </motion.p>
          <motion.button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.3 }}
          >
            <X size={16} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
