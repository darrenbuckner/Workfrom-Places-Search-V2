import React from 'react';
import { AlertCircle, MapPin, Plus } from 'lucide-react';

const MessageBanner = ({ message, type = 'info', onAction }) => {
  if (type === 'no-results') {
    return (
      <div className="rounded-lg border border-border-primary overflow-hidden">
        <div className="p-4 bg-bg-secondary">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-accent-primary" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-primary">No places found nearby</p>
              <p className="text-sm text-text-secondary mt-1">
                We couldn't find any work-friendly spots in this area yet. Help grow the community by adding places you discover!
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onAction?.('radius')}
              className="flex-1 px-4 py-2 rounded-md border border-border-primary 
                bg-bg-tertiary hover:bg-bg-primary transition-colors
                text-sm text-text-primary"
            >
              Try increasing search radius
            </button>
            <button
              onClick={() => onAction?.('add')}
              className="flex-1 px-4 py-2 rounded-md bg-accent-primary 
                hover:bg-accent-secondary transition-colors text-[var(--button-text)] text-sm
                flex items-center justify-center gap-1.5"
            >
              <Plus size={14} />
              Add a new place
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 mb-6 flex items-start gap-3 ${
      type === 'error' 
        ? 'bg-red-500/10 border border-red-500/20' 
        : 'bg-blue-500/10 border border-blue-500/20'
    }`}>
      <AlertCircle 
        className={`flex-shrink-0 w-5 h-5 ${
          type === 'error' ? 'text-red-500' : 'text-[var(--action-primary)]'
        }`} 
      />
      <p className={`text-sm ${
        type === 'error' ? 'text-red-500' : 'text-[var(--action-primary)]'
      }`}>
        {message}
      </p>
    </div>
  );
};

export default MessageBanner;