import { useState, useCallback, useMemo, useRef } from 'react';
import API_CONFIG from '../config';
import { calculateWorkabilityScore } from '../WorkabilityScore';

const mapNoiseLevel = (noise) => {
  if (!noise) return 'Unknown';
  if (typeof noise === 'string') {
    const lowerNoise = noise.toLowerCase();
    if (lowerNoise.includes('quiet') || lowerNoise.includes('low')) return 'Below average';
    if (lowerNoise.includes('moderate') || lowerNoise.includes('average')) return 'Average';
    if (lowerNoise.includes('noisy') || lowerNoise.includes('high')) return 'Above average';
    return noise;
  }
  return 'Unknown';
};

export const usePlaces = () => {
  const [originalPlaces, setOriginalPlaces] = useState([]);
  const [searchPhase, setSearchPhase] = useState('initial');
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('score_high');
  const [postSearchFilters, setPostSearchFilters] = useState({
    type: 'any',
    power: 'any',
    noise: 'any',
    openNow: false
  });
  
  // Keep track of search state
  const searchStateRef = useRef({
    hasSearched: false,
    isSearching: false
  });

  const fetchPlaces = useCallback(async (searchLocation, radius) => {
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/places/ll/${searchLocation.latitude},${searchLocation.longitude}?radius=${radius}&appid=${API_CONFIG.appId}&rpp=100`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.meta?.code === 200) {
        if (Array.isArray(data.response)) {
          if (data.response.length === 0) {
            if (data.meta.message === 'Using cached data' && originalPlaces.length === 0) {
              setError('No places found in your area. Try increasing the search radius.');
            }
            setOriginalPlaces([]);
          } else {
            const placesWithScores = data.response.map(place => ({
              ...place,
              mappedNoise: mapNoiseLevel(place.noise_level || place.noise),
              workabilityScore: calculateWorkabilityScore(place).score
            }));
            setOriginalPlaces(placesWithScores);
            setError('');
          }
        } else {
          throw new Error('Invalid response format from server');
        }
      } else {
        throw new Error(data.meta?.details || 'Unexpected response from server');
      }
    } catch (err) {
      console.error('Search error:', err);
      if (err.name === 'TypeError' || err.name === 'NetworkError') {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (err.message.includes('Unexpected response')) {
        setError('We encountered an issue processing the results. Please try again.');
      } else {
        setError(`An error occurred: ${err.message}`);
      }
      setOriginalPlaces([]);
      throw err;
    }
  }, [originalPlaces.length]);

  const filteredPlaces = useMemo(() => {
    if (!originalPlaces.length) return [];
    
    const filtered = originalPlaces.filter(place => {
      const { type, noise, power } = postSearchFilters;
      
      if (type !== 'any' && place.type !== type) return false;
      
      if (noise !== 'any') {
        const placeNoise = String(place.noise_level || place.noise || '').toLowerCase();
        const noiseMap = {
          quiet: ['quiet', 'low'],
          moderate: ['moderate', 'average'],
          noisy: ['noisy', 'high']
        };
        if (!noiseMap[noise].some(level => placeNoise.includes(level))) return false;
      }
      
      if (power !== 'any' && (!place.power || !place.power.includes(power))) return false;
      
      return true;
    });

    return sortBy === 'score_high' 
      ? filtered.sort((a, b) => b.workabilityScore - a.workabilityScore)
      : filtered;
  }, [originalPlaces, sortBy, postSearchFilters]);

  return {
    places: filteredPlaces,         // filtered & sorted places for display
    originalPlaces,                 // original unfiltered places
    setPlaces: setOriginalPlaces,   // setter for original places
    searchPhase,
    setSearchPhase,
    error,
    setError,
    sortBy,
    setSortBy,
    postSearchFilters,
    setPostSearchFilters,
    fetchPlaces,
    searchStateRef                  // expose search state ref
  };
};