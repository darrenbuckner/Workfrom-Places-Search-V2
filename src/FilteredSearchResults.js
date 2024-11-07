import React from 'react';
import { List, Map, SlidersHorizontal } from 'lucide-react';
import { Message } from './components/ui/loading';
import PostSearchFilters from './PostSearchFilters';

const FilteredSearchResults = ({
  places,
  viewMode,
  showFilters,
  setShowFilters,
  setViewMode,
  postSearchFilters,
  handlePostSearchFilter,
  sortBy,
  setSortBy,
  radius,
  children,
  WorkabilityControls,
  searchPhase,
  onPhotoClick,
  isUsingSavedLocation,
  onRecommendationMade
}) => {
  const hasPlaces = places.length > 0;
  const isSearchComplete = searchPhase === 'complete';
  const isSearching = searchPhase === 'locating' || searchPhase === 'loading';
  const shouldShowResults = hasPlaces && isSearchComplete;

  // Initial state - show nothing
  if (searchPhase === 'initial') {
    return null;
  }

  // Search in progress - return nothing here as loading states are handled by parent
  if (isSearching) {
    return null;
  }

  // Search complete with results
  if (shouldShowResults) {
    return (
        <div className="border border-[var(--border-primary)] rounded-lg shadow-sm bg-[var(--bg-secondary)]">
          <div className="border-t border-[var(--border-primary)]">
            <div className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    Found {places.length} places within {radius} miles
                  </span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                  <div className="flex items-center gap-2">
                    <WorkabilityControls 
                      onSortChange={setSortBy}
                      currentSort={sortBy}
                      showSortControl={true}
                    />
                    
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`
                        p-2 rounded transition-colors
                        ${showFilters
                          ? 'bg-[var(--action-primary)] text-white'
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                        }
                      `}
                      aria-label="Toggle filters"
                    >
                      <SlidersHorizontal size={18} />
                    </button>
                  </div>

                  <div className="flex items-center border-l border-[var(--border-primary)] pl-2 sm:pl-4">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`
                        p-2 rounded transition-colors
                        ${viewMode === 'list'
                          ? 'bg-[var(--action-primary)] text-white'
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                        }
                      `}
                      aria-label="List view"
                    >
                      <List size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`
                        p-2 rounded transition-colors
                        ${viewMode === 'map'
                          ? 'bg-[var(--action-primary)] text-white'
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
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

          {showFilters && (
            <div className="border-t border-[var(--border-primary)]">
              <div className="p-4">
                <PostSearchFilters
                  onFilterChange={handlePostSearchFilter}
                  currentFilters={postSearchFilters}
                />
              </div>
            </div>
          )}

          <div className="border-t border-[var(--border-primary)]">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Search complete with no results
  if (isSearchComplete && !hasPlaces) {
    return (
      <div className="space-y-6">
        <div className="border border-[var(--border-primary)] rounded-lg shadow-sm bg-[var(--bg-secondary)] p-4">
          <Message 
            variant="info"
            message="No places found"
            description="Try adjusting your search radius or try a different location"
          />
        </div>
      </div>
    );
  }

  return null;
});

export default FilteredSearchResults;