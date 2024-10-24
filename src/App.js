import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Plus,
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  AlertTriangle,
  InfoIcon,
} from 'lucide-react';

import { ThemeProvider, ThemeToggle } from './ThemeProvider';
import HowItWorksModal from './HowItWorksModal';
import WorkfromVirtualAd from './WorkfromVirtualAd';
import NearbyPlacesMap from './NearbyPlacesMap';
import PhotoModal from './PhotoModal';
import PlaceCard from './PlaceCard';
import SearchResultsControls from './SearchResultsControls';
import { calculateWorkabilityScore } from './WorkabilityScore';
import PostSearchFilters from './PostSearchFilters';
import SearchButton from './SearchButton';

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
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 100" 
    className="w-8 h-8 sm:w-10 sm:h-10"
  >
    <circle cx="50" cy="50" r="48" fill="#1a1f2c" />
    <circle cx="50" cy="50" r="46" fill="none" stroke="#2a3142" strokeWidth="4" />
    <defs>
      <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
    <path 
      d="M50 75 L75 40 A35 35 0 0 0 25 40 Z" 
      fill="url(#mountainGradient)"
      opacity="0.9"
    />
    <defs>
      <linearGradient id="innerMountainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    <path 
      d="M50 75 L67 50 A24 24 0 0 0 33 50 Z" 
      fill="url(#innerMountainGradient)"
      opacity="0.95"
    />
    <circle cx="50" cy="75" r="6" fill="#3b82f6" />
    <circle cx="50" cy="75" r="7" fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0.5" />
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

