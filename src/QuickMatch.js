import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const QuickMatch = ({ recommendation, place, onViewDetails }) => {
  if (!recommendation || !place) return null;

  return (
    <div className="sticky top-0 z-40 p-2 sm:p-4 -mx-2 sm:-mx-4 mb-6">
      <div className="relative p-4 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] shadow-lg">
        {/* Recommendation Badge */}
        <div className="absolute -top-3 left-4">
          <div className="px-3 py-1 rounded-full bg-[var(--accent-primary)] text-white 
            text-xs font-medium flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            AI Recommended
          </div>
        </div>

        <div className="mt-3">
          {/* Title */}
          <h3 className="text-lg font-medium text-[var(--text-primary)]">
            {place.title}
          </h3>

          {/* Quick Pitch */}
          <p className="mt-2 text-sm text-[var(--text-primary)] leading-relaxed">
            {recommendation.personalNote}
          </p>

          {/* Action Button */}
          <button
            onClick={onViewDetails}
            className="mt-4 flex items-center gap-2 text-[var(--accent-primary)] 
              hover:text-[var(--accent-secondary)] transition-colors text-sm font-medium"
          >
            View workspace details
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickMatch;