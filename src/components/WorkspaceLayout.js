import React, { useState, useEffect, useCallback, memo } from 'react';
import { MapPin, Zap, Sparkles } from 'lucide-react';
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
  <div className="flex items-center gap-2">
    <button
      onClick={() => onChange('map')}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md
        transition-colors
        ${mode === 'map'
          ? 'bg-[var(--accent-primary)] text-[var(--button-text)]'
          : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:text-[var(--text-primary)]'
        }
      `}
    >
      <MapPin size={16} />
      <span className="hidden sm:inline">Map</span>
    </button>

    <button
      onClick={() => onChange('insights')}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md
        transition-colors
        ${mode === 'insights'
          ? 'bg-[var(--accent-primary)] text-[var(--button-text)]'
          : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:text-[var(--text-primary)]'
        }
      `}
    >
      <Zap size={16} />
      <span className="hidden sm:inline">Quick Match</span>
    </button>

    <button
      onClick={() => onChange('guide')}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md
        transition-colors
        ${mode === 'guide'
          ? 'bg-[var(--accent-primary)] text-[var(--button-text)]'
          : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:text-[var(--text-primary)]'
        }
      `}
    >
      <Sparkles size={16} />
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
  // Add validation check
  const hasRequiredData = places?.length > 0 && location?.latitude && location?.longitude;

  switch(viewMode) {
    case 'map':
      return (
        <div className="rounded-lg overflow-hidden border border-[var(--border-primary)]">
          <NearbyPlacesMap
            places={places}
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
          places={places}
          location={location}
          onViewDetails={handleViewDetails}
        />
      );
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
  const [viewMode, setViewMode] = useState('map');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const { 
    isAnalyzing, 
    analysis, 
    analyzePlaces, 
    clearAnalysis 
  } = useWorkspaceAnalysis();

  // Reset view mode when location changes
  // useEffect(() => {
  //   setViewMode('insights');
  // }, [location]);

  const handleViewDetails = useCallback((place) => {
    onPhotoClick(place);
  }, [onPhotoClick]);

  const handleShowHowItWorks = useCallback(() => {
    setShowHowItWorks(true);
  }, []);

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
        />
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

            <div className="max-w-2xl mx-auto mb-4 flex justify-end">
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