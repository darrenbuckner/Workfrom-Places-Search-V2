import React from 'react';
import { MapPin } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const LocationConfirmDialog = ({ 
  locationName, 
  onUseExisting, 
  onSearchNew, 
  onCancel 
}) => {
  const { isDark } = useTheme();
  
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className={`
        max-w-md w-full rounded-lg shadow-lg border
        ${isDark 
          ? 'bg-[#1a1f2c] border-white/10' 
          : 'bg-[var(--bg-primary)] border-[var(--border-primary)]'
        }
      `}>
        <div className="p-6">
          <h2 className={`text-xl font-semibold mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Choose Location
          </h2>
          
          <p className={`mb-6 ${
            isDark ? 'text-blue-200' : 'text-[var(--text-secondary)]'
          }`}>
            You have a saved location in {locationName}. Would you like to:
          </p>
          
          <div className="space-y-3">
            <button
              onClick={onUseExisting}
              className={`
                w-full p-4 rounded-lg border text-left group transition-colors
                ${isDark 
                  ? 'bg-[#2a3142] border-white/10 hover:bg-[#323950]' 
                  : 'bg-gray-50 border-[var(--border-primary)] hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center">
                <div className={`
                  rounded-full p-2 mr-3
                  ${isDark 
                    ? 'bg-blue-500/10' 
                    : 'bg-blue-100'
                  }
                `}>
                  <MapPin className={
                    isDark ? 'w-5 h-5 text-blue-400' : 'w-5 h-5 text-blue-600'
                  } />
                </div>
                <div>
                  <div className={
                    isDark ? 'font-medium text-white' : 'font-medium text-gray-900'
                  }>
                    Use your last location
                  </div>
                  <div className={
                    isDark ? 'text-sm text-blue-200' : 'text-sm text-[var(--text-secondary)]'
                  }>
                    Search again in {locationName}
                  </div>
                </div>
              </div>
            </button>
            
            <button
              onClick={onSearchNew}
              className={`
                w-full p-4 rounded-lg border text-left group transition-colors
                ${isDark 
                  ? 'bg-[#2a3142] border-white/10 hover:bg-[#323950]' 
                  : 'bg-gray-50 border-[var(--border-primary)] hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center">
                <div className={`
                  rounded-full p-2 mr-3
                  ${isDark 
                    ? 'bg-blue-500/10' 
                    : 'bg-blue-100'
                  }
                `}>
                  <MapPin className={
                    isDark ? 'w-5 h-5 text-blue-400' : 'w-5 h-5 text-blue-600'
                  } />
                </div>
                <div>
                  <div className={
                    isDark ? 'font-medium text-white' : 'font-medium text-gray-900'
                  }>
                    Search a new area
                  </div>
                  <div className={
                    isDark ? 'text-sm text-blue-200' : 'text-sm text-[var(--text-secondary)]'
                  }>
                    Lookup your new location
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
        
        <div className={`
          border-t p-4 rounded-b-lg
          ${isDark 
            ? 'border-white/10 bg-[#232838]' 
            : 'border-[var(--border-primary)] bg-gray-50'
          }
        `}>
          <button
            onClick={onCancel}
            className={`
              w-full px-4 py-2 text-sm transition-colors
              ${isDark 
                ? 'text-blue-200 hover:text-white' 
                : 'text-[var(--text-secondary)] hover:text-gray-900'
              }
            `}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationConfirmDialog;