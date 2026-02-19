import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  FolderKanban,
  MessageCircle,
  Briefcase,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirm from '../LogoutConfirm';
import { getAvatarUrl } from '../../utils/avatar';

const Sidebar = ({
  isOpen,
  toggleSidebar,
  darkMode = true,
  userData = {
    name: 'Guest User',
    role: 'Account',
    avatar: 'https://ui-avatars.com/api/?name=Guest&background=9945ff&color=fff&size=60',
  },
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const role = user?.role || 'user';
  const navConfigByRole = {
    admin: [
      { id: 'admin-dashboard', icon: LayoutDashboard, label: 'Operations Dashboard', path: '/admin/dashboard', color: '#00ffff' },
      { id: 'admin-users', icon: Users, label: 'User Directory', path: '/admin/users', color: '#00ff88' },
      { id: 'admin-profile', icon: User, label: 'Profile', path: '/profile', color: '#9945ff' },
    ],
    user: [
      { id: 'user-studio', icon: LayoutDashboard, label: 'Project Studio', path: '/user', color: '#00ffff' },
      { id: 'user-projects', icon: FolderKanban, label: 'Client Projects', path: '/projects', color: '#00ff88' },
      { id: 'user-messages', icon: MessageCircle, label: 'Messages', path: '/messages', color: '#9945ff' },
      { id: 'user-profile', icon: User, label: 'Profile', path: '/profile', color: '#00a8ff' },
    ],
    freelancer: [
      { id: 'freelancer-dashboard', icon: Briefcase, label: 'Freelancer Workspace', path: '/freelancer', color: '#00ffff' },
      { id: 'freelancer-messages', icon: MessageCircle, label: 'Messages', path: '/messages', color: '#00ff88' },
      { id: 'freelancer-profile', icon: User, label: 'Profile', path: '/profile', color: '#9945ff' },
    ],
  };

  const navItems = navConfigByRole[role] || navConfigByRole.user;

  const sidebarVariants = {
    open: { width: '280px', transition: { duration: 0.3, ease: 'easeInOut' } },
    closed: { width: '80px', transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  return (
    <>
      <motion.aside
        initial="open"
        animate={isOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        className={`fixed h-full ${darkMode ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white border-gray-200'}
          border-r shadow-2xl z-30 overflow-hidden transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ boxShadow: darkMode ? '0 0 20px rgba(0,255,255,0.1)' : '0 0 20px rgba(0,0,0,0.05)' }}
      >
        <div className={`relative p-6 flex items-center justify-between border-b ${darkMode ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ff3333] to-[#9945ff] rounded-lg blur-md opacity-60" />
                  <div className={`relative p-2 rounded-lg border border-[#00ffff] ${darkMode ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
                    <Shield className="w-6 h-6 text-[#00ffff]" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-[#00ffff] to-[#00a8ff] bg-clip-text text-transparent">
                    Control<span className={darkMode ? 'text-white' : 'text-gray-900'}>Center</span>
                  </h1>
                  <p className={`text-xs ${darkMode ? 'text-[#808080]' : 'text-gray-500'}`}>workspace</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-[#2a2a2a] text-[#b0b0b0]' : 'hover:bg-gray-100 text-gray-600'}
              transition-all duration-200 hover:scale-110`}
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <div className={`p-4 border-b ${darkMode ? 'border-[#2a2a2a]' : 'border-gray-200'} ${!isOpen && 'flex justify-center'}`}>
          <div className={`flex ${isOpen ? 'items-center gap-4' : 'flex-col'} ${!isOpen && 'items-center'}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ffff] to-[#9945ff] rounded-full blur-sm opacity-70" />
              <img
                src={userData.avatar}
                alt={userData.name}
                className="relative w-12 h-12 rounded-full object-cover border-2 border-[#00ffff] dark:border-[#00ffff]"
                onError={(e) => { e.target.src = getAvatarUrl({ name: userData.name }, 48); }}
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 bg-[#00ff88] border-2 rounded-full ${
                  darkMode ? 'border-[#121212]' : 'border-white'
                }`}
              />
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1"
                >
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userData.name}</h3>
                  <p className="text-xs text-[#00ffff]">{userData.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = item.path === '/messages'
              ? location.pathname.startsWith('/messages')
              : location.pathname === item.path;

            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center ${isOpen ? 'justify-between' : 'justify-center'}
                  p-3 rounded-xl transition-all duration-200 group
                  ${
                    isActive
                      ? `${darkMode ? 'bg-[#1a1a1a]' : 'bg-cyan-50'} border`
                      : `${darkMode ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-100'}`
                  }`}
                style={{
                  borderColor: isActive ? `${item.color}30` : 'transparent',
                  boxShadow: isActive ? `0 0 20px ${item.color}10` : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`relative ${!isOpen && 'mx-auto'}`}>
                    <item.icon
                      size={22}
                      className={`transition-all duration-200 group-hover:scale-110 ${
                        darkMode ? 'text-[#808080] group-hover:text-white' : 'text-gray-500 group-hover:text-gray-900'
                      }`}
                      style={{ color: isActive ? item.color : undefined }}
                    />
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full"
                        style={{ backgroundColor: item.color }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </div>
                  {isOpen && (
                    <span className={`text-sm font-medium ${
                      isActive
                        ? (darkMode ? 'text-white' : 'text-gray-900')
                        : (darkMode ? 'text-[#b0b0b0] group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900')
                    }`}>
                      {item.label}
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </nav>

        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${darkMode ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
          <motion.button
            onClick={() => setShowLogoutConfirm(true)}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center ${isOpen ? 'justify-start' : 'justify-center'}
              p-3 rounded-xl ${darkMode ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-100'} group`}
          >
            <div className="flex items-center gap-3">
              <LogOut size={22} className="text-[#ff3333] group-hover:rotate-180 transition-all duration-500" />
              {isOpen && <span className="text-sm font-medium text-[#ff3333]">Logout</span>}
            </div>
          </motion.button>
        </div>
      </motion.aside>

      <LogoutConfirm
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        darkMode={darkMode}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
