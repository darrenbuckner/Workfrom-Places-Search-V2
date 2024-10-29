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
  // Base colors - Clean whites with subtle warmth
  'bg-primary': '#ffffff',            // Pure white for main background
  'bg-secondary': '#fafafa',          // Soft white for secondary elements
  'bg-tertiary': '#f5f7fa',          // Light blue-tinted white for depth
  
  // Text colors - Balanced blues and grays
  'text-primary': '#2c3e50',          // Deep blue-gray
  'text-secondary': '#64748b',        // Medium blue-gray
  'text-tertiary': '#94a3b8',         // Light blue-gray
  
  // Action colors - Ocean-inspired blues
  'action-primary': '#3b82f6',        // Clear ocean blue
  'action-primary-hover': '#2563eb',  // Deeper ocean blue
  'action-primary-light': 'rgba(59, 130, 246, 0.1)',
  'action-primary-border': 'rgba(59, 130, 246, 0.2)',
  
  // Border colors - Subtle definition
  'border-primary': 'rgba(226, 232, 240, 0.8)',
  'border-secondary': 'rgba(226, 232, 240, 0.5)',
  
  // Component specific - Clean and airy
  'card-bg': '#ffffff',
  'card-hover': '#f8fafc',
  'input-bg': '#ffffff',
  'input-border': '#e2e8f0',
  'button-text': '#ffffff',
  'button-text-muted': '#64748b',
  
  // Interactive colors - Natural progression
  'interactive-text': '#2c3e50',
  'interactive-hover': '#1e293b',
  'interactive-muted': '#64748b',
  
  // Accent colors - Coastal palette
  'accent-primary': '#3b82f6',
  'accent-secondary': '#60a5fa',
  'accent-muted': '#dbeafe',
  
  // Status colors - Natural and organic
  'success': '#34d399',               // Fresh sage green
  'warning': '#fbbf24',               // Warm sunlight
  'error': '#f87171',                 // Coral red
  'info': '#60a5fa',                  // Ocean spray
  
  // Place-specific colors - Airy and spacious
  'place-highlight-bg': '#f8fafc',    
  'place-highlight-border': '#e2e8f0',
  'place-tag-bg': 'rgba(59, 130, 246, 0.08)',
  'place-tag-text': '#3b82f6',
  'place-score-high': '#34d399',      
  'place-score-medium': '#fbbf24',    
  'place-score-low': '#f87171',       
  'place-feature-icon': '#3b82f6',    
  'place-distance': '#64748b',        
  'place-hours': '#34d399',           
  'place-hours-closed': '#f87171',    

  // Promoted place colors - Elevated but natural
  'promoted-bg': '#f0f9ff',           // Sky blue background
  'promoted-border': '#bae6fd',       // Soft blue border
  'promoted-text': '#2c3e50',         
  'promoted-secondary': '#64748b',    
  'promoted-highlight': '#3b82f6',    
  'promoted-tag-bg': 'rgba(59, 130, 246, 0.08)',
  'promoted-tag-text': '#3b82f6',
  'promoted-score-bg': '#f0f9ff',     
  'promoted-score-text': '#2c3e50',   
  'promoted-feature-icon': '#3b82f6', 
  
  // Scoring colors - Ocean-inspired
  'promoted-score-high': '#34d399',   
  'promoted-score-medium': '#fbbf24', 
  'promoted-score-low': '#f87171',    
  
  // Navigation - Clear wayfinding
  'nav-active': '#3b82f6',
  'nav-inactive': '#64748b',
  'nav-hover': '#60a5fa',
  
  // Map elements - Coastal inspiration
  'map-marker': '#3b82f6',
  'map-marker-active': '#60a5fa',
  'map-overlay': 'rgba(255, 255, 255, 0.9)',
  
  // Modal - Light and airy
  'modal-overlay': 'rgba(255, 255, 255, 0.95)',
  
  // Gradients - Subtle coastal transitions
  'gradient-primary': 'linear-gradient(to right, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.04))',
  'gradient-hover': 'linear-gradient(to right, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0.08))',
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