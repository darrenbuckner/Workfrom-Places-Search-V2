import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, ArrowRight, Navigation, Loader, X, Brain, Clock, Users, MapPin, Wifi, Battery, Volume2 } from 'lucide-react';
import { SearchPhases } from './constants';
import ErrorMessage from './ErrorMessage';
import API_CONFIG from './config';

const LoadingState = ({ loadingMessage }) => (
  <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 animate-fadeIn">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
        <Loader className="w-4 h-4 text-[var(--accent-primary)] animate-spin" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-[var(--text-primary)]">
          {loadingMessage}
        </div>
        <div className="mt-2 h-1 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
          <div 
            className="h-full w-full rounded-full animate-loading-shimmer"
            style={{
              background: `linear-gradient(
                90deg,
                var(--bg-tertiary) 0%,
                var(--accent-primary) 50%,
                var(--bg-tertiary) 100%
              )`,
              backgroundSize: '200% 100%'
            }}
          />
        </div>
      </div>
    </div>
  </div>
);

const QuickMatch = ({ 
  places,
  searchPhase,
  onRecommendationMade,
  onPhotoClick,
  isHidden,
  onHide,
  onError
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('Finding your perfect workspace...');
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const analysisRequestedRef = useRef(false);

  const loadingMessages = [
    'Finding your perfect workspace...',
    'Analyzing workspace details...',
    'Checking community insights...',
    'Almost ready...'
  ];

  // Loading message rotation
  useEffect(() => {
    if (!isAnalyzing) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[currentIndex]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Reset analysis state when places change
  useEffect(() => {
    if (places?.length === 0) {
      setRecommendation(null);
      setError(null);
      analysisRequestedRef.current = false;
    }
  }, [places]);

  const handleError = (error) => {
    const errorMessage = {
      title: 'Analysis Error',
      message: error.message || 'Unable to analyze workspaces at this time.',
      variant: 'warning'
    };
    setError(errorMessage);
    onError?.(errorMessage);
  };

  const analyzeAndRecommend = useCallback(async () => {
    if (isAnalyzing || !places.length || analysisRequestedRef.current) return;
    
    setIsAnalyzing(true);
    setError(null);
    analysisRequestedRef.current = true;

    try {
      const placesForAnalysis = places.slice(0, 10).map(place => ({
        name: place.title,
        city: place.city,
        state: place.state,
        distance: place.distance,
        wifi: place.download ? `${Math.round(place.download)} Mbps` : 
              place.no_wifi === "1" ? "No WiFi" : "Unknown",
        noise: place.noise_level || place.noise || 'Unknown',
        power: place.power || 'Unknown',
        type: place.type || 'Unknown',
        workabilityScore: place.workabilityScore || 0,
        amenities: {
          coffee: Boolean(place.coffee),
          food: Boolean(place.food),
          alcohol: Boolean(place.alcohol),
          outdoorSeating: place.outdoor_seating === '1' || Boolean(place.outside)
        }
      }));

      const response = await fetch(`${API_CONFIG.baseUrl}/analyze-workspaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ places: placesForAnalysis })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze workspaces');
      }

      const data = await response.json();
      
      if (data.meta.code === 200 || data.meta.code === 207) {
        const recommendedPlace = places.find(p => p.title === data.insights.recommendation.name);
        
        if (recommendedPlace) {
          const recommendation = {
            place: recommendedPlace,
            headline: data.insights.recommendation.headline,
            lede: data.insights.recommendation.lede,
            personalNote: data.insights.recommendation.personalNote,
            standoutFeatures: data.insights.recommendation.standoutFeatures,
            context: data.insights.context
          };
          
          setRecommendation(recommendation);
          onRecommendationMade?.(recommendedPlace);
        }
      } else {
        throw new Error(data.meta.error_detail || 'Unable to get workspace recommendations.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      handleError(error);
      
      // Fallback to basic scoring if AI analysis fails
      try {
        const bestPlace = places.reduce((best, current) => 
          current.workabilityScore > best.workabilityScore ? current : best
        , places[0]);

        setRecommendation({
          place: bestPlace,
          headline: `Highest rated workspace nearby with a ${bestPlace.workabilityScore}/10 score`,
          context: {
            timeOfDay: 'now',
            crowdLevel: 'moderate',
            bestFor: 'remote work'
          }
        });
        onRecommendationMade?.(bestPlace);
      } catch (fallbackError) {
        console.error('Fallback recommendation failed:', fallbackError);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [places, onRecommendationMade, onError]);

  // Trigger analysis when conditions are met
  useEffect(() => {
    const shouldAnalyze = 
      places?.length > 0 && 
      searchPhase === SearchPhases.COMPLETE && 
      !recommendation && 
      !isHidden && 
      !analysisRequestedRef.current;

    if (shouldAnalyze) {
      analyzeAndRecommend();
    }
  }, [places, searchPhase, recommendation, isHidden, analyzeAndRecommend]);

  if (isHidden || searchPhase === SearchPhases.INITIAL || (!places?.length && !isAnalyzing)) {
    return null;
  }

  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={() => {
          setError(null);
          analysisRequestedRef.current = false;
          analyzeAndRecommend();
        }}
        onDismiss={() => {
          setError(null);
          onHide?.();
        }}
        size="compact"
        className="animate-fadeIn"
      />
    );
  }

  if (isAnalyzing) {
    return <LoadingState loadingMessage={loadingMessage} />;
  }

  if (!recommendation) return null;

  const { place, headline, context, lede, personalNote, standoutFeatures } = recommendation;

  return (
    <div className="relative rounded-lg overflow-hidden animate-fadeIn">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 to-transparent" />
      
      <div className="relative p-4">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 
              flex items-center justify-center">
              <Brain className="w-4 h-4 text-[var(--accent-primary)]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">
                AI Quick Match
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                Best for right now
              </div>
            </div>
          </div>
          
          <button
            onClick={onHide}
            className="p-1.5 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label="Hide quick match"
          >
            <X size={14} className="text-[var(--text-secondary)]" />
          </button>
        </div>

        {recommendation && (
          <>
            {/* Main Content */}
            <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-3">
              <div className="flex gap-3">
                {/* Score Badge */}
                <div className="flex-shrink-0 w-12 h-12 rounded-lg
                  bg-[var(--accent-primary)] text-[var(--button-text)]
                  flex flex-col items-center justify-center">
                  <span className="text-lg font-bold leading-none">
                    {recommendation.place.workabilityScore}
                  </span>
                  <span className="text-[10px] opacity-80">score</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-[var(--text-primary)] mb-1 line-clamp-1">
                    {recommendation.place.title}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-2">
                    <MapPin size={12} />
                    <span>{recommendation.place.distance} miles</span>
                  </div>

                  {/* Quick Stats - Mobile optimized grid */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {[
                      { 
                        icon: Wifi, 
                        label: recommendation.place.download 
                          ? `${Math.round(recommendation.place.download)}Mbps` 
                          : 'WiFi'
                      },
                      { 
                        icon: Battery, 
                        label: recommendation.place.power?.includes('range3') 
                          ? 'Good Power' 
                          : 'Power'
                      },
                      { 
                        icon: Volume2, 
                        label: recommendation.place.mappedNoise?.split(' ')[0] || 'Moderate'
                      }
                    ].map((stat, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                        <stat.icon size={12} />
                        <span>{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Headline - Only show on larger screens */}
              <p className="hidden sm:block text-sm text-[var(--text-primary)] mt-3 line-clamp-2">
                {recommendation.headline}
              </p>
            </div>

            {/* Context and Actions */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Context Info */}
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Clock size={12} />
                <span>Best for {recommendation.context?.timeOfDay || 'now'}</span>
                <span className="mx-1">•</span>
                <Users size={12} />
                <span>{recommendation.context?.crowdLevel || 'moderate'}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onPhotoClick(recommendation.place)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 
                    px-3 py-1.5 rounded-md bg-[var(--accent-primary)] 
                    text-[var(--button-text)] hover:bg-[var(--accent-secondary)] 
                    transition-colors text-sm font-medium"
                >
                  View Details
                  <ArrowRight size={14} />
                </button>
                
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${recommendation.place.street}, ${recommendation.place.city}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 
                    px-3 py-1.5 rounded-md bg-[var(--bg-tertiary)]
                    text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]
                    transition-colors text-sm font-medium"
                >
                  <Navigation size={14} />
                  <span className="sm:hidden">Directions</span>
                </a>
              </div>
            </div>
          </>
        )}

        {isAnalyzing && <LoadingState loadingMessage={loadingMessage} />}
      </div>
    </div>
  );
};

export default QuickMatch;