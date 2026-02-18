import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-[#00a8ff]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-[#9945ff]/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#00a8ff] via-[#9945ff] to-[#00ffff] rounded-2xl blur-xl opacity-20 animate-gradient" />

        <div className="relative bg-[#121212] rounded-2xl p-8 border border-[#2a2a2a] shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Forgot Password</h1>
            <p className="text-[#b0b0b0] text-sm">
              Enter your email address and we&apos;ll send you a password reset link.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#ff3333]/10 border border-[#ff3333]/30 rounded-lg text-sm text-[#ff8080]">
              {error.message || 'Something went wrong. Please try again.'}
            </div>
          )}

          {isSuccess && (
            <div className="mb-4 p-3 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-lg text-sm text-[#a9ffcf]">
              {forgotPasswordMutation.data?.message || 'Reset link sent to your email if it exists in our system.'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#b0b0b0] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg 
                         text-white placeholder-[#808080] 
                         focus:outline-none focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]
                         transition-all duration-200"
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

          <p className="mt-6 text-center text-sm text-[#808080]">
            Remembered your password?{' '}
            <Link
              to="/login"
              className="text-[#00ffff] hover:text-[#00a8ff] font-medium transition-colors"
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