const WorkfromPlacesContent = () => {
  // Basic state
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [radius, setRadius] = useState(2);
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState('');
  const [searchPhase, setSearchPhase] = useState('initial');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [fullImg, setFullImg] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('score_high');

  // Post-search filters state
  const [postSearchFilters, setPostSearchFilters] = useState({
    type: 'any',
    power: 'any',
    noise: 'any',
    openNow: false
  });

  // Load saved location on mount
  useEffect(() => {
    const savedLocationData = localStorage.getItem('savedLocationData');
    if (savedLocationData) {
      const { location, locationName: savedName } = JSON.parse(savedLocationData);
      setLocation(location);
      setLocationName(savedName);
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
        async (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
            );
            const data = await response.json();
            const friendly = data.address?.city || data.address?.town || data.address?.suburb || 'your area';
            
            const locationData = {
              location: newLocation,
              locationName: friendly
            };
            localStorage.setItem('savedLocationData', JSON.stringify(locationData));
            
            setLocationName(friendly);
            resolve(newLocation);
          } catch (err) {
            console.error('Error getting location name:', err);
            const friendly = 'your area';
            
            const locationData = {
              location: newLocation,
              locationName: friendly
            };
            localStorage.setItem('savedLocationData', JSON.stringify(locationData));
            
            setLocationName(friendly);
            resolve(newLocation);
          }
        },
        () => reject(new Error('Unable to retrieve your location'))
      );
    });
  }, []);

  // Clear location and reset state
  const clearLocation = useCallback(() => {
    setLocation(null);
    setLocationName('');
    setPlaces([]);
    setError('');
    localStorage.removeItem('savedLocationData');
  }, []);

  // Filter places based on post-search filters
  const getFilteredPlaces = useCallback((places) => {
    return places.filter(place => {
      // Filter by type
      if (postSearchFilters.type !== 'any' && place.type !== postSearchFilters.type) {
        return false;
      }

      // Filter by power
      if (postSearchFilters.power !== 'any') {
        const powerValue = String(place.power || '').toLowerCase();
        if (!powerValue.includes(postSearchFilters.power)) {
          return false;
        }
      }

      // Filter by noise level
      if (postSearchFilters.noise !== 'any') {
        const noise = String(place.noise_level || place.noise || '').toLowerCase();
        if (postSearchFilters.noise === 'quiet' && !noise.includes('quiet') && !noise.includes('low')) {
          return false;
        }
        if (postSearchFilters.noise === 'moderate' && !noise.includes('moderate') && !noise.includes('average')) {
          return false;
        }
        if (postSearchFilters.noise === 'noisy' && !noise.includes('noisy') && !noise.includes('high')) {
          return false;
        }
      }

      // Filter by open now
      if (postSearchFilters.openNow && !place.hr_formatted) {
        return false;
      }

      return true;
    });
  }, [postSearchFilters]);

  // Handle post-search filter changes
  const handlePostSearchFilter = (key, value) => {
    setPostSearchFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Process and sort places
  const processedPlaces = useMemo(() => {
    if (!places.length) return [];
    
    const filtered = getFilteredPlaces(places);
    const processed = filtered.map(place => ({
      ...place,
      mappedNoise: mapNoiseLevel(place.noise_level || place.noise),
      workabilityScore: calculateWorkabilityScore(place).score
    }));

    return sortBy === 'score_high' 
      ? processed.sort((a, b) => b.workabilityScore - a.workabilityScore)
      : processed;
  }, [places, sortBy, getFilteredPlaces]);

  // Paginated places
  const paginatedPlaces = useMemo(() => 
    processedPlaces.slice(
      (currentPage - 1) * ITEMS_PER_PAGE, 
      currentPage * ITEMS_PER_PAGE
    ),
    [processedPlaces, currentPage]
  );

  // Update total pages when filtered results change
  useEffect(() => {
    setTotalPages(Math.ceil(processedPlaces.length / ITEMS_PER_PAGE));
  }, [processedPlaces.length]);

  // Search places
  const searchPlaces = useCallback(async () => {
    setSearchPhase('locating');
    setError('');
    setCurrentPage(1);
    
    // Reset filters on new search
    setPostSearchFilters({
      type: 'any',
      power: 'any',
      noise: 'any',
      openNow: false
    });

    try {
      const currentLocation = location || await getLocation();
      setLocation(currentLocation);
      setSearchPhase('loading');

      const response = await fetch(
        `${API_BASE_URL}/places/ll/${currentLocation.latitude},${currentLocation.longitude}?radius=${radius}&appid=${process.env.REACT_APP_API_KEY}&rpp=100`
      );
      
      const data = await response.json();

      if (data.meta.code === 200 && Array.isArray(data.response)) {
        setPlaces(data.response);

        if (data.response.length === 0) {
          setError('No places found in your area. Try increasing the search radius.');
        }
      } else {
        throw new Error('Unexpected response from the server');
      }
    } catch (err) {
      setError(`An error occurred: ${err.message}`);
      setPlaces([]);
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

  const resultsContainerRef = useRef(null);

  // Scroll to top when page changes
  useEffect(() => {
    if (resultsContainerRef.current) {
      resultsContainerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [currentPage]);

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
              <span className="hidden sm:inline ml-1 items-center text-xs sm:text-sm whitespace-nowrap text-text-primary">
                How It Works
              </span>
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
                Using your last location in {locationName}.{' '}
                <button
                  onClick={clearLocation}
                  className="text-accent-primary hover:text-accent-secondary transition-colors underline"
                >
                  Start over
                </button> to search a new area.
              </p>
            </div>
          ) : (
            <p className="mb-3 text-text-primary">
              <strong>Click search</strong> to discover work-friendly places nearby.
            </p>
          )}

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label htmlFor="radius" className="block text-sm font-medium text-text-primary mb-1.5">
                Search Radius
              </label>
              <div className="relative w-[120px]">
                <input
                  type="number"
                  id="radius"
                  min="0.5"
                  max="999"
                  step="0.1"
                  value={radius}
                  onChange={(e) => setRadius(Math.max(0.5, Math.min(999, Number(e.target.value))))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      searchPlaces(); // Changed from onSearch?.(). to searchPlaces()
                    }
                  }}
                  className="w-full h-10 px-3 rounded-md border transition-colors
                    bg-[#2a3142] dark:bg-[#2a3142] 
                    text-gray-900 dark:text-white
                    border-border-primary
                    placeholder-text-tertiary 
                    focus:border-accent-primary 
                    focus:ring-1 focus:ring-accent-primary/50 
                    pr-8
                    [appearance:textfield] 
                    [&::-webkit-outer-spin-button]:appearance-none 
                    [&::-webkit-inner-spin-button]:appearance-none 
                    hover:border-accent-secondary"
                  placeholder="2"
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm pointer-events-none">
                  mi
                </span>
              </div>
            </div>
            <SearchButton
              onClick={searchPlaces}
              disabled={searchPhase !== 'initial' && searchPhase !== 'complete'}
              searchPhase={searchPhase}
            />
          </div>
        </div>

        {/* Messages */}
        {error && <MessageBanner message={error} type="error" />}

        {/* Results */}
        {places.length > 0 && (
          <div className="mb-12" ref={resultsContainerRef}>
            {/* Post-Search Filters */}
            <PostSearchFilters
              onFilterChange={handlePostSearchFilter}
              currentFilters={postSearchFilters}
              className="mb-6"
            />

            <SearchResultsControls 
              totalPlaces={processedPlaces.length}
              radius={radius}
              sortBy={sortBy}
              onSortChange={handleSort}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
            
            {processedPlaces.length === 0 ? (
              <MessageBanner 
                message="No places match your current filters. Try adjusting your criteria." 
                type="info" 
              />
            ) : viewMode === 'list' ? (
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