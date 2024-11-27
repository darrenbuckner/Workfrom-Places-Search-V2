import React from 'react';
import { ImageIcon } from 'lucide-react';

const ImageFallback = ({ size = 'default', showText = true, className = '' }) => {
  const sizeClasses = {
    small: {
      container: 'w-12 h-12',  // 48px
      icon: 14,
      text: 'text-[10px]'
    },
    default: {
      container: 'w-16 h-16', // 64px
      icon: 18,
      text: 'text-xs'
    },
    large: {
      container: 'w-36 h-36', // 144px
      icon: 24,
      text: 'text-sm'
    }
  };

  return (
    <div className={`
      relative
      inline-flex flex-col items-center justify-center
      bg-[var(--bg-tertiary)]
      ${sizeClasses[size].container}
      ${className}
    `}>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <ImageIcon 
          size={sizeClasses[size].icon} 
          className="text-[var(--text-secondary)]"
          aria-hidden="true"
        />
        {showText && (
          <span className={`
            ${sizeClasses[size].text} 
            text-[var(--text-secondary)] 
            mt-1
          `}>
            No image
          </span>
        )}
      </div>
    </div>
  );
};

export default ImageFallback;