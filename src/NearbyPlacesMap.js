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
    accent: {
      primary: 'var(--accent-primary)',
      secondary: 'var(--accent-secondary)',
      muted: 'var(--accent-muted)',
    },
    text: {
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
      tertiary: 'var(--text-tertiary)',
    },
    bg: {
      primary: 'var(--bg-primary)',
      secondary: 'var(--bg-secondary)',
      tertiary: 'var(--bg-tertiary)',
    },
    border: {
      primary: 'var(--border-primary)',
      secondary: 'var(--border-secondary)',
    },
    button: {
      text: 'var(--button-text)',
      textMuted: 'var(--button-text-muted)',
    }
  };

  const createCustomIcon = useCallback((isHighlighted = false) => {
    const size = isHighlighted ? 40 : 32;
    const color = isHighlighted ? themeColors.accent.primary : themeColors.accent.muted;
    
    return L.divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          position: relative;
          transform: translate(-50%, -50%);
        ">
          <div style="
            width: 100%;
            height: 100%;
            background-color: ${color};
            border-radius: 50%;
            opacity: 0.9;
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            border: 2px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'};
            transition: all 0.2s ease;
          ">
            <div style="
              width: ${size * 0.6}px;
              height: ${size * 0.6}px;
              background-color: ${themeColors.bg.primary};
              border-radius: 50%;
              opacity: 0.9;
            "></div>
          </div>
        </div>
      `,
      className: `custom-marker${isHighlighted ? ' highlighted' : ''}`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -(size/2 + 2)] // Offset popup slightly above the marker
    });
  }, [isDark, themeColors]);

  const createUserIcon = useCallback(() => {
    const size = 48;
    return L.divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          position: relative;
          transform: translate(-50%, -50%);
        ">
          <div style="
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 100%;
              height: 100%;
              background-color: ${themeColors.accent.primary};
              border-radius: 50%;
              opacity: 0.15;
              animation: locationPulse 2s infinite;
            "></div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 16px;
              height: 16px;
              background-color: ${themeColors.accent.primary};
              border-radius: 50%;
              border: 3px solid ${themeColors.bg.primary};
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            "></div>
          </div>
        </div>
      `,
      className: 'user-location-marker',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -(size/2 + 2)]
    });
  }, [themeColors]);

  const getWifiStatus = (place) => {
    if (place.no_wifi === "1") {
      return { 
        icon: WifiOff, 
        label: "No WiFi", 
        color: "text-[var(--error)]",
        iconColor: "text-[var(--error)]"
      };
    }

    if (place.download) {
      const speed = Math.round(place.download);
      if (speed >= 50) {
        return {
          icon: Wifi,
          label: "Fast WiFi",
          value: "Excellent",
          color: "text-[var(--success)]",
          iconColor: "text-[var(--success)]"
        };
      }
      if (speed >= 25) {
        return {
          icon: Wifi,
          label: "Very Good WiFi",
          value: "Very Good",
          color: "text-[var(--success)]",
          iconColor: "text-[var(--success)]"
        };
      }
      if (speed >= 10) {
        return {
          icon: Wifi,
          label: "Good WiFi",
          value: "Good",
          color: "text-[var(--warning)]",
          iconColor: "text-[var(--warning)]"
        };
      }
      return {
        icon: Wifi,
        label: `${speed} Mbps`,
        value: "Basic",
        color: "text-[var(--warning)]",
        iconColor: "text-[var(--warning)]"
      };
    }

    return {
      icon: Wifi,
      label: "WiFi Available",
      value: "Unknown",
      color: "text-[var(--text-tertiary)]",
      iconColor: "text-[var(--text-tertiary)]"
    };
  };

  const getPowerStatus = (place) => {
    const powerValue = String(place.power || '').toLowerCase();
    if (powerValue === 'none' || powerValue === '') {
      return { 
        label: "No Power",
        color: "text-[var(--error)]",
        iconColor: "text-[var(--error)]"
      };
    }
    if (powerValue.includes('range3') || powerValue.includes('good')) {
      return { 
        label: "Many Outlets",
        color: "text-[var(--success)]",
        iconColor: "text-[var(--success)]"
      };
    }
    if (powerValue.includes('range2')) {
      return { 
        label: "Some Outlets",
        color: "text-[var(--warning)]",
        iconColor: "text-[var(--warning)]"
      };
    }
    return { 
      label: "Limited Power",
      color: "text-[var(--warning)]",
      iconColor: "text-[var(--warning)]"
    };
  };

  const getNoiseLevel = (place) => {
    const noise = (place.noise_level || place.noise || "").toLowerCase();
    if (noise.includes('quiet')) {
      return { 
        label: "Quiet",
        color: "text-[var(--success)]",
        iconColor: "text-[var(--success)]"
      };
    }
    if (noise.includes('moderate')) {
      return { 
        label: "Moderate",
        color: "text-[var(--warning)]",
        iconColor: "text-[var(--warning)]"
      };
    }
    if (noise.includes('noisy')) {
      return { 
        label: "Lively",
        color: "text-[var(--warning)]",
        iconColor: "text-[var(--warning)]"
      };
    }
    return { 
      label: "Unknown",
      color: "text-[var(--text-tertiary)]",
      iconColor: "text-[var(--text-tertiary)]"
    };
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
          radius={searchRadius * 1609.34}
          pathOptions={{
            color: themeColors.accent.primary,
            fillColor: themeColors.accent.primary,
            fillOpacity: 0.1,
            weight: 1,
            className: 'search-radius-circle'  // Add this custom class
          }}
        />

        {/* User location marker */}
        <Marker 
          position={defaultPosition} 
          icon={createUserIcon()}
          zIndexOffset={1000}
        >
          <Popup>
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
          const wifiStatus = getWifiStatus(place, isDark);
          const powerStatus = getPowerStatus(place, isDark);
          const noiseLevel = getNoiseLevel(place, isDark);
          
          return (
            <Marker
              key={place.ID}
              position={[place.latitude, place.longitude]}
              icon={createCustomIcon(isHighlighted)}
              zIndexOffset={isHighlighted ? 900 : 100}
            >
              <Popup>
                <div className={`
                  p-4 rounded-lg ${isHighlighted 
                    ? 'border-[var(--accent-primary)]' 
                    : 'border-[var(--border-primary)]'
                  } bg-[var(--bg-primary)] border
                `}>
                  <div className="flex items-start gap-4 mb-4">
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

                      <div className="mt-3 space-y-1.5">
                        <div className="flex flex-wrap gap-1.5">
                          <MetricBadge 
                            icon={wifiStatus.icon}
                            label={wifiStatus.label} 
                            color={wifiStatus.color}
                            iconColor={wifiStatus.iconColor}
                          />
                          <MetricBadge 
                            icon={Battery} 
                            label={powerStatus.label} 
                            color={powerStatus.color}
                            iconColor={powerStatus.iconColor}
                          />
                          <MetricBadge 
                            icon={Volume2} 
                            label={noiseLevel.label} 
                            color={noiseLevel.color}
                            iconColor={noiseLevel.iconColor}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

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
                      className="flex items-center gap-1.5 text-sm font-medium 
                        px-3 py-1.5 rounded-md transition-colors
                        bg-[var(--bg-tertiary)]
                        text-[var(--text-primary)]
                        hover:bg-[var(--bg-secondary)]
                        hover:text-[var(--accent-primary)]"
                    >
                      <Navigation size={14} />
                      <span>Directions</span>
                    </a></div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style jsx global>{`
        .leaflet-container {
          background: var(--bg-primary);
          font-family: inherit;
        }
        
        .leaflet-popup-content-wrapper,
        .leaflet-popup-tip {
          background: var(--bg-primary);
          color: var(--text-primary);
          border: 1px solid var(--border-primary);
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .leaflet-container a.leaflet-popup-close-button {
          color: var(--text-secondary);
          padding: 8px;
          width: 28px;
          height: 28px;
          font-weight: normal;
          transition: all 0.2s ease;
        }
        
        .leaflet-container a.leaflet-popup-close-button:hover {
          color: var(--text-primary);
          background: var(--bg-secondary);
          border-radius: 50%;
        }

        .map-dark .leaflet-control-zoom a {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border-color: var(--border-primary);
        }

        .map-dark .leaflet-control-zoom a:hover {
          background: var(--bg-primary);
        }

        .leaflet-bar {
          border-color: var(--border-primary);
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
          background: var(--bg-primary) !important;
          color: var(--text-primary) !important;
          border: 1px solid var(--border-primary) !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 30px !important;
          font-size: 16px !important;
          transition: all 0.2s ease !important;
        }

        .leaflet-control-zoom a:hover {
          background: var(--bg-secondary) !important;
          color: var(--accent-primary) !important;
        }

        /* Search radius circle animation */
        .leaflet-interactive.search-radius-circle {
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

        @keyframes locationPulse {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0.4;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }

        .leaflet-popup-content a {
          color: inherit !important;
          text-decoration: none !important;
        }
        
        /* Dark theme specific styles */
        .map-dark .leaflet-popup-content-wrapper,
        .map-dark .leaflet-popup-tip {
          background: var(--bg-primary);
          border-color: var(--border-primary);
        }

        .map-dark .leaflet-container a.leaflet-popup-close-button {
          color: var(--text-secondary);
        }

        .map-dark .leaflet-container a.leaflet-popup-close-button:hover {
          color: var(--text-primary);
          background: var(--bg-secondary);
        }

        /* Attribution link styles */
        .leaflet-control-attribution {
          background: var(--bg-primary) !important;
          color: var(--text-secondary) !important;
          font-size: 10px !important;
          padding: 2px 8px !important;
        }

        .leaflet-control-attribution a {
          color: var(--accent-primary) !important;
        }

        /* Focus styles for accessibility */
        .leaflet-container a:focus,
        .leaflet-container button:focus {
          outline: 2px solid var(--accent-primary) !important;
          outline-offset: 2px !important;
        }

        /* Popup transitions */
        .leaflet-fade-anim .leaflet-popup {
          transition: opacity 0.2s linear !important;
        }

        /* Custom scrollbar for popup content */
        .leaflet-popup-content-wrapper {
          scrollbar-width: thin;
          scrollbar-color: var(--accent-primary) var(--bg-secondary);
        }

        .leaflet-popup-content-wrapper::-webkit-scrollbar {
          width: 8px;
        }

        .leaflet-popup-content-wrapper::-webkit-scrollbar-track {
          background: var(--bg-secondary);
        }

        .leaflet-popup-content-wrapper::-webkit-scrollbar-thumb {
          background-color: var(--accent-primary);
          border-radius: 4px;
          border: 2px solid var(--bg-secondary);
        }
      `}</style>
    </div>
  );
};

export default NearbyPlacesMap;