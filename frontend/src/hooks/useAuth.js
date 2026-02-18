import { useAuth } from '../context/AuthContext';

export const useAuth = () => {
  const context = useAuth();
  
  const hasRole = (role) => {
    return context.user?.role === role;
  };

  const isAdmin = () => {
    return context.user?.role === 'admin';
  };

  const getUserName = () => {
    return context.user?.name || 'User';
  };

  const getUserEmail = () => {
    return context.user?.email || '';
  };

  const getUserPhoto = () => {
    return context.user?.photo || './default-avatar.png';
  };

  return {
    ...context,
    hasRole,
    isAdmin,
    getUserName,
    getUserEmail,
    getUserPhoto,
  };
};