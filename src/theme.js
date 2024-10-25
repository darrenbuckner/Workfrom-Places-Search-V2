export const darkTheme = {
  // Base colors
  'bg-primary': '#161923',            // Warm dark blue-gray base
  'bg-secondary': '#1e2231',          // Slightly lighter warm dark blue-gray
  'bg-tertiary': '#252a3d',          // Elevated background with slight warmth
  
  // Text colors
  'text-primary': '#f8f9fb',          // Slightly warm white
  'text-secondary': '#a8b3cf',        // Warm gray with blue undertones
  'text-tertiary': '#6b7a9a',        // Muted but still readable
  
  // Action colors
  'action-primary': '#4d7cfe',         // Warmer, more inviting blue
  'action-primary-hover': '#3d63db',   // Deeper blue for hover
  'action-primary-light': 'rgba(77, 124, 254, 0.12)',
  'action-primary-border': 'rgba(77, 124, 254, 0.25)',
  
  // Interactive colors
  'interactive-text': '#e2e8f4',      
  'interactive-hover': '#f8f9fb',     
  'interactive-muted': '#a8b3cf',     
  
  // Accent colors
  'accent-primary': '#4d7cfe',        
  'accent-secondary': '#6b8fff',      
  'accent-muted': '#2d3754',         
  
  // Border colors
  'border-primary': 'rgba(255, 255, 255, 0.12)',
  'border-secondary': 'rgba(255, 255, 255, 0.06)',
  
  // Component specific
  'card-bg': '#1a1f2d',
  'card-hover': '#252a3d',
  'input-bg': '#1e2231',
  'input-border': 'rgba(255, 255, 255, 0.12)',
  'button-text': '#ffffff',
  'button-text-muted': '#a8b3cf',
  
  // Status colors
  'success': '#34d399',
  'warning': '#fbbf24',
  'error': '#f87171',
  'info': '#60a5fa',
  
  // Place-specific colors - Refined for dark theme
  'place-highlight-bg': '#252a3d',     // Subtle elevation for highlighted places
  'place-highlight-border': '#2d3754', // Subtle border for highlights
  'place-tag-bg': 'rgba(77, 124, 254, 0.15)',
  'place-tag-text': '#6b8fff',
  'place-score-high': '#34d399',       // High scores
  'place-score-medium': '#fbbf24',     // Medium scores
  'place-score-low': '#f87171',        // Low scores
  'place-feature-icon': '#6b8fff',     // Feature icons (wifi, power, etc)
  'place-distance': '#a8b3cf',         // Distance text
  'place-hours': '#34d399',            // Open hours
  'place-hours-closed': '#f87171',     // Closed status

  // Promoted place colors - Refined for better contrast
  'promoted-bg': '#252d47',           // Richer, more visible background
  'promoted-border': '#3b4974',       // More prominent border
  'promoted-text': '#e2e8f4',         // Lighter text for better readability
  'promoted-secondary': '#a8b3cf',    // Secondary text
  'promoted-highlight': '#4d7cfe',    // Highlight elements
  'promoted-tag-bg': 'rgba(77, 124, 254, 0.2)',
  'promoted-tag-text': '#6b8fff',
  'promoted-score-bg': '#2d3754',     // Score background
  'promoted-score-text': '#f8f9fb',   // Score text
  'promoted-feature-icon': '#6b8fff', // Feature icons within promoted cards
  
  // Scoring colors for promoted items
  'promoted-score-high': '#34d399',   // High scores in promoted items
  'promoted-score-medium': '#fbbf24', // Medium scores in promoted items
  'promoted-score-low': '#f87171',    // Low scores in promoted items
  
  // Navigation
  'nav-active': '#4d7cfe',
  'nav-inactive': '#6b7a9a',
  'nav-hover': '#6b8fff',
  
  // Map elements
  'map-marker': '#4d7cfe',
  'map-marker-active': '#6b8fff',
  'map-overlay': 'rgba(22, 25, 35, 0.85)',
  
  // Modal
  'modal-overlay': 'rgba(13, 16, 24, 0.85)',
  
  // Gradients
  'gradient-primary': 'linear-gradient(to right, rgba(77, 124, 254, 0.15), rgba(77, 124, 254, 0.08))',
  'gradient-hover': 'linear-gradient(to right, rgba(77, 124, 254, 0.25), rgba(77, 124, 254, 0.15))',
};

