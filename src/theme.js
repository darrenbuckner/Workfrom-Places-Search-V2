export const darkTheme = {
  // Base colors - Enhanced for better depth and contrast
  'bg-primary': '#1A1221',            // Deeper purple-black base
  'bg-secondary': '#251B2D',          // Richer dark purple
  'bg-tertiary': '#322438',           // More saturated purple for active states
  
  // Text colors - Improved readability and hierarchy
  'text-primary': '#F8F2FF',          // Warmer white for main text
  'text-secondary': '#D4C2E5',        // Softer purple-tinted secondary text
  'text-tertiary': '#9D89B3',         // Muted but still readable
  
  // Action colors - More vibrant and engaging
  'action-primary': '#8A3FB7',        // Brighter purple for primary actions
  'action-primary-hover': '#9E4BD0',  // Lighter hover state
  'action-primary-light': 'rgba(138, 63, 183, 0.15)', // Subtle glow effect
  'action-primary-border': 'rgba(138, 63, 183, 0.3)', // Defined borders
  
  // Action text colors - Enhanced visibility
  'action-text': '#E2B8FF',           // Brighter purple text
  'action-text-hover': '#F0CDFF',     // Lighter hover state
  'action-text-muted': '#B98CE2',     // Softer muted state
  
  // Button colors - More distinctive
  'button-primary': '#8A3FB7',        // Matches action-primary
  'button-primary-hover': '#9E4BD0',  // Matches action-primary-hover
  'button-secondary': '#322438',      // Subtle but visible
  'button-secondary-hover': '#3D2C45', // Lighter hover state
  'button-text': '#FFFFFF',           // Pure white for contrast
  'button-text-muted': '#D4C2E5',     // Matches text-secondary
  
  // Score colors - More intuitive
  'score-background': '#8A3FB7',      // Matches primary action
  'score-background-hover': '#9E4BD0', // Consistent hover state
  'score-text': '#FFFFFF',            // Clear white text
  
  // Accent colors - More vibrant
  'accent-primary': '#B347F5',        // Brighter purple accent
  'accent-secondary': '#C76AFF',      // Lighter purple for hover
  'accent-muted': '#3D2C45',          // Subtle background accent
  
  // Interactive elements
  'interactive-text': '#F8F2FF',      // Consistent with text-primary
  'interactive-hover': '#D4C2E5',     // Matches text-secondary
  'interactive-muted': '#9D89B3',     // Matches text-tertiary
  
  // Borders - More defined hierarchy
  'border-primary': 'rgba(212, 194, 229, 0.15)',    // More visible primary border
  'border-secondary': 'rgba(212, 194, 229, 0.08)',  // Subtle secondary border
  
  // Component specific - Enhanced distinction
  'card-bg': '#251B2D',               // Matches bg-secondary
  'card-hover': '#322438',            // Matches bg-tertiary
  'input-bg': '#322438',              // Consistent with tertiary
  'input-border': 'rgba(212, 194, 229, 0.15)',  // Matches border-primary
  
  // Status colors - More vibrant and accessible
  'success': '#4CAF50',               // Brighter green
  'warning': '#FF9800',               // Warmer orange
  'error': '#F44336',                 // Brighter red
  'info': '#B347F5',                  // Matches accent-primary
  
  // Place-specific colors - Enhanced visibility
  'place-highlight-bg': '#322438',    // Consistent tertiary
  'place-highlight-border': '#3D2C45', // Slightly lighter for definition
  'place-tag-bg': 'rgba(179, 71, 245, 0.15)',  // Uses accent-primary
  'place-tag-text': '#B347F5',        // Matches accent-primary
  'place-score-high': '#4CAF50',      // Consistent success
  'place-score-medium': '#FF9800',    // Consistent warning
  'place-score-low': '#F44336',       // Consistent error
  'place-feature-icon': '#B347F5',    // Matches accent-primary
  'place-distance': '#D4C2E5',        // Matches text-secondary
  'place-hours': '#4CAF50',           // Matches success
  'place-hours-closed': '#F44336',    // Matches error

  // Promoted place colors - More prominent
  'promoted-bg': '#3D2C45',           // Lighter than accent-muted
  'promoted-border': '#8A3FB7',       // Matches action-primary
  'promoted-text': '#F8F2FF',         // Matches text-primary
  'promoted-secondary': '#D4C2E5',    // Matches text-secondary
  'promoted-highlight': '#B347F5',    // Matches accent-primary
  'promoted-tag-bg': 'rgba(179, 71, 245, 0.2)', // Slightly more visible
  'promoted-tag-text': '#B347F5',     // Matches accent-primary
  'promoted-score-bg': '#8A3FB7',     // Matches action-primary
  'promoted-score-text': '#FFFFFF',   // Pure white for contrast
  'promoted-feature-icon': '#B347F5', // Matches accent-primary
  
  // Navigation
  'nav-active': '#B347F5',            // Matches accent-primary
  'nav-inactive': '#9D89B3',          // Matches text-tertiary
  'nav-hover': '#C76AFF',             // Matches accent-secondary
  
  // Map elements - Enhanced visibility
  'map-marker': '#8A3FB7',            // Matches action-primary
  'map-marker-active': '#9E4BD0',     // Matches action-primary-hover
  'map-overlay': 'rgba(26, 18, 33, 0.95)', // Uses bg-primary
  
  // Modal
  'modal-overlay': 'rgba(26, 18, 33, 0.95)', // Consistent with map-overlay
  
  // Gradients - More sophisticated
  'gradient-primary': 'linear-gradient(to right, rgba(179, 71, 245, 0.15), rgba(179, 71, 245, 0.08))',
  'gradient-hover': 'linear-gradient(to right, rgba(179, 71, 245, 0.25), rgba(179, 71, 245, 0.15))',
  
  // Shadow effects - New
  'shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
  'shadow-md': '0 2px 4px rgba(0, 0, 0, 0.3)',
  'shadow-lg': '0 4px 6px rgba(0, 0, 0, 0.3)',
  
  // Focus states - New
  'focus-ring': 'rgba(179, 71, 245, 0.5)',
  'focus-ring-offset': '#1A1221'
};

