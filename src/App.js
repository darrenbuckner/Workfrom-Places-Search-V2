import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Plus,
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  AlertTriangle,
  ArrowDownCircle,
  InfoIcon,
  Moon,
  Sun
} from 'lucide-react';

import { ThemeProvider, ThemeToggle } from './ThemeProvider';
import HowItWorksModal from './HowItWorksModal';
import WorkfromVirtualAd from './WorkfromVirtualAd';
import NearbyPlacesMap from './NearbyPlacesMap';
import PhotoModal from './PhotoModal';
import PlaceCard from './PlaceCard';
import WorkabilityControls from './WorkabilityControls';
import SearchResultsControls from './SearchResultsControls';
import { calculateWorkabilityScore } from './WorkabilityScore';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.workfrom.co';
const ITEMS_PER_PAGE = 10;

// Utility functions
const mapNoiseLevel = (noise) => {
  if (!noise) return 'Unknown';
  if (typeof noise === 'string') {
    const lowerNoise = noise.toLowerCase();
    if (lowerNoise.includes('quiet') || lowerNoise.includes('low')) return 'Below average';
    if (lowerNoise.includes('moderate') || lowerNoise.includes('average')) return 'Average';
    if (lowerNoise.includes('noisy') || lowerNoise.includes('high')) return 'Above average';
    return noise;
  }
  return 'Unknown';
};

const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// Components
const WorkfromLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-8 h-8 sm:w-10 sm:h-10">
    <circle cx="50" cy="50" r="48" fill="#160040" />
    <path d="M50 75 L75 40 A35 35 0 0 0 25 40 Z" fill="#F5A623" />
    <path d="M50 75 L67 50 A24 24 0 0 0 33 50 Z" fill="#FFFFFF" />
    <circle cx="50" cy="75" r="6" fill="#F5A623" />
  </svg>
);

