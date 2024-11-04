import React from 'react';
import { MapPin, Search, Loader } from 'lucide-react';

const SearchControls = ({ 
  radius, 
  setRadius, 
  onSearch, 
  disabled, 
  searchPhase = 'initial',
  className = '' 
}) => {
  const isSearching = searchPhase === 'locating' || searchPhase === 'loading';
  const isInitialSearch = !isSearching && searchPhase === 'initial';

  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-end ${className}`}>
      {/* Radius Input */}
      <div className="flex-none">
        <label 
          htmlFor="radius" 
          className="block text-sm font-medium mb-1.5 text-[var(--text-primary)]"
        >
          Distance
        </label>
        <div className="relative w-[120px]">
          <input
            type="number"
            id="radius"
            min="0.5"
            max="999"
            step="0.1"
            value={radius}
            onChange={(e) => {
              const value = Math.round(Number(e.target.value) * 10) / 10;
              const validValue = Math.max(0.5, Math.min(999, value));
              setRadius(validValue);
            }}
            className={`
              w-full h-10 px-3 rounded-md border pr-8
              transition-colors duration-200
              [appearance:textfield]
              [&::-webkit-outer-spin-button]:appearance-none
              [&::-webkit-inner-spin-button]:appearance-none
              bg-[var(--bg-tertiary)]
              border-[var(--border-primary)]
              text-[var(--text-primary)]
              placeholder-[var(--text-tertiary)]
              focus:border-[var(--action-primary)]
              focus:ring-1 
              focus:ring-[var(--action-primary-light)]
              hover:border-[var(--action-primary-border)]
            `}
            placeholder="2.0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none text-[var(--text-tertiary)]">
            mi
          </span>
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={onSearch}
        disabled={disabled}
        className={`
          h-10 px-4 sm:px-6 rounded-md
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
              {searchPhase === 'locating' ? 'Getting Location...' : 'Finding Places...'}
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

      {isInitialSearch && (
        <p className="text-sm text-[var(--text-secondary)] mt-1 sm:hidden">
          We'll find workspaces near your current location
        </p>
      )}
    </div>
  );
};

export default SearchControls;