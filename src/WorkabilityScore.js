import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export const calculateWorkabilityScore = (place) => {
  let score = 0;
  let maxScore = 0;
  const factors = [];

  // WiFi Speed (0-30 points)
  maxScore += 30;
  if (place.no_wifi === "1") {
    factors.push({ name: 'WiFi Speed', score: 0, max: 30, detail: 'No WiFi' });
  } else if (place.download) {
    if (place.download >= 50) {
      score += 30;
      factors.push({ name: 'WiFi Speed', score: 30, max: 30, detail: 'Excellent' });
    } else if (place.download >= 20) {
      score += 25;
      factors.push({ name: 'WiFi Speed', score: 25, max: 30, detail: 'Very Good' });
    } else if (place.download >= 10) {
      score += 20;
      factors.push({ name: 'WiFi Speed', score: 20, max: 30, detail: 'Good' });
    } else {
      score += 10;
      factors.push({ name: 'WiFi Speed', score: 10, max: 30, detail: 'Basic' });
    }
  } else {
    factors.push({ name: 'WiFi Speed', score: 0, max: 30, detail: 'Unknown' });
  }

  // Power Availability (0-25 points)
  maxScore += 25;
  const powerValue = String(place.power || '').toLowerCase();
  if (powerValue === 'none' || powerValue === '') {
    factors.push({ name: 'Power Outlets', score: 0, max: 25, detail: 'No outlets' });
  } else if (powerValue.includes('range3') || powerValue.includes('good')) {
    score += 25;
    factors.push({ name: 'Power Outlets', score: 25, max: 25, detail: 'Abundant' });
  } else if (powerValue.includes('range2')) {
    score += 20;
    factors.push({ name: 'Power Outlets', score: 20, max: 25, detail: 'Good' });
  } else if (powerValue.includes('range1') || powerValue.includes('little')) {
    score += 15;
    factors.push({ name: 'Power Outlets', score: 15, max: 25, detail: 'Limited' });
  } else {
    factors.push({ name: 'Power Outlets', score: 0, max: 25, detail: 'Unknown' });
  }

  // Noise Level (0-25 points)
  maxScore += 25;
  const noiseLevel = String(place.noise_level || place.noise || '').toLowerCase();
  if (noiseLevel.includes('quiet') || noiseLevel.includes('low')) {
    score += 25;
    factors.push({ name: 'Background Noise', score: 25, max: 25, detail: 'Lower than average' });
  } else if (noiseLevel.includes('moderate') || noiseLevel.includes('average')) {
    score += 20;
    factors.push({ name: 'Background Noise', score: 20, max: 25, detail: 'Average level' });
  } else if (noiseLevel.includes('noisy') || noiseLevel.includes('high')) {
    score += 10;
    factors.push({ name: 'Background Noise', score: 10, max: 25, detail: 'Higher than average' });
  } else {
    factors.push({ name: 'Background Noise', score: 0, max: 25, detail: 'Unknown' });
  }

  // Amenities (0-20 points)
  maxScore += 20;
  let amenityScore = 0;
  let amenityDetails = [];

  if (place.coffee || place.type?.toLowerCase().includes('coffee')) {
    amenityScore += 5;
    amenityDetails.push('Coffee');
  }
  if (place.food) {
    amenityScore += 5;
    amenityDetails.push('Food');
  }
  if (place.outdoor_seating === '1' || place.outside) {
    amenityScore += 5;
    amenityDetails.push('Outdoor Seating');
  }
  if (place.alcohol) {
    amenityScore += 5;
    amenityDetails.push('Alcohol');
  }

  score += amenityScore;
  factors.push({ 
    name: 'Amenities', 
    score: amenityScore, 
    max: 20, 
    detail: amenityDetails.length ? amenityDetails.join(', ') : 'Limited' 
  });

  const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  
  return {
    score: finalScore,
    factors: factors,
    reliability: factors.filter(f => f.score > 0).length / factors.length
  };
};

const WorkabilityScore = ({ 
  place, 
  variant = 'full', 
  onClick = null,
  showPointer = false 
}) => {
  const { isDark } = useTheme();
  
  const calculateTotalPoints = (factors) => {
    const earned = factors.reduce((sum, factor) => sum + factor.score, 0);
    const possible = factors.reduce((sum, factor) => sum + factor.max, 0);
    return { earned, possible };
  };

  const { score, factors, reliability } = calculateWorkabilityScore(place);
  const { earned, possible } = calculateTotalPoints(factors);

  // Compact version for list view
  if (variant === 'compact') {
    return (
      <div 
        onClick={onClick}
        className={`
          flex items-center space-x-2 
          ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
          ${showPointer ? 'cursor-pointer' : ''}
        `}
        role={onClick ? "button" : undefined}
        aria-label={onClick ? "View workability score details" : undefined}
      >
        <div className={`
          text-sm font-semibold 
          ${isDark ? 'text-blue-400' : 'text-blue-600'}
          ${showPointer ? 'hover:text-accent-primary transition-colors' : ''}
        `}>
          {earned}/{possible}
        </div>
        {reliability < 1 && (
          <AlertCircle size={14} className={isDark ? 'text-blue-300' : 'text-blue-400'} />
        )}
      </div>
    );
  }

  // Full version with progress bars
  return (
    <div className={`rounded-lg p-4 ${isDark ? 'bg-[#2a3142]' : 'bg-gray-50'}`}>
      <div className="flex flex-col mb-6">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
            Workability Score
          </h3>
          <div className="flex items-baseline">
            <span className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {earned}
            </span>
            <span className={`text-sm ml-1 ${isDark ? 'text-blue-200' : 'text-blue-500'}`}>
              /{possible} points
            </span>
          </div>
        </div>
        
        {/* Overall progress bar */}
        <div className="mt-3">
          <div className={`h-2 w-full rounded-full overflow-hidden ${
            isDark ? 'bg-[#1a1f2c]' : 'bg-gray-200'
          }`}>
            <div 
              className={`h-full transition-all duration-500 ${
                isDark ? 'bg-blue-500' : 'bg-blue-600'
              }`}
              style={{ width: `${(earned / possible) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {factors.map((factor, index) => (
          <div key={index} className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <div className="flex items-baseline">
                <span className={`font-medium ${
                  isDark ? 'text-blue-100' : 'text-gray-900'
                }`}>
                  {factor.name}
                </span>
              </div>
              <span className={isDark ? 'text-blue-300' : 'text-blue-600'}>
                {factor.detail}
              </span>
            </div>
            <div className={`h-1 w-full rounded-full overflow-hidden ${
              isDark ? 'bg-[#1a1f2c]' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-full transition-all duration-500 ${
                  factor.score === 0 
                    ? isDark ? 'bg-[#1a1f2c]' : 'bg-gray-200'
                    : factor.score === factor.max 
                      ? isDark ? 'bg-blue-400' : 'bg-blue-500'
                      : isDark ? 'bg-blue-500' : 'bg-blue-600'
                }`}
                style={{ width: `${(factor.score / factor.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {reliability < 1 && (
        <div className="mt-6 flex items-start space-x-2 text-sm">
          <AlertCircle 
            size={16} 
            className={`flex-shrink-0 mt-0.5 ${
              isDark ? 'text-blue-300' : 'text-blue-500'
            }`} 
          />
          <p className={isDark ? 'text-blue-200' : 'text-blue-600'}>
            Some metrics are missing. Score may not reflect complete workspace quality.
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkabilityScore;