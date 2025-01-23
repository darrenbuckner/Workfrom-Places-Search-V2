import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Loader, MapPin, Navigation, Star, Clock, AlertCircle, ImageIcon, 
  Coffee, Wifi, WifiOff, Volume2, Users, Sparkles, Building, ChevronRight 
} from 'lucide-react';
import API_CONFIG from '../config';
import StarRating from '../components/StarRating';
import ImageFallback from '../components/ImageFallback';

const LoadingState = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const messages = [
    "Analyzing workspace amenities and features...",
    "Processing community insights and reviews...",
    "Calculating optimal matches for your needs...",
    "Creating personalized recommendations...",
    "Almost ready with your custom guide..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="flex items-center gap-3 mb-2">
          <Loader className="w-5 h-5 text-[var(--accent-primary)] animate-spin" />
          <span className="text-[var(--text-primary)] font-medium">
            {messages[currentMessage]}
          </span>
        </div>
        
        <div className="text-sm text-[var(--text-secondary)] max-w-md">
          Our AI is analyzing workspace data, community reviews, and amenities to create 
          your personalized guide. This typically takes 5-10 seconds.
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-md mt-2">
          {[
            { icon: Wifi, label: "WiFi Analysis" },
            { icon: Users, label: "Community Data" },
            { icon: Building, label: "Space Features" }
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 p-3
              rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)]">
              <Icon className="w-5 h-5 text-[var(--accent-primary)]" />
              <span className="text-xs text-[var(--text-secondary)]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PlaceInsight = ({ place, recommendation, onViewDetails }) => {
  const [imageError, setImageError] = useState(false);
  const getWifiLabel = () => {
    if (place.no_wifi === "1") return "No WiFi";
    if (place.download >= 50) return "Very Fast WiFi";
    if (place.download >= 25) return "Fast WiFi";
    if (place.download >= 10) return "Good WiFi";
    return "WiFi Available";
  };

  const getNoiseLabel = () => {
    const noise = String(place.noise_level || place.noise || "").toLowerCase();
    if (noise.includes('quiet')) return "Quiet atmosphere";
    if (noise.includes('moderate')) return "Moderate noise level";
    if (noise.includes('noisy')) return "Lively environment";
    return "Noise level varies";
  };

  return (
    <article 
      onClick={() => onViewDetails(place)}
      className="group cursor-pointer border-b border-[var(--border-primary)] last:border-0 py-6"
    >
      <div className="flex flex-col sm:flex-row sm:gap-6">
        {/* Image Section */}
        <div className="w-full sm:w-48 flex-shrink-0 mb-4 sm:mb-0">
          <div className="relative h-0 pb-[56.25%] sm:pb-[75%] rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
            {place.thumbnail_img ? (
              <img
                src={place.thumbnail_img}
                alt={place.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300
                  group-hover:scale-105"
                onError={(e) => e.target.style.display = 'none'}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageFallback 
                  size="large" 
                  showText 
                  className="!w-full !h-full" 
                />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <header className="mb-3">
            <h3 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]
              group-hover:text-[var(--accent-primary)] transition-colors">
              {place.title}
            </h3>
            <div className="flex items-center gap-3 mt-2">
              {typeof place.workabilityScore !== 'undefined' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <StarRating score={place.workabilityScore} />
                    <span className="text-sm text-[var(--text-secondary)]">
                      {place.workabilityScore.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-[var(--text-secondary)]">•</span>
                </>
              )}
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-[var(--text-secondary)]" />
                <span className="text-sm text-[var(--text-secondary)]">
                  {place.distance} miles
                </span>
              </div>
            </div>
          </header>

          <div className="flex flex-wrap gap-y-2 gap-x-3 mb-3 text-sm text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <Wifi size={14} className="text-[var(--text-tertiary)]" />
              {getWifiLabel()}
            </span>
            <span className="flex items-center gap-1.5">
              <Volume2 size={14} className="text-[var(--text-tertiary)]" />
              {getNoiseLabel()}
            </span>
            {place.coffee === "1" && (
              <span className="flex items-center gap-1.5">
                <Coffee size={14} className="text-[var(--text-tertiary)]" />
                Coffee available
              </span>
            )}
          </div>

          {recommendation?.tips?.[0] && (
            <div className="flex items-start gap-2 mt-3 sm:mt-4 p-3 rounded-lg
              bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
              <Sparkles size={14} className="text-[var(--accent-primary)] mt-1 flex-shrink-0" />
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {recommendation.tips[0]}
              </p>
            </div>
          )}

          <div className="mt-3 sm:mt-4 inline-flex items-center gap-1 text-sm font-medium 
            text-[var(--accent-primary)] group-hover:text-[var(--accent-secondary)] transition-colors">
            View details
            <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </article>
  );
};

const WorkspaceGuide = ({ places, location, onViewDetails }) => {
  const [guideData, setGuideData] = useState({
    guide: null,
    expandedPlaces: [],
    loading: true,
    error: null,
    contentReady: false
  });
  const mounted = useRef(false);
  const MINIMUM_PLACES = 3;

  // Move getQualifiedPlaces inside component
  const getQualifiedPlaces = useCallback((placesList) => {
    return placesList
      .filter(place => 
        place.thumbnail_img || 
        place.description || 
        place.download || 
        place.noise_level || 
        place.noise
      )
      .sort((a, b) => b.workabilityScore - a.workabilityScore);
  }, []);

  // Move fetchExtendedPlaces inside component
  const fetchExtendedPlaces = useCallback(async () => {
    const initialQualified = getQualifiedPlaces(places);
    
    if (initialQualified.length >= MINIMUM_PLACES) {
      return initialQualified.slice(0, 5);
    }

    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/places/ll/${location.latitude},${location.longitude}?radius=2&appid=${API_CONFIG.appId}&rpp=50`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.meta?.error_detail || 'Failed to fetch additional places');
      }

      const data = await response.json();
      const extendedPlaces = data.response || [];
      
      const allPlaces = [
        ...places,
        ...extendedPlaces.filter(newPlace => 
          !places.some(existing => existing.ID === newPlace.ID)
        )
      ];

      const qualifiedPlaces = getQualifiedPlaces(allPlaces);
      return qualifiedPlaces.slice(0, 5);
    } catch (error) {
      console.error('Failed to fetch extended places:', error);
      return initialQualified;
    }
  }, [places, location, getQualifiedPlaces]);

  const fetchGuide = useCallback(async () => {
    if (!location?.latitude || !location?.longitude) {
      setGuideData(prev => ({ ...prev, loading: false }));
      return;
    }

    setGuideData(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      contentReady: false 
    }));

    try {
      const selectedPlaces = await fetchExtendedPlaces();

      await new Promise(resolve => setTimeout(resolve, 800));

      // Create a more casual, relatable prompt
      const guidePrompt = {
        system: `You're a friendly local remote worker sharing insider tips about the best spots to work. 
        Write in a casual, approachable style using everyday language. Feel free to use common expressions 
        and be conversational - like you're texting a friend. Keep the format strictly as this JSON:
        {
          "title": "Area nickname/vibe: Key feature",
          "overview": "2-3 casual sentences about what makes this area cool for remote work",
          "recommendations": [
            {
              "id": "place_id",
              "name": "Place Name", 
              "description": "Why you'd dig working here",
              "tips": ["Real talk tip 1", "Pro tip 2"],
              "peakHours": "When it gets busy/quiet",
              "transit": "How to get there, local style"
            }
          ]
        }
        Skip formal language - keep it real but helpful.`,
        
        user: `Tell me about these spots for remote work at ${location.latitude}, ${location.longitude}

        Here's what we know about them:
        ${JSON.stringify(selectedPlaces, null, 2)}

        Give me the real scoop on:
        - Which spots have WiFi that actually works
        - Where to snag a good outlet
        - The noise situation
        - When these places get packed/quiet
        - Any unique perks worth knowing about`
      };

      const response = await fetch('/.netlify/functions/api/generate-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          places: selectedPlaces,
          location,
          appid: API_CONFIG.appId,
          prompt: guidePrompt
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      setGuideData({
        guide: result.guide,
        expandedPlaces: selectedPlaces,
        loading: false,
        error: null,
        contentReady: true
      });

    } catch (error) {
      console.error('Guide generation error:', error);
      setGuideData(prev => ({
        ...prev,
        error: error.message,
        loading: false,
        contentReady: false
      }));
    }
  }, [location, fetchExtendedPlaces]);

  useEffect(() => {
    setGuideData(prev => ({
      ...prev,
      loading: true,
      error: null,
      contentReady: false
    }));

    fetchGuide();

    return () => {
      mounted.current = false;
    };
  }, [fetchGuide]);

  if (guideData.loading) {
    return <LoadingState />;
  }

  if (guideData.error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-500">Guide Generation Failed</h3>
            <p className="text-sm text-red-500/90 mt-1">{guideData.error}</p>
            <button 
              onClick={fetchGuide}
              className="mt-3 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Only render content when both places and guide are ready
  if (!guideData.contentReady) {
    return null;
  }

  const hasExpandedRadius = guideData.expandedPlaces.some(place => 
    parseFloat(place.distance) > 0.5
  );

  return (
    <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)]">
      {guideData.guide && (
        <div className="p-4 sm:p-6 border-b border-[var(--border-primary)]">
          <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] mb-2 sm:mb-3">
            <Building size={16} className="text-[var(--accent-primary)]" />
            <span>Local Workspace Guide</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2 sm:mb-3">
            {guideData.guide.title}
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {guideData.guide.overview}
          </p>
        </div>
      )}

      <div className="divide-y divide-[var(--border-primary)]">
        {guideData.expandedPlaces.map((place) => {
          const recommendation = guideData.guide?.recommendations?.find(r => 
            r.id === place.ID || r.name === place.title
          );

          return (
            <div key={place.ID} className="px-4 sm:px-6">
              <PlaceInsight
                place={place}
                recommendation={recommendation}
                onViewDetails={onViewDetails}
              />
            </div>
          );
        })}
      </div>

      {guideData.guide && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="text-[var(--accent-primary)] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Recommendations based on community insights and real workspace data.
              {guideData.expandedPlaces.some(place => parseFloat(place.distance) > 0.5) && 
                " Some locations may be slightly outside your initial search area but are worth considering."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceGuide;