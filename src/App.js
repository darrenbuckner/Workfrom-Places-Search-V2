import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Loader, 
  Navigation, 
  AlertTriangle, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  EyeOff, 
  Star, 
  Plus, 
  List, 
  Map, 
  User, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import WorkfromVirtualAd from './WorkfromVirtualAd';
import NearbyPlacesMap from './NearbyPlacesMap';
import PhotoModal from './PhotoModal';
import LazyImage from './LazyImage';
import VirtualList from './VirtualList';
import WorkabilityScore from './WorkabilityScore';
import WorkabilityControls from './WorkabilityControls';
import { calculateWorkabilityScore } from './WorkabilityScore';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.workfrom.co';

const WorkfromLogo = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-12 h-12">
      <circle cx="50" cy="50" r="48" fill="#160040" />
      <path d="M50 75 L75 40 A35 35 0 0 0 25 40 Z" fill="#F5A623" />
      <path d="M50 75 L67 50 A24 24 0 0 0 33 50 Z" fill="#FFFFFF" />
      <circle cx="50" cy="75" r="6" fill="#F5A623" />
    </svg>
  );
};

const WorkfromPlacesApp = () => {
  const [location, setLocation] = useState(null);
  const [cityName, setCityName] = useState('');
  const [radius, setRadius] = useState(2);
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
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
  const itemsPerPage = 10;
  const listRef = useRef(null);

  useEffect(() => {
    const savedLocation = localStorage.getItem('savedLocation');
    if (savedLocation) {
      setLocation(JSON.parse(savedLocation));
      setHasSearched(true);
    }
  }, []);

  useEffect(() => {
    if (listRef.current && viewMode === 'list') {
      const yOffset = -50;
      const y = listRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [currentPage, viewMode]);

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
        () => {
          reject(new Error('Unable to retrieve your location'));
        }
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setCityName('');
    setPlaces([]);
    setHasSearched(false);
    setError('');
    localStorage.removeItem('savedLocation');
  }, []);

  const mapNoiseLevel = useCallback((noise) => {
    if (!noise) return 'Unknown';
    if (typeof noise === 'string') {
      const lowerNoise = noise.toLowerCase();
      if (lowerNoise.includes('quiet') || lowerNoise.includes('low')) return 'Below average';
      if (lowerNoise.includes('moderate') || lowerNoise.includes('average')) return 'Average';
      if (lowerNoise.includes('noisy') || lowerNoise.includes('high')) return 'Above average';
      return noise;
    }
    return 'Unknown';
  }, []);

  const processPlaces = useCallback((rawPlaces) => {
    let processed = rawPlaces.map(place => ({
      ...place,
      mappedNoise: mapNoiseLevel(place.noise_level || place.noise),
      workabilityScore: calculateWorkabilityScore(place).score
    }));

    // Always sort by score (default high to low), unless explicitly set to 'none'
    if (sortBy !== 'none') {
      processed.sort((a, b) => 
        sortBy === 'score_high' 
          ? b.workabilityScore - a.workabilityScore 
          : a.workabilityScore - b.workabilityScore
      );
    }

    return processed;
  }, [mapNoiseLevel, sortBy]);

  const searchPlaces = useCallback(async () => {
    setSearchPhase('locating');
    setError('');
    setHasSearched(true);
    setCurrentPage(1);

    try {
      let currentLocation = location;
      if (!currentLocation) {
        currentLocation = await getLocation();
        setLocation(currentLocation);
      }

      setSearchPhase('loading');

      const apiUrl = `${API_BASE_URL}/places/ll/${currentLocation.latitude},${currentLocation.longitude}?radius=${radius}&appid=${process.env.REACT_APP_API_KEY}&rpp=200`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.meta.code === 200 && Array.isArray(data.response)) {
        // Process places with workability score
        let processedPlaces = processPlaces(data.response);
        
        setPlaces(processedPlaces);
        setTotalPlaces(processedPlaces.length);
        setTotalPages(Math.ceil(processedPlaces.length / itemsPerPage));

        if (processedPlaces.length === 0) {
          setError('No places found matching your criteria. Try adjusting your filters or increasing the radius.');
        }
      } else {
        setError(`Error: Unexpected response from the server. Please try again later.`);
        setPlaces([]);
        setTotalPlaces(0);
      }
    } catch (err) {
      setError(`An error occurred: ${err.message}`);
      setPlaces([]);
      setTotalPlaces(0);
    } finally {
      setSearchPhase('complete');
    }
  }, [location, radius, getLocation, processPlaces]);

  const fetchPlacePhotos = useCallback(async (placeId) => {
    setIsPhotoLoading(true);
    try {
      const apiUrl = `${API_BASE_URL}/places/${placeId}?appid=${process.env.REACT_APP_API_KEY}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.meta.code === 200 && data.response && data.response.length > 0) {
        const placeData = data.response[0];
        const fullImgUrl = placeData.full_img;
        const description = placeData.description ? stripHtml(placeData.description) : '';
        const os = placeData.os;

        setFullImg(fullImgUrl || '');
        setSelectedPlace(prevPlace => ({
          ...prevPlace,
          description,
          os: os || ''
        }));
      } else {
        setFullImg('');
        setSelectedPlace(prevPlace => ({
          ...prevPlace,
          description: '',
          os: ''
        }));
      }
    } catch (err) {
      setFullImg('');
      setSelectedPlace(prevPlace => ({
        ...prevPlace,
        description: '',
        os: ''
      }));
    } finally {
      setIsPhotoLoading(false);
    }
  }, []);

  const openPhotoModal = useCallback((place) => {
    setSelectedPlace(place);
    setShowPhotoModal(true);
    fetchPlacePhotos(place.ID);
  }, [fetchPlacePhotos]);

  const getGoogleMapsUrl = useCallback((address) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  }, []);

  const copyAddressToClipboard = useCallback((address) => {
    navigator.clipboard.writeText(address).then(() => {
      alert('Address copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  }, []);

  const reportPlace = useCallback((placeId) => {
    console.log(`Reported place with ID: ${placeId}`);
    alert("Thank you for your report. This feature will be implemented in the future.");
  }, []);

  const stripHtml = useCallback((html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }, []);

  const MessageBanner = useCallback(({ message, type = 'info' }) => {
    const bgColor = {
      info: 'bg-blue-100 border-blue-500 text-blue-700',
      error: 'bg-red-100 border-red-500 text-red-700',
      warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    }[type] || 'bg-gray-100 border-gray-500 text-gray-700';

    const iconMap = {
      info: <AlertCircle size={24} className="mr-2" />,
      error: <AlertTriangle size={24} className="mr-2" />,
      warning: <AlertCircle size={24} className="mr-2" />,
    };

    return (
      <div className={`${bgColor} border-l-4 p-4 mb-4 rounded flex items-center`}>
        {iconMap[type]}
        <p>{message}</p>
      </div>
    );
  }, []);

  const Pagination = useCallback(() => (
    <div className="flex justify-center mt-4 space-x-2">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        Previous
      </button>
      <span className="px-3 py-1">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        Next
      </button>
    </div>
  ), [currentPage, totalPages]);

  const Footer = useCallback(() => (
    <footer className="mt-12 py-6 bg-gray-100">
      <div className="container mx-auto text-center text-gray-600">
        <p>&copy; 2024 Workfrom.</p>
        <p className="mt-2">
          <a href="#" className="text-blue-500 hover:underline">Terms of Service</a>
          {' | '}
          <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </footer>
  ), []);

  const paginatedPlaces = places.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto p-4 max-w-2xl flex-grow">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <WorkfromLogo />
            <h1 className="text-2xl font-bold ml-2">Workfrom Places Search</h1>
          </div>
          <a
            href="https://workfrom.co/add"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors flex items-center text-xs sm:text-sm"
          >
            <Plus size={16} className="mr-1" />
            <span className="hidden sm:inline">Add Place</span>
            <span className="sm:hidden">Add</span>
          </a>
        </div>

        <div className="mb-4">
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="text-blue-500 hover:underline flex items-center"
          >
            {showDescription ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span className="ml-1">How It Works</span>
          </button>
        </div>

        {showDescription && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded">
            <h2 className="font-bold mb-2">How It Works</h2>
            <p className="text-sm">
              1. Choose your filters (Fast WiFi, Background Noise, etc.)
              <br />
              2. Set your search radius (optional)
              <br />
              3. Click 'Search' to find work-friendly places near you
              <br />
              4. Browse results, view details, and get directions
            </p>
            <p className="text-sm mt-2 italic">
              Note: Places are added by members of the Workfrom community. While we strive for accuracy, information may sometimes be incomplete or outdated. Your feedback helps keep our data current!
            </p>
          </div>
        )}
        
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm mb-6">
          {location ? (
            <div className="mb-3">
              <p>Your location has been saved.&nbsp;
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); clearLocation(); }}
                  className="text-blue-500 hover:underline"
                >
                  (clear)
                </a>
              </p>
            </div>
          ) : (
            <p className="mb-3">Click search to use your current location</p>
          )}

          <WorkabilityControls 
            onSortChange={setSortBy}
            currentSort={sortBy}
            radius={radius}
            setRadius={setRadius}
          />
          
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={searchPlaces}
              className="bg-blue-500 text-white p-2 px-6 py-3 rounded hover:bg-blue-600 transition-colors"
              disabled={searchPhase !== 'initial' && searchPhase !== 'complete'}
            >
              {searchPhase === 'locating' && 'Finding your location...'}
              {searchPhase === 'loading' && 'Locating nearby places...'}
              {(searchPhase === 'initial' || searchPhase === 'complete') && 'Search'}
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded ${viewMode === 'map' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
              >
                <Map size={20} />
              </button>
            </div>
          </div>
        </div>

        {error && <MessageBanner message={error} type="error" />}
        {loading && <MessageBanner message="Loading..." type="info" />}

        {hasSearched && places.length > 0 && (
          <div className="mb-12">
            <MessageBanner 
              message={`Found ${totalPlaces} place${totalPlaces !== 1 ? 's' : ''} within ${radius} miles.`}
              type="info"
            />
            
            {viewMode === 'list' ? (
              <div ref={listRef} className="space-y-6">
                {paginatedPlaces.map((place, index) => (
                  <React.Fragment key={place.ID}>
                    {index > 0 && index % 5 === 0 && (
                      <WorkfromVirtualAd />
                    )}
                    <div className={`border p-4 rounded shadow-sm hover:shadow-md transition-shadow relative ${place.owner_promoted_flag === "1" ? 'border-yellow-400 bg-yellow-50' : ''}`}>
                      {place.owner_promoted_flag === "1" && (
                        <div className="absolute top-0 right-0 bg-red-400 text-white px-2 py-1 rounded-bl text-xs flex items-center">
                          <Star size={12} className="mr-1" />
                          Promoted
                        </div>
                      )}
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-start space-x-4">
                          <div 
                            className="w-24 h-24 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center cursor-pointer"
                            onClick={() => openPhotoModal(place)}
                          >
                            {place.thumbnail_img ? (
                              <LazyImage
                                src={place.thumbnail_img}
                                alt={place.title}
                                placeholder="https://placehold.co/100x100/e5e7eb/e5e7eb?text=Loading...&font=raleway"
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <span className="text-gray-400 text-xs">No image</span>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start">
                              <h2 
                                className="text-xl font-semibold mb-1 truncate cursor-pointer hover:text-blue-600 transition-colors" 
                                title={place.title}
                                onClick={() => openPhotoModal(place)}
                              >
                                {place.title}
                              </h2>
                              <WorkabilityScore place={place} variant="compact" />
                            </div>
                            <p className="text-sm mb-1">Distance: {place.distance} miles</p>
                            {place.download && (
                              <div className="mb-1">
                                <p className="text-sm flex items-center">
                                  <span className="mr-1">WiFi Speed:</span>
                                  <strong className="text-green-600">{Math.round(place.download)} Mbps</strong>
                                </p>
                              </div>
                            )}
                            <div className="flex items-center text-sm">
                              <span className="mr-1">Background Noise:</span>
                              <span className={`font-medium ${
                                mapNoiseLevel(place.noise_level || place.noise) === 'Below average' ? 'text-green-600' :
                                mapNoiseLevel(place.noise_level || place.noise) === 'Average' ? 'text-blue-600' :
                                mapNoiseLevel(place.noise_level || place.noise) === 'Above average' ? 'text-yellow-600' :
                                'text-gray-600'
                              }`}>
                                {mapNoiseLevel(place.noise_level || place.noise)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-between gap-2">
                          {place.os && (
                            <div className="text-gray-600 text-sm flex items-center">
                              <User size={16} className="mr-1 flex-shrink-0" />
                              <span>{place.os}</span>
                            </div>
                          )}
                          <a
                            href={getGoogleMapsUrl(`${place.street}, ${place.city}, ${place.postal}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                          >
                            <Navigation size={16} className="mr-1 flex-shrink-0" />
                            <span className="hidden sm:inline">Get Directions</span>
                            <span className="sm:hidden">Directions</span>
                          </a>
                          <button
                            onClick={() => copyAddressToClipboard(`${place.street}, ${place.city}, ${place.postal}`)}
                            className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                          >
                            <Copy size={16} className="mr-1 flex-shrink-0" />
                            <span className="hidden sm:inline">Copy Address</span>
                            <span className="sm:hidden">Copy</span>
                          </button>
                          <button
                            onClick={() => reportPlace(place.ID)}
                            className="text-gray-500 hover:text-yellow-700 text-sm flex items-center"
                          >
                            <AlertTriangle size={16} className="mr-1 flex-shrink-0" />
                            <span className="hidden sm:inline">Report</span>
                            <span className="sm:hidden">Report</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <NearbyPlacesMap places={places} userLocation={location} />
            )}
            
            {viewMode === 'list' && <Pagination />}
          </div>
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

export default WorkfromPlacesApp;