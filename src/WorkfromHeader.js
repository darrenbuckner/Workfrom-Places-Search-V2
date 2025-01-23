import React, { useState, useEffect, memo } from 'react';
import { 
  Plus, InfoIcon, ChevronDown, MapPin
} from 'lucide-react';
import { ThemeToggle } from './ThemeProvider';

// Logo component memoized since it rarely changes
const WorkfromLogo = memo(({ size = 'default' }) => {
  const dimensions = size === 'small' ? 'w-7 h-7' : 'w-8 h-8 sm:w-10 sm:h-10';
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      className={`${dimensions} text-[var(--text-primary)]`}
      aria-label="Workfrom logo"
    >
      <circle cx="50" cy="50" r="48" className="text-[var(--bg-tertiary)]" fill="currentColor" />
      <circle cx="50" cy="50" r="46" fill="none" className="text-[var(--border-primary)]" stroke="currentColor" strokeWidth="2" />
      <path d="M50 20 C35 20, 25 32, 25 45 C25 58, 35 65, 50 80 C65 65, 75 58, 75 45 C75 32, 65 20, 50 20" className="text-[var(--text-primary)]" fill="currentColor" opacity="0.9" />
      <rect x="38" y="38" width="24" height="16" rx="2" className="text-[var(--bg-secondary)]" fill="currentColor" />
      <path d="M35 54 L65 54 L68 58 L32 58 Z" className="text-[var(--bg-secondary)]" fill="currentColor" />
      <circle cx="50" cy="45" r="3" className="text-[var(--text-primary)]" fill="currentColor" opacity="0.9" />
      <path d="M47 45 Q50 48, 53 45" className="text-[var(--text-primary)]" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
});

// Header Actions component
const HeaderActions = memo(({ 
  showThemeToggle, 
  showHowItWorks,
  showAddPlace,
  onShowHowItWorks,
}) => {
  return (
    <div className="flex items-center gap-1">
      {showThemeToggle && <ThemeToggle />}
      
      {showHowItWorks && (
        <button onClick={onShowHowItWorks} className="p-2 rounded-full hover:bg-[var(--bg-secondary)] 
          transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" 
          title="How It Works">
          <InfoIcon size={20} />
        </button>
      )}
      
      {showAddPlace && (
        <a 
          href="https://workfrom.co/add" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 rounded-full hover:bg-[var(--bg-secondary)] 
            text-[var(--text-primary)] sm:px-3 sm:py-1.5"
        >
          <Plus size={20} className="sm:hidden" />
          <span className="hidden sm:block text-sm font-medium">Add Place</span>
        </a>
      )}
    </div>
  );
});

// Main WorkfromHeader component
const WorkfromHeader = ({ 
  onShowHowItWorks,
  className = '',
  showThemeToggle = true,
  showAddPlace = true,
  showHowItWorks = true,
  headerTitle = 'Workfrom Places',
  locationName = '',
  onLocationClick,
  searchPhase = 'initial'
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const showLocationBar = searchPhase !== 'initial';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsExpanded(currentScrollY < lastScrollY || currentScrollY < 50);
      setIsScrolled(currentScrollY > 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200
      ${showLocationBar && isExpanded ? 'h-[104px]' : 'h-16'} ${className}`}>
      <div className={`absolute inset-0 transition-colors duration-200
        ${isScrolled ? 'bg-[var(--bg-primary)]/95 backdrop-blur-lg shadow-sm' : 'bg-[var(--bg-primary)]'}
        border-b border-[var(--border-primary)]`} />

      <div className="relative h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WorkfromLogo size={isExpanded && showLocationBar ? 'default' : 'small'} />
          <h1 className={`font-bold text-[var(--text-primary)] truncate transition-all duration-200
            ${isExpanded && showLocationBar ? 'text-lg' : 'text-base'}`}>
            {headerTitle}
          </h1>
        </div>

        <HeaderActions
          showThemeToggle={showThemeToggle}
          showHowItWorks={showHowItWorks}
          showAddPlace={showAddPlace}
          onShowHowItWorks={onShowHowItWorks}
        />
      </div>

      {showLocationBar && (
        <div className={`relative h-12 px-4 transition-all duration-200 transform
          ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <button onClick={onLocationClick} className="flex items-center gap-2 px-4 py-2 w-full sm:w-auto rounded-full
            bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]
            border border-[var(--border-primary)] transition-colors">
            <MapPin size={16} className="text-[var(--accent-primary)]" />
            <span className="text-sm font-medium text-[var(--text-primary)] truncate">
              {locationName || 'Select Location'}
            </span>
            <ChevronDown size={16} className="text-[var(--text-secondary)]" />
          </button>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
    </header>
  );
};

export default memo(WorkfromHeader);