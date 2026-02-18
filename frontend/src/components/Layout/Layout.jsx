import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children, darkMode: initialDarkMode = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const storedTheme = localStorage.getItem('app-theme');
      if (storedTheme === 'dark') return true;
      if (storedTheme === 'light') return false;
    } catch (_) {
      // Ignore localStorage failures and fall back to default.
    }
    return initialDarkMode;
  });
  const { user } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    try {
      localStorage.setItem('app-theme', darkMode ? 'dark' : 'light');
    } catch (_) {
      // Ignore localStorage failures.
    }

    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

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
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || 'Guest'
    )}&background=9945ff&color=fff&size=60`,
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'} flex transition-colors duration-300`}>
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
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
