import React from 'react';
import { 
  Navigation, 
  Wifi, 
  WifiOff, 
  Battery,
  Volume2,
  Clock,
  Coffee,
  Users,
  ImageIcon,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import DistanceDisplay from './DistanceDisplay';
import { useTheme } from './ThemeProvider';
import { getWifiStatus } from './wifiUtils';

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

const PlaceCard = ({ place, onPhotoClick, isRecommended }) => {
  const { isDark } = useTheme();

  // Helper function for power availability
  const getPowerStatus = () => {
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

  // Helper function for noise level
  const getNoiseLevel = () => {
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

  const wifiStatus = getWifiStatus(place, isDark);
  const powerStatus = getPowerStatus();
  const noiseLevel = getNoiseLevel();
  const amenities = [
    place.coffee === "1" && { label: "Coffee", icon: Coffee },
    place.food === "1" && { label: "Food", icon: Coffee },
    (place.outdoor_seating === "1" || place.outside === "1") && { label: "Outdoor", icon: Coffee }
  ].filter(Boolean);

  return (
    <div className={`
      relative rounded-lg border transition-all duration-200
      ${isRecommended 
        ? 'border-[var(--accent-primary)] shadow-lg bg-[var(--bg-primary)]' 
        : 'border-[var(--border-primary)] hover:shadow-md bg-[var(--bg-secondary)]'
      }
    `}>
      <div className="p-4">
        {/* Header Section */}
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div 
            onClick={() => onPhotoClick(place)}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer
              bg-[var(--bg-tertiary)] transition-transform hover:scale-105"
          >
            {place.thumbnail_img ? (
              <img
                src={place.thumbnail_img}
                alt={place.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `/api/placeholder/96/96?text=No+image`;
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
                {isRecommended && (
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full 
                    bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] 
                    text-xs font-medium w-fit mb-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI Pick</span>
                  </div>
                )}
                <h2 
                  onClick={() => onPhotoClick(place)}
                  className="text-lg font-semibold text-[var(--text-primary)] 
                    hover:text-[var(--action-primary)] cursor-pointer truncate"
                >
                  {place.title}
                </h2>
                <DistanceDisplay 
                  distance={place.distance} 
                  className="mt-1"
                />
              </div>
              
              <div 
                onClick={() => onPhotoClick(place)}
                className={`
                  flex-shrink-0 w-12 h-12 rounded-lg cursor-pointer
                  flex items-center justify-center font-bold text-lg
                  bg-[var(--accent-primary)] text-[var(--button-text)]
                  transition-transform hover:scale-105
                `}
              >
                {place.workabilityScore}
              </div>
            </div>

            {/* Metrics Section */}
            <div className="mt-3 space-y-1.5">
              <div className="flex flex-wrap gap-1.5">
                <MetricBadge 
                  icon={wifiStatus.icon === 'WifiOff' ? WifiOff : Wifi}
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

              {/* Amenities */}
              {amenities.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {amenities.map((amenity, index) => (
                    <div 
                      key={index}
                      className="inline-flex items-center gap-1.5 px-2 py-1 
                        rounded-md bg-[var(--bg-tertiary)]
                        text-[var(--text-secondary)]"
                    >
                      <amenity.icon size={14} />
                      <span className="text-xs">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-3 flex-wrap mt-4">
          <button
            onClick={() => onPhotoClick(place)}
            className={`
              flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-md
              transition-colors
              bg-[var(--accent-primary)] text-[var(--button-text)]
              hover:bg-[var(--accent-secondary)]
            `}
          >
            View Details
            <ArrowRight size={16} />
          </button>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              `${place.street}, ${place.city}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-medium
              bg-[var(--bg-tertiary)] text-[var(--interactive-text)]
              hover:text-[var(--interactive-hover)]
              hover:bg-[var(--bg-tertiary)]/80
              px-3 py-1.5 rounded-md transition-colors"
          >
            <Navigation size={14} />
            Directions
          </a>
        </div>
      </div>

      {isRecommended && (
        <div className="absolute -top-px left-0 right-0 h-1 bg-[var(--accent-primary)]" />
      )}
    </div>
  );
};

export default PlaceCard;