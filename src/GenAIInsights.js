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
  Loader,
  Navigation
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import API_CONFIG from './config';

const GenAIInsights = ({ 
  places, 
  isSearching, 
  onPhotoClick,
  onRecommendationMade,
  className = ''
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAnalyzing && places.length > 0 && !isSearching && !insights) {
        analyzeNearbyPlaces();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [places, isSearching, isAnalyzing, insights]);

  const getRecommendedPlace = () => {
    if (!insights?.recommendation?.name || !places.length) return null;
    return places.find(p => p.title === insights.recommendation.name) || null;
  };

  const recommendedPlace = getRecommendedPlace();

  const getGoogleMapsUrl = (place) => {
    if (!place?.street || !place?.city) return null;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      `${place.street}, ${place.city}`
    )}`;
  };

  if (!places.length || isSearching) return null;

  if (error) {
    return (
      <div className={`bg-bg-secondary border border-border-primary rounded-lg p-4 ${className}`}>
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
    <div className={className}>
      {/* Header Section */}
      <div className="relative p-4 bg-[var(--action-primary)]/5 rounded-t-lg">
        <div className="flex items-center justify-between w-full gap-4">
          <div className="relative flex-shrink-0 w-10">
            <div className="w-10 h-10 rounded-full bg-[var(--action-primary)]/10 flex items-center justify-center">
              {isAnalyzing ? (
                <Loader className="w-5 h-5 text-[var(--action-primary)] animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-[var(--action-primary)]" />
              )}
            </div>
          </div>

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

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-medium text-text-secondary">
              {isAnalyzing ? 'Analyzing places...' : 'Perfect Match Found'}
            </span>
            <span className="font-medium text-text-primary truncate">
              {insights?.recommendation?.name || 'Finding your ideal workspace...'}
            </span>
          </div>

          <button
            onClick={!insights && !isAnalyzing ? analyzeNearbyPlaces : toggleExpand}
            disabled={isAnalyzing}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full
              transition-all duration-300 text-sm font-medium
              ${isExpanded
                ? 'bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)] text-white border-[var(--action-primary-border)]'
                : 'bg-[var(--action-primary)]/10 hover:bg-[var(--action-primary)]/15 text-[var(--text-primary)] border-[var(--action-primary)]/20'
              }
              whitespace-nowrap
              border
              ${isAnalyzing ? 'opacity-75 cursor-wait' : ''}
            `}
          >
            <Sparkles 
              size={16} 
              className={isExpanded ? 'text-white' : 'text-[var(--text-primary)]'} 
            />
            {isAnalyzing ? 'Analyzing...' : isExpanded ? 'Hide Details' : 'See Details'}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {insights?.recommendation && (
        <div className={`
          transition-all duration-300 overflow-hidden
          ${isExpanded ? 'max-h-[80vh]' : 'max-h-0'}
          ${isExpanded ? '' : ''}
          border-border-primary rounded-b-lg
        `}>
          <div className="p-4 overflow-y-auto max-h-[calc(80vh-4rem)]">

            {/* Main Content */}
            <div className="space-y-6">
              {/* Personal Note */}
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

              {/* Bottom Line Section (Moved to top) */}
              <div className="mb-6 p-4 rounded-lg bg-[var(--action-primary)]/5 border border-[var(--action-primary)]/10">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--action-primary)] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-text-primary font-medium">
                    <strong className="block mb-1">Bottom line:</strong>
                    {insights.recommendation.finalNote}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                {recommendedPlace && getGoogleMapsUrl(recommendedPlace) && (
                  <a
                    href={getGoogleMapsUrl(recommendedPlace)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md
                      bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)]
                      text-white text-sm font-medium transition-colors"
                  >
                    <Navigation size={16} />
                    Get Directions
                  </a>
                )}
                <button
                  onClick={() => onPhotoClick(recommendedPlace)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md
                    bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)]
                    text-text-primary text-sm font-medium transition-colors
                    border border-border-primary"
                >
                  <ArrowRight size={16} />
                  More Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenAIInsights;