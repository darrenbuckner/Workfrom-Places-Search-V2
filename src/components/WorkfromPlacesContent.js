import React, { useState, useRef } from 'react';
import { List, Map, SlidersHorizontal, Brain } from 'lucide-react';
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
import ErrorMessage from '../ErrorMessage';
import WorkspaceAnalyzer from './WorkspaceAnalyzer';
import QuickInsights from './QuickInsights';

const ITEMS_PER_PAGE = 10;

const StyledSearchContainer = ({ children }) => {
  return (
    <div className="mb-6">
      <div className="relative rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--accent-primary)]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[var(--accent-primary)]/5 rounded-full blur-xl pointer-events-none" />
        <div className="relative p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

const ViewModeButton = ({ mode, currentMode, icon: Icon, onClick }) => (
  <button
    onClick={() => onClick(mode)}
    className={`
      p-2 rounded transition-colors
      ${currentMode === mode
        ? 'bg-[var(--action-primary)] text-[var(--button-text)]'
        : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
      }
    `}
    aria-label={`${mode} view`}
  >
    <Icon size={18} />
  </button>
);

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
    error: searchError,
    setError: setSearchError,
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
  const [lastSearchedRadius, setLastSearchedRadius] = useState(2);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);
  const [recommendedPlace, setRecommendedPlace] = useState(null);
  const [quickMatchHidden, setQuickMatchHidden] = useState(false);
  const [error, setError] = useState(null);
  const [userPreferences, setUserPreferences] = useState({
    preferQuiet: false,
    needsPower: false,
    needsWifi: true,
    teamSize: 1
  });

  const handleSearchError = (error) => {
    if (error.name === 'GeolocationPositionError') {
      switch (error.code) {
        case 1:
          setError({
            code: 'LOCATION_DENIED',
            title: 'Location Access Required',
            message: 'Please enable location access in your browser settings to find workspaces near you.',
            variant: 'warning'
          });
          break;
        case 2:
          setError({
            code: 'LOCATION_UNAVAILABLE',
            title: 'Location Unavailable',
            message: 'Unable to determine your location. Please check your device settings and try again.',
            variant: 'warning'
          });
          break;
        default:
          setError({
            code: 'LOCATION_ERROR',
            title: 'Location Error',
            message: 'An error occurred while getting your location. Please try again.',
            variant: 'error'
          });
      }
    } else {
      setError(error);
    }
  };

  const resetSearch = () => {
    setPlaces([]);
    setRecommendedPlace(null);
    setError(null);
    setSearchError(null);
    setLocationError(null);
    setQuickMatchHidden(false);
    setPostSearchFilters({
      type: 'any',
      power: 'any',
      noise: 'any',
      openNow: false
    });
  };

  const performSearch = async () => {
    resetSearch();
    setSearchPhase(SearchPhases.LOCATING);

    try {
      const searchLocation = await getLocation();
      setLocation(searchLocation);
      
      setSearchPhase(SearchPhases.LOADING);
      await fetchPlaces(searchLocation, radius);
      setIsSearchPerformed(true);
      setLastSearchedRadius(radius);
    } catch (err) {
      console.error('Search failed:', err);
      handleSearchError(err);
    } finally {
      setSearchPhase(SearchPhases.COMPLETE);
    }
  };

  const handlePostSearchFilter = (key, value) => {
    setPostSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleQuickMatchError = (error) => {
    setError({
      title: 'Analysis Error',
      message: error.message || 'Unable to analyze workspaces at this time.',
      variant: 'warning'
    });
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === 'analyze') {
      setQuickMatchHidden(true);
    }
  };

  const hasPlaces = places.length > 0;
  const showError = error || searchError || locationError;
  const currentError = error || searchError || locationError;

  const renderContent = () => {
    if (viewMode === 'list') {
      return (
        <SearchResults
          places={places}
          sortBy={sortBy}
          filters={postSearchFilters}
          itemsPerPage={ITEMS_PER_PAGE}
          viewMode={viewMode}
          onPhotoClick={handlePhotoClick}
          recommendedPlace={recommendedPlace}
        />
      );
    }

    if (viewMode === 'map') {
      return (
        <NearbyPlacesMap 
          places={places}
          userLocation={location}
          onPhotoClick={handlePhotoClick}
          highlightedPlace={recommendedPlace}
        />
      );
    }

    if (viewMode === 'analyze') {
      return (
        <div className="space-y-6">
          <QuickInsights 
            places={places}
            onPlaceClick={handlePhotoClick}
            userPreferences={userPreferences}
          />
          <WorkspaceAnalyzer
            places={places}
            isAnalyzing={searchPhase === SearchPhases.LOADING}
            onPlaceClick={handlePhotoClick}
          />
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <div className="container mx-auto px-3 sm:px-4 max-w-2xl flex-grow overflow-x-hidden">
        <WorkfromHeader
          onShowHowItWorks={() => setShowHowItWorks(true)}
          className="mt-4 sm:mt-6 md:mt-8 mb-4"
        />

        <WelcomeBanner isSearchPerformed={isSearchPerformed} />

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

        {searchPhase === SearchPhases.COMPLETE && (
          <div className="border border-[var(--border-primary)] rounded-lg shadow-sm bg-[var(--bg-secondary)]">
            <div className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {showError ? (
                  <ErrorMessage
                    error={currentError}
                    onRetry={performSearch}
                    onDismiss={() => setError(null)}
                    size="default"
                    className="w-full animate-fade-in"
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {hasPlaces 
                          ? `Located ${places.length} places within ${lastSearchedRadius} miles`
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
                              ? 'bg-[var(--action-primary)] text-[var(--button-text)]'
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
                          <ViewModeButton
                            mode="list"
                            currentMode={viewMode}
                            icon={List}
                            onClick={handleViewModeChange}
                          />
                          <ViewModeButton
                            mode="map"
                            currentMode={viewMode}
                            icon={Map}
                            onClick={handleViewModeChange}
                          />
                          <ViewModeButton
                            mode="analyze"
                            currentMode={viewMode}
                            icon={Brain}
                            onClick={handleViewModeChange}
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
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

            {hasPlaces && !showError && (
              <div className="border-t border-[var(--border-primary)]">
                {!quickMatchHidden && viewMode !== 'analyze' && (
                  <div className="p-4 border-b border-[var(--border-primary)]">
                    <QuickMatch
                      places={places}
                      searchPhase={searchPhase}
                      onRecommendationMade={setRecommendedPlace}
                      onPhotoClick={handlePhotoClick}
                      isHidden={quickMatchHidden}
                      onHide={() => setQuickMatchHidden(true)}
                      onError={handleQuickMatchError}
                    />
                  </div>
                )}
                
                <div className="p-4">
                  {renderContent()}
                </div>
              </div>
            )}
          </div>
        )}

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
      
      <footer className="py-4 mt-10 bg-bg-secondary border-t border-[var(--border-primary)]">
        <div className="container mx-auto px-4 text-center text-xs text-text-secondary">
          <p>&copy; {new Date().getFullYear()} Workfrom</p>
        </div>
      </footer>
    </div>
  );
};

export default WorkfromPlacesContent;