import React, { useState, useEffect, useCallback, memo } from 'react';
import { MapPin, Zap, Sparkles, Star } from 'lucide-react';
import { SearchPhases } from '../constants';
import WorkfromHeader from '../WorkfromHeader';
import QuickMatchView from './QuickMatchView';
import { useWorkspaceAnalysis } from '../hooks/useWorkspaceAnalysis';
import NearbyPlacesMap from '../NearbyPlacesMap';
import WorkspaceGuide from './WorkspaceGuide';
import SearchControls from '../SearchControls';
import UnifiedLoadingState from '../UnifiedLoadingState';
import ErrorMessage from '../ErrorMessage';
import WelcomeBanner from '../WelcomeBanner';
import HowItWorksModal from '../HowItWorksModal';
import Footer from './Footer';
import { FavoritesList } from './FavoritesList';
import PhotoModal from '../PhotoModal';

const LayoutWrapper = memo(({ children }) => (
  <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
    <div className="pt-16">
      <div className="container mx-auto px-4 max-w-2xl">
        {children}
      </div>
    </div>
    <Footer />
  </div>
));

const ViewToggle = memo(({ mode, onChange }) => (
  <div className="flex items-center gap-3 sm:gap-2">
    <button
      onClick={() => onChange('insights')}
      className={`
        inline-flex items-center gap-2 px-4 py-2 sm:px-3 sm:py-1.5 text-sm font-medium rounded-md
        transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0
        justify-center
        ${mode === 'insights'
          ? 'bg-[var(--accent-primary)] text-[var(--button-text)]'
          : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:text-[var(--text-primary)]'
        }
      `}
    >
      <Sparkles size={18} className="sm:size-4" />
      <span className="hidden sm:inline">Vibe</span>
    </button>

    <button
      onClick={() => onChange('map')}
      className={`
        inline-flex items-center gap-2 px-4 py-2 sm:px-3 sm:py-1.5 text-sm font-medium rounded-md
        transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0
        justify-center
        ${mode === 'map'
          ? 'bg-[var(--accent-primary)] text-[var(--button-text)]'
          : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:text-[var(--text-primary)]'
        }
      `}
    >
      <MapPin size={18} className="sm:size-4" />
      <span className="hidden sm:inline">Map</span>
    </button>

    <button
      onClick={() => onChange('guide')}
      className={`
        inline-flex items-center gap-2 px-4 py-2 sm:px-3 sm:py-1.5 text-sm font-medium rounded-md
        transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0
        justify-center hidden
        ${mode === 'guide'
          ? 'bg-[var(--accent-primary)] text-[var(--button-text)]'
          : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:text-[var(--text-primary)]'
        }
      `}
    >
      <Sparkles size={18} className="sm:size-4" />
      <span className="hidden sm:inline">Guide</span>
    </button>
  </div>
));

