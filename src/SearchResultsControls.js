import React from 'react';
import { List, Map } from 'lucide-react';
import WorkabilityControls from './WorkabilityControls';

const SearchResultsControls = ({ 
  totalPlaces, 
  radius, 
  sortBy, 
  onSortChange, 
  viewMode, 
  setViewMode 
}) => {
  return (
    <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur-sm border-b border-border-primary py-3 mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <span className="text-text-primary">
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
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
              aria-label="List view"
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded ${viewMode === 'map' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
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