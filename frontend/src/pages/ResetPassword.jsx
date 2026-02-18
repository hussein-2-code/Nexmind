import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password, passwordConfirm }) => {
      const response = await fetch(`http://localhost:8000/api/users/resetPassword/${token}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, passwordConfirm }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      return data;
    },
    onSuccess: () => {
      navigate('/login');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    resetPasswordMutation.mutate({ password, passwordConfirm });
  };

  const isLoading = resetPasswordMutation.isPending;
  const error = resetPasswordMutation.error;

  const passwordsMatch = password && passwordConfirm && password === passwordConfirm;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-[#ff3333]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-[#00a8ff]/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#ff3333] via-[#9945ff] to-[#00a8ff] rounded-2xl blur-xl opacity-20 animate-gradient" />

        <div className="relative bg-[#121212] rounded-2xl p-8 border border-[#2a2a2a] shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-[#b0b0b0] text-sm">
              Enter your new password below.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#ff3333]/10 border border-[#ff3333]/30 rounded-lg text-sm text-[#ff8080]">
              {error.message || 'Something went wrong. Please try again.'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#b0b0b0] mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg 
                         text-white placeholder-[#808080] 
                         focus:outline-none focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]
                         transition-all duration-200"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#b0b0b0] mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="block w-full px-3 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg 
                         text-white placeholder-[#808080] 
                         focus:outline-none focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]
                         transition-all duration-200"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              {passwordConfirm && !passwordsMatch && (
                <p className="mt-1 text-xs text-[#ff8080]">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !passwordsMatch}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#ff3333] to-[#9945ff] 
                       text-white font-medium rounded-lg
                       hover:from-[#ff3333]/90 hover:to-[#9945ff]/90 
                       focus:outline-none focus:ring-2 focus:ring-[#9945ff]/50
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
            >
              {isLoading ? 'Resetting password...' : 'Reset password'}
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

export default ResetPassword;

