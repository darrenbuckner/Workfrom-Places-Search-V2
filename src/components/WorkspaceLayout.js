import React, { useState, useEffect, useCallback, memo } from 'react';
import { MapIcon } from 'lucide-react';
import { SearchPhases } from '../constants';
import WorkfromHeader from '../WorkfromHeader';
import QuickMatchView from './QuickMatchView';
import { useWorkspaceAnalysis } from '../hooks/useWorkspaceAnalysis';
import NearbyPlacesMap from '../NearbyPlacesMap';
import SearchControls from '../SearchControls';
import UnifiedLoadingState from '../UnifiedLoadingState';
import ErrorMessage from '../ErrorMessage';
import WelcomeBanner from '../WelcomeBanner';
import HowItWorksModal from '../HowItWorksModal';
import Footer from './Footer';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';

// Layout wrapper component for consistent styling
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

// Map toggle button component
const MapToggleButton = memo(({ showMap, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-lg
      border transition-colors
      ${showMap 
        ? 'bg-[var(--accent-primary)] text-[var(--button-text)] border-[var(--accent-primary)]'
        : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-primary)]'
      }
    `}
  >
    <MapIcon size={16} />
    <span className="text-sm font-medium">
      {showMap ? 'Hide Map' : 'Show Map'}
    </span>
  </button>
));

// Content area component
const ContentArea = memo(({ 
  showMap, 
  places, 
  location, 
  handleViewDetails, 
  selectedPlace,
  radius,
  analysis,
  isAnalyzing,
  analyzePlaces 
}) => (
  <div className="max-w-2xl mx-auto">
    {showMap ? (
      <div className="rounded-lg overflow-hidden border border-[var(--border-primary)]">
        <NearbyPlacesMap
          places={places}
          userLocation={location}
          onPhotoClick={handleViewDetails}
          highlightedPlace={selectedPlace}
          searchRadius={radius}
        />
      </div>
    ) : (
      <QuickMatchView
        places={places}
        onViewDetails={handleViewDetails}
        radius={radius}
        analyzedPlaces={analysis}
        isAnalyzing={isAnalyzing}
        onAnalyze={analyzePlaces}
      />
    )}
  </div>
));

// Initial state component
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

// Loading state component
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

// Error state component
const ErrorState = memo(({ 
  locationName, 
  searchPhase,
  error,
  onSearch,
  onRetryWithLargerRadius,
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
    <ErrorMessage 
      error={error}
      onRetry={error?.canRetryWithLargerRadius ? onRetryWithLargerRadius : onSearch}
      retryLabel={error?.canRetryWithLargerRadius ? `Try larger radius` : 'Try Again'}
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
  const { user } = useAuth();
  const [showMap, setShowMap] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { 
    isAnalyzing, 
    analysis, 
    analyzePlaces, 
    clearAnalysis 
  } = useWorkspaceAnalysis();

  // Reset map view when location changes
  useEffect(() => {
    setShowMap(false);
  }, [location]);

  const handleViewDetails = useCallback((place) => {
    onPhotoClick(place);
  }, [onPhotoClick]);

  const handleShowHowItWorks = useCallback(() => {
    setShowHowItWorks(true);
  }, []);

  const handleShowAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const handleAuthModal = (show) => {
    setShowAuthModal(show);
  };

  const handleCloseAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  // If no user, show only the logged out state
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
        <div className="pt-16">
          <WorkfromHeader 
            className="mb-4" 
            searchPhase="initial"
            onShowHowItWorks={() => setShowHowItWorks(true)}
            handleShowAuthModal={() => handleAuthModal(true)}
            handleCloseAuthModal={() => handleAuthModal(false)}
          />
        </div>
        <Footer />
        {showHowItWorks && <HowItWorksModal setShowModal={setShowHowItWorks} />}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => handleAuthModal(false)}
          initialMode="signup"
        />
      </div>
    );
  }

  // Handle different states
  if (searchPhase === SearchPhases.INITIAL) {
    return (
      <>
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
          <WorkfromHeader 
            className="mb-4" 
            searchPhase={searchPhase}
            onShowHowItWorks={() => setShowHowItWorks(true)}
            showAuthModal={showAuthModal}
            handleShowAuthModal={handleShowAuthModal}
            handleCloseAuthModal={handleCloseAuthModal}
          />
          {/* Add spacing div to account for header height */}
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

  // Loading states
  if (searchPhase === SearchPhases.LOCATING || searchPhase === SearchPhases.LOADING) {
    return (
      <>
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
          <WorkfromHeader 
            locationName={locationName}
            onLocationClick={onLocationChange}
            searchPhase={searchPhase}
            onShowHowItWorks={() => setShowHowItWorks(true)}
            showAuthModal={showAuthModal}
            handleShowAuthModal={handleShowAuthModal}
            handleCloseAuthModal={handleCloseAuthModal}
            className="mb-4"
          />
          {/* Add spacing div to account for header height */}
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
        <ErrorState 
          locationName={locationName}
          searchPhase={searchPhase}
          error={error}
          onSearch={onSearch}
          onRetryWithLargerRadius={onRetryWithLargerRadius}
          handleShowHowItWorks={handleShowHowItWorks}
          handleShowAuthModal={handleShowAuthModal}
          handleCloseAuthModal={handleCloseAuthModal}
          onLocationChange={onLocationChange}
        />
        {showHowItWorks && <HowItWorksModal setShowModal={setShowHowItWorks} />}
      </>
    );
  }

  // Main content state
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
              isAuthModalOpen={showAuthModal}  // renamed prop
              onShowAuthModal={handleShowAuthModal}
              onCloseAuthModal={handleCloseAuthModal}
              className="mb-4"
            />

            <div className="max-w-2xl mx-auto mb-4 flex justify-end">
              <MapToggleButton 
                showMap={showMap} 
                onClick={() => setShowMap(!showMap)} 
              />
            </div>

            <ContentArea 
              showMap={showMap}
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