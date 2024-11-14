import React from 'react';
import { 
  Wifi, 
  Phone, 
  Users, 
  Coffee, 
  Lock,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Focus,
  Brain,
  ChevronRight,
  Clock,
  ImageIcon,
  ZoomIn
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

const ClickableTitle = ({ place, onPhotoClick, className = "", showIcon = true }) => {
  if (!place) return null;

  return (
    <button
      onClick={() => onPhotoClick(place)}
      className={`
        group flex items-center gap-1.5 
        hover:text-[var(--accent-secondary)] 
        transition-colors w-full text-left
        ${className}
      `}
    >
      <span className="font-medium text-[var(--accent-primary)] group-hover:text-[var(--accent-secondary)]">
        {place.title}
      </span>
      {showIcon && (
        <ArrowRight 
          size={16} 
          className="opacity-0 group-hover:opacity-100 transition-opacity 
            text-[var(--accent-primary)] group-hover:text-[var(--accent-secondary)]" 
        />
      )}
    </button>
  );
};

const PlacesList = ({ places, onPhotoClick, limit = 2 }) => {
  if (!places?.length) return null;
  const displayPlaces = places.slice(0, limit);
  
  return (
    <div className="space-y-2">
      {displayPlaces.map((place, index) => (
        <div 
          key={place.ID} 
          className={`${index > 0 ? "mt-3 pt-3 border-t border-[var(--border-primary)]" : ""}`}
        >
          <ClickableTitle 
            place={place} 
            onPhotoClick={onPhotoClick}
          />
          <p className="text-sm text-[var(--text-secondary)]">
            {place.distance} miles away
          </p>
        </div>
      ))}
    </div>
  );
};

const FeaturedSpot = ({ place, analysisData, onPhotoClick }) => {
  const { isDark } = useTheme();
  const featuredSpotData = analysisData?.insights?.featured_spot;
  
  if (!featuredSpotData || !place) return null;

  const formatDistance = (distance) => {
    if (!distance) return 'Distance unknown';
    if (distance === 0) return 'You are here';
    
    const distNum = typeof distance === 'string' ? parseFloat(distance) : distance;
    return distNum < 0.1 ? 'Less than 0.1 miles away' :
           distNum < 10 ? `${distNum.toFixed(1)} miles away` :
           `${Math.round(distNum)} miles away`;
  };

  return (
    <div className="col-span-full">
      <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-primary)]">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-primary)]/20 
                to-[var(--accent-primary)]/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <div>
                <h3 className="text-base font-medium text-[var(--text-primary)]">
                  Featured Workspace
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Standout spot in your area
                </p>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-full text-xs font-medium
              bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
              {featuredSpotData.vibe}
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <ClickableTitle 
                  place={place} 
                  onPhotoClick={onPhotoClick}
                  className="text-lg mb-1.5"
                />
                <div className="text-sm text-[var(--text-secondary)]">
                  {formatDistance(place.distance)}
                </div>
                <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                  {featuredSpotData.highlight}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {featuredSpotData.best_for.map((activity, index) => (
                  <div
                    key={index}
                    className="px-2.5 py-1 rounded-md text-xs bg-[var(--bg-secondary)] 
                      text-[var(--text-secondary)] border border-[var(--border-primary)]"
                  >
                    Ideal for {activity}
                  </div>
                ))}
              </div>

              <div 
                onClick={() => onPhotoClick(place)}
                className="relative mt-4 rounded-lg overflow-hidden group cursor-pointer
                  border border-[var(--border-primary)] bg-[var(--bg-secondary)]"
              >
                <div className="aspect-w-16 aspect-h-9">
                  {place.thumbnail_img ? (
                    <img
                      src={place.thumbnail_img}
                      alt={place.title}
                      className="w-full h-full object-cover transition-transform duration-300 
                        group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = `/api/placeholder/800/450?text=No+image`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <ImageIcon size={24} className="text-[var(--text-tertiary)] mb-2" />
                      <span className="text-sm text-[var(--text-tertiary)]">No image available</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center 
                    bg-black/0 group-hover:bg-black/30 transition-all opacity-0 group-hover:opacity-100">
                    <span className="px-3 py-1.5 rounded-full bg-black/50 text-white text-sm 
                      flex items-center gap-1.5">
                      <ZoomIn size={14} />
                      View Details
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-72 flex-shrink-0">
              <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
                <h4 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
                  Key Features
                </h4>
                <div className="space-y-2.5">
                  {featuredSpotData.unique_features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="p-1 rounded-md bg-[var(--accent-primary)]/10 mt-0.5">
                        <ChevronRight size={12} className="text-[var(--accent-primary)]" />
                      </div>
                      <p className="text-sm text-[var(--text-primary)]">{feature}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--border-primary)]">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[var(--text-secondary)]" />
                    <span className="text-xs text-[var(--text-secondary)]">
                      Recommended time: {featuredSpotData.best_time_to_visit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InsightsSummary = ({ analysisData, places, locationName, onPhotoClick }) => {
  const { isDark } = useTheme();

  if (!places?.length) return null;

  const getFastestWifi = () => {
    const withWifi = places.filter(p => p.download && p.no_wifi !== "1");
    return withWifi.sort((a, b) => b.download - a.download);
  };

  const getCallSpaces = () => {
    return places.filter(p => {
      const noise = String(p.noise_level || p.noise || "").toLowerCase();
      const hasGoodWifi = p.download >= 25 && p.no_wifi !== "1";
      return (noise.includes('quiet') || noise.includes('moderate')) && hasGoodWifi;
    }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  };

  const getLivelySpaces = () => {
    return places.filter(p => {
      const noise = String(p.noise_level || p.noise || "").toLowerCase();
      return noise.includes('noisy') || noise.includes('high') || 
             noise.includes('moderate') || noise.includes('average');
    }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  };

  const getCozySpaces = () => {
    return places.filter(p => {
      const noise = String(p.noise_level || p.noise || "").toLowerCase();
      const type = String(p.type || "").toLowerCase();
      
      return (
        noise.includes('quiet') || 
        noise.includes('low') ||
        (type.includes('coffee') && noise.includes('moderate')) ||
        type.includes('library') ||
        (p.workabilityScore >= 7 && !noise.includes('noisy'))
      );
    }).sort((a, b) => {
      const noiseScoreA = getNoiseScore(a);
      const noiseScoreB = getNoiseScore(b);
      return noiseScoreB - noiseScoreA || parseFloat(a.distance) - parseFloat(b.distance);
    });
  };

  const getNoiseScore = (place) => {
    const noise = String(place.noise_level || place.noise || "").toLowerCase();
    if (noise.includes('quiet')) return 3;
    if (noise.includes('moderate')) return 2;
    if (noise.includes('noisy')) return 1;
    return 0;
  };

  const getMeetupSpaces = () => {
    return places.filter(p => {
      const type = String(p.type || "").toLowerCase();
      const hasSeating = true;
      const hasAmenities = p.food === "1" || p.coffee === "1" || 
                          type.includes('cafe') || type.includes('coffee');
      const noise = String(p.noise_level || p.noise || "").toLowerCase();
      
      return (
        (type.includes('cafe') || type.includes('coffee')) ||
        type.includes('coworking') ||
        (hasAmenities && hasSeating) ||
        (p.workabilityScore >= 6 && !noise.includes('quiet'))
      );
    }).sort((a, b) => {
      const scoreA = getMeetupScore(a);
      const scoreB = getMeetupScore(b);
      return scoreB - scoreA || parseFloat(a.distance) - parseFloat(b.distance);
    });
  };

  const getMeetupScore = (place) => {
    let score = 0;
    if (place.food === "1") score += 2;
    if (place.coffee === "1") score += 2;
    if (place.outdoor_seating === "1" || place.outside === "1") score += 1;
    if (place.type?.toLowerCase().includes('coworking')) score += 2;
    return score;
  };

  const getPrivateSpaces = () => {
    return places.filter(p => {
      const type = String(p.type || "").toLowerCase();
      const noise = String(p.noise_level || p.noise || "").toLowerCase();
      
      return (
        type.includes('coworking') ||
        type.includes('library') ||
        (noise.includes('quiet') && p.power?.includes('range')) ||
        (p.workabilityScore >= 7 && noise.includes('quiet'))
      );
    }).sort((a, b) => {
      const scoreA = getPrivacyScore(a);
      const scoreB = getPrivacyScore(b);
      return scoreB - scoreA || parseFloat(a.distance) - parseFloat(b.distance);
    });
  };

  const getPrivacyScore = (place) => {
    let score = 0;
    const type = String(place.type || "").toLowerCase();
    if (type.includes('coworking')) score += 3;
    if (type.includes('library')) score += 2;
    if (place.noise_level?.toLowerCase().includes('quiet')) score += 2;
    if (place.workabilityScore >= 7) score += 1;
    return score;
  };

  const fastestWifi = getFastestWifi();
  const callSpaces = getCallSpaces();
  const livelySpaces = getLivelySpaces();
  const cozySpaces = getCozySpaces();
  const meetupSpaces = getMeetupSpaces();
  const privateSpaces = getPrivateSpaces();

  const insights = [
    {
      icon: Wifi,
      title: "Fast WiFi Spots",
      subtitle: "Places with highest connection speeds",
      content: getFastestWifi().length ? (
        <PlacesList places={getFastestWifi()} onPhotoClick={onPhotoClick} />
      ) : "No WiFi speed data available",
      color: isDark ? "text-blue-400" : "text-blue-600",
      bgColor: isDark ? "bg-blue-400/10" : "bg-blue-600/10"
    },
    {
      icon: Phone,
      title: "Meeting-Ready Spaces",
      subtitle: "Quiet spots suitable for calls",
      content: getCallSpaces().length ? (
        <PlacesList places={getCallSpaces()} onPhotoClick={onPhotoClick} />
      ) : "No suitable meeting spaces found",
      color: isDark ? "text-green-400" : "text-green-600",
      bgColor: isDark ? "bg-green-400/10" : "bg-green-600/10"
    },
    {
      icon: Users,
      title: "Social Spaces",
      subtitle: "Energetic spots with a buzz",
      content: getLivelySpaces().length ? (
        <PlacesList places={getLivelySpaces()} onPhotoClick={onPhotoClick} />
      ) : "No social spaces found",
      color: isDark ? "text-purple-400" : "text-purple-600",
      bgColor: isDark ? "bg-purple-400/10" : "bg-purple-600/10"
    },
    {
      icon: Focus,
      title: "Focus Spots",
      subtitle: "Quiet spaces for concentration",
      content: getCozySpaces().length ? (
        <PlacesList places={getCozySpaces()} onPhotoClick={onPhotoClick} />
      ) : "No focus spaces found",
      color: isDark ? "text-amber-400" : "text-amber-600",
      bgColor: isDark ? "bg-amber-400/10" : "bg-amber-600/10"
    },
    {
      icon: Coffee,
      title: "Group Spaces",
      subtitle: "Perfect for team meetings",
      content: getMeetupSpaces().length ? (
        <PlacesList places={getMeetupSpaces()} onPhotoClick={onPhotoClick} />
      ) : "No group spaces found",
      color: isDark ? "text-rose-400" : "text-rose-600",
      bgColor: isDark ? "bg-rose-400/10" : "bg-rose-600/10"
    },
    {
      icon: Lock,
      title: "Private Spaces",
      subtitle: "Secluded spots for focused work",
      content: getPrivateSpaces().length ? (
        <PlacesList places={getPrivateSpaces()} onPhotoClick={onPhotoClick} />
      ) : "No private spaces found",
      color: isDark ? "text-indigo-400" : "text-indigo-600",
      bgColor: isDark ? "bg-indigo-400/10" : "bg-indigo-600/10"
    }
  ];

  return (
    <div className="rounded-lg border border-[var(--border-primary)] overflow-hidden bg-[var(--bg-secondary)]">
      <div className="p-2 sm:p-4 grid gap-2 sm:gap-4 sm:grid-cols-2">
        <FeaturedSpot 
          place={places.find(p => p.title === analysisData?.insights?.featured_spot?.place_name)}
          analysisData={analysisData}
          onPhotoClick={onPhotoClick}
        />
        {insights.map((insight, index) => (
          <div
            key={index}
            className="flex flex-col p-4 rounded-lg border border-[var(--border-primary)]
              bg-[var(--bg-primary)]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg ${insight.bgColor}
                  flex items-center justify-center flex-shrink-0`}>
                  <insight.icon className={`w-4 h-4 ${insight.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">
                    {insight.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {insight.subtitle}
                  </p>
                </div>
              </div>
              <Sparkles size={16} className="text-[var(--accent-primary)] opacity-50" />
            </div>
            {insight.content}
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border-primary)] bg-[var(--bg-primary)] p-4">
        <div className="flex items-start gap-2.5">
          <MessageSquare className="w-4 h-4 text-[var(--accent-primary)] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Note: Most spaces welcome brief calls, but consider booking private rooms for longer meetings. 
            Always check current amenities and peak hours at each location.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsightsSummary;