import React, { useState } from 'react';
import { ArrowRight, Sparkles, Brain, ChevronDown, ChevronUp } from 'lucide-react';

const QuickMatch = ({ recommendation, place, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!recommendation || !place) return null;

  const shouldShowReadMore = recommendation.personalNote.length > 100;

  return (
    <div className="sticky top-0 z-40 p-2 sm:p-4 -mx-2 sm:-mx-4 mb-4 sm:mb-6">
      <div className="relative rounded-lg border border-[var(--accent-primary)] bg-[var(--bg-primary)] shadow-md overflow-hidden">
        {/* Mobile Design */}
        <div className="sm:hidden">
          <div className="flex gap-3 p-3">
            {/* Image and Score */}
            <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-[var(--bg-secondary)]">
              {place.thumbnail_img ? (
                <img
                  src={place.thumbnail_img}
                  alt={place.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--accent-primary)]/5">
                  <Brain className="w-5 h-5 text-[var(--accent-primary)]" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 text-center py-1 text-xs font-medium
                bg-[var(--accent-primary)] text-white">
                {place.workabilityScore}/10
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="px-1.5 py-0.5 rounded-full bg-[var(--accent-primary)]/10 
                  text-[var(--accent-primary)] text-xs font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Pick
                </div>
                <span className="text-xs text-[var(--text-secondary)]">
                  {place.distance}mi
                </span>
              </div>
              <h3 className="font-medium text-[var(--text-primary)] truncate">
                {place.title}
              </h3>
              <div className="relative">
                <p className={`text-xs text-[var(--text-secondary)] mt-0.5
                  ${!isExpanded && shouldShowReadMore ? 'line-clamp-2' : ''}`}>
                  {recommendation.personalNote}
                </p>
                {shouldShowReadMore && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-1 flex items-center gap-1 text-xs font-medium 
                      text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        Show less
                        <ChevronUp className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        Read more
                        <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onViewDetails}
              className="flex-shrink-0 self-center p-2 rounded-md hover:bg-[var(--bg-secondary)] 
                text-[var(--accent-primary)] transition-colors"
              aria-label="View workspace details"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop Design */}
        <div className="hidden sm:flex p-4 gap-4">
          {/* Image Column */}
          <div className="relative flex-shrink-0 w-32 rounded-md overflow-hidden bg-[var(--bg-secondary)]">
            {place.thumbnail_img ? (
              <img
                src={place.thumbnail_img}
                alt={place.title}
                className="w-full h-32 object-cover"
              />
            ) : (
              <div className="w-full h-32 flex items-center justify-center bg-[var(--accent-primary)]/5">
                <Brain className="w-8 h-8 text-[var(--accent-primary)]" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 text-center py-1.5 text-sm font-medium
              bg-[var(--accent-primary)] text-white">
              {place.workabilityScore}/10
            </div>
          </div>

          {/* Content Column */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="px-2 py-1 rounded-full bg-[var(--accent-primary)] text-white 
                text-xs font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Recommended
              </div>
              <span className="text-sm text-[var(--text-secondary)]">
                {place.distance} miles away
              </span>
            </div>
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              {place.title}
            </h3>
            <p className="mt-2 text-sm text-[var(--text-primary)] leading-relaxed">
              {recommendation.personalNote}
            </p>
            <button
              onClick={onViewDetails}
              className="mt-3 flex items-center gap-2 text-[var(--accent-primary)] 
                hover:text-[var(--accent-secondary)] transition-colors text-sm font-medium"
            >
              View workspace details
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickMatch;