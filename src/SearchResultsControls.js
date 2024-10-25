import React from 'react';
import { List, Map } from 'lucide-react';
import WorkabilityControls from './WorkabilityControls';
import { useTheme } from './ThemeProvider';

const SearchResultsControls = ({ 
  totalPlaces, 
  radius, 
  sortBy, 
  onSortChange, 
  viewMode, 
  setViewMode 
}) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`sticky top-0 z-10 backdrop-blur-sm border-b py-3 mb-4 ${
      isDark 
        ? 'bg-[#1a1f2c]/95 border-white/10' 
        : 'bg-white/95 border-gray-200'
    }`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <span className={isDark ? 'text-white' : 'text-gray-900'}>
            Found {totalPlaces} places within {radius} miles
          </span>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <WorkabilityControls 
            onSortChange={onSortChange}
            currentSort={sortBy}
            showSortControl={true}
          />
          
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : isDark
                    ? 'bg-[#2a3142] text-white hover:bg-[#323950] border border-white/10'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
              aria-label="List view"
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'map'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : isDark
                    ? 'bg-[#2a3142] text-white hover:bg-[#323950] border border-white/10'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
              aria-label="Map view"
            >
              <Map size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsControls;