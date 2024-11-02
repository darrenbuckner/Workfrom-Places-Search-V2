import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Brain, ChevronDown, ChevronUp, X, Wifi, Battery, Volume2 } from 'lucide-react';

const AIBadge = ({ className = "" }) => (
  <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full 
    bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium ${className}`}>
    <Brain className="w-3 h-3" />
    <span>AI Pick</span>
  </div>
);

const LoadingState = () => {
  const [loadingPhase, setLoadingPhase] = React.useState(0);
  
  const phases = [
    { Icon: Wifi, text: "Checking WiFi speeds..." },
    { Icon: Battery, text: "Evaluating power access..." },
    { Icon: Volume2, text: "Analyzing noise levels..." },
    { Icon: Brain, text: "Finding your perfect match..." }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLoadingPhase(current => (current + 1) % phases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = phases[loadingPhase].Icon;

  return (
    <div className="h-[140px] sm:h-[220px] p-4">
      {/* Mobile Loading State */}
      <div className="h-full sm:hidden">
        <div className="flex gap-3 h-full">
          {/* Animated Thumbnail */}
          <div className="flex-shrink-0 w-16 h-16 rounded-md bg-[var(--bg-secondary)] relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Brain className="w-5 h-5 text-[var(--accent-primary)] animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] via-transparent to-transparent" />
              </div>
            </div>
            {/* Animated loading bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-[var(--accent-primary)] loading-bar" />
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Top Badge */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-16 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
                <CurrentIcon className="w-3 h-3 text-[var(--accent-primary)]" />
              </div>
              <div className="h-5 w-12 rounded-full bg-[var(--bg-secondary)] animate-pulse" />
            </div>

            {/* Loading Message */}
            <div className="text-xs text-[var(--accent-primary)] mb-2 transition-opacity duration-300">
              {phases[loadingPhase].text}
            </div>

            {/* Animated Lines */}
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-[var(--bg-secondary)] animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-[var(--bg-secondary)] animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Loading State */}
      <div className="hidden sm:flex gap-6 h-full p-2">
        {/* Enhanced Thumbnail */}
        <div className="flex-shrink-0 w-32 aspect-square rounded-md bg-[var(--bg-secondary)] relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <Brain className="w-8 h-8 text-[var(--accent-primary)] animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] via-transparent to-transparent" />
            </div>
          </div>
          {/* Circular progress */}
          <svg className="absolute inset-0 w-full h-full rotating-circle" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[var(--accent-primary)]/10"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-[var(--accent-primary)] progress-circle"
            />
          </svg>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-6 px-3 rounded-full bg-[var(--accent-primary)]/10 flex items-center gap-2">
              <CurrentIcon className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="text-sm text-[var(--accent-primary)] transition-opacity duration-300">
                {phases[loadingPhase].text}
              </span>
            </div>
          </div>

          {/* Animated Content */}
          <div className="space-y-3">
            <div className="h-6 w-3/4 rounded bg-[var(--bg-secondary)] animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-[var(--bg-secondary)] animate-pulse" />
              <div className="h-4 w-full rounded bg-[var(--bg-secondary)] animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-[var(--bg-secondary)] animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Add required keyframes */}
      <style>
        {`
          .loading-bar {
            width: 30%;
            animation: loadingBar 2s ease-in-out infinite;
          }

          @keyframes loadingBar {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }

          .rotating-circle {
            animation: rotate 2s linear infinite;
          }

          .progress-circle {
            stroke-dasharray: 283;
            stroke-dashoffset: 100;
            transform-origin: 50% 50%;
            animation: progress 1.4s ease-in-out infinite;
          }

          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes progress {
            0% { stroke-dashoffset: 283; }
            50% { stroke-dashoffset: 100; }
            100% { stroke-dashoffset: 283; }
          }
        `}
      </style>
    </div>
  );
};

const QuickMatch = ({ 
  recommendation, 
  place, 
  onViewDetails,
  isAnalyzing 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [contentReady, setContentReady] = useState(false);
  const [initialRender, setInitialRender] = useState(true);

  // Handle initial render and transitions
  useEffect(() => {
    if (initialRender) {
      setInitialRender(false);
      // If we have cached data, show it immediately
      if (recommendation && place && !isAnalyzing) {
        requestAnimationFrame(() => {
          setContentReady(true);
        });
      }
    } else if (!isAnalyzing && recommendation && place) {
      const timer = setTimeout(() => {
        setContentReady(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, recommendation, place, initialRender]);

  // Reset content ready state when analysis starts
  useEffect(() => {
    if (isAnalyzing) {
      setContentReady(false);
    }
  }, [isAnalyzing]);

  if (!isVisible || (!isAnalyzing && !recommendation && !place)) {
    return null;
  }

  return (
    <div className="sticky top-1 z-40 -mx-2 sm:-mx-4 sm:p-4">
      <div className="bg-[var(--bg-primary)] border border-[var(--accent-primary)] rounded-lg 
        shadow-md transition-all duration-300">
        {/* Fixed height container - Increased height for desktop */}
        <div className="relative min-h-[140px] sm:min-h-[220px]">
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
                {/* Mobile View - Unchanged */}
                <div className="sm:hidden h-[140px] p-4">
                  {/* Dismiss Button */}
                  <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-2 top-2 z-10 p-1.5 rounded-full
                      bg-[var(--bg-primary)]/90 hover:bg-[var(--bg-secondary)]
                      text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                      transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex gap-3 h-full">
                    {/* Image Container */}
                    <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden 
                      bg-[var(--bg-secondary)]">
                      {place.thumbnail_img ? (
                        <img
                          src={place.thumbnail_img}
                          alt={place.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center 
                          bg-[var(--accent-primary)]/5">
                          <Brain className="w-5 h-5 text-[var(--accent-primary)]" />
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 py-1 flex items-center justify-center
                        bg-[var(--accent-primary)] text-white text-xs font-medium">
                        {place.workabilityScore}/10
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <AIBadge />
                        <span className="text-xs text-[var(--text-secondary)]">
                          {place.distance}mi
                        </span>
                      </div>
                      <h3 className="font-medium text-[var(--text-primary)] truncate">
                        {place.title}
                      </h3>
                      <p className={`text-xs text-[var(--text-secondary)] mt-1 flex-1
                        ${!isExpanded ? 'line-clamp-2' : ''}`}>
                        {recommendation.personalNote}
                      </p>
                      {recommendation.personalNote.length > 100 && (
                        <button
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="mt-1 flex items-center gap-1 text-xs font-medium 
                            text-[var(--accent-primary)] hover:text-[var(--accent-secondary)]
                            transition-colors"
                        >
                          {isExpanded ? (
                            <>Show less <ChevronUp className="w-3 h-3" /></>
                          ) : (
                            <>Read more <ChevronDown className="w-3 h-3" /></>
                          )}
                        </button>
                      )}
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={onViewDetails}
                      className="flex-shrink-0 self-center p-2 rounded-md
                        hover:bg-[var(--bg-secondary)] text-[var(--accent-primary)]
                        transition-colors"
                      aria-label="View workspace details"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Desktop View - Adjusted height and padding */}
                <div className="hidden sm:flex min-h-[220px] p-6 gap-6">
                  {/* Dismiss Button */}
                  <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-4 top-4 z-10 
                      flex items-center gap-1.5 px-3 py-1.5 rounded-md
                      border border-[var(--border-primary)]
                      bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]
                      text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                      text-xs font-medium
                      transition-colors duration-200"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Dismiss</span>
                  </button>

                  {/* Image Container */}
                  <div className="relative flex-shrink-0 w-36 rounded-md overflow-hidden 
                    bg-[var(--bg-secondary)]">
                    <div className="aspect-square">
                      {place.thumbnail_img ? (
                        <img
                          src={place.thumbnail_img}
                          alt={place.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center 
                          bg-[var(--accent-primary)]/5">
                          <Brain className="w-8 h-8 text-[var(--accent-primary)]" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 inset-x-0 py-1.5 flex items-center justify-center
                      bg-[var(--accent-primary)] text-white text-sm font-medium">
                      {place.workabilityScore}/10
                    </div>
                  </div>

                  {/* Content - Adjusted spacing */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="px-2 py-1 rounded-full bg-[var(--accent-primary)] 
                        text-white text-xs font-medium flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5" />
                        AI Pick
                      </div>
                      <span className="text-sm text-[var(--text-secondary)]">
                        {place.distance} miles away
                      </span>
                    </div>

                    <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3">
                      {place.title}
                    </h3>

                    <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-4">
                      {recommendation.personalNote}
                    </p>

                    <button
                      onClick={onViewDetails}
                      className="flex items-center gap-2 text-[var(--accent-primary)]
                        hover:text-[var(--accent-secondary)] transition-colors text-sm font-medium"
                    >
                      View workspace details
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Expandable content for mobile */}
        {isExpanded && contentReady && recommendation?.standoutFeatures && (
          <div className="sm:hidden px-4 pb-4 animate-in fade-in slide-in-from-top duration-300">
            <div className="space-y-2">
              {recommendation.standoutFeatures.map((feature, index) => (
                <div key={index} className="text-xs text-[var(--text-secondary)]">
                  <span className="font-medium text-[var(--text-primary)]">
                    {feature.title}:
                  </span>{' '}
                  {feature.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickMatch;