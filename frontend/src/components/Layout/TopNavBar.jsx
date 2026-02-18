import React, { useMemo, useState } from 'react';
import { Search, Menu, Activity, Bell, MessageCircle, LayoutDashboard } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TopNavBar = ({
  darkMode,
  toggleDarkMode,
  toggleSidebar,
  userData = {
    name: 'Guest User',
    role: 'Account',
    avatar: 'https://ui-avatars.com/api/?name=Guest&background=9945ff&color=fff&size=40',
  },
  notifications = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const pageTitleMap = {
    '/admin/dashboard': 'Operations Dashboard',
    '/admin/users': 'User Directory',
    '/user': 'Project Studio',
    '/projects': 'Client Projects',
    '/freelancer': 'Freelancer Workspace',
    '/profile': 'Profile',
  };

  const currentPageTitle = location.pathname.startsWith('/messages')
    ? 'Messages'
    : pageTitleMap[location.pathname] || 'Workspace';

  const roleHomePath = useMemo(() => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'freelancer') return '/freelancer';
    return '/user';
  }, [user?.role]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const value = searchTerm.trim().toLowerCase();
    if (!value) return;

    if (value.includes('message') || value.includes('chat')) {
      navigate('/messages');
    } else if (value.includes('profile')) {
      navigate('/profile');
    } else if (value.includes('project')) {
      navigate(user?.role === 'user' ? '/projects' : roleHomePath);
    } else if (value.includes('user') && user?.role === 'admin') {
      navigate('/admin/users');
    } else {
      navigate(roleHomePath);
    }
  };

  return (
    <nav className={`sticky top-0 z-20 ${darkMode ? 'bg-[#121212]/80 border-[#2a2a2a]' : 'bg-white/80 border-gray-200'}
      backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between`}>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className={`lg:hidden p-2 rounded-lg ${darkMode ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-100'}`}
        >
          <Menu size={24} className={darkMode ? 'text-white' : 'text-gray-900'} />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808080]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pages (messages, projects, profile)..."
            className={`w-80 pl-10 pr-3 py-2 rounded-lg text-sm placeholder-[#808080] focus:outline-none focus:border-[#00ffff] ${
              darkMode
                ? 'bg-[#1a1a1a] border border-[#2a2a2a] text-white'
                : 'bg-white border border-gray-300 text-gray-900'
            }`}
          />
        </form>

        <span className={`hidden md:inline-flex px-3 py-1 rounded-full text-xs border ${
          darkMode
            ? 'bg-[#00ffff]/10 text-[#00ffff] border-[#00ffff]/20'
            : 'bg-cyan-50 text-cyan-700 border-cyan-200'
        }`}>
          {currentPageTitle}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => navigate(roleHomePath)}
            className={`p-2 rounded-lg transition-colors ${
              darkMode
                ? 'hover:bg-[#2a2a2a] text-[#b0b0b0] hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            title="Go to main workspace"
          >
            <LayoutDashboard size={18} />
          </button>
          {user?.role !== 'admin' && (
            <button
              onClick={() => navigate('/messages')}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'hover:bg-[#2a2a2a] text-[#b0b0b0] hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              title="Open messages"
            >
              <MessageCircle size={18} />
            </button>
          )}
        </div>

        {user?.role !== 'admin' && (
          <button
            onClick={() => navigate('/messages')}
            className={`relative p-2 rounded-lg transition-colors ${
              darkMode
                ? 'hover:bg-[#2a2a2a] text-[#b0b0b0] hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            title="Notifications"
          >
            <Bell size={18} />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#ff3333] text-[10px] text-white rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
        )}

        <span className={`hidden md:flex px-3 py-1 rounded-full text-xs ${darkMode
          ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30'
          : 'bg-green-100 text-green-700'}`}>
          <span className="flex items-center gap-1">
            <Activity size={12} /> Live
          </span>
        </span>

        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg ${darkMode ? 'bg-[#2a2a2a] text-[#00ffff]' : 'bg-gray-200 text-gray-900'}`}
          title="Toggle theme"
        >
          {darkMode ? '🌙' : '☀️'}
        </button>

        <div className={`flex items-center gap-3 ml-3 pl-3 border-l ${darkMode ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
          <div className="text-right hidden md:block">
            <p className={darkMode ? 'text-sm font-semibold text-white' : 'text-sm font-semibold text-gray-900'}>{userData.name}</p>
            <p className="text-xs text-[#00ffff]">{userData.role}</p>
          </div>
          <img
            src={userData.avatar}
            alt={userData.name}
            className="w-10 h-10 rounded-full border-2 border-[#00ffff]"
          />
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
