import React, { useState, useEffect } from 'react';
import { Brain, MapPin, Star } from 'lucide-react';
import { SearchPhases } from './constants';

const QuickMatch = ({ 
  places,
  searchPhase,
  onRecommendationMade,
  onPhotoClick,
}) => {
  const [recommendation, setRecommendation] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  // Reset when search starts
  useEffect(() => {
    if (searchPhase === SearchPhases.LOCATING || searchPhase === SearchPhases.LOADING) {
      setRecommendation(null);
      setAiInsights(null);
      setIsAnalyzing(true);
    }
  }, [searchPhase]);

  // Analyze when places are loaded
  useEffect(() => {
    if (places?.length > 0 && searchPhase === SearchPhases.COMPLETE && isAnalyzing) {
      analyzeAndRecommend();
    }
  }, [places, searchPhase, isAnalyzing]);

  const analyzeAndRecommend = async () => {
    const bestPlace = places.reduce((best, current) => {
      return (current.workabilityScore > best.workabilityScore) ? current : best;
    }, places[0]);

    try {
      // Use correct development URL
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8888/.netlify/functions/api'
        : '/.netlify/functions/api';

      const response = await fetch(`${baseUrl}/analyze-workspaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          places: places.slice(0, 10).map(place => ({
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
          }))
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response:', errorText);
        throw new Error('Failed to get AI insights');
      }

      const data = await response.json();
      setAiInsights(data.insights);
      
      setRecommendation({
        place: bestPlace,
        aiRecommendation: data.insights.recommendation
      });
      
      onRecommendationMade?.(bestPlace.title);
    } catch (error) {
      console.error('Analysis error:', error);
      // Fallback to basic recommendation without AI insights
      const basicRecommendation = {
        place: bestPlace,
        reasons: [
          bestPlace.workabilityScore ? `Workability score: ${bestPlace.workabilityScore}` : null,
          bestPlace.noise_level ? `Noise level: ${bestPlace.noise_level}` : null,
          bestPlace.power ? `Power availability: ${bestPlace.power}` : null,
          bestPlace.wifi ? `Wifi: ${bestPlace.wifi}` : null
        ].filter(Boolean)
      };
      setRecommendation(basicRecommendation);
      onRecommendationMade?.(bestPlace.title);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Don't render anything if no search has been performed or if we're in initial state
  if (searchPhase === SearchPhases.INITIAL || (!places?.length && !isAnalyzing)) {
    return null;
  }

  // Don't render if no recommendation and not analyzing
  if (!recommendation && !isAnalyzing) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="border border-[var(--accent-primary)] rounded-lg shadow-sm bg-[var(--bg-primary)] overflow-hidden">
        {isAnalyzing ? (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {searchPhase === SearchPhases.LOCATING 
                  ? 'Finding your location...'
                  : searchPhase === SearchPhases.LOADING
                    ? 'Finding nearby spaces...'
                    : 'Using AI to help choose a great option...'}
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
          <div className="p-4">
            <div className="flex gap-4">
              {/* Score Badge */}
              <div className="flex-shrink-0 w-14 h-14 rounded-md bg-[var(--accent-primary)] text-white flex items-center justify-center font-bold text-xl relative">
                {recommendation.place.workabilityScore || '?'}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium">
                      <Brain className="w-3 h-3" />
                      <span>AI Pick</span>
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
                
                {/* AI Insights Section */}
                {recommendation.aiRecommendation && (
                  <div className="space-y-3 mb-4">
                    {/* Headline */}
                    {recommendation.aiRecommendation.headline && (
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {recommendation.aiRecommendation.headline}
                      </p>
                    )}

                    {/* Personal Note - if available */}
                    {recommendation.aiRecommendation.personalNote && (
                      <p className="text-sm text-[var(--text-secondary)] italic">
                        "{recommendation.aiRecommendation.personalNote}"
                      </p>
                    )}
                  </div>
                )}

                {/* Standout Features */}
                {recommendation.aiRecommendation?.standoutFeatures && (
                  <div className="space-y-1.5">
                    {recommendation.aiRecommendation.standoutFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                        <span>{typeof feature === 'string' ? feature : feature.description}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => onPhotoClick?.(recommendation.place)}
                  className="mt-4 px-4 py-2 rounded-md bg-[var(--accent-primary)] text-white text-sm font-medium
                    hover:bg-[var(--accent-primary-hover)] transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default QuickMatch;