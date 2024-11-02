import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Brain, X, Wifi, Battery, Volume2, Coffee, Users, Sparkles } from 'lucide-react';

const AIBadge = ({ className = "" }) => (
  <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full 
    bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium ${className}`}>
    <Brain className="w-3 h-3" />
    <span>AI Pick</span>
  </div>
);

const LoadingState = ({ progress }) => {
  const [currentMetric, setCurrentMetric] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const progressBarRef = useRef(null);
  
  const metrics = [
    { 
      icon: Wifi, 
      label: "Analyzing connectivity",
      detail: "Evaluating WiFi speeds and reliability"
    },
    { 
      icon: Volume2, 
      label: "Checking atmosphere",
      detail: "Assessing noise levels and ambiance"
    },
    { 
      icon: Battery, 
      label: "Reviewing facilities",
      detail: "Checking power availability"
    },
    { 
      icon: Users, 
      label: "Processing feedback",
      detail: "Reading community insights"
    }
  ];

  useEffect(() => {
    const metricInterval = setInterval(() => {
      setCurrentMetric(prev => (prev + 1) % metrics.length);
    }, 2000);

    const phaseInterval = setInterval(() => {
      setLoadingPhase(prev => (prev + 1) % 4);
    }, 500);

    return () => {
      clearInterval(metricInterval);
      clearInterval(phaseInterval);
    };
  }, []);

  const currentIcon = metrics[currentMetric].icon;
  const Icon = currentIcon;

  return (
    <div className="p-4">
      {/* Top Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--bg-secondary)]">
        <div 
          ref={progressBarRef}
          className="absolute top-0 left-0 h-full bg-[var(--accent-primary)] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-start gap-4">
        {/* Animated Icon Container */}
        <div className="relative flex-shrink-0 w-12 h-12 rounded-lg 
          bg-[var(--accent-primary)]/10 flex items-center justify-center group">
          <Icon 
            className="w-6 h-6 text-[var(--accent-primary)] 
              transition-all duration-300 transform group-hover:scale-110" 
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full 
            bg-[var(--accent-primary)] flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white animate-pulse" />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <AIBadge />
            <span className="text-xs text-[var(--text-secondary)]">
              Finding your perfect spot
            </span>
          </div>
          
          {/* Current Action */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {metrics[currentMetric].label}{'.'.repeat(loadingPhase)}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {metrics[currentMetric].detail}
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {metrics.map((metric, index) => {
              const isCurrent = index === currentMetric;
              const isComplete = index < currentMetric;
              
              return (
                <div key={index} className="space-y-1">
                  <div className={`h-1 rounded-full overflow-hidden transition-colors duration-300
                    ${isCurrent ? 'bg-[var(--accent-primary)]/20' : 'bg-[var(--bg-secondary)]'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-300 
                        ${isComplete ? 'bg-[var(--accent-primary)]' : 
                          isCurrent ? 'bg-[var(--accent-primary)] animate-pulse' : ''}`}
                      style={{ 
                        width: isComplete ? '100%' : 
                               isCurrent ? `${progress}%` : '0%'
                      }}
                    />
                  </div>
                  <div className={`flex items-center justify-center transition-colors duration-300
                    ${isComplete ? 'text-[var(--accent-primary)]' : 
                      isCurrent ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    <metric.icon className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultContent = ({ place, recommendation, onViewDetails, onDismiss, isMobile }) => {
  const contentRef = useRef(null);
  const description = recommendation.headline || recommendation.context;

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.opacity = '0';
      contentRef.current.style.transform = 'translateY(10px)';
      
      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.style.opacity = '1';
          contentRef.current.style.transform = 'translateY(0)';
        }
      });
    }
  }, []);

  if (isMobile) {
    return (
      <div className="p-4" ref={contentRef}>
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-md relative
            bg-[var(--accent-primary)] text-white
            flex items-center justify-center font-bold text-lg">
            {place.workabilityScore}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full 
              bg-[var(--accent-primary)] flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white animate-pulse" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <AIBadge />
              <span className="text-xs text-[var(--text-secondary)]">
                {place.distance}mi away
              </span>
            </div>
            
            <h3 className="font-medium text-[var(--text-primary)] truncate">
              {place.title}
            </h3>

            {/* Added Description */}
            {description && (
              <p className="text-sm text-[var(--text-primary)] mt-1 line-clamp-1 font-medium">
                {description}
              </p>
            )}
            
            <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
              {recommendation.personalNote}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Dismiss
          </button>
          
          <button
            onClick={onViewDetails}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md
              bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)]
              text-white text-sm font-medium transition-colors"
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4" ref={contentRef}>
      <div className="flex gap-4">
        {/* Score badge section remains the same */}
        <div className="flex-shrink-0 w-14 h-14 rounded-md relative
          bg-[var(--accent-primary)] text-white
          flex items-center justify-center font-bold text-xl
          group">
          {place.workabilityScore}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full 
            bg-[var(--accent-primary)] flex items-center justify-center
            transform transition-transform group-hover:scale-110">
            <Sparkles className="w-3 h-3 text-white animate-pulse" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header remains the same */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <AIBadge />
              <span className="text-sm text-[var(--text-secondary)]">
                {place.distance} miles away
              </span>
            </div>
            <button
              onClick={onDismiss}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                transition-colors"
            >
              Dismiss
            </button>
          </div>

          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
            {place.title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
              {description}
            </p>
          )}

          <p className="text-sm text-[var(--text-secondary)] mb-3">
            {recommendation.personalNote}
          </p>

          {/* Simplified Standout Features */}
          {recommendation.standoutFeatures?.length > 0 && (
            <div className="text-xs text-[var(--text-secondary)] space-y-1">
              {recommendation.standoutFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[var(--accent-primary)]" />
                  <span>{feature.description}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={onViewDetails}
            className="mt-4 flex items-center gap-2 text-[var(--accent-primary)]
              hover:text-[var(--accent-secondary)] transition-colors text-sm font-medium"
          >
            See more about this space
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const isMobileRef = useRef(window.innerWidth < 640);
  const containerRef = useRef(null);

  // Handle loading progress animation
  useEffect(() => {
    if (isAnalyzing) {
      setLoadingProgress(0);
      setShowContent(false);
      
      const startTime = Date.now();
      const duration = 8000; // 8 seconds total for analysis
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 90);
        
        if (progress >= 90) {
          clearInterval(interval);
        }
        
        setLoadingProgress(progress);
      }, 100);

      return () => clearInterval(interval);
    } else if (recommendation && place) {
      setLoadingProgress(100);
      
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, recommendation, place]);

  useEffect(() => {
    const handleResize = () => {
      isMobileRef.current = window.innerWidth < 640;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isVisible || (!isAnalyzing && !recommendation && !place)) return null;

  return (
    <div className="sticky top-1 z-40 -mx-1 sm:-mx-4 sm:p-4">
      <div ref={containerRef} 
        className="relative bg-[var(--bg-primary)] border border-[var(--accent-primary)] 
          rounded-lg shadow-md overflow-hidden transition-all duration-300">
        
        {/* Loading State */}
        <div className={`transition-opacity duration-500 ${
          isAnalyzing ? 'opacity-100 visible' : 'opacity-0 invisible absolute inset-0'
        }`}>
          <LoadingState progress={loadingProgress} />
        </div>

        {/* Result Content */}
        <div className={`transition-opacity duration-500 ${
          showContent ? 'opacity-100 visible' : 'opacity-0 invisible absolute inset-0'
        }`}>
          {showContent && recommendation && place && (
            <ResultContent 
              place={place}
              recommendation={recommendation}
              onViewDetails={onViewDetails}
              onDismiss={() => setIsVisible(false)}
              isMobile={isMobileRef.current}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickMatch;