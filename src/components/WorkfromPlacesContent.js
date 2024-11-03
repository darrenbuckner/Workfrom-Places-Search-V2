import React, { useState, useRef } from 'react';
import { List, Map, SlidersHorizontal } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';
import { usePlaces } from '../hooks/usePlaces';
import { usePhotoModal } from '../hooks/usePhotoModal';
import WorkfromHeader from '../WorkfromHeader';
import HowItWorksModal from '../HowItWorksModal';
import SearchResultsContainer from '../SearchResultsContainer';
import SearchResults from '../SearchResults';
import GenAIInsights from '../GenAIInsights';
import NearbyPlacesMap from '../NearbyPlacesMap';
import PhotoModal from '../PhotoModal';
import PostSearchFilters from '../PostSearchFilters';
import SearchButton from '../SearchButton';
import LocationConfirmDialog from '../LocationConfirmDialog';
import WorkabilityControls from '../WorkabilityControls';
import WelcomeBanner from '../WelcomeBanner';
import { Message } from '../components/ui/loading';

const ITEMS_PER_PAGE = 10;

const WorkfromPlacesContent = () => {
  // Initialize custom hooks
  const {
    location,
    setLocation,
    locationName,
    getLocation,
    clearLocation
  } = useLocation();

  const {
    places,
    setPlaces,
    searchPhase,
    setSearchPhase,
    error,
    setError,
    sortBy,
    setSortBy,
    postSearchFilters,
    setPostSearchFilters,
    fetchPlaces
  } = usePlaces();

  const {
    selectedPlace,
    fullImg,
    showPhotoModal,
    isPhotoLoading,
    handlePhotoClick,
    closePhotoModal
  } = usePhotoModal();

  // Local state
  const [radius, setRadius] = useState(2);
  const [usingSavedLocation, setUsingSavedLocation] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [showLocationConfirm, setShowLocationConfirm] = useState(false);
  const [recommendedPlace, setRecommendedPlace] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  // Refs
  const resultsContainerRef = useRef(null);

  const performInitialSearch = async (useExistingLocation = false) => {
    setSearchPhase('locating');
    setPlaces([]);
    setRecommendedPlace(null);
    if (!useExistingLocation) {
      setUsingSavedLocation(false);
    }
    
    try {
      let searchLocation;
      if (useExistingLocation) {
        searchLocation = location;
      } else {
        searchLocation = await getLocation();
        setLocation(searchLocation);
      }
      
      setSearchPhase('loading');
      await fetchPlaces(searchLocation, radius);
      setIsSearchPerformed(true);
      // Reset filters after successful search
      setPostSearchFilters({
        type: 'any',
        power: 'any',
        noise: 'any',
        openNow: false
      });
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.message);
    } finally {
      setSearchPhase('complete');
    }
  };

  const handleSearch = async ({ useSaved }) => {
    setError('');
    setUsingSavedLocation(useSaved);
    await performInitialSearch(useSaved);
  };

  const handlePostSearchFilter = (key, value) => {
    setPostSearchFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      if (location) {
        setIsFiltering(true);
        fetchPlaces(location, radius, newFilters)
          .finally(() => setIsFiltering(false));
      }
      return newFilters;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <div className="container mx-auto p-3 sm:p-4 max-w-2xl flex-grow">
        {/* Header */}
        <WorkfromHeader
          onShowHowItWorks={() => setShowHowItWorks(true)}
          className="mb-4"
        />

        {/* Welcome Banner */}
        <WelcomeBanner isSearchPerformed={isSearchPerformed} />

        {/* Search, GenAI, and Results Container */}
        <SearchResultsContainer places={places} searchPhase={searchPhase}>
          {/* Search Section */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
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
                    w-full px-3 rounded-md border pr-8 h-10 
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
                  placeholder="2"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none text-[var(--text-tertiary)]">
                  mi
                </span>
              </div>
            </div>
            <SearchButton
              onClick={handleSearch}
              disabled={searchPhase !== 'initial' && searchPhase !== 'complete' || isFiltering}
              searchPhase={searchPhase}
              hasLocation={!!location}
              locationName={locationName}
            />
          </div>

          {/* GenAI Insights Section - Don't hide during filtering */}
          {places.length > 0 && !isFiltering && (
            <GenAIInsights
              places={places}
              isSearching={searchPhase !== 'complete'}
              onPhotoClick={handlePhotoClick}
              isUsingSavedLocation={usingSavedLocation}
              onRecommendationMade={(insights) => {
                if (insights?.recommendation?.name) {
                  setRecommendedPlace(insights.recommendation.name);
                }
              }}
            />
          )}

          {/* Controls and Filters Section */}
          {isSearchPerformed && (
            <>
              {/* Controls */}
              <div className="border-t border-[var(--border-primary)]">
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {isFiltering 
                          ? "Updating results..."
                          : places.length > 0 
                            ? `Found ${places.length} places within ${radius} miles`
                            : 'No places match your current filters'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                      {/* Sort and Filter Controls Group */}
                      <div className="flex items-center gap-2">
                        {places.length > 0 && (
                          <WorkabilityControls 
                            onSortChange={setSortBy}
                            currentSort={sortBy}
                            showSortControl={!isFiltering}
                          />
                        )}
                        
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          disabled={isFiltering}
                          className={`
                            p-2 rounded transition-colors
                            ${showFilters
                              ? 'bg-[var(--action-primary)] text-white'
                              : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                            }
                            ${isFiltering ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                          aria-label="Toggle filters"
                        >
                          <SlidersHorizontal size={18} />
                        </button>
                      </div>

                      {/* View Mode Toggles */}
                      {places.length > 0 && (
                        <div className="flex items-center border-l border-[var(--border-primary)] pl-2 sm:pl-4">
                          <button
                            onClick={() => setViewMode('list')}
                            disabled={isFiltering}
                            className={`
                              p-2 rounded transition-colors
                              ${viewMode === 'list'
                                ? 'bg-[var(--action-primary)] text-white'
                                : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                              }
                              ${isFiltering ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            aria-label="List view"
                          >
                            <List size={18} />
                          </button>
                          <button
                            onClick={() => setViewMode('map')}
                            disabled={isFiltering}
                            className={`
                              p-2 rounded transition-colors
                              ${viewMode === 'map'
                                ? 'bg-[var(--action-primary)] text-white'
                                : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                              }
                              ${isFiltering ? 'opacity-50 cursor-not-allowed' : ''}
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

              {/* Post-Search Filters */}
              {showFilters && (
                <div className="border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
                  <div className="p-4">
                    <PostSearchFilters
                      onFilterChange={handlePostSearchFilter}
                      currentFilters={postSearchFilters}
                      className="max-w-2xl mx-auto"
                      disabled={isFiltering}
                    />
                  </div>
                </div>
              )}

              {/* Results Display */}
              <div className="border-t border-[var(--border-primary)]">
                <div className="p-4">
                  {isFiltering ? (
                    <div className="flex justify-center py-8">
                      <span className="text-sm text-[var(--text-secondary)]">
                        Updating results...
                      </span>
                    </div>
                  ) : places.length === 0 ? (
                    <Message 
                      variant="info"
                      message="No places match your current filters"
                      description="Try adjusting your criteria"
                    />
                  ) : viewMode === 'list' ? (
                    <div className="space-y-6">
                      <SearchResults
                        places={places}
                        sortBy={sortBy}
                        filters={postSearchFilters}
                        itemsPerPage={ITEMS_PER_PAGE}
                        viewMode={viewMode}
                        onPhotoClick={handlePhotoClick}
                        recommendedPlaceName={recommendedPlace}
                      />
                    </div>
                  ) : (
                    <NearbyPlacesMap 
                      places={places}
                      userLocation={location}
                      onPhotoClick={handlePhotoClick}
                      highlightedPlace={recommendedPlace}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </SearchResultsContainer>

        {/* Error Message */}
        {error && searchPhase === 'complete' && (
          <Message
            variant="error"
            message="Error"
            description={error}
          />
        )}

        {/* Modals */}
        {showHowItWorks && (
          <HowItWorksModal setShowModal={setShowHowItWorks} />
        )}
        
        {showPhotoModal && (
          <PhotoModal
            selectedPlace={selectedPlace}
            fullImg={fullImg}
            isPhotoLoading={isPhotoLoading}
            setShowPhotoModal={closePhotoModal}
          />
        )}

        {showLocationConfirm && (
          <LocationConfirmDialog
            locationName={locationName}
            onUseExisting={() => {
              setShowLocationConfirm(false);
              setPlaces([]);
              performInitialSearch(true);
            }}
            onSearchNew={() => {
              clearLocation();
              setShowLocationConfirm(false);
              setPlaces([]);
              performInitialSearch(false);
            }}
            onCancel={() => {
              setShowLocationConfirm(false);
            }}
          />
        )}
      </div>
      
      {/* Footer */}
      <footer className="py-4 bg-bg-secondary border-t border-[var(--border-primary)]">
        <div className="container mx-auto px-4 text-center text-xs text-text-secondary">
          <p>&copy; {new Date().getFullYear()} Workfrom</p>
        </div>
      </footer>
    </div>
  );
};

export default WorkfromPlacesContent;