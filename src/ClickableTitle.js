import React from 'react';
import { ArrowRight } from 'lucide-react';

const ClickableTitle = ({ place, onPhotoClick, className = "", showIcon = true }) => {
  if (!place) return null;

  return (
    <button
      onClick={() => onPhotoClick(place)}
      className={`
        group flex items-center gap-1.5 
        hover:text-[var(--accent-secondary)] 
        transition-colors
        ${className}
      `}
    >
      <span className="font-medium text-[var(--accent-primary)] group-hover:text-[var(--accent-secondary)]">
        {place.title}
      </span>
      {showIcon && (
        <ArrowRight 
          size={16} 
          className="opacity-0 group-hover:opacity-100 transition-opacity 
            text-[var(--accent-primary)] group-hover:text-[var(--accent-secondary)]" 
        />
      )}
    </button>
  );
};

export default ClickableTitle;