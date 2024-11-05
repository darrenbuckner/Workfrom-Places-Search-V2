import React from 'react';
import { 
  Navigation, 
  Copy, 
  AlertTriangle,
  User,
  Wifi,
  WifiOff,
  ImageIcon,
  Brain
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

const AIBadge = ({ className = "" }) => (
  <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full 
    bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium ${className}`}>
    <Brain className="w-3 h-3" />
    <span>AI Pick</span>
  </div>
);

const PlaceCard = ({ place, onPhotoClick, isRecommended, highlight }) => {
  const isPromoted = place.owner_promoted_flag === "1";
  const { isDark } = useTheme();
  
  const getPlaceholderBg = () => {
    if (isPromoted) return 'e5e7eb';
    if (isRecommended) return 'e2e8f0';
    return 'e5e7eb';
  };

  

  const getGoogleMapsUrl = (address) => 
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <div className={`
      relative group 
      ${isRecommended ? '' : ''}
    `}>
      {/* Card Container */}
      <div className={`
        relative border rounded shadow-sm 
        transition-all duration-300
        ${isPromoted 
          ? 'border-[var(--promoted-border)] bg-[var(--promoted-bg)]' 
          : isRecommended
            ? `border-[var(--border-primary)] bg-[var(--bg-primary)] 
               shadow-lg hover:shadow-xl`
            : 'border-[var(--border-primary)] hover:shadow-md'
        }
      `}>
        <div className="p-4">
          <div className="flex flex-col space-y-4">
            {/* Header with Title, Score, and AI Badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* AI Badge for recommended places */}
                {isRecommended && (
                  <AIBadge className="mb-2" />
                )}
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
              
              {/* Updated Score Badge */}
              <div 
                onClick={() => onPhotoClick(place)}
                className="flex-shrink-0 w-12 h-12 rounded-md cursor-pointer
                  bg-[var(--accent-primary)] text-white
                  flex items-center justify-center font-bold text-lg
                  transition-transform hover:scale-105"
              >
                {place.workabilityScore}
              </div>
            </div>

            {/* Image */}
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