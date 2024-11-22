import React, { useState, useEffect } from 'react';
import { MapPin, Map as MapIcon } from 'lucide-react';
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
  setRadius
}) => {
  const [showMap, setShowMap] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  // Get and destructure all needed values from the hook
  const { 
    isAnalyzing, 
    analysis, 
    analyzePlaces, 
    clearAnalysis 
  } = useWorkspaceAnalysis();

  // Add effect to trigger analysis when places change
  useEffect(() => {
    if (places?.length > 0) {
      analyzePlaces(places);
    } else {
      clearAnalysis();
    }
  }, [places, analyzePlaces, clearAnalysis]);

  // Debug log
  useEffect(() => {
    console.log('Analysis state:', {
      isAnalyzing,
      hasAnalysis: !!analysis,
      placeCount: places?.length,
      analysisData: analysis
    });
  }, [isAnalyzing, analysis, places]);

  useEffect(() => {
    setShowMap(false);
  }, [location]);

  const handleViewDetails = (place) => {
    onPhotoClick(place);
  };

  // Initial search state
  if (searchPhase === SearchPhases.INITIAL) {
    return (
      <>
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
          <div className="pt-16">
            <div className="container mx-auto px-4 max-w-2xl">
              <WorkfromHeader 
                className="mb-4" 
                searchPhase={searchPhase}
                onShowHowItWorks={() => setShowHowItWorks(true)}
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
          <div className="pt-[104px]">
            <div className="container mx-auto px-4 max-w-2xl">
              <WorkfromHeader 
                locationName={locationName}
                onLocationClick={onLocationChange}
                searchPhase={searchPhase}
                onShowHowItWorks={() => setShowHowItWorks(true)}
                className="mb-4"
              />
              <UnifiedLoadingState
                viewMode="insights"
                searchPhase={searchPhase}
                locationName={locationName}
              />
            </div>
          </div>
          <Footer />
        </div>
        {showHowItWorks && <HowItWorksModal setShowModal={setShowHowItWorks} />}
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
          <div className="pt-[104px]">
            <div className="container mx-auto px-4 max-w-2xl">
              <WorkfromHeader 
                locationName={locationName}
                onLocationClick={onLocationChange}
                searchPhase={searchPhase}
                onShowHowItWorks={() => setShowHowItWorks(true)}
                className="mb-4"
              />
              <ErrorMessage
                error={error}
                onRetry={onSearch}
                className="mt-6"
              />
            </div>
          </div>
          <Footer />
        </div>
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
              className="mb-4"
            />

            {/* Map Toggle */}
            <div className="max-w-2xl mx-auto mb-4 flex justify-end">
              <button
                onClick={() => setShowMap(!showMap)}
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
            </div>

            {/* Content Area */}
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
          </div>
        </div>
        <Footer />
      </div>
      {showHowItWorks && <HowItWorksModal setShowModal={setShowHowItWorks} />}
    </>
  );
};

export default WorkspaceLayout;