const MessageBanner = ({ message, type = 'info' }) => {
  const styles = {
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700'
  };
  
  const icons = {
    info: <AlertCircle size={24} className="mr-2" />,
    error: <AlertTriangle size={24} className="mr-2" />,
    warning: <AlertCircle size={24} className="mr-2" />
  };

  return (
    <div className={`${styles[type] || styles.info} border-l-4 p-4 mb-4 rounded flex items-center`}>
      {icons[type]}
      <p>{message}</p>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex justify-center mt-4 space-x-2">
    <button
      onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
      disabled={currentPage === 1}
      className="px-3 py-1 rounded transition-colors
        enabled:bg-bg-secondary enabled:text-text-primary enabled:hover:bg-bg-tertiary
        disabled:bg-bg-secondary/50 disabled:text-text-tertiary"
    >
      Previous
    </button>
    <span className="px-3 py-1 text-text-primary">
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="px-3 py-1 rounded transition-colors
        enabled:bg-bg-secondary enabled:text-text-primary enabled:hover:bg-bg-tertiary
        disabled:bg-bg-secondary/50 disabled:text-text-tertiary"
    >
      Next
    </button>
  </div>
);

const Footer = () => (
  <footer className="mt-12 py-6 bg-bg-secondary border-t border-border-primary">
    <div className="container mx-auto px-4 text-center">
      <p className="text-text-secondary">&copy; Workfrom Places</p>
    </div>
  </footer>
);

const WorkfromPlacesContent = () => {  // State management with custom hooks
  const [location, setLocation] = useState(null);
  const [radius, setRadius] = useState(2);
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState('');
  const [searchPhase, setSearchPhase] = useState('initial');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [fullImg, setFullImg] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [totalPlaces, setTotalPlaces] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [sortBy, setSortBy] = useState('score_high');
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('savedLocation');
    if (savedLocation) {
      setLocation(JSON.parse(savedLocation));
    }
  }, []);

  // Geolocation handler
  const getLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          localStorage.setItem('savedLocation', JSON.stringify(newLocation));
          resolve(newLocation);
        },
        () => reject(new Error('Unable to retrieve your location'))
      );
    });
  }, []);

  // Clear location and reset state
  const clearLocation = useCallback(() => {
    setLocation(null);
    setPlaces([]);
    setError('');
    localStorage.removeItem('savedLocation');
  }, []);

  // Process and sort places
  const processedPlaces = useMemo(() => {
    if (!places.length) return [];
    
    const processed = places.map(place => ({
      ...place,
      mappedNoise: mapNoiseLevel(place.noise_level || place.noise),
      workabilityScore: calculateWorkabilityScore(place).score
    }));

    return sortBy !== 'none' 
      ? processed.sort((a, b) => 
          sortBy === 'score_high' 
            ? b.workabilityScore - a.workabilityScore 
            : a.workabilityScore - b.workabilityScore
        )
      : processed;
  }, [places, sortBy]);

  // Paginated places
  const paginatedPlaces = useMemo(() => 
    processedPlaces.slice(
      (currentPage - 1) * ITEMS_PER_PAGE, 
      currentPage * ITEMS_PER_PAGE
    ),
    [processedPlaces, currentPage]
  );

  // Add ref for the container
  const resultsContainerRef = useRef(null);

  // Add effect to scroll to top when page changes
  useEffect(() => {
    if (resultsContainerRef.current) {
      resultsContainerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [currentPage]);

  // Search places
  const searchPlaces = useCallback(async () => {
    setSearchPhase('locating');
    setError('');
    setCurrentPage(1);

    try {
      const currentLocation = location || await getLocation();
      setLocation(currentLocation);
      setSearchPhase('loading');

      const response = await fetch(
        `${API_BASE_URL}/places/ll/${currentLocation.latitude},${currentLocation.longitude}?radius=${radius}&appid=${process.env.REACT_APP_API_KEY}&rpp=200`
      );
      const data = await response.json();

      if (data.meta.code === 200 && Array.isArray(data.response)) {
        setPlaces(data.response);
        setTotalPlaces(data.response.length);
        setTotalPages(Math.ceil(data.response.length / ITEMS_PER_PAGE));

        if (data.response.length === 0) {
          setError('No places found matching your criteria. Try adjusting your filters or increasing the radius.');
        }
      } else {
        throw new Error('Unexpected response from the server');
      }
    } catch (err) {
      setError(`An error occurred: ${err.message}`);
      setPlaces([]);
      setTotalPlaces(0);
    } finally {
      setSearchPhase('complete');
    }
  }, [location, radius, getLocation]);

  // Fetch place photos
  const fetchPlacePhotos = useCallback(async (placeId) => {
    setIsPhotoLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/places/${placeId}?appid=${process.env.REACT_APP_API_KEY}`
      );
      const data = await response.json();

      if (data.meta.code === 200 && data.response?.[0]) {
        const { full_img, description, os } = data.response[0];
        setFullImg(full_img || '');
        setSelectedPlace(prev => ({
          ...prev,
          description: description ? stripHtml(description) : '',
          os: os || ''
        }));
      }
    } catch (err) {
      console.error('Error fetching place photos:', err);
    } finally {
      setIsPhotoLoading(false);
    }
  }, []);

  const handleSort = useCallback((newSortValue) => {
    setSortBy(newSortValue);
    setCurrentPage(1);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <div className="container mx-auto p-3 sm:p-4 max-w-2xl flex-grow">
        {/* Header with Theme Toggle */}
        <header className="flex justify-between items-center mb-4 gap-2">
          <div className="flex items-center min-w-0">
            <WorkfromLogo />
            <h1 className="text-lg sm:text-2xl font-bold ml-2 truncate text-text-primary">
              Workfrom Places Search
            </h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <ThemeToggle />
            <button
              onClick={() => setShowHowItWorks(true)}
              className="p-1.5 sm:p-2 rounded hover:bg-bg-secondary transition-colors flex items-center text-text-tertiary hover:text-text-primary"
              title="How It Works"
            >
              <InfoIcon size={16} />
              <span className="hidden sm:inline ml-1 items-center text-xs sm:text-sm whitespace-nowrap text-text-primary">How It Works</span>
            </button>
            <a
              href="https://workfrom.co/add"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:p-2 rounded hover:bg-bg-secondary transition-colors flex items-center text-xs sm:text-sm whitespace-nowrap text-text-primary"
            >
              <Plus size={16} />
              <span className="hidden sm:inline ml-1">Add Place</span>
              <span className="sm:hidden ml-1">Add</span>
            </a>
          </div>
        </header>

        {/* Search Controls */}
        <div className="bg-bg-secondary border border-border-primary rounded-lg p-4 shadow-sm mb-6">
          {location ? (
            <div className="mb-3">
              <p className="text-text-primary">
                Your location has been saved.{' '}
                <button
                  onClick={clearLocation}
                  className="text-accent-primary hover:text-accent-secondary transition-colors underline"
                >
                  Undo
                </button>
              </p>
            </div>
          ) : (
            <p className="mb-3 text-text-primary">Click search to use your current location</p>
          )}

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <WorkabilityControls 
                radius={radius}
                setRadius={setRadius}
                showSortControl={false}
                onSearch={searchPlaces}
              />
            </div>
            <button
              onClick={searchPlaces}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-accent-secondary transition-colors h-[38px]"
              disabled={searchPhase !== 'initial' && searchPhase !== 'complete'}
            >
              {searchPhase === 'locating' ? 'Getting your location...' :
               searchPhase === 'loading' ? 'Searching nearby...' :
               'Search'}
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && <MessageBanner message={error} type="error" />}

        {/* Results */}
        {places.length > 0 && (
          <div className="mb-12" ref={resultsContainerRef}>
            <SearchResultsControls 
              totalPlaces={totalPlaces}
              radius={radius}
              sortBy={sortBy}
              onSortChange={handleSort}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
            
            {viewMode === 'list' ? (
              <div className="space-y-6">
                {paginatedPlaces.map((place, index) => (
                  <React.Fragment key={place.ID}>
                    {index > 0 && index % 5 === 0 && <WorkfromVirtualAd />}
                    <PlaceCard
                      place={place}
                      onPhotoClick={() => {
                        setSelectedPlace(place);
                        setShowPhotoModal(true);
                        fetchPlacePhotos(place.ID);
                      }}
                    />
                  </React.Fragment>
                ))}
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            ) : (
              <NearbyPlacesMap 
                places={processedPlaces}
                userLocation={location}
                onPhotoClick={(place) => {
                  setSelectedPlace(place);
                  setShowPhotoModal(true);
                  fetchPlacePhotos(place.ID);
                }}
              />
            )}
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
            setShowPhotoModal={setShowPhotoModal}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <ThemeProvider>
      <WorkfromPlacesContent />
    </ThemeProvider>
  );
};

export default App;