import React from 'react';
import { SearchPhases } from './constants';
import { MapPin } from 'lucide-react';

const UnifiedLoadingState = ({ searchPhase, locationName }) => {
  const message = searchPhase === SearchPhases.LOCATING
    ? "Finding your location..."
    : `Searching for workspaces near ${locationName || 'you'}`;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-8">
        {/* Central pin */}
        <div className="relative z-10">
          <MapPin size={32} className="text-[var(--accent-primary)]" />
        </div>
        
        {/* Animated radar circles */}
        <div className="absolute inset-0 -m-8">
          <div className="absolute inset-0 animate-ping-slow opacity-75 rounded-full bg-[var(--accent-primary)]/10" />
          <div className="absolute inset-0 -m-4 animate-ping-slower opacity-50 rounded-full bg-[var(--accent-primary)]/5" />
          <div className="absolute inset-0 -m-8 animate-ping-slowest opacity-25 rounded-full bg-[var(--accent-primary)]/5" />
        </div>
      </div>

      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
        {message}
      </h3>
      <p className="text-sm text-[var(--text-secondary)]">
        This usually takes a few seconds
      </p>
    </div>
  );
};

export default UnifiedLoadingState;