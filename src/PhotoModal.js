import React, { useEffect, useRef, useState } from 'react';
import { 
  X, Loader, Navigation, Quote, ChevronLeft, Wifi, Battery, 
  Volume2, Clock, WifiOff, Users, Info, Star, StarHalf, StarOff, 
  Coffee, AlertCircle 
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { getWifiStatus } from './wifiUtils';
import WorkabilityScore from './WorkabilityScore';
import { useScrollLock } from './useScrollLock';

const stripHtml = (html) => {
  if (!html) return '';
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const useScrollPosition = (ref) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!ref.current || window.innerWidth >= 768) return;

    const handleScroll = () => {
      const scrollTop = ref.current.scrollTop;
      const viewportHeight = window.innerHeight;
      const triggerDistance = viewportHeight * 0.35;
      const progress = Math.min(Math.max(scrollTop / triggerDistance, 0), 1);
      setProgress(progress);
    };

    const element = ref.current;
    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [ref]);

  return progress;
};

const PhotoModal = ({ selectedPlace, fullImg, isPhotoLoading, setShowPhotoModal }) => {
  const { isDark } = useTheme();
  const contentRef = useRef(null);
  const progress = useScrollPosition(contentRef);
  useScrollLock(true);

  const getWorkabilityMetrics = (place) => {
    const metrics = [];
    
    // Add WiFi metric
    const wifiStatus = getWifiStatus(place, isDark);
    metrics.push({
      icon: wifiStatus.icon === 'WifiOff' ? WifiOff : Wifi,
      label: "WiFi",
      value: wifiStatus.value,
      color: wifiStatus.color,
      iconColor: wifiStatus.iconColor
    });

    // Power Availability
    const powerValue = String(place.power || '').toLowerCase();
    let powerStatus = { value: "Unknown" };
    if (powerValue === 'none' || powerValue === '') {
      powerStatus = { 
        value: "Not Available", 
        color: isDark ? "text-red-400" : "text-red-500",
        iconColor: isDark ? "text-red-400" : "text-red-500" 
      };
    } else if (powerValue.includes('range3') || powerValue.includes('good')) {
      powerStatus = { 
        value: "Abundant",
        color: isDark ? "text-green-400" : "text-green-500",
        iconColor: isDark ? "text-green-400" : "text-green-500"
      };
    } else if (powerValue.includes('range2')) {
      powerStatus = { 
        value: "Good",
        color: isDark ? "text-yellow-400" : "text-yellow-500",
        iconColor: isDark ? "text-yellow-400" : "text-yellow-500"
      };
    } else if (powerValue.includes('range1') || powerValue.includes('little')) {
      powerStatus = { 
        value: "Limited",
        color: isDark ? "text-yellow-400" : "text-yellow-500",
        iconColor: isDark ? "text-yellow-400" : "text-yellow-500"
      };
    }
    metrics.push({ icon: Battery, label: "Power", ...powerStatus });

    // Noise Level
    const noise = place.noise_level || place.noise || "Unknown";
    let noiseStatus = { 
      value: noise, 
      color: isDark ? "text-gray-400" : "text-gray-500",
      iconColor: isDark ? "text-gray-400" : "text-gray-500"
    };
    if (noise.toLowerCase().includes('quiet')) {
      noiseStatus = {
        value: "Quiet",
        color: isDark ? "text-green-400" : "text-green-500",
        iconColor: isDark ? "text-green-400" : "text-green-500"
      };
    } else if (noise.toLowerCase().includes('moderate')) {
      noiseStatus = {
        value: "Moderate",
        color: isDark ? "text-yellow-400" : "text-yellow-500",
        iconColor: isDark ? "text-yellow-400" : "text-yellow-500"
      };
    } else if (noise.toLowerCase().includes('noisy')) {
      noiseStatus = {
        value: "Noisy",
        color: isDark ? "text-yellow-400" : "text-yellow-500",
        iconColor: isDark ? "text-yellow-400" : "text-yellow-500"
      };
    }
    metrics.push({ icon: Volume2, label: "Noise", ...noiseStatus });

    return metrics;
  };

  const getMissingInfo = (place) => {
      const missing = [];
      
      if (!place.download && place.no_wifi !== "1") missing.push("WiFi speed");
      if (!place.power) missing.push("power outlet availability");
      if (!place.noise_level && !place.noise) missing.push("noise level");
      if (!place.full_img && !place.thumbnail_img) missing.push("photos");
      if (!place.description) missing.push("workspace description");
      if (!place.hours) missing.push("operating hours");
      
      const missingAmenities = [];
      if (place.coffee === undefined) missingAmenities.push("coffee availability");
      if (place.food === undefined) missingAmenities.push("food options");
      if (place.outdoor_seating === undefined && !place.outside) missingAmenities.push("outdoor seating");
      
      if (missingAmenities.length > 0) {
        missing.push("amenity details (" + missingAmenities.join(", ") + ")");
      }
      
      return missing;
    };

    const formatMissingInfo = (missingItems) => {
      if (missingItems.length === 0) return "";
      if (missingItems.length === 1) return missingItems[0];
      if (missingItems.length === 2) return `${missingItems[0]} and ${missingItems[1]}`;
      const lastItem = missingItems[missingItems.length - 1];
      const otherItems = missingItems.slice(0, -1).join(", ");
      return `${otherItems}, and ${lastItem}`;
    };

    // Get Score quality details
    const getScoreQuality = (score) => {
      if (score >= 8) return { label: 'Excellent', stars: 3 };
      if (score >= 6) return { label: 'Good', stars: 2 };
      if (score >= 4) return { label: 'Fair', stars: 1 };
      return { label: 'Limited', stars: 0 };
    };

    useEffect(() => {
      const handleEscape = (event) => {
        if (event.key === 'Escape') setShowPhotoModal(false);
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }, [setShowPhotoModal]);

    if (!selectedPlace) return null;

    const sanitizedDescription = stripHtml(selectedPlace?.description);
    const getGoogleMapsUrl = (address) => 
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    const metrics = getWorkabilityMetrics(selectedPlace);

    return (
      <div className="fixed inset-0 z-50 bg-[var(--modal-overlay)] backdrop-blur-sm flex flex-col md:overflow-hidden">
        {/* Mobile Header */}
        <div className="flex-shrink-0 md:hidden sticky top-0 z-20 bg-[var(--bg-primary)] border-b border-[var(--border-primary)]">
          <div className="flex items-center justify-between p-3">
            <button 
              onClick={() => setShowPhotoModal(false)}
              className="flex items-center text-[var(--text-primary)] hover:text-[var(--text-secondary)]"
            >
              <ChevronLeft size={20} className="mr-1" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h2 className="text-base font-semibold text-center flex-1 mx-4 truncate text-[var(--text-primary)]">
              {selectedPlace?.title || 'Place Details'}
            </h2>
            <div className="w-8" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex md:items-center md:justify-center overflow-hidden">
          <div className="w-full h-full md:w-[90vw] md:max-w-6xl md:h-[85vh] md:flex 
            md:rounded-lg border overflow-hidden relative
            bg-[var(--bg-primary)] border-[var(--border-primary)]">
            
            {/* Desktop Close Button */}
            <button 
              onClick={() => setShowPhotoModal(false)}
              className="hidden md:flex absolute right-4 top-4 z-20 items-center justify-center 
                w-8 h-8 rounded-full transition-colors
                bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]
                text-[var(--text-primary)]"
            >
              <X size={20} />
            </button>

            {/* Content Container */}
            <div ref={contentRef} className="h-full overflow-y-auto md:flex flex-grow">
              <div className="relative md:flex md:w-full">
                {/* Image Section */}
                <div className="relative md:w-3/5 flex-shrink-0 bg-black transform-gpu overflow-hidden"
                  style={{ height: window.innerWidth >= 768 ? '100%' : '35vh' }}>
                  <div className={`h-full ${window.innerWidth >= 768 ? 'absolute inset-0' : ''}`}>
                    {isPhotoLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black">
                        <Loader size={32} className="text-[var(--accent-primary)] animate-spin" />
                      </div>
                    ) : fullImg ? (
                      <>
                        <div className="absolute inset-0 transform-gpu transition-transform duration-200"
                          style={{
                            transform: window.innerWidth < 768 
                              ? `scale(${1 + Math.min(progress * 0.05, 0.05)})` 
                              : 'none'
                          }}>
                          <img
                            src={fullImg}
                            alt={selectedPlace?.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = `/api/placeholder/800/600?text=Image not available`;
                            }}
                          />
                        </div>
                        <div className="absolute inset-x-0 -bottom-1 h-32 pointer-events-none md:hidden
                          bg-gradient-to-t from-black via-black/80 to-transparent"
                          style={{ 
                            opacity: 0.3 + Math.min(progress * 0.7, 0.7),
                            transition: 'opacity 0.2s ease-out'
                          }}
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-secondary)]">
                        <p className="text-sm text-[var(--text-secondary)]">No image available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Section */}
                <div className="relative flex-1 md:w-2/5">
                  <div className="p-4 space-y-4">
                    {/* Title & Location */}
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                        {selectedPlace?.title}
                      </h2>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm text-[var(--text-secondary)]">{selectedPlace?.street}</p>
                          <p className="text-sm text-[var(--text-secondary)]">{selectedPlace?.city}</p>
                        </div>
                        {selectedPlace?.street && selectedPlace?.city && (
                          <a
                            href={getGoogleMapsUrl(`${selectedPlace.street}, ${selectedPlace.city}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-1.5 rounded-md
                              bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)]
                              text-white text-sm transition-colors"
                          >
                            <Navigation size={14} className="mr-1.5" />
                            Directions
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Workability Score Section */}
                    <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-hidden">
                      {/* Score Header */}
                      <div className="p-4 bg-[var(--bg-primary)]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-[var(--accent-primary)]">
                              {selectedPlace.workabilityScore}
                            </span>
                            <span className="text-sm text-[var(--text-secondary)]">/10</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(3)].map((_, i) => {
                              const quality = getScoreQuality(selectedPlace.workabilityScore);
                              const StarIcon = i < quality.stars ? Star : i === quality.stars - 0.5 ? StarHalf : StarOff;
                              return (
                                <StarIcon 
                                  key={i} 
                                  size={16} 
                                  className="text-[var(--accent-primary)]"
                                  fill={i < quality.stars ? "currentColor" : "none"}
                                />
                              );
                            })}
                          </div>
                        </div>
                        <div className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                          {getScoreQuality(selectedPlace.workabilityScore).label} for Remote Work
                        </div>

                        {/* Workability Metrics Grid */}
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          {metrics.map((metric, index) => (
                            <div key={index} 
                              className="p-2.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]"
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <metric.icon size={14} className={metric.iconColor} />
                                <span className="text-xs text-[var(--text-secondary)]">{metric.label}</span>
                              </div>
                              <div className={`text-sm font-medium ${metric.color}`}>
                                {metric.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Community Perspective Section */}
                    {sanitizedDescription && (
                      <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                        <div className="p-4">
                          <div className="flex items-start gap-2.5 mb-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
                                <Users className="w-4 h-4 text-[var(--accent-primary)]" />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-[var(--text-primary)]">
                                Community Perspective
                              </h3>
                              {selectedPlace?.os && (
                                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                  Shared by Workfrom member {selectedPlace.os}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="relative">
                            <Quote className="absolute -left-1 -top-1 w-4 h-4 text-[var(--accent-primary)] opacity-20" />
                            <p className="text-[var(--text-primary)] leading-relaxed pl-3">
                              {sanitizedDescription}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Missing Info Section */}
                    {getMissingInfo(selectedPlace).length > 0 && (
                      <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                        <div className="p-4">
                          <div className="flex items-start gap-2.5">
                            <AlertCircle size={16} className="flex-shrink-0 text-[var(--accent-primary)] mt-0.5" />
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                              Help other members by adding {formatMissingInfo(getMissingInfo(selectedPlace))}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default PhotoModal;