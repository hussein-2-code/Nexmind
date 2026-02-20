import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import UserDashboard from './pages/UserDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import Landing from './pages/Landing';
import ClientProjects from './pages/ClientProjects';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import InfoPage from './pages/InfoPage';
import { Toaster } from 'react-hot-toast';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { token, user, authLoading } = useAuth();
  const { darkMode } = useTheme();

  if (authLoading) return (
    <div className={`min-h-screen flex items-center justify-center transition-colors ${darkMode ? 'bg-[#0a0a0a]' : 'bg-slate-50'}`}>
      <div className={darkMode ? 'text-white' : 'text-slate-900'}>Loading...</div>
    </div>
  );

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main App with Chat Provider
function AppWithChat() {
  return (
    <ChatProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      <AppRoutes />
    </ChatProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ClientProjects />
          </ProtectedRoute>
        }
      />

      <Route
        path="/freelancer"
        element={
          <ProtectedRoute>
            <FreelancerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Chat Routes */}
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/messages/:conversationId"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        }
      />

      {/* Public landing page as main route */}
      <Route path="/" element={<Landing />} />
      <Route path="/info/:slug" element={<InfoPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <AppWithChat />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
