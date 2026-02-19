import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getAvatarUrl } from '../../utils/avatar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { darkMode, setDarkMode } = useTheme();
  const { user } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    const applyResponsiveSidebar = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };

    applyResponsiveSidebar();
    window.addEventListener('resize', applyResponsiveSidebar);
    return () => window.removeEventListener('resize', applyResponsiveSidebar);
  }, []);

  const roleLabelMap = {
    admin: 'Administrator',
    user: 'Client',
    freelancer: 'freelancer',
  };

  const userData = {
    name: user?.name || 'Guest User',
    role: roleLabelMap[user?.role] || 'Account',
    avatar: getAvatarUrl(user, 128),
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-slate-50'}`}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        userData={userData}
      />

      {/* Main Content */}
      <main 
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-[80px]'} 
          ${darkMode ? 'text-white' : 'text-gray-900'}`}
      >
        {/* Top Navigation Bar */}
        <TopNavBar 
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          userData={userData}
          notifications={3}
        />

        {/* Page Content */}
        <div className={`p-4 sm:p-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
