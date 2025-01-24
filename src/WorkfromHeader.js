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
      aria-label="Nearby places logo"
    >
      {/* Background circle with very subtle gradient */}
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" className="text-[var(--accent-primary)]" stopOpacity="0.08" />
          <stop offset="100%" className="text-[var(--accent-primary)]" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#grad1)" />
      
      {/* Outer ring with subtle glow */}
      <circle 
        cx="50" cy="50" r="46" 
        className="text-[var(--accent-primary)]" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
        strokeDasharray="4,2"
        opacity="0.8"
      />

      {/* Central location marker */}
      <g className="text-[var(--accent-primary)]" fill="currentColor">
        <circle cx="50" cy="50" r="8" fillOpacity="0.15" />
        <circle cx="50" cy="50" r="4" />
      </g>

      {/* Orbital rings representing nearby places */}
      <g className="text-[var(--text-primary)]" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6">
        <ellipse cx="50" cy="50" rx="20" ry="30" transform="rotate(-30 50 50)" strokeDasharray="2,3" />
        <ellipse cx="50" cy="50" rx="25" ry="35" transform="rotate(30 50 50)" strokeDasharray="3,4" />
      </g>

      {/* Small dots representing places */}
      <g className="text-[var(--text-primary)]" fill="currentColor" opacity="0.8">
        <circle cx="65" cy="35" r="2" />
        <circle cx="30" cy="60" r="2" />
        <circle cx="70" cy="65" r="2" />
        <circle cx="35" cy="30" r="2" />
      </g>
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
  headerTitle = 'Nearby',
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