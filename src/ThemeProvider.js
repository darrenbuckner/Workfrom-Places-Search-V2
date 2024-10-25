import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { darkTheme, lightTheme } from './theme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    localStorage.setItem('darkMode', !isDark);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setIsDark(JSON.parse(savedTheme));
    } else {
      // Check user's system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    }
  }, []);

  useEffect(() => {
    const theme = isDark ? darkTheme : lightTheme;
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme toggle button component
export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded transition-colors
        bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)]
        text-white shadow-[0_0_20px_var(--action-primary-border)]
        border border-[var(--action-primary-border)]
      `}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={16} className="text-white" />
      ) : (
        <Moon size={16} className="text-white" />
      )}
    </button>
  );
};