export const lightTheme = {
  // Base colors
  'bg-primary': '#fdfbf9',            // Warm off-white
  'bg-secondary': '#f8f7f4',          // Slightly darker warm
  'bg-tertiary': '#f3f2ef',          // Third level
  
  // Text colors
  'text-primary': '#2d3748',          // Warm gray
  'text-secondary': '#64748b',        // Medium gray
  'text-tertiary': '#94a3b8',        // Light gray
  
  // Action colors
  'action-primary': '#4871f7',        // Warm blue
  'action-primary-hover': '#3b5fdf',  // Darker warm blue
  'action-primary-light': 'rgba(72, 113, 247, 0.1)',
  'action-primary-border': 'rgba(72, 113, 247, 0.2)',
  
  // Border colors
  'border-primary': 'rgba(0, 0, 0, 0.08)',
  'border-secondary': 'rgba(0, 0, 0, 0.04)',
  
  // Component specific
  'card-bg': '#ffffff',
  'card-hover': '#f8f7f4',
  'input-bg': '#ffffff',
  'input-border': '#e2e8f0',
  'button-text': '#ffffff',
  'button-text-muted': '#64748b',
  
  // Interactive colors
  'interactive-text': '#2d3748',
  'interactive-hover': '#1a202c',
  'interactive-muted': '#64748b',
  
  // Accent colors
  'accent-primary': '#4871f7',
  'accent-secondary': '#6d8cf8',
  'accent-muted': '#e0e7ff',
  
  // Status colors
  'success': '#10b981',
  'warning': '#f59e0b',
  'error': '#ef4444',
  'info': '#3b82f6',
  
  // Place-specific colors - Refined for light theme
  'place-highlight-bg': '#f8f7f4',     // Subtle warm highlight
  'place-highlight-border': '#e5e7eb', // Soft border
  'place-tag-bg': 'rgba(72, 113, 247, 0.08)',
  'place-tag-text': '#4871f7',
  'place-score-high': '#059669',       // More muted green
  'place-score-medium': '#d97706',     // Warm amber
  'place-score-low': '#dc2626',        // Slightly muted red
  'place-feature-icon': '#4871f7',     // Feature icons
  'place-distance': '#64748b',         // Distance text
  'place-hours': '#059669',            // Open hours
  'place-hours-closed': '#dc2626',     // Closed status

  // Promoted place colors - Kept for reference
  'promoted-bg': '#fffbeb',           // Warm yellow background
  'promoted-border': '#fbbf24',       // Amber border
  'promoted-text': '#2d3748',         // Clear, dark text
  'promoted-secondary': '#64748b',    // Secondary text
  'promoted-highlight': '#f59e0b',    // Highlight elements
  'promoted-tag-bg': 'rgba(245, 158, 11, 0.1)',
  'promoted-tag-text': '#d97706',
  'promoted-score-bg': '#fff7ed',     // Score background
  'promoted-score-text': '#2d3748',   // Score text
  'promoted-feature-icon': '#d97706', // Feature icons within promoted cards
  
  // Scoring colors for promoted items
  'promoted-score-high': '#059669',   // High scores in promoted items
  'promoted-score-medium': '#d97706', // Medium scores in promoted items
  'promoted-score-low': '#dc2626',    // Low scores in promoted items
  
  // Navigation
  'nav-active': '#4871f7',
  'nav-inactive': '#64748b',
  'nav-hover': '#6d8cf8',
  
  // Map elements
  'map-marker': '#4871f7',
  'map-marker-active': '#6d8cf8',
  'map-overlay': 'rgba(255, 255, 255, 0.85)',
  
  // Modal
  'modal-overlay': 'rgba(45, 55, 72, 0.75)',
  
  // Gradients
  'gradient-primary': 'linear-gradient(to right, rgba(72, 113, 247, 0.1), rgba(72, 113, 247, 0.05))',
  'gradient-hover': 'linear-gradient(to right, rgba(72, 113, 247, 0.15), rgba(72, 113, 247, 0.1))',
};

// Helper functions
export const getColorWithOpacity = (color, opacity) => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export const adjustColor = (color, amount) => {
  const clamp = (num) => Math.min(255, Math.max(0, num));
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const newR = clamp(r + amount);
    const newG = clamp(g + amount);
    const newB = clamp(b + amount);
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
  return color;
};