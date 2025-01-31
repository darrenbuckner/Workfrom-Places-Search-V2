import React, { useRef, useCallback, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
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
  ChevronRight,
  BookOpen,
  X
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import WorkspaceGuide from './components/WorkspaceGuide';

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

const mapStyle = {
  default: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    config: {
      maxZoom: 19,
      subdomains: 'abcd',
      className: 'map-tiles-light'
    }
  }
};

// Update the map styles
const mapStyles = `
  .leaflet-container {
    background: var(--bg-primary);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  .map-tiles-light {
    filter: saturate(1.1) contrast(1.05) brightness(1.05);
  }

  /* Fix popup content margin */
  .leaflet-popup-content {
    margin: 0 !important;
  }

  /* Control and popup styles */
  .leaflet-control-zoom {
    border: none !important;
    background: var(--bg-primary) !important;
    backdrop-filter: blur(8px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05) !important;
  }

  .leaflet-control-zoom a {
    background: transparent !important;
    color: var(--text-primary) !important;
    border: 1px solid var(--border-primary) !important;
  }

  .leaflet-control-zoom a:hover {
    background: var(--bg-secondary) !important;
  }

  .leaflet-popup-content-wrapper {
    background-color: var(--bg-primary) !important;
    border: 1px solid var(--border-primary) !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
  }

  .leaflet-popup-tip {
    background-color: var(--bg-primary) !important;
    border: 1px solid var(--border-primary) !important;
    border-top: none !important;
    box-shadow: none !important;
  }

  .leaflet-popup-close-button {
    color: var(--text-primary) !important;
  }

  /* Ensure popup tip aligns with content wrapper border */
  .leaflet-popup-tip-container {
    overflow: visible !important;
  }

  @keyframes locationPulse {
    0% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 0.4;
    }
    70% {
      transform: translate(-50%, -50%) scale(2);
      opacity: 0;
    }
    100% {
      transform: translate(-50%, -50%) scale(2);
      opacity: 0;
    }
  }
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = mapStyles;
document.head.appendChild(styleSheet);

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
  const currentMapStyle = mapStyle.default;  // Always use default (light) style

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
    const color = isHighlighted 
      ? themeColors.accent.primary 
      : `${themeColors.accent.primary}`;
    
    return L.divIcon({
      html: `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: 3px solid ${themeColors.bg.primary};
          transition: transform 0.2s ease;
        "></div>
      `,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -(size/2 + 2)]
    });
  }, [themeColors]);

  const createUserIcon = useCallback(() => {
    const size = 64;
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
              width: 75%;
              height: 75%;
              background-color: ${themeColors.accent.primary};
              border-radius: 50%;
              opacity: 0.2;
              animation: locationPulse 2s infinite 0.3s;
            "></div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 24px;
              height: 24px;
              background-color: ${themeColors.accent.primary};
              border-radius: 50%;
              border: 4px solid ${themeColors.bg.primary};
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
              hover:bg-[var(--action-primary-hover)] transition-colors flex-1"
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

const [showGuide, setShowGuide] = useState(false);

return (
  <div className="rounded-lg overflow-hidden border border-[var(--border-primary)] map-container flex flex-col h-[calc(100vh-260px)]">
    <MapContainer 
      ref={mapRef}
      center={defaultPosition} 
      zoom={13} 
      style={{ height: 'calc(100vh - 260px)', width: '100%' }}
      className="" // Remove theme class from initial render
      zoomControl={false}
    >
      <MapController userLocation={userLocation} places={places} />
      
      <TileLayer
        url={currentMapStyle.url}
        attribution={currentMapStyle.attribution}
        {...currentMapStyle.config}
      />

      <ZoomControl position="bottomright" />

      {/* Search radius circle */}
      <Circle
        center={defaultPosition}
        radius={searchRadius * 1609.34}
        pathOptions={{
          color: themeColors.accent.primary,
          fillColor: themeColors.accent.primary,
          fillOpacity: 0.1,
          weight: 1,
          className: 'search-radius-circle'
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

      {/* Place markers wrapped in MarkerClusterGroup */}
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={50}
        showCoverageOnHover={false}
        iconCreateFunction={(cluster) => {
          return L.divIcon({
            html: `
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                background-color: var(--accent-primary);
                border-radius: 50%;
                border: 3px solid var(--bg-primary);
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--button-text);
                font-weight: 600;
                font-size: 14px;
              ">
                ${cluster.getChildCount()}
              </div>
            `,
            className: 'custom-cluster-marker',
            iconSize: L.point(40, 40),
            iconAnchor: [20, 20]
          });
        }}
      >
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
      </MarkerClusterGroup>
    </MapContainer>

    <button
      onClick={() => setShowGuide(true)}
      className="flex items-center gap-1 px-3 py-1.5 rounded-md
        bg-[var(--bg-secondary)] text-[var(--text-primary)]
        hover:bg-[var(--bg-tertiary)] transition-colors hidden"
    >
      <BookOpen size={16} />
      <span>Generate Guide</span>
    </button>

    {showGuide && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-[var(--bg-primary)] rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 flex justify-between items-center p-4 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]">
            <h2 className="text-lg font-semibold">Workspace Guide</h2>
            <button
              onClick={() => setShowGuide(false)}
              className="p-1 hover:bg-[var(--bg-secondary)] rounded-md"
            >
              <X size={20} />
            </button>
          </div>
          <WorkspaceGuide places={places} onClose={() => setShowGuide(false)} />
        </div>
      </div>
    )}
  </div>
);
};

export default NearbyPlacesMap;