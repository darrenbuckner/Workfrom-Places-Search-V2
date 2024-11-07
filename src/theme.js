export const darkTheme = {
  // Base colors - Deep, rich backgrounds inspired by Lyft
  'bg-primary': '#0F0B14',            // Deep purple-black
  'bg-secondary': '#161219',          // Lighter purple-black
  'bg-tertiary': '#1D1820',           // Elevated surface with purple tint
  
  // Text colors - Crisp contrast
  'text-primary': '#FFFFFF',          // Pure white
  'text-secondary': '#B4A5C1',        // Soft purple-white
  'text-tertiary': '#8E7B9B',         // Muted purple
  
  // Action colors - Lyft-inspired pink/purple
  'action-primary': '#EA4C89',        // Vibrant pink
  'action-primary-hover': '#D23B78',  // Darker pink
  'action-primary-light': 'rgba(234, 76, 137, 0.12)',
  'action-primary-border': 'rgba(234, 76, 137, 0.25)',
  
  // Interactive colors
  'interactive-text': '#FFFFFF',      
  'interactive-hover': '#B4A5C1',     
  'interactive-muted': '#8E7B9B',     
  
  // Accent colors - Bold pink highlights
  'accent-primary': '#EA4C89',        // Vibrant pink
  'accent-secondary': '#FF69B4',      // Bright pink
  'accent-muted': '#4A2B4B',          // Deep purple background
  
  // Border colors - Subtle purple tints
  'border-primary': 'rgba(255, 255, 255, 0.1)',
  'border-secondary': 'rgba(255, 255, 255, 0.05)',
  
  // Component specific
  'card-bg': '#161219',
  'card-hover': '#1D1820',
  'input-bg': '#1D1820',
  'input-border': 'rgba(255, 255, 255, 0.1)',
  'button-text': '#FFFFFF',
  'button-text-muted': '#B4A5C1',
  
  // Status colors - Modern and bold
  'success': '#00E5A0',               // Bright mint green
  'warning': '#FFB168',               // Warm orange
  'error': '#FF4F7D',                 // Pink-red
  'info': '#EA4C89',                  // Pink
  
  // Place-specific colors
  'place-highlight-bg': '#1D1820',     
  'place-highlight-border': '#2A222E', 
  'place-tag-bg': 'rgba(234, 76, 137, 0.15)',
  'place-tag-text': '#FF69B4',
  'place-score-high': '#00E5A0',       
  'place-score-medium': '#FFB168',     
  'place-score-low': '#FF4F7D',        
  'place-feature-icon': '#FF69B4',     
  'place-distance': '#B4A5C1',         
  'place-hours': '#00E5A0',            
  'place-hours-closed': '#FF4F7D',     

  // Promoted place colors
  'promoted-bg': '#2A1F33',           
  'promoted-border': '#3D2D47',       
  'promoted-text': '#FFFFFF',         
  'promoted-secondary': '#B4A5C1',    
  'promoted-highlight': '#EA4C89',    
  'promoted-tag-bg': 'rgba(234, 76, 137, 0.2)',
  'promoted-tag-text': '#FF69B4',
  'promoted-score-bg': '#2A222E',     
  'promoted-score-text': '#FFFFFF',   
  'promoted-feature-icon': '#FF69B4', 
  
  // Scoring colors for promoted items
  'promoted-score-high': '#00E5A0',   
  'promoted-score-medium': '#FFB168', 
  'promoted-score-low': '#FF4F7D',    
  
  // Navigation
  'nav-active': '#EA4C89',           
  'nav-inactive': '#8E7B9B',
  'nav-hover': '#FF69B4',
  
  // Map elements
  'map-marker': '#EA4C89',           
  'map-marker-active': '#FF69B4',
  'map-overlay': 'rgba(15, 11, 20, 0.85)',
  
  // Modal
  'modal-overlay': 'rgba(15, 11, 20, 0.95)',
  
  // Gradients
  'gradient-primary': 'linear-gradient(to right, rgba(234, 76, 137, 0.15), rgba(234, 76, 137, 0.08))',
  'gradient-hover': 'linear-gradient(to right, rgba(234, 76, 137, 0.25), rgba(234, 76, 137, 0.15))',
};

