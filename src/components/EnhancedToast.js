'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X, Wifi, WifiOff } from 'lucide-react';

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    textColor: 'text-white',
    borderColor: 'border-green-200'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    textColor: 'text-white',
    borderColor: 'border-red-200'
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-gradient-to-r from-orange-500 to-orange-600',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    textColor: 'text-white',
    borderColor: 'border-orange-200'
  },
  info: {
    icon: Info,
    bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    textColor: 'text-white',
    borderColor: 'border-blue-200'
  },
  connection: {
    icon: Wifi,
    bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    textColor: 'text-white',
    borderColor: 'border-green-200'
  },
  disconnection: {
    icon: WifiOff,
    bgColor: 'bg-gradient-to-r from-red-500 to-rose-600',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    textColor: 'text-white',
    borderColor: 'border-red-200'
  }
};

export default function EnhancedToast({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose, 
  duration = 4000,
  showProgress = true,
  embedded = false
}) {
  const config = toastConfig[type] || toastConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    if (!isVisible) return;
    if (!duration || duration <= 0) return;
    if (typeof onClose !== 'function') return;

    const t = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(t);
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.25, 0.46, 0.45, 0.94],
            staggerChildren: 0.1
          }}
          className={embedded ? "max-w-md" : "fixed top-4 right-4 z-50 max-w-md"}
        >
          <motion.div
            className={`${config.bgColor} rounded-xl shadow-2xl border ${config.borderColor} backdrop-blur-sm`}
            initial={{ x: 100 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <motion.div
                  className={`${config.iconBg} p-2 rounded-lg flex-shrink-0`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Icon size={20} className={config.iconColor} />
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <motion.p
                    className={`${config.textColor} text-sm font-medium leading-relaxed`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    {message}
                  </motion.p>
                  
                  {/* Progress Bar */}
                  {showProgress && duration > 0 && (
                    <div className="mt-2 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-white bg-opacity-70 origin-left"
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: duration / 1000, ease: 'linear' }}
                      />
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <motion.button
                  onClick={onClose}
                  className={`${config.textColor} opacity-70 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white hover:bg-opacity-20`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <X size={16} />
                </motion.button>
              </div>
            </div>

            {/* Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-xl opacity-20"
              style={{
                background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 70%)`
              }}
              animate={{
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toast Container for managing multiple toasts
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <EnhancedToast
              message={toast.message}
              type={toast.type}
              isVisible={true}
              onClose={() => removeToast(toast.id)}
              duration={toast.duration}
              showProgress={toast.showProgress}
              embedded={true}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000, showProgress = true) => {
    const id = Date.now();
    const newToast = { id, message, type, duration, showProgress };
    
    setToasts(prev => [...prev, newToast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts
  };
}
