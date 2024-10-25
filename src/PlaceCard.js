import React from 'react';
import { 
  Navigation, 
  Copy, 
  AlertTriangle,
  Star,
  Trophy,
  User,
  Wifi,
  WifiOff,
  ImageIcon
} from 'lucide-react';
import LazyImage from './LazyImage';
import WorkabilityScore from './WorkabilityScore';

const PlaceCard = ({ place, onPhotoClick }) => {
  const isPromoted = place.owner_promoted_flag === "1";
  
  const copyAddressToClipboard = (address) => {
    navigator.clipboard.writeText(address).then(
      () => alert('Address copied to clipboard!'),
      (err) => console.error('Could not copy text: ', err)
    );
  };

  const getGoogleMapsUrl = (address) => 
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <div 
      className={`
        border rounded shadow-sm hover:shadow-md transition-shadow relative
        ${isPromoted 
          ? 'border-[var(--promoted-border)] bg-[var(--promoted-bg)]' 
          : 'border-border-primary'
        }
      `}
    >
      <div className="p-4">
        <div className="flex flex-col space-y-4">
          {/* Header with Title and Score */}
          <div className="flex items-start gap-3">
            {/* Title and Distance Container */}
            <div className="flex-1 min-w-0">
              <h2 
                className={`
                  text-xl font-semibold mb-1 cursor-pointer
                  hover:text-[var(--action-primary)] transition-colors
                  ${isPromoted ? 'text-[var(--promoted-text)]' : 'text-text-primary'}
                  truncate block
                `}
                title={place.title}
                onClick={() => onPhotoClick(place)}
              >
                {place.title}
              </h2>
              <p className={`text-sm ${
                isPromoted ? 'text-[var(--promoted-secondary)]' : 'text-text-secondary'
              }`}>
                Distance: {place.distance} miles
              </p>
            </div>
            
            {/* Score Badge */}
            <div 
              onClick={() => onPhotoClick(place)}
              className={`
                flex items-center px-3 py-1 rounded-full flex-shrink-0 cursor-pointer
                hover:opacity-90 transition-all duration-200
                ${isPromoted 
                  ? 'bg-[var(--promoted-tag-bg)]' 
                  : 'bg-[var(--place-tag-bg)]'
                }
              `}
            >
              {isPromoted && (
                <Trophy 
                  size={14} 
                  className="mr-1.5 text-[var(--promoted-tag-text)]" 
                />
              )}
              <span className={`
                font-medium whitespace-nowrap
                ${isPromoted 
                  ? 'text-[var(--promoted-tag-text)]' 
                  : 'text-[var(--place-tag-text)]'
                }
              `}>
                {place.workabilityScore}/100
              </span>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex space-x-4">
            {/* Thumbnail */}
            <div 
              onClick={() => onPhotoClick(place)}
              className={`
                w-24 h-24 rounded flex-shrink-0 overflow-hidden cursor-pointer
                group relative
                ${isPromoted
                  ? 'bg-[var(--promoted-tag-bg)]'
                  : 'bg-[var(--bg-tertiary)]'
                }
              `}
            >
              {place.thumbnail_img ? (
                <LazyImage
                  src={place.thumbnail_img}
                  alt={place.title}
                  placeholder="https://placehold.co/100x100/e5e7eb/e5e7eb?text=Loading...&font=raleway"
                  className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                />
              ) : (
                <div className={`
                  w-full h-full flex flex-col items-center justify-center
                  transition-colors group-hover:bg-opacity-90
                  ${isPromoted
                    ? 'bg-[var(--promoted-tag-bg)]'
                    : 'bg-[var(--bg-tertiary)]'
                  }
                `}>
                  <ImageIcon 
                    size={20} 
                    className={`mb-1 ${
                      isPromoted
                        ? 'text-[var(--promoted-secondary)]'
                        : 'text-text-tertiary'
                    }`}
                  />
                  <span className={`
                    text-xs text-center
                    ${isPromoted
                      ? 'text-[var(--promoted-secondary)]'
                      : 'text-text-tertiary'
                    }
                  `}>
                    No image
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              {/* WiFi Status */}
              <div className="mb-2">
                <p className={`text-sm flex items-center ${
                  isPromoted 
                    ? 'text-[var(--promoted-feature-icon)]' 
                    : 'text-[var(--place-feature-icon)]'
                }`}>
                  {place.no_wifi === "1" ? (
                    <>
                      <WifiOff size={16} className="mr-1.5 flex-shrink-0" />
                      <span className="truncate">No WiFi Available</span>
                    </>
                  ) : place.download ? (
                    <>
                      <Wifi size={16} className="mr-1.5 flex-shrink-0" />
                      <span className="truncate">WiFi Speed: {Math.round(place.download)} Mbps</span>
                    </>
                  ) : (
                    <>
                      <Wifi size={16} className="mr-1.5 flex-shrink-0" />
                      <span className="truncate">WiFi Status Unknown</span>
                    </>
                  )}
                </p>
              </div>

              {/* Noise Level */}
              <div className={`text-sm flex items-center ${
                isPromoted ? 'text-[var--promoted-text)]' : 'text-text-primary'
              }`}>
                <span className="mr-1">Noise Levels:</span>
                <span className="font-medium truncate">
                  {place.mappedNoise}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
            {/* Author */}
            {place.os && (
              <div className={`text-sm flex items-center flex-shrink truncate ${
                isPromoted ? 'text-[var(--promoted-secondary)]' : 'text-text-secondary'
              }`}>
                <User size={16} className="mr-1 flex-shrink-0" />
                <span className="truncate">{place.os}</span>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => window.open(getGoogleMapsUrl(
                  `${place.street}, ${place.city}, ${place.postal}`
                ), '_blank')}
                className="text-[var(--action-primary)] hover:text-[var(--action-primary-hover)] 
                  text-sm flex items-center transition-colors"
              >
                <Navigation size={16} className="mr-1 flex-shrink-0" />
                <span className="hidden sm:inline">Get Directions</span>
                <span className="sm:hidden">Directions</span>
              </button>

              <button
                onClick={() => copyAddressToClipboard(
                  `${place.street}, ${place.city}, ${place.postal}`
                )}
                className="text-[var(--action-primary)] hover:text-[var(--action-primary-hover)] 
                  text-sm flex items-center transition-colors"
              >
                <Copy size={16} className="mr-1 flex-shrink-0" />
                <span className="hidden sm:inline">Copy Address</span>
                <span className="sm:hidden">Copy</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;