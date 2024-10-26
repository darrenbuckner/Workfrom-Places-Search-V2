import React, { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const SearchCoordinator = ({ 
  onSearch,
  searchPhase,
  savedLocation,
  locationName,
  className = ''
}) => {
  // Track which location mode we're using
  const [searchMode, setSearchMode] = useState('auto'); // 'auto', 'saved', 'new'
  
  // When location changes, reset to auto mode
  useEffect(() => {
    setSearchMode('auto');
  }, [savedLocation]);

  const handleSearch = async () => {
    // If we're explicitly using saved location, or we have one and are in auto mode
    if (searchMode === 'saved' || (searchMode === 'auto' && savedLocation)) {
      onSearch({ useSaved: true });
    } 
    // If we're explicitly searching new, or we have no saved location in auto mode
    else {
      onSearch({ useSaved: false });
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Location Mode Selection */}
      {savedLocation && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-blue-500" />
            <span className="text-sm">
              Previous location: <span className="font-medium">{locationName}</span>
            </span>
          </div>
          
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setSearchMode('saved')}
              className={`px-3 py-1 rounded-full transition-colors ${
                searchMode === 'saved'
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              Use Previous
            </button>
            <button
              onClick={() => setSearchMode('new')}
              className={`px-3 py-1 rounded-full transition-colors ${
                searchMode === 'new'
                  ? 'bg-blue-100 text-blue-700' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              New Location
            </button>
          </div>
        </div>
      )}

      {/* Primary Search Button */}
      <button
        onClick={handleSearch}
        disabled={searchPhase !== 'initial' && searchPhase !== 'complete'}
        className={`
          relative px-6 py-2.5 rounded-lg font-medium
          transition-all duration-300
          ${searchPhase !== 'initial' && searchPhase !== 'complete'
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
          }
          flex items-center justify-center gap-2
          min-w-[180px]
        `}
      >
        {searchMode === 'new' ? (
          <>
            <MapPin size={18} className={searchPhase === 'locating' ? 'animate-pulse' : ''} />
            Find New Location
          </>
        ) : (
          <>
            <Navigation size={18} className={searchPhase === 'loading' ? 'animate-pulse' : ''} />
            {searchPhase === 'locating' ? 'Getting Location...' :
             searchPhase === 'loading' ? 'Searching...' :
             'Search This Area'}
          </>
        )}
      </button>
      
      {/* Help Text */}
      <div className="text-xs text-gray-500">
        {searchMode === 'new' ? (
          "We'll get your current location to find nearby spots"
        ) : savedLocation ? (
          "Searching around your previous location"
        ) : (
          "We'll get your location to find nearby spots"
        )}
      </div>
    </div>
  );
};

export default SearchCoordinator;