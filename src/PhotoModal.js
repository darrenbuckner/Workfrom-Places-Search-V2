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

const MetricBadge = ({ icon: Icon, label, color, className = "" }) => {
  const { isDark } = useTheme();
  
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

const PhotoModal = ({ selectedPlace, fullImg, isPhotoLoading, setShowPhotoModal }) => {
  const { isDark } = useTheme();
  const contentRef = useRef(null);
  const progress = useScrollPosition(contentRef);
  
  const getWifiStyle = (place) => {
    if (place.no_wifi === "1") return 'unavailable';
    if (!place.download) return 'unknown';
    return 'available';
  };

  const getPowerStyle = (place) => {
    const powerValue = String(place.power || '').toLowerCase();
    if (powerValue.includes('range3') || powerValue.includes('good')) return 'full';
    if (powerValue.includes('range2')) return 'limited';
    return 'none';
  };

  const getNoiseStyle = (place) => {
    const noise = String(place.noise_level || place.noise || '').toLowerCase();
    if (noise.includes('quiet')) return 'quiet';
    if (noise.includes('moderate')) return 'moderate';
    return 'noisy';
  };

  const getWorkabilityMetrics = (place) => {
    // WiFi Metric
    const getWifiMetric = () => {
      if (place.no_wifi === "1") {
        return {
          type: 'wifi',
          icon: WifiOff,
          noWifi: true,
          label: "No WiFi",
          details: "This location does not provide WiFi access",
          recommendations: "Consider bringing a mobile hotspot"
        };
      }

      if (place.download) {
        const speed = Math.round(place.download);
        return {
          type: 'wifi',
          icon: Wifi,
          download: speed,
          label: speed >= 50 ? "Fast WiFi" : speed >= 25 ? "Very Good WiFi" : speed >= 10 ? "Good WiFi" : `${speed} Mbps`,
          details: `${speed}+ Mbps download speed`,
          recommendations: speed >= 50 ? "Excellent for video calls and large file transfers" :
                          speed >= 25 ? "Good for most remote work needs" :
                          speed >= 10 ? "Suitable for basic work tasks" :
                          "Best for light web browsing",
          stats: [
            speed >= 50 ? "HD Video Calls ✓" : "Video Calls: May be unstable",
            speed >= 25 ? "Multiple Devices ✓" : "Limited Devices",
            speed >= 10 ? "Web Browsing ✓" : "Basic Web Only"
          ]
        };
      }

      return {
        type: 'wifi',
        icon: Wifi,
        download: 0,
        label: "WiFi Available",
        details: "Speed data not available",
        recommendations: "Ask staff about typical speeds"
      };
    };

    // Power Metric
    const getPowerMetric = () => {
      const powerValue = String(place.power || '').toLowerCase();
      
      if (powerValue.includes('range3') || powerValue.includes('good')) {
        return {
          type: 'power',
          icon: Battery,
          powerValue: powerValue,
          label: "Many Outlets",
          details: "Abundant power access throughout",
          recommendations: "Most seats have easy outlet access",
          stats: [
            "Outlets at >75% of seats",
            "High availability throughout",
            "Extension cords usually allowed"
          ]
        };
      }
      
      if (powerValue.includes('range2')) {
        return {
          type: 'power',
          icon: Battery,
          powerValue: powerValue,
          label: "Some Outlets",
          details: "Moderate power availability",
          recommendations: "Choose seating strategically for outlet access",
          stats: [
            "Outlets at ~50% of seats",
            "Moderate availability",
            "May need to plan seating"
          ]
        };
      }
      
      if (powerValue.includes('range1') || powerValue.includes('little')) {
        return {
          type: 'power',
          icon: Battery,
          powerValue: powerValue,
          label: "Limited Power",
          details: "Sparse outlet availability",
          recommendations: "Arrive with devices charged",
          stats: [
            "Outlets at <25% of seats",
            "Limited availability",
            "Best to bring backup power"
          ]
        };
      }
      
      if (powerValue === 'none') {
        return {
          type: 'power',
          icon: Battery,
          powerValue: powerValue,
          label: "No Power",
          details: "No power outlets available",
          recommendations: "Bring fully charged devices",
          stats: [
            "No public outlets",
            "Not suitable for long sessions",
            "Backup power recommended"
          ]
        };
      }
      
      return {
        type: 'power',
        icon: Battery,
        powerValue: powerValue,
        label: "Power Unknown",
        details: "Power outlet availability not confirmed",
        recommendations: "Check with staff about outlet access",
        stats: [
          "Availability varies",
          "Ask staff for locations",
          "Consider bringing backup"
        ]
      };
    };

    // Noise Metric
    const getNoiseMetric = () => {
      const noiseLevel = (place.noise_level || place.noise || "").toLowerCase();
      return {
        type: 'noise',
        icon: Volume2,
        noiseLevel: noiseLevel,
        label: noiseLevel.includes('quiet') ? "Quiet" :
               noiseLevel.includes('moderate') ? "Moderate" :
               noiseLevel.includes('noisy') ? "Lively" : "Unknown",
        details: noiseLevel.includes('quiet') ? "Library-like atmosphere" :
                 noiseLevel.includes('moderate') ? "Balanced noise level" :
                 noiseLevel.includes('noisy') ? "Energetic atmosphere" : "Noise level varies",
        recommendations: noiseLevel.includes('quiet') ? "Ideal for focused work" :
                        noiseLevel.includes('moderate') ? "Good for most work styles" :
                        noiseLevel.includes('noisy') ? "Best with noise-canceling headphones" :
                        "Levels may vary by time of day",
        stats: noiseLevel ? [
          noiseLevel.includes('quiet') ? "Good for concentration" :
          noiseLevel.includes('moderate') ? "Normal conversation level" :
          noiseLevel.includes('noisy') ? "Higher conversation level" : "Variable noise levels",
          noiseLevel.includes('quiet') ? "Minimal conversation" :
          noiseLevel.includes('moderate') ? "Some background noise" :
          noiseLevel.includes('noisy') ? "Notable background noise" : "Noise levels not confirmed"
        ] : undefined
      };
    };

    return [
      getWifiMetric(),
      getPowerMetric(),
      getNoiseMetric()
    ];
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
  const metrics = getWorkabilityMetrics(selectedPlace);

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:overflow-hidden">
      <div className="absolute inset-0 bg-[var(--modal-backdrop)] backdrop-blur-xl" />
      
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
          shadow-lg">
          
          <button 
            onClick={() => setShowPhotoModal(false)}
            className="hidden md:flex absolute right-4 top-4 z-20 items-center justify-center 
              w-8 h-8 rounded-full transition-colors
              bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]
              text-[var(--text-primary)]"
          >
            <X size={20} />
          </button>

          <div ref={contentRef} className="h-full overflow-y-auto md:flex flex-grow">
            <div className="relative md:flex md:w-full">
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
                      <div className="text-center">
                        <ImageIcon size={32} className="mx-auto mb-2 text-[var(--text-tertiary)]" />
                        <p className="text-sm text-[var(--text-secondary)]">No image available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative flex-1 md:w-2/5 border-l border-[var(--modal-border)]">
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
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-[var(--accent-primary)]">
                            {selectedPlace.workabilityScore}
                          </span>
                          <span className="text-sm text-[var(--text-secondary)]">/10</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(3)].map((_, i) => {
                            const quality = getScoreQuality(selectedPlace.workabilityScore);
                            const StarIcon = i < quality.stars ? Star : 
                                           i === quality.stars - 0.5 ? StarHalf : StarOff;
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
                      
                      <div className="text-sm font-medium text-[var(--text-primary)] mb-4">
                        {getScoreQuality(selectedPlace.workabilityScore).label} for Remote Work
                      </div>

                      {/* Metrics Section - Updated Layout */}
                      <div className="flex flex-wrap gap-2">
                        {getWorkabilityMetrics(selectedPlace).map((metric, index) => (
                          <ExpandableMetricBadge
                            key={index}
                            metric={metric}
                            className="flex-shrink-0"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

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
                    <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
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