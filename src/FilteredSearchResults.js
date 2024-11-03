import React from 'react';
import { List, Map, SlidersHorizontal } from 'lucide-react';
import { Message } from './components/ui/loading';
import PostSearchFilters from './PostSearchFilters';
import IntegratedSearchResults from './IntegratedSearchResults';

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
  children, // Keep for map view
  WorkabilityControls,
  searchPhase,
  onPhotoClick,
  recommendation,
  recommendedPlace,
  isAnalyzing
}) => {
  const hasPlaces = places.length > 0;
  
  return (
    <div className="space-y-6">
      <div className="border border-[var(--border-primary)] rounded-lg shadow-sm bg-[var(--bg-secondary)]">
        <div className="border-t border-[var(--border-primary)]">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {hasPlaces 
                    ? `Found ${places.length} places within ${radius} miles`
                    : 'No places match your current filters'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                <div className="flex items-center gap-2">
                  <WorkabilityControls 
                    onSortChange={setSortBy}
                    currentSort={sortBy}
                    showSortControl={hasPlaces}
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

                {hasPlaces && (
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
                )}
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

        {hasPlaces ? (
          <div className="border-t border-[var(--border-primary)]">
            <div className="p-4">
              {viewMode === 'list' ? (
                <IntegratedSearchResults
                  places={places}
                  sortBy={sortBy}
                  filters={postSearchFilters}
                  viewMode={viewMode}
                  onPhotoClick={onPhotoClick}
                  recommendation={recommendation}
                  recommendedPlace={recommendedPlace}
                  isAnalyzing={searchPhase !== 'complete'}
                />
              ) : (
                children
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-[var(--border-primary)]">
            <Message 
              variant="info"
              message="No places match your current filters"
              description="Try adjusting your filter criteria"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FilteredSearchResults;