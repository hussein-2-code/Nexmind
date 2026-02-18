import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';

const LogoutConfirm = ({ isOpen, onClose, onConfirm }) => {
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
            <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-6 shadow-2xl">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-[#ff3333]/10 flex items-center justify-center">
                  <LogOut size={28} className="text-[#ff3333]" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2">Logout</h3>
              <p className="text-[#b0b0b0] text-center mb-5">Are you sure you want to logout?</p>
              <div className="flex gap-3">
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2 bg-[#ff3333] text-white rounded-lg hover:bg-[#ff3333]/80 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
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