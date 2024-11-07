import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, Star, X, ArrowRight, Navigation, Loader } from 'lucide-react';
import { SearchPhases } from './constants';
import API_CONFIG from './config';

const QuickMatch = ({ 
  places,
  searchPhase,
  onRecommendationMade,
  onPhotoClick,
  isHidden,
  onHide,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('Confirming your best option...');
  const analysisRequestedRef = useRef(false);
  
  const getGoogleMapsUrl = (place) => {
    const address = `${place.street}, ${place.city}, ${place.postal}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  // Rotate loading messages
  useEffect(() => {
    if (!isAnalyzing) return;

    const messages = [
      'Confirming your best option...',
      'Analyzing workspace details...',
      'Checking community insights...',
      'Almost ready...'
    ];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      setLoadingMessage(messages[currentIndex]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const analyzeAndRecommend = useCallback(async () => {
    if (isAnalyzing || !places.length || analysisRequestedRef.current) return;
    
    setIsAnalyzing(true);
    analysisRequestedRef.current = true;

    try {
      const placesForAnalysis = places.slice(0, 10).map(place => ({
        name: place.title,
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

      if (!response.ok) throw new Error('Failed to get AI insights');

      const data = await response.json();
      
      if (data.meta.code === 200 || data.meta.code === 207) {
        const aiRecommendation = data.insights.recommendation;
        const contextInfo = data.insights.context;
        const recommendedPlace = places.find(p => p.title === aiRecommendation.name);
        
        if (recommendedPlace) {
          setRecommendation({
            place: recommendedPlace,
            headline: aiRecommendation.headline,
            lede: aiRecommendation.lede,
            personalNote: aiRecommendation.personalNote,
            standoutFeatures: aiRecommendation.standoutFeatures,
            context: contextInfo
          });
          onRecommendationMade?.(recommendedPlace.ID);
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      const bestPlace = places.reduce((best, current) => 
        current.workabilityScore > best.workabilityScore ? current : best
      , places[0]);

      setRecommendation({
        place: bestPlace,
        headline: `Highest rated workspace nearby`,
        lede: `This workspace offers the highest overall workability score in the area.`,
        standoutFeatures: []
      });
      onRecommendationMade?.(bestPlace.ID);
    } finally {
      setIsAnalyzing(false);
    }
  }, [places, onRecommendationMade]);

  // Reset analysis state when places change
  useEffect(() => {
    if (places?.length === 0) {
      setRecommendation(null);
      analysisRequestedRef.current = false;
    }
  }, [places]);

  // Trigger analysis only when we have places and are in complete state
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

  return (
    <div className="relative bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg overflow-hidden">
      {!isAnalyzing && recommendation && (
        <button
          onClick={onHide}
          className="absolute right-2 top-2 p-1 rounded-full 
            bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] 
            text-[var(--text-secondary)] transition-colors z-10"
          aria-label="Hide quick match"
        >
          <X size={14} />
        </button>
      )}

      <div className="p-3">
        {isAnalyzing ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
              <Loader className="w-4 h-4 text-[var(--accent-primary)] animate-spin" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {loadingMessage}
              </div>
              <div className="mt-2 h-1 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                <div className="h-full w-full bg-[var(--accent-primary)] origin-left animate-[progress_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        ) : recommendation && (
          <div className="space-y-2">
            {/* Rest of the component remains the same */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded bg-[var(--accent-primary)] text-[var(--button-text)] 
                flex items-center justify-center font-bold text-lg">
                {recommendation.place.workabilityScore}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--accent-primary)]/10 
                    text-[var(--accent-primary)] font-medium inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Best Match
                  </div>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {recommendation.place.distance}mi away
                  </span>
                </div>

                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1 truncate">
                  {recommendation.place.title}
                </h3>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-[var(--border-primary)]/50">
              {recommendation.headline && (
                <div className="text-xs font-medium text-[var(--text-primary)]">
                  {recommendation.headline}
                </div>
              )}
              
              {recommendation.lede && (
                <div className="text-xs text-[var(--text-secondary)] italic">
                  {recommendation.lede}
                </div>
              )}

              {recommendation.personalNote && (
                <div className="text-xs text-[var(--text-secondary)]">
                  {recommendation.personalNote}
                </div>
              )}

              {recommendation.standoutFeatures?.length > 0 && (
                <div className="pt-1.5 flex flex-wrap gap-2">
                  {recommendation.standoutFeatures.slice(0, 3).map((feature, index) => (
                    <div key={index} className="inline-flex items-center gap-1 
                      px-1.5 py-0.5 rounded-full bg-[var(--accent-primary)]/5 
                      text-[var(--text-secondary)] text-xs">
                      <span className="w-1 h-1 rounded-full bg-[var(--accent-primary)]" />
                      <span>{typeof feature === 'string' ? feature : feature.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onPhotoClick(recommendation.place)}
                className="flex-1 px-2 py-1.5 text-xs font-medium rounded
                  bg-[var(--accent-primary)] text-[var(--button-text)] hover:bg-[var(--action-primary-hover)]
                  flex items-center justify-center gap-1 transition-colors"
              >
                See Details
                <ArrowRight size={12} />
              </button>
              <a
                href={getGoogleMapsUrl(recommendation.place)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1.5 text-xs font-medium rounded
                  border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]
                  flex items-center justify-center gap-1 transition-colors"
              >
                <Navigation size={12} />
                Directions
              </a>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default QuickMatch;