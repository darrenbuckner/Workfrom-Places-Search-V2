import { useState, useCallback, useRef } from 'react';
import API_CONFIG from '../config';

const TIMEOUT_DURATION = 45000;
const RETRY_DELAYS = [2000, 5000, 10000];
const AI_CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours
const aiInsightsCache = new Map();

class AnalysisError extends Error {
  constructor(message, code, retryable = true) {
    super(message);
    this.name = 'AnalysisError';
    this.code = code;
    this.retryable = retryable;
  }
}

const generateCacheKey = (places) => {
  return places
    .map(p => `${p.ID}-${p.description?.substring(0, 100)}`)
    .sort()
    .join('|');
};

const prepareAnalysisPayload = (places) => {
  if (!Array.isArray(places) || places.length === 0) {
    return { places: [] };
  }

  return {
    places: places.map(place => ({
      id: place.ID,
      description: place.description || '',
      name: place.title || '',
      type: place.type || '',
      distance: parseFloat(place.distance) || 0,
      noise: place.noise_level || place.noise || '',
      wifi: place.download 
        ? `${Math.round(place.download)} Mbps` 
        : place.no_wifi === "1" 
          ? "No WiFi" 
          : "Unknown",
      workabilityScore: place.workabilityScore || 0,
      features: {
        hasCoffee: place.coffee === "1",
        hasFood: place.food === "1",
        hasOutdoor: place.outdoor_seating === "1" || place.outside === "1",
        isPowerAvailable: Boolean(place.power && place.power !== 'none')
      }
    }))
  };
};

export const useWorkspaceAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisInProgress, setAnalysisInProgress] = useState(new Set());
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
    setAnalysisInProgress(new Set());
  }, []);

  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsAnalyzing(false);
    setAnalysisInProgress(new Set());
  }, []);

  const attemptAnalysis = async (places, retryCount = 0) => {
    try {
      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, TIMEOUT_DURATION);

      const payload = prepareAnalysisPayload(places);
      const response = await fetch(
        `${API_CONFIG.baseUrl}/analyze-workspaces?appid=${API_CONFIG.appId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: abortControllerRef.current?.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new AnalysisError(
          response.status === 429 ? 'Rate limit exceeded' : 'Analysis failed',
          response.status,
          response.status === 429 || response.status >= 500
        );
      }

      const data = await response.json();
      
      if (!data.insights) {
        throw new AnalysisError('Invalid analysis response', 'INVALID_RESPONSE', false);
      }

      return data.insights;

    } catch (err) {
      if (err.name === 'AbortError' && retryCount < RETRY_DELAYS.length) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[retryCount]));
        return attemptAnalysis(places, retryCount + 1);
      }
      throw err;
    }
  };

  const analyzePlaces = useCallback(async (places, skipCache = false) => {
    if (!places?.length) {
      setError(new AnalysisError('No places to analyze', 'NO_PLACES', false));
      return null;
    }

    const cacheKey = generateCacheKey(places);
    if (!skipCache) {
      const cached = aiInsightsCache.get(cacheKey);
      if (cached?.timestamp && Date.now() - cached.timestamp < AI_CACHE_DURATION) {
        setAnalysis(cached.data);
        return cached.data;
      }
    }

    const placeIds = new Set(places.map(p => p.ID));
    setAnalysisInProgress(placeIds);
    setIsAnalyzing(true);
    setError(null);

    try {
      const insights = await attemptAnalysis(places);
      
      aiInsightsCache.set(cacheKey, {
        data: insights,
        timestamp: Date.now()
      });

      setAnalysis(insights);
      return insights;

    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err);
      return null;

    } finally {
      setIsAnalyzing(false);
      setAnalysisInProgress(new Set());
      abortControllerRef.current = null;
    }
  }, []);

  return {
    isAnalyzing: analysisInProgress.size > 0,
    currentlyAnalyzing: analysisInProgress,
    analysis,
    error,
    analyzePlaces,
    cancelAnalysis,
    clearAnalysis
  };
};