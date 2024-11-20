import React, { useState, useEffect } from 'react';
import { MapPin, Map as MapIcon } from 'lucide-react';
import { SearchPhases } from '../constants';
import WorkfromHeader from '../WorkfromHeader';
import QuickMatchView from './QuickMatchView';
import NearbyPlacesMap from '../NearbyPlacesMap';
import SearchControls from '../SearchControls';
import UnifiedLoadingState from '../UnifiedLoadingState';
import ErrorMessage from '../ErrorMessage';
import WelcomeBanner from '../WelcomeBanner';
import Footer from './Footer';

const LocationBar = ({ locationName, onChangeLocation, showMap, onToggleMap }) => (
  <div className="flex gap-2">
    <button
      onClick={onChangeLocation}
      className="flex-1 flex items-center gap-2 p-4 rounded-lg
        bg-[var(--bg-secondary)] border border-[var(--border-primary)]
        hover:border-[var(--accent-primary)] transition-colors group"
    >
      <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 
        flex items-center justify-center">
        <MapPin className="w-5 h-5 text-[var(--accent-primary)]" />
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-medium text-[var(--text-primary)]">
          {locationName || 'Current Location'}
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Click to change location
        </p>
      </div>
    </button>
    
    <button
      onClick={onToggleMap}
      className={`
        flex items-center gap-2 px-4 rounded-lg border transition-colors
        ${showMap 
          ? 'bg-[var(--accent-primary)] text-[var(--button-text)] border-[var(--accent-primary)]'
          : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-primary)]'
        }
      `}
    >
      <MapIcon size={16} />
      <span className="text-sm font-medium whitespace-nowrap">
        {showMap ? 'Hide Map' : 'Show Map'}
      </span>
    </button>
  </div>
);

// Update the layout section to use the new LocationBar props
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
  
  // Reset map view when location changes
  useEffect(() => {
    setShowMap(false);
  }, [location]);

  const handleViewDetails = (place) => {
    onPhotoClick(place);
  };

  if (searchPhase === SearchPhases.INITIAL) {
	  return (
	    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
	      <div className="container mx-auto px-4 max-w-2xl">
	        <WorkfromHeader className="mt-6 mb-4" />
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
	  );
	}

  if (searchPhase === SearchPhases.LOCATING || searchPhase === SearchPhases.LOADING) {
	  return (
	    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
	      <div className="container mx-auto px-4 max-w-2xl">
	        <WorkfromHeader className="mt-6 mb-4" />
	        <UnifiedLoadingState
	          viewMode="insights"
	          searchPhase={searchPhase}
	          locationName={locationName}
	        />
	      </div>
	      <Footer />
	    </div>
	  );
	}

  if (error) {
	  return (
	    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
	      <div className="container mx-auto px-4 max-w-2xl">
	        <WorkfromHeader className="mt-6 mb-4" />
	        <ErrorMessage
	          error={error}
	          onRetry={onSearch}
	          className="mt-6"
	        />
	      </div>
	      <Footer />
	    </div>
	  );
	}

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <div className="container mx-auto px-4">
        <WorkfromHeader className="mt-6 mb-4" />
        
        <div className="max-w-2xl mx-auto mb-6">
          <LocationBar
            locationName={locationName}
            onChangeLocation={onLocationChange}
            showMap={showMap}
            onToggleMap={() => setShowMap(!showMap)}
          />
        </div>

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
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WorkspaceLayout;