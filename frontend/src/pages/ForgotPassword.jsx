import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const ForgotPassword = () => {
  const { darkMode } = useTheme();
  const [email, setEmail] = useState('');

  const forgotPasswordMutation = useMutation({
    mutationFn: async ({ email }) => {
      const response = await fetch('http://localhost:8000/api/users/forgotPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link');
      }

      return data;
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    forgotPasswordMutation.mutate({ email });
  };

  const isLoading = forgotPasswordMutation.isPending;
  const error = forgotPasswordMutation.error;
  const isSuccess = forgotPasswordMutation.isSuccess;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${darkMode ? 'bg-[#0a0a0a]' : 'bg-slate-100'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-32 w-80 h-80 rounded-full blur-3xl animate-pulse ${darkMode ? 'bg-[#00a8ff]/20' : 'bg-blue-400/10'}`} />
        <div className={`absolute -bottom-40 -left-32 w-80 h-80 rounded-full blur-3xl animate-pulse delay-700 ${darkMode ? 'bg-[#9945ff]/20' : 'bg-violet-400/10'}`} />
      </div>

      <div className="relative w-full max-w-md">
        {darkMode && (
          <div className="absolute -inset-1 bg-gradient-to-r from-[#00a8ff] via-[#9945ff] to-[#00ffff] rounded-2xl blur-xl opacity-20 animate-gradient" />
        )}

        <div className={`relative rounded-2xl p-8 border shadow-2xl ${darkMode ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white border-slate-200'}`}>
          <div className="text-center mb-6">
            <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Forgot Password</h1>
            <p className={`text-sm ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>
              Enter your email address and we&apos;ll send you a password reset link.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-[#ff3333]/10 border border-red-200 dark:border-[#ff3333]/30 rounded-lg text-sm text-red-600 dark:text-[#ff8080]">
              {error.message || 'Something went wrong. Please try again.'}
            </div>
          )}

          {isSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-[#00ff88]/10 border border-emerald-200 dark:border-[#00ff88]/30 rounded-lg text-sm text-emerald-700 dark:text-[#a9ffcf]">
              {forgotPasswordMutation.data?.message || 'Reset link sent to your email if it exists in our system.'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full px-3 py-3 rounded-lg focus:outline-none focus:ring-1 transition-all duration-200 ${darkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder-[#808080] focus:border-[#00ffff] focus:ring-[#00ffff]' : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/30'}`}
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#00a8ff] to-[#9945ff] 
                       text-white font-medium rounded-lg
                       hover:from-[#00a8ff]/90 hover:to-[#9945ff]/90 
                       focus:outline-none focus:ring-2 focus:ring-[#9945ff]/50
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
            >
              {isLoading ? 'Sending reset link...' : 'Send reset link'}
            </button>
          </form>

          <p className={`mt-6 text-center text-sm ${darkMode ? 'text-[#808080]' : 'text-slate-500'}`}>
            Remembered your password?{' '}
            <Link
              to="/login"
              className="text-cyan-600 dark:text-[#00ffff] hover:text-cyan-700 dark:hover:text-[#00a8ff] font-medium transition-colors"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        .animate-gradient {
          animation: gradient 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;

