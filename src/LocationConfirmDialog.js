import React from 'react';
import { MapPin } from 'lucide-react';

const LocationConfirmDialog = ({ 
  locationName, 
  onUseExisting, 
  onSearchNew, 
  onCancel 
}) => {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1f2c] rounded-lg shadow-lg max-w-md w-full border border-white/10">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Choose Location
          </h2>
          
          <p className="text-blue-200 mb-6">
            You have a saved location in {locationName}. Would you like to:
          </p>
          
          <div className="space-y-3">
            <button
              onClick={onUseExisting}
              className="w-full p-4 border border-white/10 rounded-lg bg-[#2a3142] hover:bg-[#323950] transition-colors text-left group"
            >
              <div className="flex items-center">
                <div className="bg-blue-500/10 rounded-full p-2 mr-3">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-white">
                    Use your last location
                  </div>
                  <div className="text-sm text-blue-200">
                    Search again in {locationName}
                  </div>
                </div>
              </div>
            </button>
            
            <button
              onClick={onSearchNew}
              className="w-full p-4 border border-white/10 rounded-lg bg-[#2a3142] hover:bg-[#323950] transition-colors text-left group"
            >
              <div className="flex items-center">
                <div className="bg-blue-500/10 rounded-full p-2 mr-3">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-white">
                    Search a new area
                  </div>
                  <div className="text-sm text-blue-200">
                    Lookup your new location
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
        
        <div className="border-t border-white/10 p-4 bg-[#232838] rounded-b-lg">
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 text-blue-200 hover:text-white transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationConfirmDialog;