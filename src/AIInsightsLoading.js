import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, ChevronRight, MapPin } from 'lucide-react';

const AIInsightsLoading = ({ locationName }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    'Analyzing workspace data...',
    'Finding hidden gems...',
    'Evaluating amenities...',
    'Identifying optimal spots...',
    'Generating recommendations...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-lg border border-[var(--border-primary)] overflow-hidden bg-[var(--bg-secondary)]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-primary)]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 
            flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              Analyzing Workspaces
            </h3>
            <p className="text-sm text-[var--text-secondary)]">
              Finding the best spots in {locationName || 'this area'}
            </p>
          </div>
        </div>
      </div>

      {/* Loading Content */}
      <div className="p-4">
        <div className="space-y-4">
          {/* Progress Steps */}
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border 
                  transition-all duration-300
                  ${index === currentStep 
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5' 
                    : index < currentStep
                      ? 'border-[var(--border-primary)] bg-[var(--bg-primary)] opacity-50'
                      : 'border-[var(--border-primary)] bg-[var(--bg-primary)] opacity-25'
                  }`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${index === currentStep 
                    ? 'bg-[var(--accent-primary)]/10' 
                    : 'bg-[var(--bg-secondary)]'
                  }
                `}>
                  {index === currentStep ? (
                    <Sparkles className={`w-4 h-4 ${
                      index === currentStep 
                        ? 'text-[var(--accent-primary)]' 
                        : 'text-[var(--text-secondary)]'
                    }`} />
                  ) : index < currentStep ? (
                    <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-[var(--text-secondary)]" />
                  )}
                </div>
                <span className={`text-sm ${
                  index === currentStep 
                    ? 'text-[var(--text-primary)] font-medium' 
                    : 'text-[var(--text-secondary)]'
                }`}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          {/* Loading Bar */}
          <div className="h-1 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--accent-primary)] transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsLoading;