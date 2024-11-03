import React, { useState, useEffect } from 'react';
import { MapPin, Search, ArrowLeft, ChevronDown } from 'lucide-react';
import { LoadingSpinner } from './components/ui/loading';

const SearchButton = ({ 
  onClick, 
  disabled, 
  searchPhase, 
  hasLocation,
  locationName,
}) => {
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  
  useEffect(() => {
    if (searchPhase !== 'initial' && searchPhase !== 'complete') {
      setShowLocationOptions(false);
    }
  }, [searchPhase]);

  const handleSearch = (useSaved = false) => {
    setShowLocationOptions(false);
    onClick({ useSaved });
  };

  const isSearching = searchPhase === 'locating' || searchPhase === 'loading';
  
  return (
    <div className="flex flex-col gap-2">
      {/* Main Search Button */}
      {!hasLocation ? (
        // New user flow - single button
        <button
          onClick={() => handleSearch(false)}
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
              <span>{searchPhase === 'locating' ? 'Getting Location...' : 'Searching Nearby...'}</span>
            </>
          ) : (
            <>
              <MapPin size={20} />
              <span>See What's Nearby</span>
            </>
          )}
        </button>
      ) : (
        // Returning user flow - dropdown style
        <div className="relative w-full min-w-[180px] sm:min-w-[220px] z-50">
          <button
            onClick={() => setShowLocationOptions(!showLocationOptions)}
            disabled={disabled}
            className={`
              w-full h-12 px-6 rounded-lg
              font-medium transition-all duration-200
              flex items-center justify-between
              focus-visible:outline-none focus-visible:ring-2 
              focus-visible:ring-[var(--action-primary)] focus-visible:ring-offset-2
              ${disabled
                ? 'bg-bg-secondary text-text-tertiary cursor-not-allowed'
                : 'bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)] text-white shadow-md'
              }
            `}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              {isSearching ? (
                <>
                  <LoadingSpinner size={20} />
                  <span>{searchPhase === 'locating' ? 'Getting Location...' : 'Searching Nearby...'}</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>New Search</span>
                </>
              )}
            </div>
            {!isSearching && (
              <ChevronDown 
                size={20} 
                className={`transition-transform ${showLocationOptions ? 'rotate-180' : ''}`} 
              />
            )}
          </button>

          {/* Location Options Dropdown */}
          {showLocationOptions && !disabled && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border-primary shadow-lg overflow-hidden backdrop-blur-sm">
              <div className="bg-bg-secondary/95 py-1">
                <button
                  onClick={() => handleSearch(true)}
                  className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-bg-tertiary/80 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--action-primary)] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={15} className="text-[var(--action-primary)]" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-text-primary">Use saved location</div>
                    <div className="text-xs text-text-secondary mt-0.5">{locationName}</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleSearch(false)}
                  className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-bg-tertiary/80 transition-colors text-left border-t border-border-primary"
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--action-primary)] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={15} className="text-[var(--action-primary)]" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-text-primary">Search new area</div>
                    <div className="text-xs text-text-secondary mt-0.5">Use your current location</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      {!hasLocation && !isSearching && (
        <div className="text-center text-xs text-text-secondary px-2">
          Tap to find work-friendly places near your current location
        </div>
      )}
    </div>
  );
};

export default SearchButton;