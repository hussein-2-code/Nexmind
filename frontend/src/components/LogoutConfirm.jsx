import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';

const LogoutConfirm = ({ isOpen, onClose, onConfirm, darkMode = true }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80"
          >
            <div className={`rounded-xl p-6 shadow-2xl border ${darkMode ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-[#ff3333]/10 flex items-center justify-center">
                  <LogOut size={28} className="text-red-600 dark:text-[#ff3333]" />
                </div>
              </div>
              <h3 className={`text-lg font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Logout</h3>
              <p className={`text-center mb-5 ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>Are you sure you want to logout?</p>
              <div className="flex gap-3">
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 dark:bg-[#ff3333] text-white rounded-lg hover:bg-red-700 dark:hover:bg-[#ff3333]/80 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={onClose}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LogoutConfirm;