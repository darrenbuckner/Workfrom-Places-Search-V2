import React, { useState } from 'react';
import { List, Map, Brain, SlidersHorizontal } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';
import { usePlaces } from '../hooks/usePlaces';
import { usePhotoModal } from '../hooks/usePhotoModal';
import { SearchPhases } from '../constants';
import WorkfromHeader from '../WorkfromHeader';
import HowItWorksModal from '../HowItWorksModal';
import ControlsHeader from '../ControlsHeader';
import SearchControls from '../SearchControls';
import SearchResults from '../SearchResults';
import NearbyPlacesMap from '../NearbyPlacesMap';
import PhotoModal from '../PhotoModal';
import PostSearchFilters from '../PostSearchFilters';
import WorkabilityControls from '../WorkabilityControls';
import InsightsSummary from '../InsightsSummary';
import WelcomeBanner from '../WelcomeBanner';
import ViewModeToggle from '../ViewModeToggle';
import ErrorMessage from '../ErrorMessage';
import API_CONFIG from '../config';

const ITEMS_PER_PAGE = 10;

const StyledSearchContainer = ({ children }) => (
  <div className="mb-6">
    <div className="relative rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--accent-primary)]/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[var(--accent-primary)]/5 rounded-full blur-xl pointer-events-none" />
      <div className="relative p-4 sm:p-6">{children}</div>
    </div>
  </div>
);

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
  // State
  const [radius, setRadius] = useState(2);
  const [lastSearchedRadius, setLastSearchedRadius] = useState(2);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);
  const [error, setError] = useState(null);
  const [workspaceAnalysis, setWorkspaceAnalysis] = useState(null);

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

  const hasPlaces = places.length > 0;
  const showError = error || searchError || locationError;
  const currentError = error || searchError || locationError;

  // Add the filter handler function
  const handlePostSearchFilter = (key, value) => {
    setPostSearchFilters(prev => ({ ...prev, [key]: value }));
  };


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
    setError(null);
    setSearchError(null);
    setLocationError(null);
    setWorkspaceAnalysis(null);
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
      const fetchedPlaces = await fetchPlaces(searchLocation, radius);
      setIsSearchPerformed(true);
      setLastSearchedRadius(radius);

      // Prepare data for analysis
      const placesData = fetchedPlaces.map(place => ({
        name: place.title,
        type: place.type || '',
        distance: parseFloat(place.distance) || 0,
        noise: place.noise_level || place.noise || '',
        power: place.power || '',
        workabilityScore: place.workabilityScore || 0,
        wifi: place.download ? `${Math.round(place.download)} Mbps` : 
              place.no_wifi === "1" ? "No WiFi" : "Unknown",
        amenities: {
          coffee: place.coffee === "1",
          food: place.food === "1",
          alcohol: place.alcohol === "1",
          outdoorSeating: place.outdoor_seating === "1" || place.outside === "1"
        }
      }));

      try {
        const analysisResponse = await fetch(
          `${API_CONFIG.baseUrl}/analyze-workspaces?appid=${API_CONFIG.appId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ places: placesData })
          }
        );

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          console.log('Analysis Response:', analysisData); // Debug log
          if (analysisData.insights) {
            setWorkspaceAnalysis(analysisData.insights);
          }
        }
      } catch (err) {
        console.error('Analysis failed:', err);
        // Don't fail the whole search if analysis fails
      }

      // Automatically switch to insights view after first search
      if (!isSearchPerformed) {
        setViewMode('insights');
      }
    } catch (err) {
      console.error('Search failed:', err);
      handleSearchError(err);
    } finally {
      setSearchPhase(SearchPhases.COMPLETE);
    }
  };

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
        />
      );
    }

    if (viewMode === 'map') {
      return (
        <NearbyPlacesMap 
          places={places}
          userLocation={location}
          onPhotoClick={handlePhotoClick}
        />
      );
    }

    if (viewMode === 'insights') {
      return (
        <InsightsSummary
          places={places}
          analysisData={workspaceAnalysis}
          locationName={locationName}
          onPhotoClick={handlePhotoClick}
        />
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
          <>
            <ControlsHeader 
              viewMode={viewMode}
              setViewMode={setViewMode}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              totalPlaces={places.length}
              radius={lastSearchedRadius}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            {/* Show filters panel if enabled */}
            {showFilters && viewMode !== 'insights' && (
              <div className="mt-4 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)] p-4">
                <PostSearchFilters
                  onFilterChange={handlePostSearchFilter}
                  currentFilters={postSearchFilters}
                  disabled={searchPhase !== SearchPhases.COMPLETE}
                />
              </div>
            )}

            {/* Content section */}
            <div className="mt-4 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)]">
              <div className="p-4">
                {renderContent()}
              </div>
            </div>
          </>
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