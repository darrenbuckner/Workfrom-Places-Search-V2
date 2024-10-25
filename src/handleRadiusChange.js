// This would replace the search controls section in App.js
const SearchControls = ({ radius, setRadius, location, clearLocation, searchPlaces, searchPhase }) => {
  const { isDark } = useTheme();
  
  const handleRadiusChange = (e) => {
    // Convert to number and ensure it has at most 1 decimal place
    const value = Math.round(Number(e.target.value) * 10) / 10;
    // Set minimum to 0.5 and maximum to 999
    const validValue = Math.max(0.5, Math.min(999, value));
    setRadius(validValue);
  };

  return (
    <div className={`bg-bg-secondary border border-border-primary rounded-lg p-4 shadow-sm mb-6 ${
      isDark ? 'bg-[#2a3142] border-white/10' : 'bg-gray-50 border-gray-200'
    }`}>
      {location ? (
        <div className="mb-3">
          <p className={isDark ? 'text-white' : 'text-gray-900'}>
            Using your last-known location in {location.name}.{' '}
            <button
              onClick={clearLocation}
              className="text-blue-500 hover:text-blue-600 transition-colors underline"
            >
              Undo
            </button>
          </p>
        </div>
      ) : (
        <p className={`mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <strong>Click search</strong> to discover work-friendly places nearby.
        </p>
      )}

      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label 
            htmlFor="radius" 
            className={`block text-sm font-medium mb-1.5 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Search Radius
          </label>
          <div className="relative w-[120px]">
            <input
              type="number"
              id="radius"
              min="0.5"
              max="999"
              step="0.1"
              value={radius}
              onChange={handleRadiusChange}
              className={`
                w-full px-3 rounded-md border pr-8 h-10 
                transition-colors duration-200
                [appearance:textfield]
                [&::-webkit-outer-spin-button]:appearance-none
                [&::-webkit-inner-spin-button]:appearance-none
                ${isDark 
                  ? 'bg-[#2a3142] border-white/10 text-white placeholder-gray-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }
                ${isDark
                  ? 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 hover:border-blue-400'
                  : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 hover:border-gray-300'
                }
              `}
              placeholder="2"
            />
            <span className={`
              absolute right-3 top-1/2 -translate-y-1/2 
              text-sm pointer-events-none
              ${isDark ? 'text-gray-400' : 'text-gray-500'}
            `}>
              mi
            </span>
          </div>
        </div>
        <SearchButton
          onClick={searchPlaces}
          disabled={searchPhase !== 'initial' && searchPhase !== 'complete'}
          searchPhase={searchPhase}
          hasLocation={!!location}
        />
      </div>
    </div>
  );
};