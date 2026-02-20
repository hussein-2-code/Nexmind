import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Search, Menu, Activity, Bell, MessageCircle, LayoutDashboard, MessageSquare, Briefcase, FileCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../utils/avatar';
import useNotifications from '../../hooks/useNotifications';

const TopNavBar = ({
  darkMode,
  toggleDarkMode,
  toggleSidebar,
  userData = {
    name: 'Guest User',
    role: 'Account',
    avatar: 'https://ui-avatars.com/api/?name=Guest&background=9945ff&color=fff&size=40',
  },
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    unreadCount,
    notifications,
    listLoading,
    markAsRead,
    markAllAsRead,
    markAllAsReadPending,
  } = useNotifications(notifOpen);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className={`relative p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'hover:bg-[#2a2a2a] text-[#b0b0b0] hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#ff3333] text-[10px] text-white rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div
                className={`absolute right-0 top-full mt-2 w-[360px] max-h-[420px] rounded-xl shadow-xl border flex flex-col z-50 ${
                  darkMode ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-slate-200'
                }`}
              >
                <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'border-[#2a2a2a]' : 'border-slate-200'}`}>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      disabled={markAllAsReadPending}
                      className={`text-xs font-medium ${darkMode ? 'text-[#00ffff] hover:text-[#00ffff]/80' : 'text-cyan-600 hover:text-cyan-700'}`}
                    >
                      {markAllAsReadPending ? 'Updating…' : 'Mark all read'}
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto flex-1 min-h-0 scrollbar-modern">
                  {listLoading ? (
                    <p className={`px-4 py-6 text-sm text-center ${darkMode ? 'text-[#808080]' : 'text-slate-500'}`}>Loading…</p>
                  ) : notifications.length === 0 ? (
                    <p className={`px-4 py-6 text-sm text-center ${darkMode ? 'text-[#808080]' : 'text-slate-500'}`}>No notifications yet.</p>
                  ) : (
                    <ul className="py-1">
                      {notifications.map((n) => (
                        <li key={n._id}>
                          <button
                            type="button"
                            onClick={() => {
                              if (!n.read) markAsRead(n._id);
                              setNotifOpen(false);
                              if (n.link) navigate(n.link);
                            }}
                            className={`w-full text-left px-4 py-3 flex gap-3 transition-colors ${
                              n.read ? (darkMode ? 'opacity-70' : 'opacity-80') : darkMode ? 'bg-[#00ffff]/5' : 'bg-cyan-50/50'
                            } ${darkMode ? 'hover:bg-[#2a2a2a]' : 'hover:bg-slate-50'}`}
                          >
                            <span className="flex-shrink-0 mt-0.5">
                              {n.type === 'message' && <MessageSquare size={16} className={darkMode ? 'text-[#00ffff]' : 'text-cyan-600'} />}
                              {n.type === 'project_assigned' && <Briefcase size={16} className={darkMode ? 'text-[#00ff88]' : 'text-emerald-600'} />}
                              {n.type === 'project_status' && <FileCheck size={16} className={darkMode ? 'text-[#9945ff]' : 'text-violet-600'} />}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{n.title}</p>
                              {n.message && <p className={`text-xs truncate mt-0.5 ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-500'}`}>{n.message}</p>}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className={`px-4 py-2 border-t ${darkMode ? 'border-[#2a2a2a]' : 'border-slate-200'}`}>
                    <button
                      onClick={() => { setNotifOpen(false); navigate('/notifications'); }}
                      className={`text-xs font-medium w-full py-2 rounded-lg ${darkMode ? 'text-[#00ffff] hover:bg-[#2a2a2a]' : 'text-cyan-600 hover:bg-slate-100'}`}
                    >
                      View all
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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

        <div className={`flex items-center gap-3 ml-3 pl-3 border-l ${darkMode ? 'border-[#2a2a2a]' : 'border-slate-200'}`}>
          <div className="text-right hidden md:block">
            <p className={darkMode ? 'text-sm font-semibold text-white' : 'text-sm font-semibold text-slate-900'}>{userData.name}</p>
            <p className={`text-xs ${darkMode ? 'text-[#00ffff]' : 'text-cyan-600'}`}>{userData.role}</p>
          </div>
          <img
            src={userData.avatar}
            alt={userData.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500 dark:border-[#00ffff]"
            onError={(e) => { e.target.src = getAvatarUrl({ name: userData.name }, 40); }}
          />
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
