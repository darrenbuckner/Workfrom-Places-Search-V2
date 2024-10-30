import React from 'react';
import { 
  Navigation, 
  Copy, 
  AlertTriangle,
  User,
  Wifi,
  WifiOff,
  ImageIcon,
  Brain,
  Sparkles
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

const PlaceCard = ({ place, onPhotoClick, isRecommended, highlight }) => {
  const isPromoted = place.owner_promoted_flag === "1";
  const { isDark } = useTheme();

  // Add animation keyframes effect
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes recommendedPulse {
        0%, 100% { opacity: 0.9; }
        50% { opacity: 1; }
      }
      @keyframes recommendedBrainPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  
  const copyAddressToClipboard = (address) => {
    navigator.clipboard.writeText(address).then(
      () => alert('Address copied to clipboard!'),
      (err) => console.error('Could not copy text: ', err)
    );
  };

  const getGoogleMapsUrl = (address) => 
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  const getPlaceholderBg = () => {
    if (isPromoted) return 'e5e7eb';
    if (isRecommended) return 'e2e8f0';
    return 'e5e7eb';
  };

  const getWifiDisplay = (place) => {
    if (place.no_wifi === "1") return "No WiFi";
    if (place.download) {
      const speed = Math.round(place.download);
      if (speed >= 50) return "Excellent";
      if (speed >= 20) return "Very Good";
      if (speed >= 10) return "Good";
      return "Basic";
    }
    return "Unknown";
  };

  const getPowerDisplay = (power) => {
    const powerValue = String(power || '').toLowerCase();
    if (powerValue === 'none' || powerValue === '') return 'No outlets';
    if (powerValue.includes('range3') || powerValue.includes('good')) return 'Abundant';
    if (powerValue.includes('range2')) return 'Good';
    if (powerValue.includes('range1') || powerValue.includes('little')) return 'Limited';
    return 'Unknown';
  };

  return (
    <div className={`
      relative group 
      ${isRecommended ? 'pt-8' : ''}
    `}>
      {/* Card Container */}
      <div className={`
        relative border rounded shadow-sm 
        transition-all duration-300
        ${isPromoted 
          ? 'border-[var(--promoted-border)] bg-[var(--promoted-bg)]' 
          : isRecommended
            ? `border-[var(--accent-primary)] border-2 bg-[var(--bg-primary)] 
               shadow-lg hover:shadow-xl
               ${highlight ? 'ring-2 ring-[var(--accent-primary)] ring-opacity-50' : ''}`
            : 'border-[var(--border-primary)] hover:shadow-md'
        }
        ${isRecommended ? 'transform scale-[1.02]' : ''}
      `}>
        <div className="p-4">
          <div className="flex flex-col space-y-4">
            {/* Header with Title and Score */}
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h2 className={`
                  text-xl font-semibold mb-1 cursor-pointer
                  transition-colors
                  ${isPromoted 
                    ? 'text-[var(--promoted-text)] hover:text-[var(--promoted-text)]/90' 
                    : 'text-text-primary hover:text-[var(--action-primary)]'
                  }
                  truncate block
                `}
                  title={place.title}
                  onClick={() => onPhotoClick(place)}
                >
                  {place.title}
                </h2>
                <p className={`text-sm ${
                  isPromoted 
                    ? 'text-[var(--promoted-secondary)]' 
                    : isDark && isRecommended
                      ? 'text-white'
                      : 'text-[var(--text-secondary)]'
                }`}>
                  Distance: {place.distance} miles
                </p>
              </div>
              
              <div onClick={() => onPhotoClick(place)}
                className={`
                  flex items-center cursor-pointer
                  hover:opacity-80 transition-opacity
                  font-medium
                  ${isPromoted 
                    ? 'text-[var(--promoted-text)]'
                    : isDark && isRecommended
                      ? 'text-white'
                      : 'text-[var(--text-primary)]'
                  }
                `}
              >
                {place.workabilityScore}/10
              </div>
            </div>

            {/* Image and Details */}
            <div className="flex space-x-4">
              <div onClick={() => onPhotoClick(place)}
                className={`
                  w-24 h-24 rounded flex-shrink-0 overflow-hidden cursor-pointer
                  group relative
                  ${isPromoted
                    ? 'bg-[var(--promoted-tag-bg)]'
                    : isRecommended
                      ? 'bg-[var(--bg-primary)]/10'
                      : 'bg-[var(--bg-tertiary)]'
                  }
                `}
              >
                {place.thumbnail_img ? (
                  <img
                    src={place.thumbnail_img}
                    alt={place.title}
                    className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/96x96/${getPlaceholderBg()}/94a3b8?text=No+image&font=raleway`;
                    }}
                  />
                ) : (
                  <div className={`
                    w-full h-full flex flex-col items-center justify-center
                    transition-colors group-hover:bg-opacity-90
                    ${isPromoted
                      ? 'bg-[var(--promoted-tag-bg)]'
                      : isRecommended
                        ? 'bg-[var(--bg-primary)]/10'
                        : 'bg-[var(--bg-tertiary)]'
                    }
                  `}>
                    <ImageIcon 
                      size={20} 
                      className={`mb-1 ${
                        isPromoted
                          ? 'text-[var(--promoted-secondary)]'
                          : isDark && isRecommended
                            ? 'text-white'
                            : 'text-text-tertiary'
                      }`} 
                    />
                    <span className={`
                      text-xs text-center
                      ${isPromoted
                        ? 'text-[var(--promoted-secondary)]'
                        : isDark && isRecommended
                          ? 'text-white'
                          : 'text-text-tertiary'
                      }
                    `}>
                      No image
                    </span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* WiFi Status */}
                <div className="text-sm flex items-center">
                  <span className="text-text-primary mr-1">WiFi:</span>
                  <span className="font-medium truncate text-text-primary">
                    {getWifiDisplay(place)}
                  </span>
                </div>

                {/* Power Status */}
                <div className="text-sm flex items-center">
                  <span className="text-text-primary mr-1">Power Outlets:</span>
                  <span className="font-medium truncate text-text-primary">
                    {getPowerDisplay(place.power)}
                  </span>
                </div>

                {/* Noise Level */}
                <div className="text-sm flex items-center">
                  <span className="text-text-primary mr-1">Noise Levels:</span>
                  <span className="font-medium truncate text-text-primary">
                    {place.mappedNoise}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
              {place.os && (
                <div className={`text-sm flex items-center flex-shrink truncate ${
                  isPromoted 
                    ? 'text-[var(--promoted-secondary)]' 
                    : isDark && isRecommended
                      ? 'text-white'
                      : 'text-[var(--text-secondary)]'
                }`}>
                  <User size={16} className="mr-1 flex-shrink-0" />
                  <span className="truncate">{place.os}</span>
                </div>
              )}
              
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => window.open(getGoogleMapsUrl(
                    `${place.street}, ${place.city}, ${place.postal}`
                  ), '_blank')}
                  className={`
                    text-sm flex items-center transition-colors
                    text-[var(--action-primary)] hover:text-[var(--action-primary-hover)]
                  `}
                >
                  <Navigation size={16} className="mr-1 flex-shrink-0" />
                  <span>Get Directions</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;