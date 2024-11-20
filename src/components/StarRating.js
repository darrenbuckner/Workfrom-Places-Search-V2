import React from 'react';
import { Star, StarHalf, StarOff } from 'lucide-react';

const StarRating = ({ score, variant = 'default' }) => {
  const maxStars = 5;
  const scaledScore = (score / 10) * maxStars; // Convert 10-point scale to 5 stars
  const fullStars = Math.floor(scaledScore);
  const hasHalfStar = scaledScore % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  const starClassName = variant === 'large' 
    ? 'w-5 h-5' 
    : 'w-4 h-4';

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className={`${starClassName} text-[var(--accent-primary)]`}
          fill="currentColor"
        />
      ))}
      {hasHalfStar && (
        <StarHalf
          className={`${starClassName} text-[var(--accent-primary)]`}
          fill="currentColor"
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <StarOff
          key={`empty-${i}`}
          className={`${starClassName} text-[var(--accent-primary)] opacity-40`}
        />
      ))}
    </div>
  );
};

export default StarRating;