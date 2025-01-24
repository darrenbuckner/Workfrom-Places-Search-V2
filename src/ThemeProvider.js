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
  // Initialize state from localStorage or system preference
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    // Check user's system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = () => {
    setIsDark(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newValue));
      return newValue;
    });
  };

  useEffect(() => {
    const theme = isDark ? darkTheme : lightTheme;
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
    
    // Update data-theme attribute instead of class
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
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
      className="p-1.5 rounded-md transition-colors text-text-tertiary 
        hover:text-text-primary hover:bg-bg-secondary group"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? (
        <Sun 
          size={16} 
          className="group-hover:text-amber-400 transition-colors" 
        />
      ) : (
        <Moon 
          size={16}
          className="group-hover:text-blue-500 transition-colors" 
        />
      )}
    </button>
  );
};