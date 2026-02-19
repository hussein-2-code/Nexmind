import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { darkMode } = useTheme();
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const getHomeRouteByRole = (role) => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'freelancer') return '/freelancer';
    return '/user';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login({ email, password });
      console.log("Login result:", result);
      
      navigate(getHomeRouteByRole(result?.data?.role));
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${darkMode ? 'bg-[#0a0a0a]' : 'bg-slate-100'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-32 w-80 h-80 rounded-full blur-3xl animate-pulse ${darkMode ? 'bg-[#ff3333]/20' : 'bg-red-400/10'}`} />
        <div className={`absolute -bottom-40 -left-32 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000 ${darkMode ? 'bg-[#00a8ff]/20' : 'bg-blue-400/10'}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-700 ${darkMode ? 'bg-[#9945ff]/10' : 'bg-violet-400/10'}`} />
      </div>

      <div className="relative w-full max-w-md">
        {darkMode && (
          <div className="absolute -inset-1 bg-gradient-to-r from-[#ff3333] via-[#9945ff] to-[#00a8ff] rounded-2xl blur-xl opacity-20 animate-gradient" />
        )}
        <div className={`relative rounded-2xl p-8 shadow-2xl ${darkMode ? 'bg-[#121212] border border-[#2a2a2a]' : 'bg-white border border-slate-200'}`}>
          <div className="text-center mb-8">
            <div className={`inline-flex p-3 rounded-2xl mb-4 ${darkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-slate-100 border border-slate-200'}`}>
              <svg className={`w-8 h-8 ${darkMode ? 'text-[#00ffff]' : 'text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Welcome Back</h1>
            <p className={darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}>Sign in to continue to your dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-[#ff3333]/10 border border-red-200 dark:border-[#ff3333]/30 rounded-lg">
              <p className="text-red-600 dark:text-[#ff3333] text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error?.message || 'Invalid email or password'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 transition-colors ${darkMode ? 'text-[#808080] group-focus-within:text-[#00ffff]' : 'text-slate-400 group-focus-within:text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 ${darkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder-[#808080]' : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'}`}
                  placeholder="admin@gmail.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 transition-colors ${darkMode ? 'text-[#808080] group-focus-within:text-[#00ffff]' : 'text-slate-400 group-focus-within:text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-12 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 ${darkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder-[#808080]' : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'}`}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-[#808080] hover:text-[#00ffff] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className={`w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500/30 focus:ring-offset-0 ${darkMode ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-slate-100 border-slate-300'}`}
                />
                <span className={`ml-2 text-sm ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-cyan-600 dark:text-[#00a8ff] hover:text-cyan-700 dark:hover:text-[#00ffff] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full py-3 px-4 bg-gradient-to-r from-[#ff3333] to-[#9945ff] 
                       text-white font-medium rounded-lg
                       hover:from-[#ff3333]/90 hover:to-[#9945ff]/90 
                       focus:outline-none focus:ring-2 focus:ring-[#9945ff]/50
                       transform transition-all duration-200 
                       disabled:opacity-50 disabled:cursor-not-allowed
                       overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          <p className={`mt-6 text-center text-sm ${darkMode ? 'text-[#808080]' : 'text-slate-500'}`}>
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup')} className="text-cyan-600 dark:text-[#00ffff] hover:text-cyan-700 dark:hover:text-[#00a8ff] font-medium transition-colors">
              Sign up now
            </button>
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
}
