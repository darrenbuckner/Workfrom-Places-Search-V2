import React from 'react';
import { Search, Loader, AlertCircle } from 'lucide-react';

const SearchProgressIndicator = ({ phase, error, usingSavedLocation }) => {
  // Don't show anything in initial state
  if (phase === 'initial') return null;

  return (
    <div className="mt-4 max-w-lg mx-auto">
      <div className="flex flex-col gap-3">
        {/* Only show location message if getting new location */}
        {!usingSavedLocation && phase === 'locating' && !error && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-500 bg-blue-500/10">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Loader className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-blue-500">
                Getting your location
              </div>
              <div className="text-sm text-text-secondary mt-0.5">
                Please allow location access if prompted
              </div>
            </div>
          </div>
        )}

        {/* Show searching message during search phase */}
        {phase === 'loading' && !error && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-500 bg-blue-500/10">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Loader className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-blue-500">
                Finding places nearby
              </div>
              <div className="text-sm text-text-secondary mt-0.5">
                Searching nearby places...
              </div>
            </div>
          </div>
        )}

        {/* Show errors if they occur */}
        {error && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-red-500 bg-red-500/10">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-red-500">
                Error
              </div>
              <div className="text-sm text-red-500 mt-0.5">
                {error}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchProgressIndicator;