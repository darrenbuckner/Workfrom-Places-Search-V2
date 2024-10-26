import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Plus,
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  AlertTriangle,
  InfoIcon,
  MapPin,
  Search,
  Loader,
  Check
} from 'lucide-react';

import { ThemeProvider, ThemeToggle } from './ThemeProvider';
import WorkfromHeader from './WorkfromHeader';
import HowItWorksModal from './HowItWorksModal';
import SearchResults from './SearchResults';
import WorkfromVirtualAd from './WorkfromVirtualAd';
import NearbyPlacesMap from './NearbyPlacesMap';
import PhotoModal from './PhotoModal';
import PlaceCard from './PlaceCard';
import SearchResultsControls from './SearchResultsControls';
import { calculateWorkabilityScore } from './WorkabilityScore';
import PostSearchFilters from './PostSearchFilters';
import SearchButton from './SearchButton';
import LocationConfirmDialog from './LocationConfirmDialog';
import Pagination from './Pagination';
import { useTheme } from './ThemeProvider';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.workfrom.co';
const ITEMS_PER_PAGE = 10;

// Search Progress Indicator Component
const SearchProgressIndicator = ({ phase, error, usingSavedLocation }) => {
  // Don't show anything in initial state
  if (phase === 'initial') return null;

  return (
    <div className="mt-4 max-w-lg mx-auto">
      <div className="flex flex-col gap-3">
        {/* Only show location acquisition for new location searches */}
        {!usingSavedLocation && phase === 'locating' && !error && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-500 bg-blue-500/10">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Loader className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-blue-500">
                Getting your location
              </div>
              <div className="text-sm text-text-secondary mt-0.5">
                Please allow location access if prompted
              </div>
            </div>
          </div>
        )}

        {/* Show searching message during search phase */}
        {phase === 'loading' && !error && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-500 bg-blue-500/10">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Loader className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-blue-500">
                Finding workspaces
              </div>
              <div className="text-sm text-text-secondary mt-0.5">
                Searching nearby places...
              </div>
            </div>
          </div>
        )}

        {/* Show errors if they occur */}
        {error && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-red-500 bg-red-500/10">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-red-500">
                Error
              </div>
              <div className="text-sm text-red-500 mt-0.5">
                {error}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Utility Components (keep existing implementations)
const WorkfromLogo = () => {/* ... existing implementation ... */};
const MessageBanner = ({ message, type = 'info' }) => {/* ... existing implementation ... */};
const Footer = () => {/* ... existing implementation ... */};
// Utility functions
const stripHtml = (html) => {
  if (!html) return '';
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

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

const WorkfromPlacesContent = () => {
  // State Management
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [radius, setRadius] = useState(2);
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState('');
  const [searchPhase, setSearchPhase] = useState('initial');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [fullImg, setFullImg] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('score_high');
  const [showLocationConfirm, setShowLocationConfirm] = useState(false);
  const { isDark } = useTheme();

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
    setShowLocationConfirm(false);
    localStorage.removeItem('savedLocationData');
  }, []);

  const performSearch = async (useExistingLocation = false) => {
    setSearchPhase('locating');
    setPlaces([]); 

    // Reset filters
    setPostSearchFilters({
      type: 'any',
      power: 'any',
      noise: 'any',
      openNow: false
    });

    try {
      let searchLocation;
      if (useExistingLocation) {
        searchLocation = location;
      } else {
        searchLocation = await getLocation();
        // Explicitly set the new location and save it
        setLocation(searchLocation);
        // Note: getLocation already handles saving to localStorage and setting locationName
      }
      
      setSearchPhase('loading');

      const response = await fetch(
        `${API_BASE_URL}/places/ll/${searchLocation.latitude},${searchLocation.longitude}?radius=${radius}&appid=${process.env.REACT_APP_API_KEY}&rpp=100`
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
  };

  // Updated handle search function
  const handleSearch = async ({ useSaved }) => {
    setError('');
    
    if (useSaved) {
      performSearch(true);
    } else {
      // Don't clear location until we have the new one
      await performSearch(false);
    }
  };

  // Search places
  const searchPlaces = useCallback(async () => {
    setError('');
    
    // If we have a saved location, show the confirmation dialog
    if (location) {
      setShowLocationConfirm(true);
      return;
    }
    
    // Hide existing results while searching
    setPlaces([]);
    
    // Continue with the original search logic for new locations
    performSearch();
  }, [location, getLocation, radius]);

  // Handle post-search filter changes
  const handlePostSearchFilter = (key, value) => {
    setPostSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  // Filter and process places
const processedPlaces = useMemo(() => {
  if (!places.length) return [];
  
  // First add workability scores to all places
  const placesWithScores = places.map(place => ({
    ...place,
    mappedNoise: mapNoiseLevel(place.noise_level || place.noise),
    workabilityScore: calculateWorkabilityScore(place).score
  }));
  
  // Then filter based on criteria
  const filtered = placesWithScores.filter(place => {
    if (postSearchFilters.type !== 'any' && place.type !== postSearchFilters.type) {
      return false;
    }
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
    return true;
  });

  // Sort if needed
  return sortBy === 'score_high' 
    ? filtered.sort((a, b) => b.workabilityScore - a.workabilityScore)
    : filtered;
  }, [places, sortBy, postSearchFilters]);

  const handleSort = useCallback((newSortValue) => {
    setSortBy(newSortValue);
  }, []);

  const resultsContainerRef = useRef(null);

  // Photo handling
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

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <div className="container mx-auto p-3 sm:p-4 max-w-2xl flex-grow">
        {/* Header */}
        <WorkfromHeader onShowHowItWorks={() => setShowHowItWorks(true)} />

        {/* Search Controls */}
        <div className={`bg-bg-secondary border border-border-primary rounded-lg p-4 shadow-sm mb-6 ${
          isDark ? 'bg-[#2a3142] border-white/10' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label 
                htmlFor="radius" 
                className={`block text-sm font-medium mb-1.5 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Distance
              </label>
              <div className="relative w-[120px]">
                <input
                  type="number"
                  id="radius"
                  min="0.5"
                  max="999"
                  step="0.1"
                  value={radius}
                  onChange={(e) => {
                    const value = Math.round(Number(e.target.value) * 10) / 10;
                    const validValue = Math.max(0.5, Math.min(999, value));
                    setRadius(validValue);
                  }}
                  className={`
                    w-full px-3 rounded-md border pr-8 h-10 
                    transition-colors duration-200
                    [appearance:textfield]
                    [&::-webkit-outer-spin-button]:appearance-none
                    [&::-webkit-inner-spin-button]:appearance-none
                    ${isDark 
                      ? 'bg-[#2a3142] border-white/10 text-white placeholder-gray-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }
                    ${isDark
                      ? 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 hover:border-blue-400'
                      : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 hover:border-gray-300'
                    }
                  `}
                  placeholder="2"
                />
                <span className={`
                  absolute right-3 top-1/2 -translate-y-1/2 
                  text-sm pointer-events-none
                  ${isDark ? 'text-gray-400' : 'text-gray-500'}
                `}>
                  mi
                </span>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <SearchButton
                onClick={handleSearch}
                disabled={searchPhase !== 'initial' && searchPhase !== 'complete'}
                searchPhase={searchPhase}
                hasLocation={!!location}
                savedLocation={location}
                locationName={locationName}
                onLocationModeChange={(mode) => {
                  if (mode === 'new') {
                    setError('');
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Search Progress - Only show during search phases when no results are displayed */}
        {(searchPhase === 'locating' || searchPhase === 'loading') && places.length === 0 && (
          <SearchProgressIndicator 
            phase={searchPhase} 
            error={error}
            usingSavedLocation={!!location} 
          />
        )}

        {/* Messages */}
        {error && places.length === 0 && (
          <MessageBanner message={error} type="error" />
        )}

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
              <SearchResults
                places={processedPlaces}
                sortBy={sortBy}
                filters={postSearchFilters}
                itemsPerPage={ITEMS_PER_PAGE}
                viewMode={viewMode}
                onPhotoClick={(place) => {
                  setSelectedPlace(place);
                  setShowPhotoModal(true);
                  fetchPlacePhotos(place.ID);
                }}
              />
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

        {showLocationConfirm && (
          <LocationConfirmDialog
            locationName={locationName}
            onUseExisting={() => {
              setShowLocationConfirm(false);
              setPlaces([]); // Hide existing results
              performSearch(true);
            }}
            onSearchNew={() => {
              clearLocation();
              setShowLocationConfirm(false);
              setPlaces([]); // Hide existing results
              performSearch(false);
            }}
            onCancel={() => {
              setShowLocationConfirm(false);
            }}
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