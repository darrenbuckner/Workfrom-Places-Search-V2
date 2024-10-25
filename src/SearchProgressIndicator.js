import React from 'react';
import { 
  MapPin, 
  Search, 
  Loader, 
  Check,
  AlertCircle
} from 'lucide-react';

const SearchProgressIndicator = ({ phase, error }) => {
  const steps = [
    {
      key: 'locating',
      label: 'Getting your location',
      icon: MapPin,
      loading: phase === 'locating',
      complete: phase === 'loading' || phase === 'complete',
      error: error && phase === 'locating'
    },
    {
      key: 'loading',
      label: 'Finding workspaces',
      icon: Search,
      loading: phase === 'loading',
      complete: phase === 'complete',
      error: error && phase === 'loading'
    }
  ];

  if (phase === 'initial') return null;

  return (
    <div className="mt-4 max-w-lg mx-auto">
      <div className="flex flex-col gap-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          
          return (
            <div 
              key={step.key}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                step.loading
                  ? 'border-blue-500 bg-blue-500/10'
                  : step.complete
                    ? 'border-green-500 bg-green-500/10'
                    : step.error
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-border-primary bg-bg-secondary opacity-50'
              }`}
            >
              <div className="relative">
                {/* Background circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.loading
                    ? 'bg-blue-500'
                    : step.complete
                      ? 'bg-green-500'
                      : step.error
                        ? 'bg-red-500'
                        : 'bg-bg-tertiary'
                }`}>
                  {step.loading ? (
                    <Loader className="w-4 h-4 text-white animate-spin" />
                  ) : step.complete ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : step.error ? (
                    <AlertCircle className="w-4 h-4 text-white" />
                  ) : (
                    <Icon className="w-4 h-4 text-text-secondary" />
                  )}
                </div>

                {/* Progress line connecting steps */}
                {index < steps.length - 1 && (
                  <div className={`absolute left-1/2 top-full h-3 w-px ${
                    step.complete
                      ? 'bg-green-500'
                      : 'bg-border-primary'
                  }`} />
                )}
              </div>

              <div className="flex-1">
                <div className={`font-medium ${
                  step.loading
                    ? 'text-blue-500'
                    : step.complete
                      ? 'text-green-500'
                      : step.error
                        ? 'text-red-500'
                        : 'text-text-secondary'
                }`}>
                  {step.label}
                </div>
                {step.loading && (
                  <div className="text-sm text-text-secondary mt-0.5">
                    {step.key === 'locating'
                      ? 'Please allow location access if prompted'
                      : 'Searching nearby places...'}
                  </div>
                )}
                {step.error && error && (
                  <div className="text-sm text-red-500 mt-0.5">
                    {error}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchProgressIndicator;