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
  ImageIcon,
  Star,
  ChevronRight
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

// New MetricBadge component to match list view styling
const MetricBadge = ({ icon: Icon, label, variant }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-400/10';
      case 'warning':
        return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-400/10';
      case 'error':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-400/10';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-400/10';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${getVariantStyles()}`}>
      <Icon size={12} />
      <span className="font-medium text-xs">{label}</span>
    </div>
  );
};

// StarRating component to match list view
const StarRating = ({ score }) => {
  const ratingValue = Math.round(score * 2) / 2; // Round to nearest 0.5
  const fullStars = Math.floor(ratingValue);
  const hasHalfStar = ratingValue % 1 !== 0;
  
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={12}
          className={`${
            i < fullStars
              ? 'text-[var(--accent-primary)] fill-current'
              : i === fullStars && hasHalfStar
              ? 'text-[var(--accent-primary)]'
              : 'text-[var(--text-tertiary)]'
          }`}
        />
      ))}
    </div>
  );
};

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
        variant: 'error'
      };
    }

    if (place.download) {
      const speed = Math.round(place.download);
      if (speed >= 50) {
        return {
          icon: Wifi,
          label: "Fast WiFi",
          variant: 'success'
        };
      }
      if (speed >= 25) {
        return {
          icon: Wifi,
          label: "Very Good WiFi",
          variant: 'success'
        };
      }
      if (speed >= 10) {
        return {
          icon: Wifi,
          label: "Good WiFi",
          variant: 'warning'
        };
      }
      return {
        icon: Wifi,
        label: `${speed} Mbps`,
        variant: 'warning'
      };
    }

    return {
      icon: Wifi,
      label: "WiFi Available",
      variant: 'default'
    };
  };

  const getPowerStatus = (place) => {
    const powerValue = String(place.power || '').toLowerCase();
    if (powerValue === 'none' || powerValue === '') {
      return { 
        label: "No Power",
        variant: 'error'
      };
    }
    if (powerValue.includes('range3') || powerValue.includes('good')) {
      return { 
        label: "Many Outlets",
        variant: 'success'
      };
    }
    if (powerValue.includes('range2')) {
      return { 
        label: "Some Outlets",
        variant: 'warning'
      };
    }
    return { 
      label: "Limited Power",
      variant: 'warning'
    };
  };

  const getNoiseLevel = (place) => {
    const noise = (place.noise_level || place.noise || "").toLowerCase();
    if (noise.includes('quiet')) {
      return { 
        label: "Quiet",
        variant: 'success'
      };
    }
    if (noise.includes('moderate')) {
      return { 
        label: "Moderate",
        variant: 'warning'
      };
    }
    if (noise.includes('noisy')) {
      return { 
        label: "Lively",
        variant: 'warning'
      };
    }
    return { 
      label: "Unknown",
      variant: 'default'
    };
  };

  // Replace the PopupContent component in NearbyPlacesMap.js with this more compact version

const PopupContent = ({ place, isHighlighted }) => {
  // Helper to get concise WiFi status
  const getWifiInfo = (place) => {
    if (place.no_wifi === "1") return "No WiFi";
    if (place.download) {
      const speed = Math.round(place.download);
      if (speed >= 50) return "Fast WiFi";
      if (speed >= 25) return "Good WiFi";
      if (speed >= 10) return `${speed} Mbps`;
      return `${speed} Mbps`;
    }
    return "WiFi Available";
  };

  // Helper to get concise power status
  const getPowerInfo = (place) => {
    const power = String(place.power || '').toLowerCase();
    if (power === 'none' || power === '') return "No outlets";
    if (power.includes('range3') || power.includes('good')) return "Many outlets";
    if (power.includes('range2')) return "Some outlets";
    return "Limited power";
  };

  return (
    <div className={`
      relative rounded-lg border overflow-hidden
      ${isHighlighted 
        ? 'border-[var(--accent-primary)] bg-gradient-to-br from-[var(--accent-primary)]/5 to-[var(--accent-primary)]/10' 
        : 'border-[var(--border-primary)] bg-[var(--bg-secondary)]'
      }
    `}>
      <div className="p-3">
        {/* Header Section */}
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          <div 
            onClick={() => onPhotoClick(place)}
            className={`
              w-14 h-14 rounded-md overflow-hidden flex-shrink-0 cursor-pointer
              bg-[var(--bg-tertiary)] transition-transform hover:scale-105
              border ${isHighlighted ? 'border-[var(--accent-primary)]/25' : 'border-[var(--border-primary)]'}
            `}
          >
            {place.thumbnail_img ? (
              <img
                src={place.thumbnail_img}
                alt={place.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `/api/placeholder/56/56?text=No+image`;
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <ImageIcon size={16} className="text-[var(--text-tertiary)]" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold truncate
                  ${isHighlighted ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}
                `}>
                  {place.title}
                </h3>
                {/* Rating and Distance */}
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1">
                    <StarRating score={place.workabilityScore / 2} />
                    <span className="text-xs text-[var(--text-secondary)]">
                      {place.workabilityScore.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)]">
                    • {place.distance} mi
                  </span>
                </div>
                {/* Compact Info Line */}
                <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--text-secondary)]">
                  <Wifi size={12} className="flex-shrink-0" />
                  <span className="truncate">{getWifiInfo(place)}</span>
                  <span className="mx-0.5">•</span>
                  <Battery size={12} className="flex-shrink-0" />
                  <span className="truncate">{getPowerInfo(place)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--border-primary)]">
          <button
            onClick={() => onPhotoClick(place)}
            className="flex items-center justify-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md
              bg-[var(--accent-primary)] text-[var(--button-text)]
              hover:bg-[var(--accent-secondary)] transition-colors flex-1"
          >
            View Details
            <ChevronRight size={12} />
          </button>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              `${place.street}, ${place.city}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium
              bg-[var(--bg-tertiary)] text-[var(--text-primary)]
              hover:text-[var(--accent-primary)]
              px-2.5 py-1.5 rounded-md transition-colors"
          >
            <Navigation size={12} />
            <span className="sm:inline">Directions</span>
          </a>
        </div>
      </div>

      {isHighlighted && (
        <>
          <div className="absolute -top-px left-0 right-0 h-1 bg-[var(--accent-primary)]" />
          <div className="absolute -left-px top-0 bottom-0 w-1 bg-[var(--accent-primary)]" />
        </>
      )}
    </div>
  );
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
          
          return (
            <Marker
              key={place.ID}
              position={[place.latitude, place.longitude]}
              icon={createCustomIcon(isHighlighted)}
              zIndexOffset={isHighlighted ? 900 : 100}
            >
              <Popup>
                <PopupContent place={place} isHighlighted={isHighlighted} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style jsx="true" global="true">{`
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
        .leaflet-popup-content-wrapper {
          padding: 0 !important;
          overflow: hidden !important;
          border-radius: 0.5rem !important;
        }
        
        .leaflet-popup-content {
          margin: 0 !important;
          width: 320px !important;
        }
        
        .leaflet-popup-close-button {
          right: 4px !important;
          top: 4px !important;
          color: var(--text-secondary) !important;
          z-index: 1;
        }

        .leaflet-popup-tip {
          border-top: 1px solid var(--border-primary) !important;
        }
      `}</style>
    </div>
  );
};

export default NearbyPlacesMap;