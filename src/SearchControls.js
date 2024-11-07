import React, { useState, useEffect } from 'react';
import { MapPin, Search, Loader, ChevronDown, History, X } from 'lucide-react';
import { SearchPhases } from './constants';

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
  const [showRadiusMenu, setShowRadiusMenu] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const isSearching = searchPhase === SearchPhases.LOCATING || searchPhase === SearchPhases.LOADING;
  const isInitialSearch = !isSearching && searchPhase === SearchPhases.INITIAL;

  const radiusPresets = [
    { value: 0.5, label: '0.5mi', description: 'Walking' },
    { value: 2, label: '2mi', description: 'Biking' },
    { value: 5, label: '5mi', description: 'Short Drive' },
    { value: 10, label: '10mi', description: 'Driving' }
  ];

  useEffect(() => {
    const preset = radiusPresets.find(p => p.value === radius);
    setActivePreset(preset?.value || null);
  }, [radius]);

  const handleRadiusChange = (value) => {
    const validValue = Math.max(0.5, Math.min(999, value));
    setRadius(validValue);
    setActivePreset(validValue);
  };

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
        {/* Desktop Layout */}
        <div className="hidden sm:flex flex-col gap-3">
          {/* Radius Presets */}
          <div className="grid grid-cols-4 gap-2">
            {radiusPresets.map(({ value, label, description }) => (
              <button
                key={value}
                onClick={() => handleRadiusChange(value)}
                className={`
                  py-2.5 px-3 rounded-lg transition-colors
                  flex flex-col items-center justify-center
                  border border-[var(--border-primary)]
                  ${value === activePreset
                    ? 'bg-[var(--action-primary)] text-[var(--button-text)] border-transparent'
                    : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                  }
                `}
              >
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs opacity-80">{description}</span>
              </button>
            ))}
          </div>

          {/* Search Button */}
          <button
            onClick={onSearch}
            disabled={disabled}
            className={`
              w-full h-12 px-6 rounded-lg
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
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="flex">
            <button
              onClick={onSearch}
              disabled={disabled}
              className={`
                flex-1 h-12 px-4 rounded-l-lg
                font-medium transition-all duration-200
                flex items-center justify-center gap-2
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
                  <span>Find Places Nearby</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowRadiusMenu(!showRadiusMenu)}
              disabled={disabled}
              className={`
                px-3 h-12 rounded-r-lg border-l
                flex items-center justify-center gap-1
                ${disabled
                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed'
                  : 'bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)] text-[var(--button-text)]'
                }
              `}
            >
              <span className="text-sm">{radius}mi</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${showRadiusMenu ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Mobile Radius Menu Popup */}
          {showRadiusMenu && (
            <>
              <div 
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => setShowRadiusMenu(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-2 p-4 
                bg-[var(--bg-primary)] rounded-lg shadow-lg border border-[var(--border-primary)] 
                z-50">
                <div className="grid grid-cols-2 gap-2">
                  {radiusPresets.map(({ value, label, description }) => (
                    <button
                      key={value}
                      onClick={() => {
                        handleRadiusChange(value);
                        setShowRadiusMenu(false);
                      }}
                      className={`
                        p-3 rounded-md transition-colors
                        flex flex-col items-center justify-center
                        border border-[var(--border-primary)]
                        ${value === activePreset
                          ? 'bg-[var(--action-primary)] text-[var(--button-text)] border-transparent'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                        }
                      `}
                    >
                      <span className="font-medium">{label}</span>
                      <span className="text-xs opacity-80">{description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Help Text */}
        <p className="text-xs text-[var(--text-secondary)] text-center">
          {isInitialSearch 
            ? "We'll find the best workspaces near your current location"
            : `Searching within ${radius} miles ${locationName ? `of your location in ${locationName}` : ''}`
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