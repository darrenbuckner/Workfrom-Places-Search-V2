import React from 'react';
import { X, Wifi, Battery, Volume2, Coffee, ChevronLeft } from 'lucide-react';
import { useScrollLock } from './useScrollLock';

const HowItWorksModal = ({ setShowModal }) => {
  useScrollLock(true);
  
  return (
    <div className="fixed inset-0 bg-black/90 modal-backdrop">
      <div className="min-h-screen md:flex md:items-center md:justify-center">
        <div className="md:w-[600px] bg-white md:rounded-lg overflow-hidden relative">
          {/* Close Button - Desktop */}
          <button 
            onClick={() => setShowModal(false)}
            className="hidden md:flex absolute right-4 top-4 z-20 items-center justify-center w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Mobile Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b z-10 md:hidden">
            <div className="flex items-center justify-between p-3">
              <button 
                onClick={() => setShowModal(false)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft size={20} className="mr-1" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <h2 className="text-base font-semibold text-center flex-1 mx-4 truncate">
                How It Works
              </h2>
              <div className="w-8" />
            </div>
          </div>

          <div className="p-6">
            {/* Header - Desktop */}
            <div className="hidden md:block mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">How It Works</h2>
              <p className="text-gray-600">Find the perfect workspace in your area</p>
            </div>

            {/* Steps Section */}
            <div className="mb-8">
              <h3 className="font-medium text-gray-900 mb-4">Quick Start Guide</h3>
              <div className="space-y-4">
                {[
                  'Share your location to discover nearby spots',
                  'Set your preferred search radius (default is 2 miles)',
                  'View results as a list or interactive map'
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 mt-0.5">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workability Score Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Understanding Workability Scores</h3>
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <Wifi className="flex-shrink-0 w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">WiFi Quality</p>
                    <p className="text-sm text-gray-600">Speed and reliability ratings from real users</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Battery className="flex-shrink-0 w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Power Access</p>
                    <p className="text-sm text-gray-600">Availability of power outlets for your devices</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Volume2 className="flex-shrink-0 w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Noise Levels</p>
                    <p className="text-sm text-gray-600">Typical ambient sound and workspace atmosphere</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Coffee className="flex-shrink-0 w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Amenities</p>
                    <p className="text-sm text-gray-600">Food, drinks, seating options, and other facilities</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Community Note */}
            <div className="text-sm text-gray-500 bg-blue-50 rounded-lg p-4">
              <p>
                <span className="font-medium text-gray-900">Community-Powered:</span>{' '}
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