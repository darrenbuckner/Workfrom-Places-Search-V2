import React, { useState, useEffect, memo } from 'react';
import { AuthModal } from './components/AuthModal';
import { 
  Plus, InfoIcon, ChevronDown, MapPin, LogOut
} from 'lucide-react';
import { ThemeToggle } from './ThemeProvider';
import { useAuth } from './hooks/useAuth';

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

// Separate component for user menu
const UserMenu = memo(({ user, onLogout, onClose }) => {
  if (!user) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-1 w-48 py-1 rounded-lg shadow-lg
        border border-[var(--border-primary)] bg-[var(--bg-primary)]/95 backdrop-blur-sm z-50">
        <div className="px-4 py-2 border-b border-[var(--border-primary)]">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.email}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{user.membershipType || 'Free Account'}</p>
        </div>
        <div className="py-1">
          <button onClick={onLogout} className="w-full px-4 py-2 text-sm text-left text-[var(--text-primary)]
            hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-2">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
});

// Header Actions component
const HeaderActions = memo(({ 
  showThemeToggle, 
  showHowItWorks,
  showAddPlace,
  onShowHowItWorks,
  user,
  isLoading,
  onAddPlace,
  onShowAuthModal,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getUserInitial = () => user?.email?.charAt(0).toUpperCase() || '?';

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
        <button onClick={onAddPlace} className="p-2 rounded-full hover:bg-[var(--bg-secondary)] 
          text-[var(--text-primary)] sm:px-3 sm:py-1.5">
          <Plus size={20} className="sm:hidden" />
          <span className="hidden sm:block text-sm font-medium">Add Place</span>
        </button>
      )}

      <div className="relative">
        {isLoading ? (
          <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] animate-pulse" />
        ) : user ? (
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-full
              hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] 
              flex items-center justify-center text-[var(--button-text)]">
              {getUserInitial()}
            </div>
            <ChevronDown size={16} className="text-[var(--text-secondary)]" />
          </button>
        ) : (
          <button
            onClick={onShowAuthModal}
            className="px-3 py-1.5 rounded-md bg-[var(--accent-primary)]
              text-[var(--button-text)] text-sm font-medium
              hover:bg-[var(--accent-primary-hover)] transition-colors"
          >
            Sign In
          </button>
        )}

        {showUserMenu && user && (
          <UserMenu 
            user={user} 
            onLogout={onLogout} 
            onClose={() => setShowUserMenu(false)} 
          />
        )}
      </div>
    </div>
  );
});

// Main WorkfromHeader component
const WorkfromHeader = ({ 
  onShowHowItWorks,
  className = '',
  addPlaceUrl = 'https://workfrom.co/add',
  showThemeToggle = true,
  showAddPlace = true,
  showHowItWorks = true,
  headerTitle = 'Workfrom Places',
  locationName = '',
  onLocationClick,
  searchPhase = 'initial',
  handleShowAuthModal,
  handleCloseAuthModal
}) => {
  const { user, logout, isLoading } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
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

  const handleAddPlace = (e) => {
    e.preventDefault();
    if (!user) {
      handleShowAuthModal();
      return;
    }
    alert("Thank you for your interest. The ability to add new places will be available soon!");
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

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
          user={user}
          isLoading={isLoading}
          onAddPlace={handleAddPlace}
          onShowAuthModal={handleShowAuthModal}
          onLogout={handleLogout}
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

      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={handleCloseAuthModal}
        />
      )}
    </header>
  );
};

export default memo(WorkfromHeader);