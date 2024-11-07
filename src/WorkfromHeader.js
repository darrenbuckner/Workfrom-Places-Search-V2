import React from 'react';
import { Plus, InfoIcon } from 'lucide-react';
import { ThemeToggle } from './ThemeProvider';

// Extracted Logo component for better maintainability
const WorkfromLogo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 100" 
    className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--text-primary)]"
    aria-label="Workfrom logo"
  >
    {/* Background Circle */}
    <circle 
      cx="50" 
      cy="50" 
      r="48" 
      className="text-[var(--bg-tertiary)]" 
      fill="currentColor" 
    />
    <circle 
      cx="50" 
      cy="50" 
      r="46" 
      fill="none" 
      className="text-[var(--border-primary)]" 
      stroke="currentColor" 
      strokeWidth="2" 
    />
    
    {/* Location Pin */}
    <path 
      d="M50 20 C35 20, 25 32, 25 45 C25 58, 35 65, 50 80 C65 65, 75 58, 75 45 C75 32, 65 20, 50 20"
      className="text-[var(--text-primary)]"
      fill="currentColor"
      opacity="0.9"
    />
    
    {/* Laptop Screen */}
    <rect 
      x="38" 
      y="38" 
      width="24" 
      height="16" 
      rx="2" 
      className="text-[var(--bg-secondary)]"
      fill="currentColor"
    />
    
    {/* Laptop Base */}
    <path 
      d="M35 54 L65 54 L68 58 L32 58 Z" 
      className="text-[var(--bg-secondary)]"
      fill="currentColor"
    />
    
    {/* Coffee Cup */}
    <circle 
      cx="50" 
      cy="45" 
      r="3" 
      className="text-[var(--text-primary)]" 
      fill="currentColor"
      opacity="0.9" 
    />
    <path 
      d="M47 45 Q50 48, 53 45" 
      className="text-[var(--text-primary)]"
      stroke="currentColor"
      strokeWidth="1.5" 
      fill="none" 
    />
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