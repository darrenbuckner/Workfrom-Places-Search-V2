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
import ImageFallback from './ImageFallback';

const MetricBadge = ({ icon: Icon, label, color, className = "" }) => {
  const { isDark } = useTheme();
  
  // Color mapping for different metrics
  const colorStyles = {
    wifi: {
      available: {
        icon: isDark ? "text-emerald-400" : "text-emerald-600",
        text: isDark ? "text-emerald-300" : "text-emerald-700",
        bg: isDark ? "bg-emerald-400/10" : "bg-emerald-50",
        border: isDark ? "border-emerald-400/20" : "border-emerald-100"
      },
      unavailable: {
        icon: isDark ? "text-red-400" : "text-red-600",
        text: isDark ? "text-red-300" : "text-red-700",
        bg: isDark ? "bg-red-400/10" : "bg-red-50",
        border: isDark ? "border-red-400/20" : "border-red-100"
      },
      unknown: {
        icon: isDark ? "text-slate-400" : "text-slate-600",
        text: isDark ? "text-slate-300" : "text-slate-700",
        bg: isDark ? "bg-slate-400/10" : "bg-slate-50",
        border: isDark ? "border-slate-400/20" : "border-slate-100"
      }
    },
    power: {
      full: {
        icon: isDark ? "text-emerald-400" : "text-emerald-600",
        text: isDark ? "text-emerald-300" : "text-emerald-700",
        bg: isDark ? "bg-emerald-400/10" : "bg-emerald-50",
        border: isDark ? "border-emerald-400/20" : "border-emerald-100"
      },
      limited: {
        icon: isDark ? "text-amber-400" : "text-amber-600",
        text: isDark ? "text-amber-300" : "text-amber-700",
        bg: isDark ? "bg-amber-400/10" : "bg-amber-50",
        border: isDark ? "border-amber-400/20" : "border-amber-100"
      },
      none: {
        icon: isDark ? "text-red-400" : "text-red-600",
        text: isDark ? "text-red-300" : "text-red-700",
        bg: isDark ? "bg-red-400/10" : "bg-red-50",
        border: isDark ? "border-red-400/20" : "border-red-100"
      }
    },
    noise: {
      quiet: {
        icon: isDark ? "text-emerald-400" : "text-emerald-600",
        text: isDark ? "text-emerald-300" : "text-emerald-700",
        bg: isDark ? "bg-emerald-400/10" : "bg-emerald-50",
        border: isDark ? "border-emerald-400/20" : "border-emerald-100"
      },
      moderate: {
        icon: isDark ? "text-amber-400" : "text-amber-600",
        text: isDark ? "text-amber-300" : "text-amber-700",
        bg: isDark ? "bg-amber-400/10" : "bg-amber-50",
        border: isDark ? "border-amber-400/20" : "border-amber-100"
      },
      noisy: {
        icon: isDark ? "text-blue-400" : "text-blue-600",
        text: isDark ? "text-blue-300" : "text-blue-700",
        bg: isDark ? "bg-blue-400/10" : "bg-blue-50",
        border: isDark ? "border-blue-400/20" : "border-blue-100"
      }
    }
  };

  const getWifiStyle = (label) => {
    if (label.includes('No WiFi')) return colorStyles.wifi.unavailable;
    if (label === 'Unknown') return colorStyles.wifi.unknown;
    return colorStyles.wifi.available;
  };

  const getPowerStyle = (label) => {
    if (label.includes('Many') || label.includes('Good')) return colorStyles.power.full;
    if (label.includes('Limited') || label.includes('Some')) return colorStyles.power.limited;
    return colorStyles.power.none;
  };

  const getNoiseStyle = (label) => {
    if (label === 'Quiet') return colorStyles.noise.quiet;
    if (label === 'Moderate') return colorStyles.noise.moderate;
    return colorStyles.noise.noisy;
  };

  let style;
  if (Icon === Wifi || Icon === WifiOff) {
    style = getWifiStyle(label);
  } else if (Icon === Battery) {
    style = getPowerStyle(label);
  } else if (Icon === Volume2) {
    style = getNoiseStyle(label);
  }

  return (
    <div className={`
      inline-flex items-center gap-1.5 px-2 py-1 rounded-md
      ${style.bg} ${style.border} border
      ${className}
    `}>
      <Icon size={14} className={style.icon} />
      <span className={`text-xs font-medium ${style.text}`}>
        {label}
      </span>
    </div>
  );
};

const PlaceCard = ({ place, onPhotoClick, isRecommended }) => {
  const { isDark } = useTheme();

  // Helper function for power availability
  const getPowerStatus = () => {
    const powerValue = String(place.power || '').toLowerCase();
    if (powerValue === 'none' || powerValue === '') {
      return { label: "No Power" };
    }
    if (powerValue.includes('range3') || powerValue.includes('good')) {
      return { label: "Many Outlets" };
    }
    if (powerValue.includes('range2')) {
      return { label: "Some Outlets" };
    }
    return { label: "Limited Power" };
  };

  // Helper function for noise level
  const getNoiseLevel = () => {
    const noise = (place.noise_level || place.noise || "").toLowerCase();
    if (noise.includes('quiet')) {
      return { label: "Quiet" };
    }
    if (noise.includes('moderate')) {
      return { label: "Moderate" };
    }
    if (noise.includes('noisy')) {
      return { label: "Lively" };
    }
    return { label: "Unknown" };
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
                  e.target.src = `/api/placeholder/64/64?text=No+image`;
                }}
              />
            ) : (
              <ImageFallback size="default" />
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
                />
                <MetricBadge 
                  icon={Battery} 
                  label={powerStatus.label}
                />
                <MetricBadge 
                  icon={Volume2} 
                  label={noiseLevel.label}
                />
              </div>

              {/* Amenities */}
              {amenities.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {amenities.map((amenity, index) => (
                    <div 
                      key={index}
                      className="inline-flex items-center gap-1.5 px-2 py-1 
                        rounded-md border border-[var(--border-primary)]
                        bg-[var(--bg-primary)]
                        text-[var(--text-primary)]"
                    >
                      <amenity.icon size={14} className="text-[var(--text-secondary)]" />
                      <span className="text-xs font-medium">
                        {amenity.label}
                      </span>
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