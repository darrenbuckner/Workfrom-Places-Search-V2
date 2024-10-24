import React from 'react';
import { mapPin } from 'lucide-react';

const LocationConfirmDialog = ({ 
  locationName, 
  onUseExisting, 
  onSearchNew, 
  onCancel 
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-bg-primary border border-border-primary rounded-lg shadow-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">
            Choose Location
          </h2>
          
          <p className="text-text-secondary mb-6">
            You have a saved location in {locationName}. Would you like to:
          </p>
          
          <div className="space-y-3">
            <button
              onClick={onUseExisting}
              className="w-full p-4 border border-border-primary rounded-lg bg-bg-secondary hover:bg-bg-tertiary transition-colors text-left group"
            >
              <div className="flex items-center">
                <div className="bg-accent-primary/10 rounded-full p-2 mr-3">
                  <mapPin className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <div className="font-medium text-text-primary">
                    Use saved location
                  </div>
                  <div className="text-sm text-text-secondary">
                    Search again in {locationName}
                  </div>
                </div>
              </div>
            </button>
            
            <button
              onClick={onSearchNew}
              className="w-full p-4 border border-border-primary rounded-lg bg-bg-secondary hover:bg-bg-tertiary transition-colors text-left group"
            >
              <div className="flex items-center">
                <div className="bg-accent-primary/10 rounded-full p-2 mr-3">
                  <mapPin className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <div className="font-medium text-text-primary">
                    Search new area
                  </div>
                  <div className="text-sm text-text-secondary">
                    Use your current location
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
        
        <div className="border-t border-border-primary p-4 bg-bg-secondary rounded-b-lg">
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationConfirmDialog;