import React, { useState, useEffect } from 'react';
import { Brain, Star, X } from 'lucide-react';
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

  // Reset when search starts
  useEffect(() => {
    if (searchPhase === SearchPhases.LOCATING || searchPhase === SearchPhases.LOADING) {
      setRecommendation(null);
      setIsAnalyzing(false);
    }
  }, [searchPhase]);

  // Analyze when places are loaded
  useEffect(() => {
    if (places?.length > 0 && searchPhase === SearchPhases.COMPLETE && !recommendation && !isHidden) {
      analyzeAndRecommend();
    }
  }, [places, searchPhase, recommendation, isHidden]);

  const analyzeAndRecommend = async () => {
    if (isAnalyzing || !places.length) return;

    setIsAnalyzing(true);

    try {
      // Prepare the closest 10 places for analysis
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

      if (!response.ok) {
        throw new Error('Failed to get AI insights');
      }

      const data = await response.json();
      
      if (data.meta.code === 200 || data.meta.code === 207) {
        const aiRecommendation = data.insights.recommendation;
        const contextInfo = data.insights.context;
        
        // Find the full place object that matches the recommendation
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
          
          onRecommendationMade?.(recommendedPlace.title);
        } else {
          throw new Error('Recommended place not found in dataset');
        }
      } else {
        throw new Error(data.meta?.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      // Use highest scored place as fallback
      const bestPlace = places.reduce((best, current) => 
        current.workabilityScore > best.workabilityScore ? current : best
      , places[0]);

      setRecommendation({
        place: bestPlace,
        headline: `Highest rated workspace with a ${bestPlace.workabilityScore}/10 workability score`,
        lede: `This workspace offers the highest overall workability score in the area. It's a reliable choice for remote work.`,
        standoutFeatures: [/* ... */],
        context: {/* ... */}
      });
      
      onRecommendationMade?.(bestPlace.title);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (searchPhase === SearchPhases.INITIAL || (!places?.length && !isAnalyzing) || isHidden) {
    return null;
  }

  return (
    <div className="mb-6 relative">
      <div className="border border-[var(--accent-primary)] rounded-lg shadow-sm bg-[var(--bg-primary)] overflow-hidden">
        {/* Close Button */}
        {!isAnalyzing && recommendation && (
          <button
            onClick={onHide}
            className="absolute top-2 right-2 p-1.5 rounded-full 
              bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] 
              text-[var(--text-secondary)] transition-colors z-10"
            aria-label="Hide quick match"
          >
            <X size={16} />
          </button>
        )}
        <div className="p-4">
          {isAnalyzing ? (
            <div className="animate-pulse space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {searchPhase === SearchPhases.LOCATING 
                    ? 'Finding your location...'
                    : searchPhase === SearchPhases.LOADING
                      ? 'Finding nearby spaces...'
                      : 'Using AI to find your best match...'}
                </span>
              </div>
              <div className="h-1 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent-primary)] animate-pulse transition-all duration-500" 
                  style={{ 
                    width: searchPhase === SearchPhases.LOCATING 
                      ? '33%' 
                      : searchPhase === SearchPhases.LOADING 
                        ? '66%' 
                        : '90%' 
                  }} 
                />
              </div>
            </div>
          ) : recommendation ? (
            <div className="flex gap-4">
              {/* Score Badge */}
              <div className="flex-shrink-0 w-14 h-14 rounded-md bg-[var(--accent-primary)] text-white 
                flex items-center justify-center font-bold text-xl relative">
                {recommendation.place.workabilityScore}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent-primary)] 
                  flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full 
                      bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium">
                      <Brain className="w-3 h-3" />
                      <span>Best Match</span>
                    </div>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {recommendation.place.distance} miles away
                    </span>
                  </div>
                </div>

                {/* Place Name & Context */}
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                  {recommendation.place.title}
                </h3>
                
                {/* AI Recommendation */}
                {recommendation.headline && (
                  <p className="text-sm text-[var(--text-primary)] mb-2">
                    {recommendation.headline}
                  </p>
                )}

                {recommendation.lede && (
                  <p className="text-sm text-[var(--text-secondary)] italic mb-3">
                    "{recommendation.lede}"
                  </p>
                )}

                {/* Context Info */}
                {recommendation.context && (
                  <div className="hidden mb-3 text-sm text-[var(--text-secondary)]">
                    <p>Best for: {recommendation.context.bestFor} work</p>
                    <p>Current crowd level: {recommendation.context.crowdLevel}</p>
                  </div>
                )}

                {/* Personal Note */}
                {recommendation.personalNote && (
                  <p className="hidden text-sm text-[var(--text-secondary)] italic mb-3">
                    "{recommendation.personalNote}"
                  </p>
                )}

                {/* Standout Features */}
                <div className="space-y-1.5">
                  {recommendation.standoutFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                      <span>{feature.description}</span>
                    </div>
                  ))}
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => onPhotoClick?.(recommendation.place)}
                  className="mt-4 px-4 py-2 rounded-md bg-[var(--accent-primary)] text-white 
                    text-sm font-medium hover:bg-[var(--accent-primary-hover)] transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default QuickMatch;