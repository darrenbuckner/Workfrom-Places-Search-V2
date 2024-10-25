export const darkTheme = {
  // Background colors
  'bg-primary': '#1a1f2c',
  'bg-secondary': '#2a3142',
  'bg-tertiary': '#232838',
  
  // Text colors
  'text-primary': '#ffffff',
  'text-secondary': '#94a3b8',
  'text-tertiary': '#64748b',
  
  // Action colors (updated for better contrast)
  'action-primary': '#3b82f6',         // Brighter blue
  'action-primary-hover': '#2563eb',   // Slightly darker on hover
  'action-primary-light': 'rgba(59, 130, 246, 0.1)',
  'action-primary-border': 'rgba(59, 130, 246, 0.2)',
  
  // Interactive element colors
  'interactive-text': '#e2e8f0',       // Light gray for interactive text
  'interactive-hover': '#f8fafc',      // Slightly lighter on hover
  'interactive-muted': '#94a3b8',      // Muted text for secondary actions
  
  // Accent colors
  'accent-primary': '#3b82f6',         // Main accent color
  'accent-secondary': '#60a5fa',       // Lighter accent for hover states
  'accent-muted': '#93c5fd',          // Very light accent for backgrounds
  
  // Border colors
  'border-primary': 'rgba(255, 255, 255, 0.1)',
  'border-secondary': 'rgba(255, 255, 255, 0.05)',
  
  // Component specific
  'card-bg': '#1a1f2c',
  'card-hover': '#2a3142',
  'input-bg': '#2a3142',
  'input-border': 'rgba(255, 255, 255, 0.1)',
  'button-text': '#ffffff',           // Consistent button text color
  'button-text-muted': '#94a3b8',     // Muted button text

  // Status colors
  'success': '#4ade80',               // Success green
  'warning': '#fbbf24',               // Warning yellow
  'error': '#ef4444',                 // Error red
  'info': '#60a5fa',                  // Info blue

  // Modal overlay
  'modal-overlay': 'rgba(0, 0, 0, 0.75)',
  
  // Gradients
  'gradient-primary': 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))',
  'gradient-hover': 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))',
};

// Helper function to get color with opacity
export const getColorWithOpacity = (color, opacity) => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export const lightTheme = {
  // Background colors
  'bg-primary': '#ffffff',
  'bg-secondary': '#f8fafc',
  'bg-tertiary': '#f1f5f9',
  
  // Text colors
  'text-primary': '#1e293b',
  'text-secondary': '#475569',
  'text-tertiary': '#64748b',
  
  // Action colors
  'action-primary': '#1441ff',
  'action-primary-hover': 'rgba(20, 65, 255, 0.9)',
  'action-primary-light': 'rgba(20, 65, 255, 0.1)',
  'action-primary-border': 'rgba(20, 65, 255, 0.2)',
  
  // Border colors
  'border-primary': 'rgba(0, 0, 0, 0.1)',
  'border-secondary': 'rgba(0, 0, 0, 0.05)',
  
  // Component specific
  'card-bg': '#ffffff',
  'card-hover': '#f8fafc',
  'input-bg': '#ffffff',
  'input-border': '#e2e8f0',

  // Modal overlay
  'modal-overlay': 'rgba(0, 0, 0, 0.8)',
};