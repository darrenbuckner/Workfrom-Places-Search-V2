import React, { useEffect, useRef, useState } from 'react';
import { 
  X, Loader, Navigation, Quote, ChevronLeft, Wifi, Battery, 
  Volume2, Clock, WifiOff, Users, Info, Star, StarHalf, StarOff, 
  Coffee, AlertCircle, ImageIcon,
  ZoomIn, ArrowRight 
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { getWifiStatus } from './wifiUtils';
import WorkabilityScore from './WorkabilityScore';
import WifiCredentials from './components/WifiCredentials';
import StarRating from './components/StarRating';
import WorkabilityMetrics from './components/WorkabilityMetrics';
import ExpandableMetricBadge from './ExpandableMetricBadge';
import LocationSection from './LocationSection';
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

// Power related functions
const getPowerLabel = (place) => {
  const powerValue = String(place.power || '').toLowerCase();
  if (powerValue.includes('range3') || powerValue.includes('good')) return "Many Outlets";
  if (powerValue.includes('range2')) return "Some Outlets";
  if (powerValue.includes('range1') || powerValue.includes('little')) return "Limited Power";
  if (powerValue === 'none') return "No Power";
  return "Power Unknown";
};

const getPowerDetails = (place) => {
  const powerValue = String(place.power || '').toLowerCase();
  if (powerValue.includes('range3') || powerValue.includes('good')) return "Abundant power access throughout";
  if (powerValue.includes('range2')) return "Moderate power availability";
  if (powerValue.includes('range1') || powerValue.includes('little')) return "Sparse outlet availability";
  if (powerValue === 'none') return "No power outlets available";
  return "Power outlet availability not confirmed";
};

const getPowerRecommendations = (place) => {
  const powerValue = String(place.power || '').toLowerCase();
  if (powerValue.includes('range3') || powerValue.includes('good')) return "Most seats have easy outlet access";
  if (powerValue.includes('range2')) return "Choose seating strategically for outlet access";
  if (powerValue.includes('range1') || powerValue.includes('little')) return "Arrive with devices charged";
  if (powerValue === 'none') return "Bring fully charged devices";
  return "Check with staff about outlet access";
};

const getPowerStats = (place) => {
  const powerValue = String(place.power || '').toLowerCase();
  if (powerValue.includes('range3') || powerValue.includes('good')) {
    return [
      "Outlets at >75% of seats",
      "High availability throughout",
      "Extension cords usually allowed"
    ];
  }
  if (powerValue.includes('range2')) {
    return [
      "Outlets at ~50% of seats",
      "Moderate availability",
      "May need to plan seating"
    ];
  }
  if (powerValue.includes('range1') || powerValue.includes('little')) {
    return [
      "Outlets at <25% of seats",
      "Limited availability",
      "Best to bring backup power"
    ];
  }
  if (powerValue === 'none') {
    return [
      "No public outlets",
      "Not suitable for long sessions",
      "Backup power recommended"
    ];
  }
  return [
    "Availability varies",
    "Ask staff for locations",
    "Consider bringing backup"
  ];
};

// Noise related functions
const getNoiseLabel = (place) => {
  const noise = String(place.noise_level || place.noise || "").toLowerCase();
  if (noise.includes('quiet')) return "Quiet";
  if (noise.includes('moderate')) return "Moderate";
  if (noise.includes('noisy')) return "Lively";
  return "Noise Unknown";
};

const getNoiseDetails = (place) => {
  const noise = String(place.noise_level || place.noise || "").toLowerCase();
  if (noise.includes('quiet')) return "Library-like atmosphere";
  if (noise.includes('moderate')) return "Balanced noise level";
  if (noise.includes('noisy')) return "Energetic atmosphere";
  return "Noise level varies";
};

const getNoiseRecommendations = (place) => {
  const noise = String(place.noise_level || place.noise || "").toLowerCase();
  if (noise.includes('quiet')) return "Ideal for focused work";
  if (noise.includes('moderate')) return "Good for most work styles";
  if (noise.includes('noisy')) return "Best with noise-canceling headphones";
  return "Levels may vary by time of day";
};

const getNoiseStats = (place) => {
  const noise = String(place.noise_level || place.noise || "").toLowerCase();
  if (!noise) return undefined;

  return [
    noise.includes('quiet') ? "Good for concentration" :
    noise.includes('moderate') ? "Normal conversation level" :
    noise.includes('noisy') ? "Higher conversation level" : "Variable noise levels",
    
    noise.includes('quiet') ? "Minimal conversation" :
    noise.includes('moderate') ? "Some background noise" :
    noise.includes('noisy') ? "Notable background noise" : "Noise levels not confirmed"
  ];
};

// WiFi related functions
const getWifiLabel = (place) => {
  if (place.no_wifi === "1") return "No WiFi";
  if (!place.download) return "WiFi Available";
  const speed = Math.round(place.download);
  return speed >= 50 ? "Fast WiFi" :
         speed >= 25 ? "Very Good WiFi" :
         speed >= 10 ? "Good WiFi" :
         `${speed} Mbps`;
};

const getWifiDetails = (place) => {
  if (place.no_wifi === "1") return "No WiFi service available";
  if (!place.download) return "WiFi available, speed unknown";
  const speed = Math.round(place.download);
  return `${speed}+ Mbps download speed`;
};

const getWifiRecommendations = (place) => {
  if (place.no_wifi === "1") return "Consider bringing a mobile hotspot";
  if (!place.download) return "Ask staff about typical speeds";
  const speed = Math.round(place.download);
  return speed >= 50 ? "Excellent for video calls and large file transfers" :
         speed >= 25 ? "Good for most remote work needs" :
         speed >= 10 ? "Suitable for basic work tasks" :
         "Best for light web browsing";
};

const getWifiStats = (place) => {
  if (place.no_wifi === "1") {
    return ["No public WiFi", "Mobile data recommended", "Hotspot may be needed"];
  }
  if (!place.download) return undefined;
  
  const speed = Math.round(place.download);
  return [
    speed >= 50 ? "HD Video Calls ✓" : "Video Calls: May be unstable",
    speed >= 25 ? "Multiple Devices ✓" : "Limited Devices",
    speed >= 10 ? "Web Browsing ✓" : "Basic Web Only"
  ];
};

const PhotoModal = ({ selectedPlace, fullImg, isPhotoLoading, setShowPhotoModal }) => {
  const { isDark } = useTheme();
  const contentRef = useRef(null);
  const progress = useScrollPosition(contentRef);
  
  useScrollLock(true);

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
    if (place.outdoor_seating === undefined && !place.outside) {
      missingAmenities.push("outdoor seating");
    }
    
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:overflow-hidden">
      <div className="absolute inset-0 bg-[var(--modal-backdrop)] backdrop-blur-xl" />
      
      {/* Mobile Header */}
      <div className="flex-shrink-0 md:hidden sticky top-0 z-20 bg-[var(--bg-primary)] border-b border-[var(--border-primary)]">
        <div className="flex items-center justify-between p-3">
          <button 
            onClick={() => setShowPhotoModal(false)}
            className="flex items-center text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h2 className="text-base font-semibold text-center flex-1 mx-4 truncate text-[var(--text-primary)]">
            {selectedPlace?.title}
          </h2>
          <div className="w-8" />
        </div>
      </div>

      <div className="relative flex-grow flex md:items-center md:justify-center overflow-hidden">
        <div className="w-full h-full md:w-[90vw] md:max-w-6xl md:h-[85vh] md:flex 
          md:rounded-lg overflow-hidden relative
          bg-[var(--bg-primary)] border border-[var(--border-primary)]
          shadow-[var(--shadow-lg)]">
          
          {/* Close Button */}
          <button 
            onClick={() => setShowPhotoModal(false)}
            className="hidden md:flex absolute right-4 top-4 z-20 items-center justify-center 
              w-8 h-8 rounded-full
              bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] 
              text-[var(--text-primary)] transition-colors"
          >
            <X size={20} />
          </button>

          <div ref={contentRef} className="h-full overflow-y-auto md:flex flex-grow">
            <div className="relative md:flex md:w-full">
              {/* Image Section */}
              <div className="relative md:w-3/5 flex-shrink-0 bg-[var(--bg-primary)] transform-gpu overflow-hidden"
                style={{ height: window.innerWidth >= 768 ? '100%' : '35vh' }}>
                <div className={`h-full ${window.innerWidth >= 768 ? 'absolute inset-0' : ''}`}>
                  {isPhotoLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-primary)]">
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
                        bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-transparent"
                        style={{ 
                          opacity: 0.3 + Math.min(progress * 0.7, 0.7),
                          transition: 'opacity 0.2s ease-out'
                        }}
                      />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-secondary)]">
                      <div className="text-center">
                        <ImageIcon size={32} className="mx-auto mb-2 text-[var(--text-tertiary)]" />
                        <p className="text-sm text-[var(--text-secondary)]">No image available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="relative flex-1 md:w-2/5 border-l border-[var(--border-primary)]">
                <div className="p-4 space-y-4">
                  <div className="hidden md:block">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                      {selectedPlace?.title}
                    </h2>
                  </div>

                  <LocationSection place={selectedPlace} />

                  <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-baseline gap-3">
                          <StarRating score={selectedPlace.workabilityScore} variant="large" />
                          <span className="text-sm text-[var(--text-secondary)]">
                            {selectedPlace.workabilityScore.toFixed(1)}/10
                          </span>
                        </div>
                        <div className="px-2.5 py-1 rounded-full text-xs font-medium
                          bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                          {getScoreQuality(selectedPlace.workabilityScore).label}
                        </div>
                      </div>
                      
                      <div className="text-sm font-medium text-[var(--text-primary)] mb-4">
                        {getScoreQuality(selectedPlace.workabilityScore).label} for Remote Work
                      </div>

                      <WorkabilityMetrics place={selectedPlace} />
                    </div>
                  </div>

                  {selectedPlace.password && (
                    <WifiCredentials password={selectedPlace.password} />
                  )}

                  {sanitizedDescription && (
                    <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                      <div className="p-4">
                        <div className="flex items-start gap-2.5 mb-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 
                              flex items-center justify-center">
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
                          <p className="text-sm text-[var(--text-primary)] leading-relaxed pl-3">
                            {sanitizedDescription}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {getMissingInfo(selectedPlace).length > 0 && (
                    <div className="hidden rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                      <div className="p-4">
                        <div className="flex items-start gap-2.5">
                          <AlertCircle 
                            size={16} 
                            className="flex-shrink-0 text-[var(--accent-primary)] mt-0.5" 
                          />
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