export const lightTheme = {
  // Base colors
  'bg-primary': '#FFFFFF',            
  'bg-secondary': '#F8F9FB',          
  'bg-tertiary': '#F1F4F8',           
  
  // Text colors
  'text-primary': '#1A2B3B',          
  'text-secondary': '#4A5567',        
  'text-tertiary': '#6E7A8A',         
  
  // Action colors
  'action-primary': '#000000',        
  'action-primary-hover': '#1a1a1a',  
  'action-primary-light': 'rgba(0, 0, 0, 0.12)',
  'action-primary-border': 'rgba(0, 0, 0, 0.25)',
  
  // Button-specific colors
  'button-primary': '#000000',
  'button-primary-hover': '#1a1a1a',
  'button-secondary': '#F1F4F8',
  'button-secondary-hover': '#E3E8EF',
  'button-text': '#FFFFFF',
  'button-text-muted': '#4A5567',
  
  // Score-specific colors
  'score-background': '#000000',
  'score-background-hover': '#1a1a1a',
  'score-text': '#FFFFFF',
  
  // Interactive colors
  'interactive-text': '#1A2B3B',      
  'interactive-hover': '#000000',     
  'interactive-muted': '#4A5567',     
  
  // Accent colors
  'accent-primary': '#000000',        
  'accent-secondary': '#1a1a1a',      
  'accent-muted': '#f5f5f5',          
  
  // Border colors
  'border-primary': '#E3E8EF',
  'border-secondary': '#D0D7E2',
  
  // Component specific
  'card-bg': '#FFFFFF',
  'card-hover': '#F8F9FB',
  'input-bg': '#FFFFFF',
  'input-border': '#E3E8EF',
  
  // Status colors
  'success': '#2D8A54',               
  'warning': '#B95000',               
  'error': '#CC3340',                 
  'info': '#000000',                  
  
  // Place-specific colors
  'place-highlight-bg': '#F8F9FB',
  'place-highlight-border': '#E3E8EF',
  'place-tag-bg': 'rgba(0, 0, 0, 0.08)',
  'place-tag-text': '#000000',
  'place-score-high': '#2D8A54',      
  'place-score-medium': '#B95000',
  'place-score-low': '#CC3340',
  'place-feature-icon': '#000000',
  'place-distance': '#4A5567',
  'place-hours': '#2D8A54',
  'place-hours-closed': '#CC3340',

  // Promoted place colors
  'promoted-bg': '#F8FAFD',
  'promoted-border': '#000000',
  'promoted-text': '#1A2B3B',
  'promoted-secondary': '#4A5567',
  'promoted-highlight': '#000000',
  'promoted-tag-bg': 'rgba(0, 0, 0, 0.08)',
  'promoted-tag-text': '#000000',
  'promoted-score-bg': '#F8FAFD',
  'promoted-score-text': '#1A2B3B',
  'promoted-feature-icon': '#000000',
  
  // Scoring colors for promoted items
  'promoted-score-high': '#2D8A54',   
  'promoted-score-medium': '#B95000',
  'promoted-score-low': '#CC3340',
  
  // Navigation
  'nav-active': '#000000',
  'nav-inactive': '#4A5567',
  'nav-hover': '#1a1a1a',
  
  // Map elements
  'map-marker': '#000000',
  'map-marker-active': '#1a1a1a',
  'map-overlay': 'rgba(255, 255, 255, 0.95)',
  
  // Modal
  'modal-overlay': 'rgba(0, 0, 0, 0.4)',
  
  // Gradients
  'gradient-primary': 'linear-gradient(to right, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.04))',
  'gradient-hover': 'linear-gradient(to right, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.08))',
};

// Helper functions remain unchanged
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