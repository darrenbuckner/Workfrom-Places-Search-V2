import React from 'react';

const DistanceDisplay = ({ distance, className = "" }) => {
  const formatDistance = (dist) => {
    if (!dist) return 'Distance unknown';
    if (dist === 0) return 'You are here';
    
    const distNum = typeof dist === 'string' ? parseFloat(dist) : dist;
    
    if (distNum < 0.1) {
      return 'Less than 0.1 miles';
    } else if (distNum < 10) {
      return `${distNum.toFixed(1)} miles`;
    } else {
      return `${Math.round(distNum)} miles`;
    }
  };

  return (
    <span className={`text-sm text-[var(--text-secondary)] ${className}`}>
      {formatDistance(distance)}
    </span>
  );
};

export default DistanceDisplay;