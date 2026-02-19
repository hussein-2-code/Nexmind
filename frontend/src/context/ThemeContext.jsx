import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ darkMode: true, setDarkMode: () => {} });

export const useTheme = () => {
  const context = useContext(ThemeContext);
  return context ?? { darkMode: true, setDarkMode: () => {} };
};

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('app-theme');
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
    } catch (_) {}
    return true;
  });

  useEffect(() => {
    try {
      localStorage.setItem('app-theme', darkMode ? 'dark' : 'light');
    } catch (_) {}
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
