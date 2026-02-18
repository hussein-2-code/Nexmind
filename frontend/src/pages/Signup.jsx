import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '@tanstack/react-query';

export default function Signup() {
  const navigate = useNavigate();
  const { login: loginAfterSignup } = useAuth();
  const getHomeRouteByRole = (role) => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'freelancer') return '/freelancer';
    return '/user';
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'user' // default role
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await fetch('http://localhost:8000/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      return data;
    },
    onSuccess: async (data) => {
      // Auto login after successful signup
      await loginAfterSignup({
        email: formData.email,
        password: formData.password
      });
      const role = data?.data?.role || formData.role;
      navigate(getHomeRouteByRole(role));
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signupMutation.mutate(formData);
  };

  const passwordsMatch = formData.password === formData.passwordConfirm;
  const isPasswordValid = formData.password.length >= 6;
  const canSubmit = formData.name && 
                    formData.email && 
                    formData.password && 
                    formData.passwordConfirm && 
                    passwordsMatch && 
                    isPasswordValid && 
                    agreeTerms;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-[#ff3333]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-[#00a8ff]/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#9945ff]/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Signup Card */}
      <div className="relative w-full max-w-lg">
        {/* Glowing effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#ff3333] via-[#9945ff] to-[#00a8ff] rounded-2xl blur-xl opacity-20 animate-gradient" />
        
        <div className="relative bg-[#121212] rounded-2xl p-8 border border-[#2a2a2a] shadow-2xl">
          
          {/* Logo/Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] mb-4">
              <svg className="w-8 h-8 text-[#00ffff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-[#b0b0b0]">Join us today! Choose your account type</p>
          </div>

          {/* Error Message */}
          {signupMutation.error && (
            <div className="mb-6 p-4 bg-[#ff3333]/10 border border-[#ff3333]/30 rounded-lg">
              <p className="text-[#ff3333] text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {signupMutation.error.message || 'Signup failed. Please try again.'}
              </p>
            </div>
          )}

          {/* Role Selection Cards */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#b0b0b0] mb-3">
              I want to join as
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* User Role */}
              <button
                type="button"
                onClick={() => handleRoleSelect('user')}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.role === 'user'
                    ? 'border-[#00ffff] bg-[#00ffff]/10'
                    : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#4a4a4a]'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    formData.role === 'user' ? 'bg-[#00ffff]/20' : 'bg-[#2a2a2a]'
                  }`}>
                    <svg className={`w-6 h-6 ${
                      formData.role === 'user' ? 'text-[#00ffff]' : 'text-[#808080]'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className={`font-semibold ${
                    formData.role === 'user' ? 'text-[#00ffff]' : 'text-white'
                  }`}>User</h3>
                  <p className="text-xs text-[#808080] mt-1">Browse & purchase</p>
                </div>
                {formData.role === 'user' && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-5 h-5 text-[#00ffff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Freelancer Role */}
              <button
                type="button"
                onClick={() => handleRoleSelect('freelancer')}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.role === 'freelancer'
                    ? 'border-[#00ff88] bg-[#00ff88]/10'
                    : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#4a4a4a]'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    formData.role === 'freelancer' ? 'bg-[#00ff88]/20' : 'bg-[#2a2a2a]'
                  }`}>
                    <svg className={`w-6 h-6 ${
                      formData.role === 'freelancer' ? 'text-[#00ff88]' : 'text-[#808080]'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className={`font-semibold ${
                    formData.role === 'freelancer' ? 'text-[#00ff88]' : 'text-white'
                  }`}>Freelancer</h3>
                  <p className="text-xs text-[#808080] mt-1">Offer services</p>
                </div>
                {formData.role === 'freelancer' && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-5 h-5 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[#b0b0b0] mb-2">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-[#808080] group-focus-within:text-[#00ffff] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg 
                           text-white placeholder-[#808080] 
                           focus:outline-none focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]
                           transition-all duration-200"
                  placeholder="John Doe"
                  required
                  disabled={signupMutation.isPending}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#b0b0b0] mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-[#808080] group-focus-within:text-[#00ffff] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg 
                           text-white placeholder-[#808080] 
                           focus:outline-none focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]
                           transition-all duration-200"
                  placeholder="john@example.com"
                  required
                  disabled={signupMutation.isPending}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#b0b0b0] mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-[#808080] group-focus-within:text-[#00ffff] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-12 py-3 bg-[#1a1a1a] border rounded-lg 
                           text-white placeholder-[#808080] 
                           focus:outline-none focus:ring-1 transition-all duration-200
                           ${formData.password && !isPasswordValid 
                             ? 'border-[#ff3333] focus:border-[#ff3333] focus:ring-[#ff3333]' 
                             : formData.password && isPasswordValid
                               ? 'border-[#00ff88] focus:border-[#00ff88] focus:ring-[#00ff88]'
                               : 'border-[#2a2a2a] focus:border-[#00ffff] focus:ring-[#00ffff]'
                           }`}
                  placeholder="••••••••"
                  required
                  disabled={signupMutation.isPending}
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
              {formData.password && !isPasswordValid && (
                <p className="mt-1 text-xs text-[#ff3333]">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#b0b0b0] mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-[#808080] group-focus-within:text-[#00ffff] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-12 py-3 bg-[#1a1a1a] border rounded-lg 
                           text-white placeholder-[#808080] 
                           focus:outline-none focus:ring-1 transition-all duration-200
                           ${formData.passwordConfirm && !passwordsMatch 
                             ? 'border-[#ff3333] focus:border-[#ff3333] focus:ring-[#ff3333]' 
                             : formData.passwordConfirm && passwordsMatch
                               ? 'border-[#00ff88] focus:border-[#00ff88] focus:ring-[#00ff88]'
                               : 'border-[#2a2a2a] focus:border-[#00ffff] focus:ring-[#00ffff]'
                           }`}
                  placeholder="••••••••"
                  required
                  disabled={signupMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-[#808080] hover:text-[#00ffff] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showConfirmPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
              {formData.passwordConfirm && !passwordsMatch && (
                <p className="mt-1 text-xs text-[#ff3333]">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 bg-[#1a1a1a] border-[#2a2a2a] rounded 
                           text-[#00ffff] focus:ring-[#00ffff]/20 focus:ring-offset-0"
                  required
                />
              </div>
              <label htmlFor="terms" className="ml-2 text-sm text-[#b0b0b0]">
                I agree to the{' '}
                <a href="#" className="text-[#00ffff] hover:text-[#00a8ff] transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#00ffff] hover:text-[#00a8ff] transition-colors">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!canSubmit || signupMutation.isPending}
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
                {signupMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Sign Up</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-[#808080]">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-[#00ffff] hover:text-[#00a8ff] font-medium transition-colors"
            >
              Sign in
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
}
