import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Wifi, 
  Battery, 
  Volume2, 
  Coffee, 
  AlertCircle,
  ImageIcon,
  ArrowRight,
  Loader
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import API_CONFIG from './config';

const GenAIInsights = ({ 
  places, 
  isSearching, 
  onPhotoClick,
  onRecommendationMade
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isDark } = useTheme();

  // Reset states when new search begins
  useEffect(() => {
    if (isSearching) {
      setInsights(null);
      setError(null);
      setIsAnalyzing(false);
      setIsExpanded(false);
    }
  }, [isSearching]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const analyzeNearbyPlaces = async () => {
    if (isAnalyzing || places.length === 0 || isSearching || insights) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Prepare places data for analysis
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

      // Call the analysis API
      const response = await fetch(`${API_CONFIG.baseUrl}/analyze-workspaces`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ places: placesForAnalysis })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      
      if (data.insights?.recommendation) {
        setInsights(data.insights);
        onRecommendationMade?.(data.insights);
      } else {
        throw new Error('Invalid analysis response');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger analysis when places are loaded
  useEffect(() => {
    // Start analysis after a short delay to ensure all states are settled
    const timer = setTimeout(() => {
      if (!isAnalyzing && places.length > 0 && !isSearching && !insights) {
        analyzeNearbyPlaces();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [places, isSearching, isAnalyzing, insights]);

  // Find the recommended place in our places array
  const getRecommendedPlace = () => {
    if (!insights?.recommendation?.name || !places.length) return null;
    return places.find(p => p.title === insights.recommendation.name) || null;
  };

  const recommendedPlace = getRecommendedPlace();

  // Don't render anything if we have no places or are searching
  if (!places.length || isSearching) return null;

  // Show error state
  if (error) {
    return (
      <div className="bg-bg-secondary border border-border-primary rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-secondary">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">Unable to analyze places: {error}</p>
          </div>
          <button
            onClick={() => {
              setError(null);
              setInsights(null);
              setIsAnalyzing(false);
            }}
            className="text-xs text-[var(--action-primary)] hover:text-[var(--action-primary-hover)] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-lg overflow-hidden mb-6">
      {/* Header Section */}
      <div className="relative p-4 bg-[var(--action-primary)]/5">
        <div className="flex items-center justify-between w-full gap-4">
          {/* Sparkles Icon (previously Brain) */}
          <div className="relative flex-shrink-0 w-10">
            <div className="w-10 h-10 rounded-full bg-[var(--action-primary)]/10 flex items-center justify-center">
              {isAnalyzing ? (
                <Loader className="w-5 h-5 text-[var(--action-primary)] animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-[var(--action-primary)]" />
              )}
            </div>
          </div>

          {/* Place Image */}
          {recommendedPlace && (
            <div className="relative flex-shrink-0 w-10">
              <div className="w-10 h-10 rounded-md overflow-hidden border border-border-primary">
                {recommendedPlace?.thumbnail_img ? (
                  <img
                    src={recommendedPlace.thumbnail_img}
                    alt={recommendedPlace.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/40/40';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-text-secondary" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Text Content */}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-medium text-text-secondary">
              {isAnalyzing ? 'Analyzing places...' : 'Perfect Match Found'}
            </span>
            <span className="font-medium text-text-primary truncate">
              {insights?.recommendation?.name || 'Finding your ideal workspace...'}
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={!insights && !isAnalyzing ? analyzeNearbyPlaces : toggleExpand}
            disabled={isAnalyzing}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full
              transition-all duration-300 text-sm font-medium
              ${isExpanded
                ? 'bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)] text-white border-[var(--action-primary-border)]'
                : 'bg-[var(--action-primary)]/10 hover:bg-[var(--action-primary)]/15 text-[var(--action-primary)] border-[var(--action-primary)]/20'
              }
              whitespace-nowrap
              border
              ${isAnalyzing ? 'opacity-75 cursor-wait' : ''}
            `}
          >
            <Sparkles 
              size={16} 
              className={isExpanded 
                ? 'text-white' 
                : 'text-[var(--action-primary)]'
              } 
            />
            {isAnalyzing ? 'Analyzing...' : isExpanded ? 'Hide Analysis' : 'See Why'}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {insights?.recommendation && (
        <div className={`
          transition-[max-height] duration-300 ease-out overflow-hidden
          ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}
        `}>
          <div className="p-4 space-y-4 border-t border-border-primary">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[var(--action-primary)]" />
              <span className="text-sm font-medium text-[var(--action-primary)]">
                AI Recommendation
              </span>
            </div>

            <p className="text-sm text-text-primary leading-relaxed">
              {insights.recommendation.personalNote}
            </p>

            {/* Features */}
            <div className="space-y-2">
              {insights.recommendation.standoutFeatures?.map((feature, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-md bg-bg-tertiary border border-border-primary"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--action-primary)]/10 flex items-center justify-center flex-shrink-0">
                    {feature.category === 'wifi' ? <Wifi className="w-4 h-4 text-[var(--action-primary)]" /> :
                     feature.category === 'power' ? <Battery className="w-4 h-4 text-[var(--action-primary)]" /> :
                     feature.category === 'quiet' ? <Volume2 className="w-4 h-4 text-[var(--action-primary)]" /> :
                     <Coffee className="w-4 h-4 text-[var(--action-primary)]" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-text-primary">
                      {feature.title}
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5">
                      {feature.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Section */}
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[var(--action-primary)] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-text-secondary italic flex-1">
                  <strong>Bottom line:</strong> {insights.recommendation.finalNote}
                </p>
              </div>

              {recommendedPlace && (
                <div className="flex justify-end">
                  <button
                    onClick={() => onPhotoClick(recommendedPlace)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full
                      transition-all duration-300 text-sm font-medium
                      bg-[var(--action-primary)]/10 hover:bg-[var(--action-primary)]/15 
                      text-[var(--action-primary)] border-[var(--action-primary)]/20
                      border whitespace-nowrap
                    `}
                  >
                    <span>View Space Details</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenAIInsights;