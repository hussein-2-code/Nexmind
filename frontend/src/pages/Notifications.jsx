import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, Briefcase, FileCheck } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { useTheme } from '../context/ThemeContext';
import useNotifications from '../hooks/useNotifications';

const Notifications = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const {
    unreadCount,
    notifications,
    listLoading,
    markAsRead,
    markAllAsRead,
    markAllAsReadPending,
  } = useNotifications(true);

  const getIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageSquare size={20} className={darkMode ? 'text-[#00ffff]' : 'text-cyan-600'} />;
      case 'project_assigned':
        return <Briefcase size={20} className={darkMode ? 'text-[#00ff88]' : 'text-emerald-600'} />;
      case 'project_status':
        return <FileCheck size={20} className={darkMode ? 'text-[#9945ff]' : 'text-violet-600'} />;
      default:
        return <Bell size={20} className={darkMode ? 'text-[#b0b0b0]' : 'text-slate-500'} />;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <Layout>
      <div className={`max-w-2xl mx-auto ${darkMode ? 'text-white' : 'text-slate-900'}`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell size={28} className={darkMode ? 'text-[#00ffff]' : 'text-cyan-600'} />
            Notifications
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              disabled={markAllAsReadPending}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                darkMode
                  ? 'bg-[#2a2a2a] text-[#00ffff] hover:bg-[#333]'
                  : 'bg-slate-200 text-cyan-700 hover:bg-slate-300'
              }`}
            >
              {markAllAsReadPending ? 'Updating…' : `Mark all read (${unreadCount})`}
            </button>
          )}
        </div>

        {listLoading ? (
          <p className={`text-center py-12 ${darkMode ? 'text-[#808080]' : 'text-slate-500'}`}>Loading notifications…</p>
        ) : notifications.length === 0 ? (
          <div className={`text-center py-16 rounded-xl border ${darkMode ? 'border-[#2a2a2a] bg-[#121212]' : 'border-slate-200 bg-slate-50'}`}>
            <Bell size={48} className={`mx-auto mb-4 ${darkMode ? 'text-[#333]' : 'text-slate-300'}`} />
            <p className={darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}>No notifications yet.</p>
            <p className={`text-sm mt-1 ${darkMode ? 'text-[#808080]' : 'text-slate-500'}`}>
              You’ll see new messages and project updates here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li key={n._id}>
                <button
                  type="button"
                  onClick={() => {
                    if (!n.read) markAsRead(n._id);
                    if (n.link) navigate(n.link);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-colors flex gap-4 ${
                    n.read
                      ? darkMode
                        ? 'bg-[#121212] border-[#2a2a2a] hover:border-[#333]'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                      : darkMode
                        ? 'bg-[#00ffff]/5 border-[#00ffff]/20'
                        : 'bg-cyan-50/50 border-cyan-200'
                  }`}
                >
                  <span className="flex-shrink-0">{getIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{n.title}</p>
                    {n.message && (
                      <p className={`text-sm mt-0.5 ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>{n.message}</p>
                    )}
                    <p className={`text-xs mt-2 ${darkMode ? 'text-[#808080]' : 'text-slate-400'}`}>{formatTime(n.createdAt)}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
