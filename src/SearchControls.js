import React, { useState } from 'react';
import { MapPin, Search, Loader, ChevronDown } from 'lucide-react';
import { SearchPhases } from './constants';

const SearchControls = ({ 
  radius, 
  setRadius,
  onSearch, 
  disabled, 
  searchPhase = SearchPhases.INITIAL,
  className = '',
  locationName = ''
}) => {
  const [showRadiusMenu, setShowRadiusMenu] = useState(false);
  const isSearching = searchPhase === SearchPhases.LOCATING || searchPhase === SearchPhases.LOADING;
  const isInitialSearch = !isSearching && searchPhase === SearchPhases.INITIAL;

  const handleRadiusChange = (value) => {
    const validValue = Math.max(0.5, Math.min(999, value));
    setRadius(validValue);
  };

  const handlePresetClick = (value) => {
    setRadius(value);
    setShowRadiusMenu(false);
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="relative">
        <div className="flex">
          {/* Main Search Button */}
          <button
            onClick={onSearch}
            disabled={disabled}
            className={`
              flex-1 h-10 px-4 sm:px-6 rounded-l-md
              font-medium transition-all duration-200
              flex items-center justify-center gap-2
              focus:outline-none focus:ring-2 
              focus:ring-[var(--action-primary-light)]
              ${disabled
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed'
                : 'bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)] text-white shadow-sm'
              }
            `}
          >
            {isSearching ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span className="whitespace-nowrap">
                  {searchPhase === SearchPhases.LOCATING ? 'Getting Location...' : 'Finding Places...'}
                </span>
              </>
            ) : isInitialSearch ? (
              <>
                <MapPin className="w-4 h-4" />
                <span className="whitespace-nowrap">Find Places Nearby</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span className="whitespace-nowrap">Search This Area</span>
              </>
            )}
          </button>

          {/* Radius Toggle Button */}
          <button
            onClick={() => setShowRadiusMenu(!showRadiusMenu)}
            disabled={disabled}
            className={`
              px-2 h-10 rounded-r-md border-l
              flex items-center justify-center
              transition-all duration-200
              ${disabled
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed border-l-[var(--border-primary)]'
                : 'bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)] text-white shadow-sm border-l-[var(--action-primary-hover)]'
              }
            `}
            aria-label="Adjust search radius"
          >
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-200 ${showRadiusMenu ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Radius Dropdown Menu */}
        {showRadiusMenu && (
          <div 
            className="absolute top-full mt-2 right-0 w-64 bg-[var(--bg-primary)] rounded-lg shadow-lg border border-[var(--border-primary)] p-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Search Radius
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={radius}
                  onChange={(e) => handleRadiusChange(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-[var(--text-secondary)] w-12 text-right">
                  {radius}mi
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {[1, 2, 5, 10].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetClick(preset)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors
                    ${radius === preset 
                      ? 'bg-[var(--action-primary)] text-white' 
                      : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                    }
                  `}
                >
                  {preset}mi
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Help Text / Current Radius */}
      {isInitialSearch ? (
        <p className="text-sm text-[var(--text-secondary)] sm:hidden text-center">
          We'll find workspaces near your current location
        </p>
      ) : (
        <p className="text-xs text-[var(--text-secondary)] text-center">
          Searching within {radius} miles{locationName ? ` of ${locationName}` : ''}
        </p>
      )}
    </div>
  );
};

export default SearchControls;