import React from 'react';
import { Plus, InfoIcon } from 'lucide-react';
import { ThemeToggle } from './ThemeProvider';

const WorkfromLogo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 100" 
    className="w-8 h-8 sm:w-10 sm:h-10"
  >
    <circle cx="50" cy="50" r="48" fill="#1a1f2c" />
    <circle cx="50" cy="50" r="46" fill="none" stroke="#2a3142" strokeWidth="4" />
    <defs>
      <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
    <path 
      d="M50 75 L75 40 A35 35 0 0 0 25 40 Z" 
      fill="url(#mountainGradient)"
      opacity="0.9"
    />
    <defs>
      <linearGradient id="innerMountainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    <path 
      d="M50 75 L67 50 A24 24 0 0 0 33 50 Z" 
      fill="url(#innerMountainGradient)"
      opacity="0.95"
    />
    <circle cx="50" cy="75" r="6" fill="#3b82f6" />
    <circle cx="50" cy="75" r="7" fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0.5" />
  </svg>
);

const WorkfromHeader = ({ onShowHowItWorks }) => {
  const handleAddPlace = (e) => {
    e.preventDefault();
    alert("Thank you for your interest. The ability to add new places will be available soon!");
  };

  return (
    <header className="flex justify-between items-center mb-4 gap-2">
      <div className="flex items-center min-w-0">
        <WorkfromLogo />
        <h1 className="text-lg sm:text-2xl font-bold ml-2 truncate text-text-primary">
          Workfrom Places
        </h1>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <ThemeToggle />
        
        <button
          onClick={onShowHowItWorks}
          className="p-1.5 sm:p-2 rounded hover:bg-bg-secondary transition-colors flex items-center text-text-tertiary hover:text-text-primary"
          title="How It Works"
        >
          <InfoIcon size={16} />
          <span className="hidden sm:inline ml-1 text-xs sm:text-sm whitespace-nowrap text-text-primary">
            How It Works
          </span>
        </button>
        
        <button
          onClick={handleAddPlace}
          className="p-1.5 sm:p-2 rounded hover:bg-bg-secondary transition-colors flex items-center text-xs sm:text-sm whitespace-nowrap text-text-primary"
        >
          <Plus size={16} />
          <span className="hidden sm:inline ml-1">Add Place</span>
          <span className="sm:hidden ml-1">Add</span>
        </button>
      </div>
    </header>
  );
};

export default WorkfromHeader;