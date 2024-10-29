import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ThemeProvider } from './ThemeProvider';
import API_CONFIG from './config';
import WorkfromHeader from './WorkfromHeader';
import HowItWorksModal from './HowItWorksModal';
import SearchResults from './SearchResults';
import GenAIInsights from './GenAIInsights';
import StickyControls from './StickyControls';
import NearbyPlacesMap from './NearbyPlacesMap';
import PhotoModal from './PhotoModal';
import SearchResultsControls from './SearchResultsControls';
import { calculateWorkabilityScore } from './WorkabilityScore';
import PostSearchFilters from './PostSearchFilters';
import SearchButton from './SearchButton';
import LocationConfirmDialog from './LocationConfirmDialog';
import { useTheme } from './ThemeProvider';
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

import { 
  SearchProgressIndicator, 
  Message, 
  LoadingSpinner 
} from './components/ui/loading';

// Where API calls are made
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.workfrom.co';
const API_BASE_URL = API_CONFIG.baseUrl;
const ITEMS_PER_PAGE = 10;

// Helper Functions
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

// Main Content Component
const WorkfromPlacesContent = () => {
  // State Management
  const resultsContainerRef = useRef(null);
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
  const [recommendedPlace, setRecommendedPlace] = useState(null);
  const { isDark } = useTheme(false);

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

  // Reset recommended place when search starts
  useEffect(() => {
    if (searchPhase === 'initial') {
      setRecommendedPlace(null);
    }
  }, [searchPhase]);

  // Location Management
  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser');
    }

    return new Promise((resolve, reject) => {
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
            
            const locationData = { location: newLocation, locationName: friendly };
            localStorage.setItem('savedLocationData', JSON.stringify(locationData));
            
            setLocationName(friendly);
            resolve(newLocation);
          } catch (err) {
            const friendly = 'your area';
            const locationData = { location: newLocation, locationName: friendly };
            localStorage.setItem('savedLocationData', JSON.stringify(locationData));
            setLocationName(friendly);
            resolve(newLocation);
          }
        },
        () => reject(new Error('Unable to retrieve your location'))
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setLocationName('');
    setPlaces([]);
    setError('');
    setShowLocationConfirm(false);
    localStorage.removeItem('savedLocationData');
  }, []);

  // Search Functionality
  const performSearch = async (useExistingLocation = false) => {
    setSearchPhase('locating');
    setPlaces([]);
    setRecommendedPlace(null);
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
        setLocation(searchLocation);
      }
      
      setSearchPhase('loading');

      const searchUrl = `${API_CONFIG.baseUrl}/places/ll/${searchLocation.latitude},${searchLocation.longitude}`;
      console.log('Fetching places from:', searchUrl);

      const response = await fetch(
        `${searchUrl}?radius=${radius}&appid=${API_CONFIG.appId}&rpp=100`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
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
      console.error('Search error:', err);
      setError(`An error occurred: ${err.message}`);
      setPlaces([]);
    } finally {
      setSearchPhase('complete');
    }
  };

  const handleSearch = async ({ useSaved }) => {
    setError('');
    await performSearch(useSaved);
  };

  // Filter and Process Places
  const processedPlaces = useMemo(() => {
    if (!places.length) return [];
    
    const placesWithScores = places.map(place => ({
      ...place,
      mappedNoise: mapNoiseLevel(place.noise_level || place.noise),
      workabilityScore: calculateWorkabilityScore(place).score
    }));
    
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

    return sortBy === 'score_high' 
      ? filtered.sort((a, b) => b.workabilityScore - a.workabilityScore)
      : filtered;
  }, [places, sortBy, postSearchFilters]);

  // Photo Management
  const fetchPlacePhotos = useCallback(async (placeId) => {
    setIsPhotoLoading(true);
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/places/${placeId}?appid=${API_CONFIG.appId}`
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

  // Event Handlers
  const handlePostSearchFilter = (key, value) => {
    setPostSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = useCallback((newSortValue) => {
    setSortBy(newSortValue);
  }, []);

  const handlePhotoClick = useCallback((place) => {
    setSelectedPlace(place);
    setShowPhotoModal(true);
    fetchPlacePhotos(place.ID);
  }, [fetchPlacePhotos]);

  // Render
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <div className="container mx-auto p-3 sm:p-4 max-w-2xl flex-grow">
        <WorkfromHeader
          onShowHowItWorks={() => setShowHowItWorks(true)}
          className="mb-4"
        />

        {/* Search Controls */}
        <div className={`
          border border-[var(--border-primary)] rounded-lg p-4 shadow-sm mb-6
          bg-[var(--bg-secondary)]
        `}>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label 
                htmlFor="radius" 
                className="block text-sm font-medium mb-1.5 text-[var(--text-primary)]"
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
                    bg-[var(--bg-tertiary)]
                    border-[var(--border-primary)]
                    text-[var(--text-primary)]
                    placeholder-[var(--text-tertiary)]
                    focus:border-[var(--action-primary)]
                    focus:ring-1 
                    focus:ring-[var(--action-primary-light)]
                    hover:border-[var(--action-primary-border)]
                  `}
                  placeholder="2"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none text-[var(--text-tertiary)]">
                  mi
                </span>
              </div>
            </div>
            <SearchButton
              onClick={handleSearch}
              disabled={searchPhase !== 'initial' && searchPhase !== 'complete'}
              searchPhase={searchPhase}
              hasLocation={!!location}
              locationName={locationName}
            />
          </div>
        </div>

        {/* Search Progress */}
        {(searchPhase === 'locating' || searchPhase === 'loading') && places.length === 0 && (
          <SearchProgressIndicator 
            phase={searchPhase} 
            error={error}
            usingSavedLocation={!!location} 
          />
        )}

        {/* Search Results (continued) */}
        {places.length > 0 && (
          <div className="mb-12" ref={resultsContainerRef}>
            {/* Search Results Controls - Includes AI Insights */}
            <StickyControls 
              totalPlaces={processedPlaces.length}
              radius={radius}
              sortBy={sortBy}
              onSortChange={handleSort}
              viewMode={viewMode}
              setViewMode={setViewMode}
              currentFilters={postSearchFilters}
              onFilterChange={handlePostSearchFilter}
              places={processedPlaces}
              isSearching={searchPhase !== 'complete'}
              onPhotoClick={(place) => {
                setSelectedPlace(place);
                setShowPhotoModal(true);
                fetchPlacePhotos(place.ID);
              }}
              onRecommendationMade={(insights) => {
                if (insights?.recommendation?.name) {
                  setRecommendedPlace(insights.recommendation.name);
                }
              }}
            />
            {/* No Results Message - Using new Message component */}
            {processedPlaces.length === 0 ? (
              <Message 
                variant="info"
                message="No places match your current filters"
                description="Try adjusting your criteria"
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
                recommendedPlaceName={recommendedPlace}
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
                highlightedPlace={recommendedPlace}
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
              setPlaces([]);
              performSearch(true);
            }}
            onSearchNew={() => {
              clearLocation();
              setShowLocationConfirm(false);
              setPlaces([]);
              performSearch(false);
            }}
            onCancel={() => {
              setShowLocationConfirm(false);
            }}
          />
        )}
      </div>
      
      {/* Footer */}
      <footer className="py-4 bg-bg-secondary border-t border-border-primary">
        <div className="container mx-auto px-4 text-center text-sm text-text-secondary">
          <p>&copy; {new Date().getFullYear()} Workfrom. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <ThemeProvider>
      <WorkfromPlacesContent />
    </ThemeProvider>
  );
};

export default App;