import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="relative max-w-lg w-full">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff3333]/20 to-[#9945ff]/20 rounded-full blur-3xl animate-pulse" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-[#121212] border border-[#2a2a2a] rounded-2xl p-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff3333] to-[#9945ff] rounded-full blur-xl opacity-50" />
              <div className="relative bg-[#1a1a1a] p-4 rounded-full border border-[#00ffff]">
                <AlertTriangle size={48} className="text-[#ff3333]" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-2">Page Not Found</h2>
          <p className="text-[#b0b0b0] mb-8">
            The page you requested does not exist or was moved.
          </p>

          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00ffff] to-[#00a8ff] text-black font-medium rounded-lg mx-auto hover:shadow-lg hover:shadow-[#00ffff]/20 transition-all"
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
