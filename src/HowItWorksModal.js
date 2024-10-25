import React from 'react';
import { X, Wifi, Battery, Volume2, Coffee, ChevronLeft } from 'lucide-react';
import { useScrollLock } from './useScrollLock';
import { useTheme } from './ThemeProvider';

const HowItWorksModal = ({ setShowModal }) => {
  useScrollLock(true);
  const { isDark } = useTheme();
  
  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto md:overflow-hidden">
      <div className="min-h-screen md:flex md:items-center md:justify-center">
        <div className={`md:w-[600px] ${
          isDark ? 'bg-[#1a1f2c] border-white/10' : 'bg-white border-gray-200'
        } md:rounded-lg overflow-hidden relative border`}>
          {/* Close Button - Desktop */}
          <button 
            onClick={() => setShowModal(false)}
            className={`hidden md:flex absolute right-4 top-4 z-20 items-center justify-center w-8 h-8 rounded-full transition-colors ${
              isDark 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <X size={20} />
          </button>

          {/* Mobile Header */}
          <div className={`sticky top-0 backdrop-blur-sm border-b z-10 md:hidden ${
            isDark 
              ? 'bg-[#1a1f2c]/95 border-white/10' 
              : 'bg-white/95 border-gray-200'
          }`}>
            <div className="flex items-center justify-between p-3">
              <button 
                onClick={() => setShowModal(false)}
                className={`flex items-center ${
                  isDark 
                    ? 'text-blue-300 hover:text-blue-200' 
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                <ChevronLeft size={20} className="mr-1" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <h2 className={`text-base font-semibold text-center flex-1 mx-4 truncate ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                How It Works
              </h2>
              <div className="w-8" />
            </div>
          </div>

          <div className="p-6">
            {/* Header - Desktop */}
            <div className="hidden md:block mb-6">
              <h2 className={`text-2xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                How It Works
              </h2>
              <p className={isDark ? 'text-blue-200' : 'text-gray-600'}>
                Find the perfect workspace in your area
              </p>
            </div>

            {/* Steps Section */}
            <div className="mb-8">
              <h3 className={`font-medium mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Quick Start Guide
              </h3>
              <div className="space-y-4">
                {[
                  'Share your location to discover nearby spots',
                  'Set your preferred search radius (default is 2 miles)',
                  'View results as a list or interactive map'
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                      isDark 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`mt-0.5 ${
                      isDark ? 'text-blue-100' : 'text-gray-700'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workability Score Section */}
            <div className={`rounded-lg p-4 mb-6 border ${
              isDark 
                ? 'bg-[#2a3142] border-white/10' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`font-medium mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Understanding Workability Scores
              </h3>
              <div className="grid gap-4">
                {[
                  { 
                    icon: <Wifi />, 
                    title: 'WiFi Quality',
                    description: 'Speed and reliability ratings from real users'
                  },
                  {
                    icon: <Battery />,
                    title: 'Power Access',
                    description: 'Availability of power outlets for your devices'
                  },
                  {
                    icon: <Volume2 />,
                    title: 'Noise Levels',
                    description: 'Typical ambient sound and workspace atmosphere'
                  },
                  {
                    icon: <Coffee />,
                    title: 'Amenities',
                    description: 'Food, drinks, seating options, and other facilities'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 mt-1 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className={`font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.title}
                      </p>
                      <p className={`text-sm ${
                        isDark ? 'text-blue-200' : 'text-gray-600'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Note */}
            <div className={`text-sm rounded-lg p-4 ${
              isDark 
                ? 'bg-blue-500/10 text-blue-200' 
                : 'bg-blue-50 text-blue-700'
            }`}>
              <p>
                <span className={`font-medium ${
                  isDark ? 'text-white' : 'text-blue-900'
                }`}>
                  Community-Powered:
                </span>{' '}
                All listings come from the Workfrom community. See a place that should be listed? 
                Use the "Add Place" button to share it with others!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal;