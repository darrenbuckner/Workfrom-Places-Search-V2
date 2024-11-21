export const darkTheme = {
  // Base colors - Rich, deep backgrounds with subtle depth
  'bg-primary': '#0A0A0C',            // Near-black with slight warmth
  'bg-secondary': '#141417',          // Subtle lift from primary
  'bg-tertiary': '#1C1C21',          // Slightly lighter for interaction
  
  // Text colors - Sharp, clear typography
  'text-primary': '#FFFFFF',          // Pure white for primary text
  'text-secondary': 'rgba(255, 255, 255, 0.82)', // Soft white for secondary
  'text-tertiary': 'rgba(255, 255, 255, 0.64)',  // More muted for tertiary
  
  // Action colors - Vibrant but sophisticated
  'action-primary': '#0A84FF',        // Apple SF blue
  'action-primary-hover': '#0070E0',  // Slightly darker on hover
  'action-primary-light': 'rgba(10, 132, 255, 0.12)', // Subtle glow
  'action-primary-border': 'rgba(10, 132, 255, 0.3)', // Defined borders
  
  // Button colors - Clear hierarchy
  'button-primary': 'linear-gradient(180deg, #0A84FF 0%, #0070E0 100%)',  // Subtle gradient
  'button-primary-hover': 'linear-gradient(180deg, #0070E0 0%, #005CC8 100%)',
  'button-secondary': '#1C1C21',      
  'button-secondary-hover': '#26262C',
  'button-text': '#FFFFFF',
  'button-text-muted': 'rgba(255, 255, 255, 0.82)',
  
  // Interactive elements - Refined states
  'interactive-text': '#FFFFFF',
  'interactive-hover': '#0A84FF',
  'interactive-muted': 'rgba(255, 255, 255, 0.64)',
  
  // Accent colors - Adding soft red accent
  'accent-primary': '#0A84FF',
  'accent-secondary': '#fca5a5',      // New soft red accent
  'accent-tertiary': '#30C7FF',       // Light blue as third accent
  'accent-muted': 'rgba(10, 132, 255, 0.16)',
  'accent-soft': 'rgba(252, 165, 165, 0.16)', // Soft red with opacity
  
  // Borders - Subtle definition
  'border-primary': 'rgba(255, 255, 255, 0.1)',
  'border-secondary': 'rgba(255, 255, 255, 0.05)',
  
  // Status colors - Clear feedback
  'success': '#30D158',  // SF green
  'warning': '#FFD60A',  // SF yellow
  'error': '#FF453A',    // SF red
  'info': '#0A84FF',     // SF blue
  
  // Shadow effects
  'shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.25)',
  'shadow-md': '0 2px 4px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.25)',
  'shadow-lg': '0 4px 6px rgba(0, 0, 0, 0.5), 0 5px 7px rgba(0, 0, 0, 0.25)',
  
  // Focus states
  'focus-ring': 'rgba(10, 132, 255, 0.6)',
  'focus-ring-offset': '#0A0A0C',

  // Modal and overlay colors
  'modal-backdrop': 'rgba(0, 0, 0, 0.5)',
  'modal-backdrop-filter': 'blur(20px)',
  'modal-bg': '#FFFFFF',
  'modal-border': 'rgba(0, 0, 0, 0.08)',
  
  // Status colors
  'status-success': '#4CAF50',
  'status-warning': '#FF9800',
  'status-error': '#F44336',
  
  // Surface overlays
  'overlay-hover': 'rgba(0, 0, 0, 0.02)',
  'overlay-active': 'rgba(0, 0, 0, 0.04)',
  'overlay-raised': 'rgba(0, 0, 0, 0.1)'
};

export const lightTheme = {
  // Base colors - Clean, bright foundations
  'bg-primary': '#FFFFFF',
  'bg-secondary': '#F5F5F7',          // Classic Apple light gray
  'bg-tertiary': '#E8E8ED',          // Slightly darker for depth
  
  // Text colors - Sharp, accessible
  'text-primary': '#1D1D1F',          // Near-black for primary
  'text-secondary': 'rgba(29, 29, 31, 0.85)', // Softened for secondary
  'text-tertiary': 'rgba(29, 29, 31, 0.65)',  // More muted for tertiary
  
  // Action colors - Bold but refined
  'action-primary': '#007AFF',        // Apple SF blue (light)
  'action-primary-hover': '#0066D6',  // Darker on hover
  'action-primary-light': 'rgba(0, 122, 255, 0.1)',
  'action-primary-border': 'rgba(0, 122, 255, 0.25)',
  
  // Button colors - Clear hierarchy
  'button-primary': 'linear-gradient(180deg, #007AFF 0%, #0066D6 100%)',
  'button-primary-hover': 'linear-gradient(180deg, #0066D6 0%, #0055B3 100%)',
  'button-secondary': '#F5F5F7',
  'button-secondary-hover': '#E8E8ED',
  'button-text': '#FFFFFF',
  'button-text-muted': 'rgba(29, 29, 31, 0.85)',
  
  // Interactive elements - Refined states
  'interactive-text': '#1D1D1F',
  'interactive-hover': '#007AFF',
  'interactive-muted': 'rgba(29, 29, 31, 0.65)',
  
  // Accent colors - Adding coral accent to complement dark theme's soft red
  'accent-primary': '#007AFF',
  'accent-secondary': '#F87171',      // Warmer red for light theme
  'accent-tertiary': '#40A9FF',       // Light blue as third accent
  'accent-muted': 'rgba(0, 122, 255, 0.12)',
  'accent-soft': 'rgba(248, 113, 113, 0.12)', // Coral with opacity
  
  // Borders - Subtle definition
  'border-primary': 'rgba(0, 0, 0, 0.1)',
  'border-secondary': 'rgba(0, 0, 0, 0.05)',
  
  // Status colors - Clear feedback
  'success': '#28CD41',  // SF green (light)
  'warning': '#FF9F0A',  // SF yellow (light)
  'error': '#FF3B30',    // SF red (light)
  'info': '#007AFF',     // SF blue (light)
  
  // Shadow effects - Subtle elevation
  'shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
  'shadow-md': '0 2px 4px rgba(0, 0, 0, 0.05), 0 2px 6px rgba(0, 0, 0, 0.1)',
  'shadow-lg': '0 4px 6px rgba(0, 0, 0, 0.05), 0 5px 7px rgba(0, 0, 0, 0.1)',
  
  // Focus states
  'focus-ring': 'rgba(0, 122, 255, 0.6)',
  'focus-ring-offset': '#FFFFFF',

  // Modal and overlay colors
  'modal-backdrop': 'rgba(0, 0, 0, 0.5)',
  'modal-backdrop-filter': 'blur(20px)',
  'modal-bg': '#FFFFFF',
  'modal-border': 'rgba(0, 0, 0, 0.08)',
  
  // Status colors
  'status-success': '#2D8A54',
  'status-warning': '#B95000',
  'status-error': '#CC3340',
  
  // Surface overlays
  'overlay-hover': 'rgba(0, 0, 0, 0.02)',
  'overlay-active': 'rgba(0, 0, 0, 0.04)',
  'overlay-raised': 'rgba(0, 0, 0, 0.1)'
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