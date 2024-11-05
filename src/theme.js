export const darkTheme = {
  // Base colors - Dramatic depths
  'bg-primary': '#0a0b0d',            // Deep space black
  'bg-secondary': '#111216',          // Monochromatic darker
  'bg-tertiary': '#16171c',          // Elevated surface
  
  // Text colors - Sharp contrast
  'text-primary': '#ffffff',          // Pure white for maximum contrast
  'text-secondary': '#9ba1b0',        // Muted but legible
  'text-tertiary': '#6b7280',        // Subtle text
  
  // Action colors - Vibrant purple accent
  'action-primary': '#5340f0',        // New primary purple
  'action-primary-hover': '#4733e0',  // Darker shade
  'action-primary-light': 'rgba(83, 64, 240, 0.12)',
  'action-primary-border': 'rgba(83, 64, 240, 0.25)',
  
  // Interactive colors - Clean transitions
  'interactive-text': '#ffffff',      
  'interactive-hover': '#9ba1b0',     
  'interactive-muted': '#6b7280',     
  
  // Accent colors - Modernist palette
  'accent-primary': '#5340f0',        // New primary purple
  'accent-secondary': '#6e5df2',      // Lighter purple
  'accent-muted': '#2a1f99',         // Deep purple background
  
  // Border colors - Architectural definition
  'border-primary': 'rgba(255, 255, 255, 0.08)',
  'border-secondary': 'rgba(255, 255, 255, 0.04)',
  
  // Component specific - Structured spaces
  'card-bg': '#111216',
  'card-hover': '#16171c',
  'input-bg': '#16171c',
  'input-border': 'rgba(255, 255, 255, 0.08)',
  'button-text': '#ffffff',
  'button-text-muted': '#9ba1b0',
  
  // Status colors - Contemporary palette
  'success': '#10b981',               // Modern green
  'warning': '#f59e0b',               // Bold amber
  'error': '#ef4444',                 // Vivid red
  'info': '#5340f0',                  // Updated to match new purple
  
  // Place-specific colors - Bold modernist approach
  'place-highlight-bg': '#16171c',     
  'place-highlight-border': '#1f2937', 
  'place-tag-bg': 'rgba(83, 64, 240, 0.15)',
  'place-tag-text': '#6e5df2',
  'place-score-high': '#10b981',       
  'place-score-medium': '#f59e0b',     
  'place-score-low': '#ef4444',        
  'place-feature-icon': '#6e5df2',     
  'place-distance': '#9ba1b0',         
  'place-hours': '#10b981',            
  'place-hours-closed': '#ef4444',     

  // Promoted place colors - Dramatic emphasis
  'promoted-bg': '#1e1b4b',           
  'promoted-border': '#312e81',       
  'promoted-text': '#ffffff',         
  'promoted-secondary': '#9ba1b0',    
  'promoted-highlight': '#5340f0',    // Updated to new purple
  'promoted-tag-bg': 'rgba(83, 64, 240, 0.2)',
  'promoted-tag-text': '#6e5df2',
  'promoted-score-bg': '#1f2937',     
  'promoted-score-text': '#ffffff',   
  'promoted-feature-icon': '#6e5df2', 
  
  // Scoring colors for promoted items - Bold states
  'promoted-score-high': '#10b981',   
  'promoted-score-medium': '#f59e0b', 
  'promoted-score-low': '#ef4444',    
  
  // Navigation - Clear wayfinding
  'nav-active': '#5340f0',           // Updated to new purple
  'nav-inactive': '#6b7280',
  'nav-hover': '#6e5df2',
  
  // Map elements - Contemporary styling
  'map-marker': '#5340f0',           // Updated to new purple
  'map-marker-active': '#6e5df2',
  'map-overlay': 'rgba(10, 11, 13, 0.85)',
  
  // Modal - Dramatic overlay
  'modal-overlay': 'rgba(10, 11, 13, 0.95)',
  
  // Gradients - Modern transitions
  'gradient-primary': 'linear-gradient(to right, rgba(83, 64, 240, 0.15), rgba(83, 64, 240, 0.08))',
  'gradient-hover': 'linear-gradient(to right, rgba(83, 64, 240, 0.25), rgba(83, 64, 240, 0.15))',
};