export const lightTheme = {
  // Base colors - Warm, professional neutrals (unchanged)
  'bg-primary': '#FFFFFF',            // Clean white
  'bg-secondary': '#F8F9FB',          // Soft blue-gray
  'bg-tertiary': '#F1F4F8',           // Lighter blue-gray
  
  // Text colors - Rich, readable hierarchy (unchanged)
  'text-primary': '#1A2B3B',          // Deep blue-gray
  'text-secondary': '#4A5567',        // Medium blue-gray
  'text-tertiary': '#6E7A8A',         // Light blue-gray
  
  // Action colors - Now dark and bold
  'action-primary': '#000000',        // Pure black for primary actions
  'action-primary-hover': '#1a1a1a',  // Slightly lighter black on hover
  'action-primary-light': 'rgba(0, 0, 0, 0.12)',
  'action-primary-border': 'rgba(0, 0, 0, 0.25)',
  
  // Interactive colors - More contrast
  'interactive-text': '#1A2B3B',      // Deep blue-gray
  'interactive-hover': '#000000',     // Black
  'interactive-muted': '#4A5567',     // Medium blue-gray
  
  // Accent colors - Bold black palette
  'accent-primary': '#000000',        // Pure black
  'accent-secondary': '#1a1a1a',      // Slightly lighter black
  'accent-muted': '#f5f5f5',          // Light gray background
  
  // Border colors - Subtle definition (unchanged)
  'border-primary': '#E3E8EF',
  'border-secondary': '#D0D7E2',
  
  // Component specific - Refined spaces
  'card-bg': '#FFFFFF',
  'card-hover': '#F8F9FB',
  'input-bg': '#FFFFFF',
  'input-border': '#E3E8EF',
  'button-text': '#FFFFFF',
  'button-text-muted': '#4A5567',
  
  // Status colors - High contrast indicators
  'success': '#2D8A54',               // Darker green
  'warning': '#B95000',               // Warm orange
  'error': '#CC3340',                 // Professional red
  'info': '#000000',                  // Black for info
  
  // Place-specific colors - Bold workspace oriented
  'place-highlight-bg': '#F8F9FB',
  'place-highlight-border': '#E3E8EF',
  'place-tag-bg': 'rgba(0, 0, 0, 0.08)',
  'place-tag-text': '#000000',
  'place-score-high': '#2D8A54',      // Darker green
  'place-score-medium': '#B95000',
  'place-score-low': '#CC3340',
  'place-feature-icon': '#000000',
  'place-distance': '#4A5567',
  'place-hours': '#2D8A54',
  'place-hours-closed': '#CC3340',

  // Promoted place colors - Premium feel
  'promoted-bg': '#F8FAFD',
  'promoted-border': '#E3E8EF',
  'promoted-text': '#1A2B3B',
  'promoted-secondary': '#4A5567',
  'promoted-highlight': '#000000',
  'promoted-tag-bg': 'rgba(0, 0, 0, 0.08)',
  'promoted-tag-text': '#000000',
  'promoted-score-bg': '#F8FAFD',
  'promoted-score-text': '#1A2B3B',
  'promoted-feature-icon': '#000000',
  
  // Scoring colors for promoted items
  'promoted-score-high': '#2D8A54',   // Darker green
  'promoted-score-medium': '#B95000',
  'promoted-score-low': '#CC3340',
  
  // Navigation - Bold wayfinding
  'nav-active': '#000000',
  'nav-inactive': '#4A5567',
  'nav-hover': '#1a1a1a',
  
  // Map elements - Bold mapping
  'map-marker': '#000000',
  'map-marker-active': '#1a1a1a',
  'map-overlay': 'rgba(255, 255, 255, 0.95)',
  
  // Modal - Clean overlay
  'modal-overlay': 'rgba(0, 0, 0, 0.4)',
  
  // Gradients - Subtle transitions
  'gradient-primary': 'linear-gradient(to right, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.04))',
  'gradient-hover': 'linear-gradient(to right, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.08))',
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