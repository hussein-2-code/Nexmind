import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NotFound = () => {
  const { darkMode } = useTheme();
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${darkMode ? 'bg-[#0a0a0a]' : 'bg-slate-100'}`}>
      <div className="relative max-w-lg w-full">
        <div className={`absolute inset-0 rounded-full blur-3xl animate-pulse ${darkMode ? 'bg-gradient-to-r from-[#ff3333]/20 to-[#9945ff]/20' : 'bg-gradient-to-r from-red-200/30 to-violet-200/30'}`} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative rounded-2xl p-8 text-center border ${darkMode ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white border-slate-200'}`}
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              {darkMode && <div className="absolute inset-0 bg-gradient-to-r from-[#ff3333] to-[#9945ff] rounded-full blur-xl opacity-50" />}
              <div className={`relative p-4 rounded-full border ${darkMode ? 'bg-[#1a1a1a] border-[#00ffff]' : 'bg-slate-100 border-cyan-300'}`}>
                <AlertTriangle size={48} className="text-red-500 dark:text-[#ff3333]" />
              </div>
            </div>
          </div>

          <h1 className={`text-6xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>404</h1>
          <h2 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Page Not Found</h2>
          <p className={`mb-8 ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>
            The page you requested does not exist or was moved.
          </p>

          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-[#00ffff] dark:to-[#00a8ff] text-white dark:text-black font-medium rounded-lg mx-auto hover:shadow-lg hover:shadow-cyan-500/20 dark:hover:shadow-[#00ffff]/20 transition-all"
            >
              <Home size={20} />
              Back to Home
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
