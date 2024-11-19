import React, { useState } from 'react';
import { useLocation } from '../hooks/useLocation';
import { usePlaces } from '../hooks/usePlaces';
import { usePhotoModal } from '../hooks/usePhotoModal';
import { SearchPhases } from '../constants';
import PhotoModal from '../PhotoModal';
import WorkspaceLayout from './WorkspaceLayout';

const WorkfromPlacesContent = () => {
  const [radius, setRadius] = useState(3);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

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

  const handleSearchError = (error) => {
    if (error.name === 'GeolocationPositionError') {
      switch (error.code) {
        case 1:
          setSearchError({
            code: 'LOCATION_DENIED',
            title: 'Location Access Required',
            message: 'Please enable location access to find workspaces near you.',
            variant: 'warning'
          });
          break;
        case 2:
          setSearchError({
            code: 'LOCATION_UNAVAILABLE',
            title: 'Location Unavailable',
            message: 'Unable to determine your location. Please try again.',
            variant: 'warning'
          });
          break;
        default:
          setSearchError({
            code: 'LOCATION_ERROR',
            title: 'Location Error',
            message: 'An error occurred while getting your location. Please try again.',
            variant: 'error'
          });
      }
    } else {
      setSearchError(error);
    }
  };

  const performSearch = async () => {
    setSearchPhase(SearchPhases.LOCATING);
    setSearchError(null);
    setLocationError(null);

    try {
      const searchLocation = await getLocation();
      setLocation(searchLocation);
      
      setSearchPhase(SearchPhases.LOADING);
      const fetchedPlaces = await fetchPlaces(searchLocation, radius);
      setPlaces(fetchedPlaces);
    } catch (err) {
      console.error('Search failed:', err);
      handleSearchError(err);
    } finally {
      setSearchPhase(SearchPhases.COMPLETE);
    }
  };

  const handleChangeLocation = () => {
    setPlaces([]);
    setSearchError(null);
    setLocationError(null);
    setSearchPhase(SearchPhases.INITIAL);
  };

  return (
    <>
      <WorkspaceLayout
        places={places}
        location={location}
        locationName={locationName}
        searchPhase={searchPhase}
        error={searchError || locationError}
        onSearch={performSearch}
        onLocationChange={handleChangeLocation}
        onPhotoClick={handlePhotoClick}
        radius={radius}
        setRadius={setRadius}
      />
      
      {showPhotoModal && (
        <PhotoModal
          selectedPlace={selectedPlace}
          fullImg={fullImg}
          isPhotoLoading={isPhotoLoading}
          setShowPhotoModal={closePhotoModal}
        />
      )}
    </>
  );
};

export default WorkfromPlacesContent;