export const lightTheme = {
  // Base colors - Natural whites and creams
  'bg-primary': '#fffcf8',            // Warm white
  'bg-secondary': '#faf7f2',          // Soft cream
  'bg-tertiary': '#f5f2ed',           // Light beige
  
  // Text colors - Rich earth tones
  'text-primary': '#2d2a26',          // Deep bark brown
  'text-secondary': '#615c55',        // Warm gray
  'text-tertiary': '#8c8782',         // Muted stone
  
  // Action colors - Deep forest greens
  'action-primary': '#1a2f25',        // Almost black green
  'action-primary-hover': '#0f1a15',  // Deeper green
  'action-primary-light': 'rgba(26, 47, 37, 0.1)',
  'action-primary-border': 'rgba(26, 47, 37, 0.2)',
  
  // Border colors - Natural definition
  'border-primary': 'rgba(210, 204, 193, 0.8)',  // Soft sand
  'border-secondary': 'rgba(210, 204, 193, 0.5)', // Light sand
  
  // Component specific - Natural materials
  'card-bg': '#fffcf8',               // Warm white
  'card-hover': '#faf7f2',            // Soft cream
  'input-bg': '#fffcf8',              // Warm white
  'input-border': '#e6e2d9',          // Light stone
  'button-text': '#ffffff',           // Pure white
  'button-text-muted': '#615c55',     // Warm gray
  
  // Interactive colors - Organic progression
  'interactive-text': '#2d2a26',      // Deep bark brown
  'interactive-hover': '#1a2f25',     // Almost black green
  'interactive-muted': '#615c55',     // Warm gray
  
  // Accent colors - Rich orange and deep green
  'accent-primary': '#1a2f25',        // Almost black green
  'accent-secondary': '#dd6b20',      // Rich orange
  'accent-muted': '#feeddd',          // Soft orange mist
  
  // Status colors - Natural alerts
  'success': '#1a2f25',               // Almost black green
  'warning': '#dd6b20',               // Rich orange
  'error': '#bc4749',                 // Clay red
  'info': '#1a2f25',                  // Almost black green
  
  // Place-specific colors - Natural spaces
  'place-highlight-bg': '#faf7f2',    
  'place-highlight-border': '#e6e2d9',
  'place-tag-bg': 'rgba(26, 47, 37, 0.08)',
  'place-tag-text': '#1a2f25',
  'place-score-high': '#1a2f25',      
  'place-score-medium': '#dd6b20',    
  'place-score-low': '#bc4749',       
  'place-feature-icon': '#1a2f25',    
  'place-distance': '#615c55',        
  'place-hours': '#1a2f25',           
  'place-hours-closed': '#bc4749',    

  // Promoted place colors - Elevated natural
  'promoted-bg': '#f0f4f2',           // Soft sage
  'promoted-border': '#c7d4ce',       // Sage border
  'promoted-text': '#2d2a26',         
  'promoted-secondary': '#615c55',    
  'promoted-highlight': '#1a2f25',    
  'promoted-tag-bg': 'rgba(26, 47, 37, 0.08)',
  'promoted-tag-text': '#1a2f25',
  'promoted-score-bg': '#f0f4f2',     
  'promoted-score-text': '#2d2a26',   
  'promoted-feature-icon': '#1a2f25', 
  
  // Scoring colors - Nature-inspired states
  'promoted-score-high': '#1a2f25',   
  'promoted-score-medium': '#dd6b20', 
  'promoted-score-low': '#bc4749',    
  
  // Navigation - Clear wayfinding
  'nav-active': '#1a2f25',
  'nav-inactive': '#615c55',
  'nav-hover': '#dd6b20',
  
  // Map elements - Natural mapping
  'map-marker': '#1a2f25',
  'map-marker-active': '#dd6b20',
  'map-overlay': 'rgba(255, 252, 248, 0.95)',
  
  // Modal - Light and airy
  'modal-overlay': 'rgba(255, 252, 248, 0.95)',
  
  // Gradients - Organic transitions
  'gradient-primary': 'linear-gradient(to right, rgba(26, 47, 37, 0.08), rgba(26, 47, 37, 0.04))',
  'gradient-hover': 'linear-gradient(to right, rgba(26, 47, 37, 0.12), rgba(26, 47, 37, 0.08))',
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