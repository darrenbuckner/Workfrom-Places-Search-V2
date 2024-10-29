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
    <div className={`
      sticky top-0 z-30 backdrop-blur-sm border-b mb-6 px-4 
      border border-border-primary rounded-lg
      ${isDark 
        ? 'bg-[#1a1f2c]/95 border-white/10' 
        : 'bg-white/95 border-gray-200'
      }
    `}>
      <div className="py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Results Count */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <span className={`
              text-sm font-medium
              ${isDark ? 'text-white' : 'text-gray-900'}
            `}>
              Found {totalPlaces} places within {radius} miles
            </span>
          </div>
          
          {/* Controls */}
          <div className={`
            flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end
            rounded-md px-4 py-2
            ${isDark 
              ? 'bg-[#2a3142] border border-white/10' 
              : 'bg-gray-50 border border-gray-200'
            }
          `}>
            {/* Sort Control */}
            <WorkabilityControls 
              onSortChange={onSortChange}
              currentSort={sortBy}
              showSortControl={true}
            />
            
            {/* View Mode Toggles */}
            <div className="flex space-x-2 pl-4 border-l border-border-primary">
              <button
                onClick={() => setViewMode('list')}
                className={`
                  p-2 rounded transition-colors flex items-center gap-2
                  ${viewMode === 'list'
                    ? 'bg-[var(--action-primary)] text-white'
                    : isDark
                      ? 'text-white hover:bg-[#323950]'
                      : 'text-gray-600 hover:bg-gray-200'
                  }
                `}
                aria-label="List view"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`
                  p-2 rounded transition-colors flex items-center gap-2
                  ${viewMode === 'map'
                    ? 'bg-[var(--action-primary)] text-white'
                    : isDark
                      ? 'text-white hover:bg-[#323950]'
                      : 'text-gray-600 hover:bg-gray-200'
                  }
                `}
                aria-label="Map view"
              >
                <Map size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsControls; 