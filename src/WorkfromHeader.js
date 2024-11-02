import React from 'react';
import { Plus, InfoIcon } from 'lucide-react';
import { ThemeToggle } from './ThemeProvider';

// Extracted Logo component for better maintainability
const WorkfromLogo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 100" 
    className="w-8 h-8 sm:w-10 sm:h-10"
    aria-label="Workfrom logo"
  >
    {/* Enhanced Background Circle */}
    <circle cx="50" cy="50" r="48" fill="#1e1b4b" /> {/* Deep purple background */}
    <circle cx="50" cy="50" r="46" fill="none" stroke="#312e81" strokeWidth="2" /> {/* Rich purple border */}
    
    {/* Enhanced Location Pin Base with gradient */}
    <defs>
      <linearGradient id="pinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7c3aed" /> {/* Lighter violet */}
        <stop offset="100%" stopColor="#5340f0" /> {/* Primary purple */}
      </linearGradient>
    </defs>
    <path 
      d="M50 20 C35 20, 25 32, 25 45 C25 58, 35 65, 50 80 C65 65, 75 58, 75 45 C75 32, 65 20, 50 20"
      fill="url(#pinGradient)"
      opacity="0.95"
    />
    
    {/* Enhanced Laptop Screen with gradient */}
    <rect 
      x="38" y="38" width="24" height="16" rx="2" 
      fill="#f1f5f9" 
      stroke="#cbd5e1" 
      strokeWidth="1.5" 
    />
    
    {/* Enhanced Laptop Base with gradient */}
    <path 
      d="M35 54 L65 54 L68 58 L32 58 Z" 
      fill="#e2e8f0" 
      stroke="#cbd5e1" 
      strokeWidth="1.5" 
    />
    
    {/* Enhanced Coffee Cup with gradient */}
    <circle cx="50" cy="45" r="3" fill="#6d28d9" opacity="0.9" /> {/* Rich purple */}
    <path 
      d="M47 45 Q50 48, 53 45" 
      stroke="#6d28d9" 
      strokeWidth="1.5" 
      fill="none" 
    />
    
    {/* Enhanced Glow Effect */}
    <circle cx="50" cy="50" r="44" fill="url(#enhancedGlow)" opacity="0.15" />
    
    {/* Enhanced Gradients */}
    <defs>
      <radialGradient id="enhancedGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#a78bfa" /> {/* Bright violet glow */}
        <stop offset="100%" stopColor="#5340f0" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

const WorkfromHeader = ({ 
  onShowHowItWorks,
  className = '',
  addPlaceUrl = 'https://workfrom.co/add',
  showThemeToggle = true,
  showAddPlace = true,
  showHowItWorks = true,
  headerTitle = 'Workfrom Places'
}) => {
  const handleAddPlace = (e) => {
    e.preventDefault();
    alert("Thank you for your interest. The ability to add new places will be available soon!");
  };

  return (
    <header className={`flex justify-between items-center gap-2 ${className}`}>
      {/* Logo and Title Section */}
      <div className="flex items-center min-w-0">
        <WorkfromLogo />
        <h1 className="text-sm font-bold ml-2 truncate text-text-primary">
          {headerTitle}
        </h1>
      </div>
      
      {/* Actions Section */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {showThemeToggle && <ThemeToggle />}
        
        {showHowItWorks && (
          <button
            onClick={onShowHowItWorks}
            className="p-1.5 sm:p-2 rounded hover:bg-bg-secondary transition-colors 
              flex items-center text-text-tertiary hover:text-text-primary"
            title="How It Works"
            aria-label="Learn how Workfrom Places works"
          >
            <InfoIcon size={16} />
            <span className="hidden sm:inline ml-1 text-xs sm:text-sm whitespace-nowrap text-text-primary">
              How It Works
            </span>
          </button>
        )}
        
        {showAddPlace && (
          <button
            onClick={handleAddPlace}
            className="p-1.5 sm:p-2 rounded hover:bg-bg-secondary transition-colors 
              flex items-center text-xs sm:text-sm whitespace-nowrap text-text-primary"
            aria-label="Add a new place to Workfrom"
          >
            <Plus size={16} className="flex-shrink-0" />
            <span className="hidden sm:inline ml-1">Add Place</span>
            <span className="sm:hidden ml-1">Add</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default WorkfromHeader;