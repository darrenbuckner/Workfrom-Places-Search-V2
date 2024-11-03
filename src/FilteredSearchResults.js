import React from 'react';
import { List, Map, SlidersHorizontal } from 'lucide-react';
import { Message } from './components/ui/loading';
import PostSearchFilters from './PostSearchFilters';
import GenAIInsights from './GenAIInsights';

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
  const hasSearchResults = places.length > 0;
  const isSearchComplete = searchPhase === 'complete';
  
  // Only show GenAI insights when we have places and search is complete
  const showInsights = hasSearchResults && isSearchComplete;
  
  return (
    <div className="space-y-6">
      {showInsights && (
        <GenAIInsights
          places={places}
          isSearching={searchPhase !== 'complete'}
          onPhotoClick={onPhotoClick}
          isUsingSavedLocation={isUsingSavedLocation}
          onRecommendationMade={onRecommendationMade}
          className="mb-1"
        />
      )}

      <div className="border border-[var(--border-primary)] rounded-lg shadow-sm bg-[var(--bg-secondary)]">
        {/* Controls Section - Always visible after search */}
        {isSearchComplete && (
          <div className="border-t border-[var(--border-primary)]">
            <div className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {hasSearchResults 
                      ? `Found ${places.length} places within ${radius} miles`
                      : 'No places match your current filters'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                  <div className="flex items-center gap-2">
                    <WorkabilityControls 
                      onSortChange={setSortBy}
                      currentSort={sortBy}
                      showSortControl={hasSearchResults}
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

                  {hasSearchResults && (
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
        )}

        {/* Filters Section - Always visible when showFilters is true */}
        {showFilters && isSearchComplete && (
          <div className="border-t border-[var(--border-primary)]">
            <div className="p-4">
              <PostSearchFilters
                onFilterChange={handlePostSearchFilter}
                currentFilters={postSearchFilters}
              />
            </div>
          </div>
        )}

        {/* Results Section - Always maintain structure */}
        {isSearchComplete && (
          <div className="border-t border-[var(--border-primary)]">
            <div className="p-4">
              {hasSearchResults ? (
                children
              ) : (
                <Message 
                  variant="info"
                  message="No places match your current filters"
                  description="Try adjusting your filter criteria"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilteredSearchResults;