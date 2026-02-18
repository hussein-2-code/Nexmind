import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// 👇 CREATE CONTEXT
const AuthContext = createContext(null);

// 👇 EXPORT useAuth HOOK - THIS WAS MISSING!
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authLoading, setAuthLoading] = useState(true);
  const queryClient = useQueryClient();

  // Normalize user object from different API response shapes
  const extractUserFromResponse = (data) => {
    if (!data) return null;
    if (data.data?.document) return data.data.document;
    if (data.data?.user) return data.data.user;
    if (data.data) return data.data;
    if (data.user) return data.user;
    return data;
  };

  // Central helpers for managing auth state + persistence
  const setAuthData = (userData, authToken) => {
    if (userData) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    if (authToken) {
      setToken(authToken);
      localStorage.setItem('token', authToken);
    }
  };

  const clearAuthData = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setAuthLoading(false);
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await fetch('http://localhost:8000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      const normalizedUser = extractUserFromResponse(data);
      const authToken = data?.token || data?.data?.token;
      setAuthData(normalizedUser, authToken);
    },
  });

  const logout = () => {
    clearAuthData();
    queryClient.clear();
  };

  const getToken = () => token; // 👈 Add this helper

  // Allow profile and other screens to keep context user in sync
  const updateUser = (updatedUser) => {
    if (!updatedUser) return;
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    login: loginMutation.mutateAsync,
    logout,
    getToken, // 👈 Add this
    updateUser,
    isLoading: loginMutation.isPending,
    authLoading,
    error: loginMutation.error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};