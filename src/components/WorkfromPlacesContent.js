import React, { useState, useRef } from 'react';
import { List, Map, SlidersHorizontal } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';
import { usePlaces } from '../hooks/usePlaces';
import { usePhotoModal } from '../hooks/usePhotoModal';
import { SearchPhases } from '../constants';
import WorkfromHeader from '../WorkfromHeader';
import HowItWorksModal from '../HowItWorksModal';
import SearchControls from '../SearchControls';
import SearchResults from '../SearchResults';
import NearbyPlacesMap from '../NearbyPlacesMap';
import PhotoModal from '../PhotoModal';
import PostSearchFilters from '../PostSearchFilters';
import WorkabilityControls from '../WorkabilityControls';
import WelcomeBanner from '../WelcomeBanner';
import QuickMatch from '../QuickMatch';
import { Message } from '../components/ui/loading';

const ITEMS_PER_PAGE = 10;

const StyledSearchContainer = ({ children }) => {
  return (
    <div className="mb-6">
      <div className="relative rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        {/* Decorative Elements - Moved outside main container */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--accent-primary)]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[var(--accent-primary)]/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const WorkfromPlacesContent = () => {
  // Custom hooks
  const {
    location,
    setLocation,
    locationName,
    getLocation,
    error: locationError,
    setError: setLocationError
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
  const [lastSearchedRadius, setLastSearchedRadius] = useState(2); // Track the radius used in last search
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);
  const [recommendedPlace, setRecommendedPlace] = useState(null);
  const [recommendedPlaceId, setRecommendedPlaceId] = useState(null);
  const [quickMatchHidden, setQuickMatchHidden] = useState(false);

  // Search functionality
  const performSearch = async () => {
    setSearchPhase(SearchPhases.LOCATING);
    setPlaces([]);
    setRecommendedPlace(null);
    setError('');
    setLastSearchedRadius(radius); // Update the last searched radius
    setQuickMatchHidden(false); // Reset the hidden state on new search
    setPostSearchFilters({
      type: 'any',
      power: 'any',
      noise: 'any',
      openNow: false
    });

    try {
      const searchLocation = await getLocation();
      setLocation(searchLocation);
      
      setSearchPhase(SearchPhases.LOADING);
      await fetchPlaces(searchLocation, radius);
      setIsSearchPerformed(true);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.message);
    } finally {
      setSearchPhase(SearchPhases.COMPLETE);
    }
  };

  const handlePostSearchFilter = (key, value) => {
    setPostSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  const hasPlaces = places.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <div className="container mx-auto px-3 sm:px-4 max-w-2xl flex-grow overflow-x-hidden">
        {/* Header */}
        <WorkfromHeader
          onShowHowItWorks={() => setShowHowItWorks(true)}
          className="mt-4 sm:mt-6 md:mt-8 mb-4"
        />

        {/* Welcome Banner */}
        <WelcomeBanner isSearchPerformed={isSearchPerformed} />

        {/* Search Controls Wrap */}
        <StyledSearchContainer>
          <SearchControls
            radius={radius}
            setRadius={setRadius}
            onSearch={performSearch}
            disabled={searchPhase !== SearchPhases.INITIAL && searchPhase !== SearchPhases.COMPLETE}
            searchPhase={searchPhase}
            locationName={locationName}
          />
        </StyledSearchContainer>

        {/* Results Section - Only show when search is complete */}
        {searchPhase === SearchPhases.COMPLETE && (
          <div className="border border-[var(--border-primary)] rounded-lg shadow-sm bg-[var(--bg-secondary)]">
            <div className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {hasPlaces 
                      ? `Found ${places.length} places within ${lastSearchedRadius} miles`
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

            {error ? (
              <div className="p-4 border-t border-[var(--border-primary)]">
                <Message
                  variant="error"
                  message="Error"
                  description={error}
                />
              </div>
            ) : (hasPlaces ? (
              <div className="border-t border-[var(--border-primary)]">
                {/* QuickMatch now appears inside the results container */}
                {!quickMatchHidden && (
                  <div className="p-4 border-b border-[var(--border-primary)]">
                    <QuickMatch
                      places={places}
                      searchPhase={searchPhase}
                      onRecommendationMade={setRecommendedPlace}
                      onPhotoClick={handlePhotoClick}
                      isHidden={quickMatchHidden}
                      onHide={() => setQuickMatchHidden(true)}
                    />
                  </div>
                )}
                
                <div className="p-4">
                  {viewMode === 'list' ? (
                    <SearchResults
                      places={places}
                      sortBy={sortBy}
                      filters={postSearchFilters}
                      itemsPerPage={ITEMS_PER_PAGE}
                      viewMode={viewMode}
                      onPhotoClick={handlePhotoClick}
                      recommendedPlaceId={recommendedPlaceId}
                    />
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
            ) : (
              <div className="p-4 border-t border-[var(--border-primary)]">
                <Message 
                  variant="info"
                  message="No places found"
                  description="Try adjusting your search radius or try a different location"
                />
              </div>
            ))}
          </div>
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