const ContentArea = ({ 
  viewMode,
  places, 
  location, 
  handleViewDetails, 
  selectedPlace,
  radius,
  analysis,
  isAnalyzing,
  analyzePlaces 
}) => {
  // Filter places based on radius (convert radius to meters)
  const filteredPlaces = places?.filter(place => {
    // Convert radius from miles to meters (1 mile = 1609.34 meters)
    const radiusInMeters = radius * 1609.34;
    
    // Calculate distance using the Haversine formula
    const R = 6371e3; // Earth's radius in meters
    const φ1 = location.latitude * Math.PI/180;
    const φ2 = place.latitude * Math.PI/180;
    const Δφ = (place.latitude - location.latitude) * Math.PI/180;
    const Δλ = (place.longitude - location.longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in meters

    return distance <= radiusInMeters;
  }) || [];

  // Add validation check
  const hasRequiredData = filteredPlaces?.length > 0 && location?.latitude && location?.longitude;

  switch(viewMode) {
    case 'map':
      return (
        <div className="rounded-lg overflow-hidden border border-[var(--border-primary)]">
          <NearbyPlacesMap
            places={filteredPlaces}
            userLocation={location}
            onPhotoClick={handleViewDetails}
            highlightedPlace={selectedPlace}
            searchRadius={radius}
          />
        </div>
      );
    case 'guide':
      // Show loading or empty state if no data
      if (!hasRequiredData) {
        return (
          <div className="p-4 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[var(--accent-primary)]" />
              <p className="text-[var(--text-secondary)]">
                Search for workspaces to see personalized recommendations
              </p>
            </div>
          </div>
        );
      }
      return (
        <WorkspaceGuide 
          places={filteredPlaces}
          location={location}
          onViewDetails={handleViewDetails}
        />
      );
    default:
      return (
        <QuickMatchView
          places={filteredPlaces}
          onViewDetails={handleViewDetails}
          radius={radius}
          analyzedPlaces={analysis}
          isAnalyzing={isAnalyzing}
          onAnalyze={analyzePlaces}
        />
      );
  }
};

const InitialState = memo(({
  radius, 
  setRadius, 
  onSearch, 
  searchPhase,
  handleShowHowItWorks,
  handleShowAuthModal,
  handleCloseAuthModal
}) => (
  <LayoutWrapper>
    <WorkfromHeader 
      className="mb-4"
      searchPhase={searchPhase}
      onShowHowItWorks={handleShowHowItWorks}
      handleShowAuthModal={handleShowAuthModal}
      handleCloseAuthModal={handleCloseAuthModal}
    />
    <WelcomeBanner />
    <div className="mt-6">
      <SearchControls
        radius={radius}
        setRadius={setRadius}
        onSearch={onSearch}
        searchPhase={searchPhase}
      />
    </div>
  </LayoutWrapper>
));

const LoadingState = memo(({ 
  locationName, 
  searchPhase,
  handleShowHowItWorks,
  handleShowAuthModal,
  handleCloseAuthModal,
  onLocationChange 
}) => (
  <LayoutWrapper>
    <WorkfromHeader 
      locationName={locationName}
      onLocationClick={onLocationChange}
      searchPhase={searchPhase}
      onShowHowItWorks={handleShowHowItWorks}
      handleShowAuthModal={handleShowAuthModal}
      handleCloseAuthModal={handleCloseAuthModal}
      className="mb-4"
    />
    <UnifiedLoadingState
      viewMode="insights"
      searchPhase={searchPhase}
      locationName={locationName}
    />
  </LayoutWrapper>
));

const ErrorState = memo(({ 
  locationName, 
  searchPhase,
  error,
  onSearch,
  onRetryWithLargerRadius,
  handleShowHowItWorks,
  handleShowAuthModal,
  handleCloseAuthModal,
  onLocationChange,
  radius,
  setRadius
}) => (
  <LayoutWrapper>
    <WorkfromHeader 
      locationName={locationName}
      onLocationClick={onLocationChange}
      searchPhase={searchPhase}
      onShowHowItWorks={handleShowHowItWorks}
      handleShowAuthModal={handleShowAuthModal}
      handleCloseAuthModal={handleCloseAuthModal}
      className="mb-4"
    />
    <ErrorMessage 
      error={error}
      onRetry={onSearch}
      radius={radius}
      setRadius={setRadius}
      locationName={locationName}
      onRadiusChange={setRadius}
    />
  </LayoutWrapper>
));

const WorkspaceLayout = ({
  places,
  location,
  locationName,
  searchPhase,
  error,
  onSearch,
  onLocationChange,
  onPhotoClick,
  radius,
  setRadius,
  onRetryWithLargerRadius
}) => {
  const [viewMode, setViewMode] = useState('insights');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const { 
    isAnalyzing, 
    analysis, 
    analyzePlaces, 
    clearAnalysis 
  } = useWorkspaceAnalysis();

  useEffect(() => {
    if (location) {
      setViewMode('insights');
    }
  }, [location]);

  const handleViewDetails = useCallback((place) => {
    onPhotoClick(place);
  }, [onPhotoClick]);

  const handleShowHowItWorks = useCallback(() => {
    setShowHowItWorks(true);
  }, []);

  const renderContent = () => {
    switch (viewMode) {
      case 'map':
        return <NearbyPlacesMap
          places={places}
          userLocation={location}
          onPhotoClick={handleViewDetails}
          highlightedPlace={selectedPlace}
          searchRadius={radius}
        />;
      case 'guide':
        return <WorkspaceGuide 
          places={places}
          location={location}
          onViewDetails={handleViewDetails}
        />;
      case 'favorites':
        return <FavoritesList />;
      default:
        return (
          <QuickMatchView
            places={places}
            onViewDetails={handleViewDetails}
            radius={radius}
            analyzedPlaces={analysis}
            isAnalyzing={isAnalyzing}
            onAnalyze={analyzePlaces}
          />
        );
    }
  };

  if (searchPhase === SearchPhases.INITIAL) {
    return (
      <>
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
          <WorkfromHeader 
            className="mb-4" 
            searchPhase={searchPhase}
            onShowHowItWorks={() => setShowHowItWorks(true)}
          />
          <div className="h-16" />
          <div className="flex-1 container mx-auto px-4 max-w-2xl">
            <WelcomeBanner />
            <div className="mt-6">
              <SearchControls
                radius={radius}
                setRadius={setRadius}
                onSearch={onSearch}
                searchPhase={searchPhase}
              />
            </div>
          </div>
          <Footer />
        </div>
        {showHowItWorks && <HowItWorksModal setShowModal={setShowHowItWorks} />}
      </>
    );
  }

  if (searchPhase === SearchPhases.LOCATING || searchPhase === SearchPhases.LOADING) {
    return (
      <>
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
          <WorkfromHeader 
            locationName={locationName}
            onLocationClick={onLocationChange}
            searchPhase={searchPhase}
            onShowHowItWorks={() => setShowHowItWorks(true)}
            className="mb-4"
          />
          <div className="h-[104px]" />
          <div className="flex-1 container mx-auto px-4 max-w-2xl">
            <UnifiedLoadingState
              viewMode="insights"
              searchPhase={searchPhase}
              locationName={locationName}
            />
          </div>
          <Footer />
        </div>
        {showHowItWorks && <HowItWorksModal setShowModal={setShowHowItWorks} />}
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
          <WorkfromHeader 
            locationName={locationName}
            onLocationClick={onLocationChange}
            searchPhase={searchPhase}
            onShowHowItWorks={() => setShowHowItWorks(true)}
            className="mb-4"
          />
          <div className="h-[104px]" />
          <div className="flex-1 container mx-auto px-4 max-w-2xl">
            <ErrorState 
              locationName={locationName}
              searchPhase={searchPhase}
              error={error}
              onSearch={onSearch}
              onRetryWithLargerRadius={onRetryWithLargerRadius}
              handleShowHowItWorks={handleShowHowItWorks}
              handleShowAuthModal={() => setShowHowItWorks(true)}
              handleCloseAuthModal={() => setShowHowItWorks(false)}
              onLocationChange={onLocationChange}
              radius={radius}
              setRadius={setRadius}
            />
          </div>
          <Footer />
        </div>
        {showHowItWorks && <HowItWorksModal setShowModal={setShowHowItWorks} />}
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
        <div className="pt-[104px]">
          <div className="container mx-auto px-4">
            <WorkfromHeader 
              locationName={locationName}
              onLocationClick={onLocationChange}
              searchPhase={searchPhase}
              onShowHowItWorks={() => setShowHowItWorks(true)}
              className="mb-4"
            />

            <div className="max-w-2xl mx-auto mb-4 mt-4 flex justify-end">
              <ViewToggle 
                mode={viewMode}
                onChange={setViewMode}
              />
            </div>

            <ContentArea 
              viewMode={viewMode}
              places={places}
              location={location}
              handleViewDetails={handleViewDetails}
              selectedPlace={selectedPlace}
              radius={radius}
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              analyzePlaces={analyzePlaces}
            />
          </div>
        </div>
        <Footer />
      </div>
      {showHowItWorks && <HowItWorksModal setShowModal={setShowHowItWorks} />}
    </>
  );
};

export default memo(WorkspaceLayout);