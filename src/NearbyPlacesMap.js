import React, { useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Navigation, 
  ArrowRight, 
  Battery, 
  Wifi, 
  WifiOff, 
  Volume2, 
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

// MapController to handle automatic map fitting
const MapController = ({ userLocation, places }) => {
  const map = useMap();

  useEffect(() => {
    if (!userLocation || !places.length) return;

    const bounds = L.latLngBounds([
      [userLocation.latitude, userLocation.longitude],
      ...places.map(place => [place.latitude, place.longitude])
    ]);

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15
    });
  }, [map, userLocation, places]);

  return null;
};

// Reusable badge component for metrics
const MetricBadge = ({ icon: Icon, label, color, className = "" }) => (
  <div className={`
    inline-flex items-center gap-1.5 px-2 py-1 
    rounded-md border border-[var(--border-primary)]
    bg-[var(--bg-primary)]
    ${className}
  `}>
    <Icon size={14} className={color} />
    <span className={`text-xs font-medium ${color}`}>{label}</span>
  </div>
);

const NearbyPlacesMap = ({ 
  places, 
  userLocation,
  onPhotoClick,
  highlightedPlace,
  searchRadius = 2
}) => {
  const { isDark } = useTheme();
  const defaultPosition = [userLocation.latitude, userLocation.longitude];
  const mapRef = useRef(null);

  const themeColors = {
    accent: isDark ? '#FF9EEE' : '#000000',
    highlight: isDark ? '#FFB8F3' : '#1a1a1a',
    marker: isDark ? '#B399AF' : '#6E7A8A',
    text: {
      primary: isDark ? '#FFFFFF' : '#1A2B3B',
      secondary: isDark ? '#E0C9DC' : '#4A5567'
    },
    bg: {
      primary: isDark ? '#2A1929' : '#FFFFFF',
      secondary: isDark ? '#362234' : '#F8F9FB'
    },
    border: isDark ? 'rgba(224, 201, 220, 0.1)' : '#E3E8EF'
  };

  const createCustomIcon = useCallback((isHighlighted = false) => {
    const size = isHighlighted ? 40 : 32;
    const color = isHighlighted ? themeColors.accent : themeColors.marker;
    
    return L.divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border-radius: 50%;
          opacity: 0.9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: 2px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'};
          transition: all 0.2s ease;
        ">
          <div style="
            width: ${size * 0.6}px;
            height: ${size * 0.6}px;
            background-color: white;
            border-radius: 50%;
            opacity: 0.9;
          "></div>
        </div>
      `,
      className: `custom-marker${isHighlighted ? ' highlighted' : ''}`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  }, [isDark, themeColors]);

  const createUserIcon = useCallback(() => {
    return L.divIcon({
      html: `
        <div style="
          width: 48px;
          height: 48px;
          background-color: ${themeColors.accent};
          border-radius: 50%;
          opacity: 0.15;
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 16px;
            height: 16px;
            background-color: ${themeColors.accent};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          "></div>
        </div>
      `,
      className: 'user-location-marker',
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });
  }, [themeColors]);

  const getWifiStatus = (place) => {
    if (place.no_wifi === "1") {
      return { 
        icon: WifiOff, 
        label: "No WiFi", 
        color: isDark ? "text-red-400" : "text-red-500" 
      };
    }
    if (place.download) {
      const speed = Math.round(place.download);
      if (speed >= 50) {
        return {
          icon: Wifi,
          label: "Fast WiFi",
          color: isDark ? "text-green-400" : "text-green-500"
        };
      }
      return {
        icon: Wifi,
        label: `${speed} Mbps`,
        color: isDark ? "text-yellow-400" : "text-yellow-500"
      };
    }
    return {
      icon: Wifi,
      label: "Unknown",
      color: isDark ? "text-gray-400" : "text-gray-500"
    };
  };

  const getPowerStatus = (place) => {
    const powerValue = String(place.power || '').toLowerCase();
    if (powerValue === 'none' || powerValue === '') {
      return { label: "No Power", color: isDark ? "text-red-400" : "text-red-500" };
    }
    if (powerValue.includes('range3') || powerValue.includes('good')) {
      return { label: "Many Outlets", color: isDark ? "text-green-400" : "text-green-500" };
    }
    if (powerValue.includes('range2')) {
      return { label: "Some Outlets", color: isDark ? "text-yellow-400" : "text-yellow-500" };
    }
    return { label: "Limited Power", color: isDark ? "text-yellow-400" : "text-yellow-500" };
  };

  const getNoiseLevel = (place) => {
    const noise = (place.noise_level || place.noise || "").toLowerCase();
    if (noise.includes('quiet')) {
      return { label: "Quiet", color: isDark ? "text-green-400" : "text-green-500" };
    }
    if (noise.includes('moderate')) {
      return { label: "Moderate", color: isDark ? "text-yellow-400" : "text-yellow-500" };
    }
    if (noise.includes('noisy')) {
      return { label: "Lively", color: isDark ? "text-yellow-400" : "text-yellow-500" };
    }
    return { label: "Unknown", color: isDark ? "text-gray-400" : "text-gray-500" };
  };

  return (
    <div className="rounded-lg overflow-hidden border border-[var(--border-primary)] map-container">
      <MapContainer 
        ref={mapRef}
        center={defaultPosition} 
        zoom={13} 
        style={{ height: '500px', width: '100%' }}
        className={isDark ? 'map-dark' : ''}
      >
        <MapController userLocation={userLocation} places={places} />
        
        <TileLayer
          url={isDark 
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Search radius circle */}
        <Circle
          center={defaultPosition}
          radius={searchRadius * 1609.34} // Convert miles to meters
          pathOptions={{
            color: themeColors.accent,
            fillColor: themeColors.accent,
            fillOpacity: 0.1,
            weight: 1
          }}
        />

        {/* User location marker */}
        <Marker 
          position={defaultPosition} 
          icon={createUserIcon()}
          zIndexOffset={1000}
        >
          <Popup className="themed-popup">
            <div className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 
                  flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Your location</p>
                  <p className="text-sm text-[var(--text-secondary)]">Current position</p>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Place markers */}
        {places.map((place) => {
          const isHighlighted = highlightedPlace && place.ID === highlightedPlace.ID;
          const wifiStatus = getWifiStatus(place);
          const powerStatus = getPowerStatus(place);
          const noiseLevel = getNoiseLevel(place);
          
          return (
            <Marker
              key={place.ID}
              position={[place.latitude, place.longitude]}
              icon={createCustomIcon(isHighlighted)}
              zIndexOffset={isHighlighted ? 900 : 100}
            >
              <Popup minWidth={300}>
                <div className={`
                  p-4 rounded-lg ${isHighlighted 
                    ? 'border-[var(--accent-primary)]' 
                    : 'border-[var(--border-primary)]'
                  } bg-[var(--bg-primary)] border
                `}>
                  {/* Header Section */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Thumbnail */}
                    <div 
                      onClick={() => onPhotoClick(place)}
                      className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer
                        bg-[var(--bg-tertiary)] transition-transform hover:scale-105"
                    >
                      {place.thumbnail_img ? (
                        <img
                          src={place.thumbnail_img}
                          alt={place.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `/api/placeholder/80/80?text=No+image`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <ImageIcon size={20} className="text-[var(--text-tertiary)] mb-1" />
                          <span className="text-xs text-[var(--text-tertiary)]">No image</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h2 
                            onClick={() => onPhotoClick(place)}
                            className="text-lg font-semibold text-[var(--text-primary)] 
                              hover:text-[var(--action-primary)] cursor-pointer truncate"
                          >
                            {place.title}
                          </h2>
                          <p className="text-sm text-[var(--text-secondary)] mt-1">
                            {place.distance} miles away
                          </p>
                        </div>
                        
                        <div 
                          onClick={() => onPhotoClick(place)}
                          className="flex-shrink-0 w-12 h-12 rounded-lg cursor-pointer
                            flex items-center justify-center font-bold text-lg
                            bg-[var(--accent-primary)] text-[var(--button-text)]
                            transition-transform hover:scale-105"
                        >
                          {place.workabilityScore}
                        </div>
                      </div>

                      {/* Metrics Section */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex flex-wrap gap-1.5">
                          <MetricBadge 
                            icon={wifiStatus.icon}
                            label={wifiStatus.label} 
                            color={wifiStatus.color}
                          />
                          <MetricBadge 
                            icon={Battery} 
                            label={powerStatus.label} 
                            color={powerStatus.color}
                          />
                          <MetricBadge 
                            icon={Volume2} 
                            label={noiseLevel.label} 
                            color={noiseLevel.color}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => onPhotoClick(place)}
                      className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md
                        bg-[var(--accent-primary)] text-[var(--button-text)]
                        hover:bg-[var(--accent-secondary)] transition-colors"
                    >
                      <span>View Details</span>
                      <ArrowRight size={14} />
                    </button>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        `${place.street}, ${place.city}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                        flex items-center gap-1.5 text-sm font-medium 
                        px-3 py-1.5 rounded-md transition-colors
                        bg-[var(--bg-tertiary)]
                        border border-[var(--border-primary)]
                        hover:border-[var(--accent-primary)]
                        hover:bg-[var(--bg-secondary)]
                        ${isDark 
                          ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]' 
                          : 'text-[var(--text-primary)]'
                        }
                      `}
                    >
                      <Navigation size={14} className="text-current" /> {/* Use text-current to match parent text color */}
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style jsx global>{`
        .leaflet-container {
          background: ${themeColors.bg.primary};
          font-family: inherit;
        }
        
        .leaflet-popup-content-wrapper,
        .leaflet-popup-tip {
          background: ${themeColors.bg.primary};
          color: ${themeColors.text.primary};
          border: 1px solid ${themeColors.border};
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .leaflet-container a.leaflet-popup-close-button {
          color: ${themeColors.text.secondary};
          padding: 8px;
          width: 28px;
          height: 28px;
          font-weight: normal;
          transition: all 0.2s ease;
        }
        
        .leaflet-container a.leaflet-popup-close-button:hover {
          color: ${themeColors.text.primary};
          background: ${themeColors.bg.secondary};
          border-radius: 50%;
        }

        .map-dark .leaflet-control-zoom a {
          background: ${themeColors.bg.secondary};
          color: ${themeColors.text.primary};
          border-color: ${themeColors.border};
        }

        .map-dark .leaflet-control-zoom a:hover {
          background: ${themeColors.bg.primary};
        }

        .leaflet-bar {
          border-color: ${themeColors.border};
        }

        .leaflet-popup {
          margin-bottom: 0;
        }

        .leaflet-popup-content {
          margin: 0;
          min-width: 300px;
        }

        .leaflet-popup-content p {
          margin: 0;
        }

        .custom-marker {
          background: none;
          border: none;
          transition: transform 0.2s ease;
        }

        .custom-marker:hover {
          transform: scale(1.1);
        }

        .custom-marker.highlighted {
          z-index: 1000 !important;
        }

        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }

        .leaflet-control-zoom a {
          background: ${themeColors.bg.primary} !important;
          color: ${themeColors.text.primary} !important;
          border: 1px solid ${themeColors.border} !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 30px !important;
          font-size: 16px !important;
          transition: all 0.2s ease !important;
        }

        .leaflet-control-zoom a:hover {
          background: ${themeColors.bg.secondary} !important;
          color: ${themeColors.accent} !important;
        }

        /* Search radius circle animation */
        .leaflet-interactive {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            stroke-opacity: 0.8;
            stroke-width: 1;
          }
          50% {
            stroke-opacity: 0.4;
            stroke-width: 2;
          }
          100% {
            stroke-opacity: 0.8;
            stroke-width: 1;
          }
        }

        /* User location marker pulse animation */
        .user-location-marker {
          background: none;
          border: none;
        }

        .user-location-marker::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 48px;
          height: 48px;
          margin: -24px 0 0 -24px;
          background: ${themeColors.accent};
          border-radius: 50%;
          animation: ripple 2s infinite ease-out;
          opacity: 0;
        }

        .leaflet-popup-content a {
          color: inherit !important;
          text-decoration: none !important;
        }

        .leaflet-popup-content a {
          color: inherit !important;
          text-decoration: none !important;
        }

        .leaflet-popup-content a:hover {
          color: inherit !important;
        }

        .leaflet-container a.leaflet-popup-close-button {
          width: 24px !important;
          height: 24px !important;
          padding: 0 !important;
          margin: 4px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: ${themeColors.text.secondary};
          font-size: 18px !important;
          font-family: system-ui !important;
          transition: all 0.2s ease;
          border-radius: 50%;
          line-height: 1 !important;
        }

        .leaflet-container a.leaflet-popup-close-button:hover {
          color: ${themeColors.text.primary};
          background: ${themeColors.bg.secondary};
          text-decoration: none;
        }

        .leaflet-popup-close-button span {
          margin-top: -2px;
          display: inline-flex;
        }

        @keyframes ripple {
          0% {
            transform: scale(0.5);
            opacity: 0.4;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default NearbyPlacesMap;