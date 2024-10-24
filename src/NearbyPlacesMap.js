import React, { useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, ArrowRight, Battery, Wifi, Volume2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import WorkabilityScore from './WorkabilityScore';

// Utility component to handle map events and updates
const MapEventHandler = ({ onPopupOpen }) => {
  const map = useMap();

  React.useEffect(() => {
    map.on('popupopen', (e) => {
      // Get the popup and its position
      const popup = e.popup;
      const popupLatLng = popup.getLatLng();
      
      // Wait for the popup to be fully rendered
      requestAnimationFrame(() => {
        // Get the popup content element
        const popupContent = popup._container;
        if (!popupContent) return;

        // Calculate popup dimensions
        const popupHeight = popupContent.offsetHeight;
        
        // Calculate the new position that will center the popup
        const point = map.project(popupLatLng);
        
        // Only adjust vertical position, leave horizontal as is
        point.y -= popupHeight / 2;
        
        // Convert back to LatLng and pan
        const newCenter = map.unproject(point);
        map.panTo(newCenter, { animate: true });
      });
      
      onPopupOpen?.(e);
    });
  }, [map, onPopupOpen]);

  return null;
};

const NearbyPlacesMap = ({ 
  places, 
  userLocation,
  onPhotoClick
}) => {
  const { isDark } = useTheme();
  const defaultPosition = [userLocation.latitude, userLocation.longitude];
  const mapRef = useRef(null);

  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const placeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const getGoogleMapsUrl = (address) => 
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  const getPowerLabel = (power) => {
    if (!power) return 'Unknown';
    if (power.includes('range3')) return 'Plenty';
    if (power.includes('range2')) return 'Good';
    if (power.includes('range1')) return 'Limited';
    return 'Unknown';
  };

  const handlePopupOpen = useCallback((e) => {
    // Additional popup open handling if needed
    console.log('Popup opened:', e);
  }, []);

  return (
    <div className="rounded-lg overflow-hidden border border-border-primary map-container">
      <MapContainer 
        ref={mapRef}
        center={defaultPosition} 
        zoom={13} 
        style={{ height: '500px', width: '100%' }}
        className={isDark ? 'map-dark' : ''}
      >
        <MapEventHandler onPopupOpen={handlePopupOpen} />
        <TileLayer
          url={isDark 
            ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
          attribution={isDark
            ? '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
            : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          }
        />
        <Marker position={defaultPosition} icon={userIcon}>
          <Popup>
            <div className="bg-[#1a1f2c] text-white p-2 rounded">
              <p className="font-medium">Your location</p>
            </div>
          </Popup>
        </Marker>
        {places.map((place) => (
          <Marker
            key={place.ID}
            position={[place.latitude, place.longitude]}
            icon={placeIcon}
          >
            <Popup minWidth={300}>
              <div className="bg-[#1a1f2c] text-white p-4 -m-4 rounded">
                {/* Header */}
                <div className="mb-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 
                      className="text-lg font-semibold text-white hover:text-blue-300 cursor-pointer transition-colors"
                      onClick={() => onPhotoClick(place)}
                    >
                      {place.title}
                    </h3>
                    <WorkabilityScore place={place} variant="compact" />
                  </div>
                  <p className="text-blue-200 text-sm">
                    Distance: {place.distance} miles
                  </p>
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  {place.download && (
                    <div className="flex items-center text-sm">
                      <Wifi size={16} className="text-blue-400 mr-2" />
                      <span className="text-blue-200">WiFi Speed:</span>
                      <span className="ml-1 text-green-400 font-medium">
                        {Math.round(place.download)} Mbps
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Battery size={16} className="text-blue-400 mr-2" />
                    <span className="text-blue-200">Power:</span>
                    <span className="ml-1 text-white">
                      {getPowerLabel(place.power)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Volume2 size={16} className="text-blue-400 mr-2" />
                    <span className="text-blue-200">Noise Level:</span>
                    <span className="ml-1 text-white">
                      {place.mappedNoise}
                    </span>
                  </div>
                </div>

                {/* Address */}
                <div className="text-sm text-blue-200 mb-4">
                  <p>{place.street}</p>
                  <p>{place.city}, {place.postal}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <a
                    href={getGoogleMapsUrl(`${place.street}, ${place.city}, ${place.postal}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm px-3 py-1.5 bg-accent-primary hover:bg-accent-secondary transition-colors text-white rounded"
                  >
                    <Navigation size={14} className="mr-1.5" />
                    Get Directions
                  </a>
                  <button
                    onClick={() => onPhotoClick(place)}
                    className="inline-flex items-center text-sm px-3 py-1.5 bg-[#2a3142] hover:bg-[#323950] transition-colors text-blue-200 rounded"
                  >
                    <ArrowRight size={14} className="mr-1.5" />
                    See More
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default NearbyPlacesMap;