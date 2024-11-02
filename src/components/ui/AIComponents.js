import React from 'react';
import { Brain, Wifi, Volume2, Clock, Battery } from 'lucide-react';

const loadingPhrases = [
  'Analyzing WiFi speeds...',
  'Evaluating noise levels...',
  'Checking power availability...',
  'Assessing workspace comfort...',
  'Reviewing member feedback...'
];

export const AILoadingMessage = () => {
  const [currentPhrase, setCurrentPhrase] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase(current => (current + 1) % loadingPhrases.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-lg border border-[var(--accent-primary)]/20 bg-[var(--bg-secondary)] overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center animate-pulse">
              <Brain className="w-4 h-4 text-[var(--accent-primary)]" />
            </div>
          </div>
          <div>
            <h3 className="font-medium text-[var(--text-primary)]">
              AI Workspace Analysis
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Finding your perfect remote work spot
            </p>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="space-y-4">
          {/* Loading phrase with typing animation */}
          <div className="h-5 flex items-center">
            <p className="text-sm text-[var(--accent-primary)] typing-animation">
              {loadingPhrases[currentPhrase]}
            </p>
          </div>

          {/* Analysis Progress Bars */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Wifi, label: 'Connectivity' },
              { icon: Volume2, label: 'Atmosphere' },
              { icon: Battery, label: 'Facilities' },
              { icon: Clock, label: 'Availability' }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-[var(--text-secondary)]" />
                <div className="flex-1">
                  <div className="text-xs text-[var(--text-secondary)] mb-1">
                    {item.label}
                  </div>
                  <div className="h-1 rounded-full bg-[var(--border-primary)] overflow-hidden">
                    <div 
                      className="h-full bg-[var(--accent-primary)] rounded-full loading-bar"
                      style={{ 
                        animationDelay: `${index * 0.2}s`,
                        animationDuration: '1.5s'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Info Section */}
      <div className="border-t border-[var(--border-primary)] px-4 py-3 bg-[var(--bg-primary)]/50">
        <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5" />
          Using real-time data and community insights
        </p>
      </div>

      {/* Add required keyframe animations */}
      <style>
        {`
          @keyframes loading {
            0% { width: 0%; }
            50% { width: 100%; }
            100% { width: 0%; }
          }

          .loading-bar {
            animation: loading ease-in-out infinite;
          }

          @keyframes typing {
            from { opacity: 0.5; }
            to { opacity: 1; }
          }

          .typing-animation {
            animation: typing 0.5s ease-in-out infinite alternate;
          }
        `}
      </style>
    </div>
  );
};

export const AIErrorMessage = ({ message, onRetry }) => (
  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
          <Brain className="w-4 h-4 text-red-500" />
        </div>
      </div>
      <div>
        <h3 className="font-medium text-red-500">
          Analysis Interrupted
        </h3>
        <p className="text-sm text-red-500/90 mt-1">
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 text-sm font-medium text-red-500 hover:text-red-600 
              transition-colors flex items-center gap-1.5"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  </div>
);