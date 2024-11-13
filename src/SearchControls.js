import React from 'react';
import { MapPin, Search, Loader, History, X } from 'lucide-react';
import { SearchPhases } from './constants';
import RadiusSelect from './RadiusSelect';

const SearchControls = ({ 
  radius, 
  setRadius,
  onSearch, 
  disabled, 
  searchPhase = SearchPhases.INITIAL,
  className = '',
  locationName = '',
  usingSavedLocation = false,
  onClearSavedLocation = () => {},
  filters,
}) => {
  const isSearching = searchPhase === SearchPhases.LOCATING || searchPhase === SearchPhases.LOADING;
  const isInitialSearch = !isSearching && searchPhase === SearchPhases.INITIAL;

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Saved Location Badge */}
      {usingSavedLocation && !isSearching && (
        <div className="flex justify-center mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full 
            bg-[var(--bg-secondary)] border border-[var(--border-primary)]
            text-sm text-[var(--text-secondary)]">
            <History size={14} />
            <span>Using saved location</span>
            <button
              onClick={onClearSavedLocation}
              className="ml-1 p-0.5 rounded-full hover:bg-[var(--bg-tertiary)]"
              aria-label="Clear saved location"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Main Search Section */}
      <div className="flex flex-col gap-4">
        {/* Search Controls - Added position-relative here */}
        <div className="flex gap-2 relative">
          <button
            onClick={onSearch}
            disabled={disabled}
            className={`
              flex-1 h-12 px-6 rounded-lg
              font-medium transition-all duration-200
              flex items-center justify-center gap-2
              focus:outline-none focus:ring-2 
              focus:ring-[var(--action-primary-light)]
              ${disabled
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed'
                : 'bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)] text-[var(--button-text)]'
              }
            `}
          >
            {isSearching ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>{searchPhase === SearchPhases.LOCATING ? 'Getting Location...' : 'Finding Places...'}</span>
              </>
            ) : (
              <>
                {isInitialSearch ? <MapPin size={20} /> : <Search size={20} />}
                <span>{isInitialSearch ? 'Start Search' : 'Search This Area'}</span>
              </>
            )}
          </button>

          {/* Changed div wrapper to static positioning */}
          <div className="static">
            <RadiusSelect
              radius={radius}
              onRadiusChange={setRadius}
              disabled={disabled}
              className="flex-shrink-0"
            />
          </div>
        </div>

        {/* Help Text */}
        <p className="text-xs text-[var(--text-secondary)] text-center">
          {isInitialSearch 
            ? "We'll find the best workspaces near your current location"
            : `Searching within ${radius} miles of your location`
          }
        </p>

        {/* Filters Section */}
        {!isInitialSearch && filters && (
          <div className="border-t border-[var(--border-primary)] pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filters}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchControls;