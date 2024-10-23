import React from 'react';
import { AlertCircle } from 'lucide-react';

export const calculateWorkabilityScore = (place) => {
  let score = 0;
  let maxScore = 0;
  const factors = [];

  // WiFi Speed (0-30 points)
  if (place.download) {
    maxScore += 30;
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
  }

  // Power Availability (0-25 points)
  maxScore += 25;
  const powerValue = String(place.power || '').toLowerCase();
  if (powerValue.includes('range3') || powerValue.includes('good')) {
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

const WorkabilityScore = ({ place, variant = 'full' }) => {
  const { score, factors, reliability } = calculateWorkabilityScore(place);
  const { earned, possible } = {
    earned: factors.reduce((sum, factor) => sum + factor.score, 0),
    possible: factors.reduce((sum, factor) => sum + factor.max, 0)
  };
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressBarColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Compact version for list view
  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-2">
        <div className={`text-sm font-semibold ${getScoreColor(score)}`}>
          {earned}/{possible}
        </div>
        {reliability < 1 && (
          <AlertCircle size={14} className="text-gray-400" />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-2">
      <div className="flex flex-col mb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Workability Score</h3>
          <div className="flex items-baseline">
            <span className={`text-lg font-bold ${getScoreColor(score)}`}>
              {earned}
            </span>
            <span className="text-xs text-gray-500 ml-1">
              /{possible}
            </span>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressBarColor(score)} transition-all duration-500`}
              style={{ width: `${(earned / possible) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {factors.map((factor, index) => (
          <div key={index} className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5">
              <div className="flex items-baseline">
                <span className="text-xs text-gray-600 font-medium">{factor.name}</span>
              </div>
              <span className="text-xs text-gray-500">{factor.detail}</span>
            </div>
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  factor.score === 0 ? 'bg-gray-200' :
                  factor.score === factor.max ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${(factor.score / factor.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {reliability < 1 && (
        <div className="mt-2 flex items-start space-x-1">
          <AlertCircle size={12} className="flex-shrink-0 mt-0.5 text-gray-400" />
          <p className="text-xs text-gray-500">
            Some metrics are missing. Score may not reflect complete workspace quality.
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkabilityScore;