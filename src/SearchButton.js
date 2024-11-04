import React from 'react';
import { MapPin, Search } from 'lucide-react';
import { LoadingSpinner } from './components/ui/loading';  // Adjust this path to match your project structure

export const SearchPhases = {
  INITIAL: 'initial',
  LOCATING: 'locating',
  LOADING: 'loading',
  COMPLETE: 'complete'
};

const SearchButton = ({ 
  onClick, 
  disabled, 
  searchPhase 
}) => {
  const isSearching = searchPhase === SearchPhases.LOCATING || searchPhase === SearchPhases.LOADING;
  const isInitialSearch = !isSearching && searchPhase === SearchPhases.INITIAL;
  
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => onClick()}
        disabled={disabled}
        className={`
          w-full min-w-[180px] sm:min-w-[220px] h-12 px-6 rounded-lg
          font-medium transition-all duration-200
          flex items-center justify-center gap-3 sm:gap-4
          focus-visible:outline-none focus-visible:ring-2 
          focus-visible:ring-[var(--action-primary)] focus-visible:ring-offset-2
          ${disabled
            ? 'bg-bg-secondary text-text-tertiary cursor-not-allowed'
            : 'bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)] text-white shadow-md'
          }
        `}
      >
        {isSearching ? (
          <>
            <LoadingSpinner size={20} />
            <span>
              {searchPhase === SearchPhases.LOCATING ? 'Finding Your Location...' : 'Discovering Spaces...'}
            </span>
          </>
        ) : (
          <>
            {isInitialSearch ? (
              <>
                <MapPin size={20} />
                <span>Find Spaces Near Me</span>
              </>
            ) : (
              <>
                <Search size={20} />
                <span>Search This Location</span>
              </>
            )}
          </>
        )}
      </button>
    </div>
  );
};

export default SearchButton;