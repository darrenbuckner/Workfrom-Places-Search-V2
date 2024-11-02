import React, { useState, useEffect } from 'react';
import { ArrowRight, Brain, X } from 'lucide-react';

const AIBadge = ({ className = "" }) => (
  <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full 
    bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium ${className}`}>
    <Brain className="w-3 h-3" />
    <span>AI Pick</span>
  </div>
);

const LoadingState = () => {
  const [loadingText, setLoadingText] = useState("Finding your best workspace match");
  
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingText(current => 
        current.endsWith("...") ? "Finding your best workspace match" : current + "."
      );
    }, 500);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-4">
        {/* Animated Score Badge */}
        <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-md 
          bg-[var(--accent-primary)]/10 flex items-center justify-center">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full 
            border-2 sm:border-3 border-[var(--accent-primary)] border-t-transparent 
            animate-spin" />
        </div>

        {/* Loading Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <AIBadge />
            <span className="text-xs sm:text-sm text-[var(--text-secondary)] animate-pulse">
              Analyzing nearby workspaces
            </span>
          </div>
          
          <p className="text-sm sm:text-base text-[var(--text-primary)] font-medium">
            {loadingText}
          </p>

          {/* Loading Bars - Desktop Only */}
          <div className="hidden sm:grid grid-cols-3 gap-3 mt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-1 rounded-full overflow-hidden bg-[var(--bg-secondary)]">
                <div 
                  className="h-full w-full bg-[var(--accent-primary)]/30 loading-bar"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .loading-bar {
          animation: loading 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

const QuickMatch = ({ 
  recommendation, 
  place, 
  onViewDetails,
  isAnalyzing 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [contentReady, setContentReady] = useState(false);
  const [initialRender, setInitialRender] = useState(true);

  useEffect(() => {
    if (initialRender) {
      setInitialRender(false);
      if (recommendation && place && !isAnalyzing) {
        requestAnimationFrame(() => setContentReady(true));
      }
    } else if (!isAnalyzing && recommendation && place) {
      const timer = setTimeout(() => setContentReady(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, recommendation, place, initialRender]);

  useEffect(() => {
    if (isAnalyzing) setContentReady(false);
  }, [isAnalyzing]);

  if (!isVisible || (!isAnalyzing && !recommendation && !place)) return null;

  return (
    <div className="sticky top-1 z-40 -mx-1 sm:-mx-4 sm:p-4">
      <div className="bg-[var(--bg-primary)] border border-[var(--accent-primary)] rounded-lg shadow-md">
        <div className="relative min-h-[120px] sm:min-h-[160px]">
          {/* Loading State */}
          <div className={`absolute inset-0 transition-opacity duration-300 ${
            !contentReady ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}>
            <LoadingState />
          </div>

          {/* Content */}
          <div className={`transition-opacity duration-300 ${
            contentReady ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}>
            {recommendation && place && (
              <>
                {/* Mobile View */}
                <div className="sm:hidden p-4">
                  <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-2 top-2 z-10 p-1.5 rounded-full
                      bg-[var(--bg-primary)]/90 hover:bg-[var(--bg-secondary)]
                      text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                      transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex gap-3">
                    {/* Score Badge */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-md 
                      bg-[var(--accent-primary)] text-white
                      flex items-center justify-center font-bold text-lg">
                      {place.workabilityScore}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <AIBadge />
                        <span className="text-xs text-[var(--text-secondary)]">
                          {place.distance}mi
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-[var(--text-primary)] truncate mb-1.5">
                        {place.title}
                      </h3>
                      
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                        {recommendation.headline}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={onViewDetails}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md
                      bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)]
                      text-white text-sm font-medium transition-colors"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Desktop View */}
                <div className="hidden sm:block p-6">
                  <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-4 top-4 z-10 
                      flex items-center gap-1.5 px-3 py-1.5 rounded-md
                      border border-[var(--border-primary)]
                      bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]
                      text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                      text-xs font-medium transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Dismiss</span>
                  </button>

                  <div className="flex gap-6">
                    {/* Score Badge */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-md 
                      bg-[var(--accent-primary)] text-white
                      flex items-center justify-center font-bold text-2xl">
                      {place.workabilityScore}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <AIBadge />
                        <span className="text-sm text-[var(--text-secondary)]">
                          {place.distance} miles away
                        </span>
                      </div>

                      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                        {place.title}
                      </h3>

                      <p className="text-[var(--text-primary)] mb-1">
                        {recommendation.headline}
                      </p>
                      
                      <p className="text-sm text-[var(--text-secondary)]">
                        {recommendation.context}
                      </p>

                      {recommendation.standoutFeatures && (
                        <div className="mt-4 flex flex-wrap gap-3">
                          {recommendation.standoutFeatures.map((feature, index) => (
                            <div key={index} 
                              className="px-2 py-1 rounded-md bg-[var(--bg-secondary)] 
                                text-sm text-[var(--text-primary)]">
                              {feature.description}
                            </div>
                          ))}
                        </div>
                      )}

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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickMatch;