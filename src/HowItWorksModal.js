import React from 'react';
import { X, Wifi, Battery, Volume2, Coffee, ChevronLeft } from 'lucide-react';
import { useScrollLock } from './useScrollLock';
import { useTheme } from './ThemeProvider';

const HowItWorksModal = ({ setShowModal }) => {
  useScrollLock(true);
  
  return (
    <div className="fixed inset-0 bg-[var(--modal-backdrop)] backdrop-blur-xl z-50 overflow-y-auto">
      <div className="min-h-screen px-0 md:p-4 flex items-start md:items-center justify-center">
        <div className="w-full md:w-[600px] bg-[var(--bg-primary)] md:rounded-lg 
          overflow-hidden relative border border-[var(--border-primary)]">
          {/* Close Button - Desktop */}
          <button 
            onClick={() => setShowModal(false)}
            className="hidden md:flex absolute right-4 top-4 z-20 items-center justify-center 
              w-8 h-8 rounded-full
              bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] 
              text-[var(--text-primary)] transition-colors"
          >
            <X size={20} />
          </button>

          {/* Mobile Header */}
          <div className="sticky top-0 backdrop-blur-sm border-b z-10 md:hidden
            bg-[var(--bg-primary)]/95 border-[var(--border-primary)]">
            <div className="flex items-center justify-between p-3">
              <button 
                onClick={() => setShowModal(false)}
                className="flex items-center text-[var(--action-primary)] 
                  hover:text-[var(--action-primary-hover)]"
              >
                <ChevronLeft size={20} className="mr-1" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <h2 className="text-base font-semibold text-center flex-1 mx-4 
                truncate text-[var(--text-primary)]"
              >
                How It Works
              </h2>
              <div className="w-8" />
            </div>
          </div>

          {/* Modal content with proper background */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-2rem)] bg-[var(--bg-primary)]">
            <h2 className="text-xl font-semibold mb-4 pr-8 text-[var(--text-primary)]">
              How It Works
            </h2>
            
            <div className="space-y-4">
              <section>
                <h3 className="font-medium mb-2 text-[var(--text-primary)]">Community-Powered</h3>
                <p className="text-[var(--text-secondary)]">
                  Our workspace data is sourced and maintained by remote workers like you. Each location is 
                  verified and rated by community members who work there, providing real insights about WiFi, 
                  power availability, noise levels, and more.
                </p>
              </section>

              <section>
                <h3 className="font-medium mb-2 text-[var(--text-primary)]">Finding Places</h3>
                <p className="text-[var(--text-secondary)]">
                  Share your location to discover the best workspaces nearby. Filter by distance and workspace 
                  type to find exactly what you need, whether it's a quiet cafe, dedicated coworking space, or 
                  public workspace.
                </p>
              </section>

              <section>
                <h3 className="font-medium mb-2 text-[var(--text-primary)]">Workability Score</h3>
                <p className="text-[var(--text-secondary)]">
                  Each space receives a Workability Score based on key remote work factors including WiFi 
                  quality, power availability, noise levels, and amenities. Higher scores indicate better 
                  working environments, validated by community feedback.
                </p>
              </section>

              <section>
                <h3 className="font-medium mb-2 text-[var(--text-primary)]">Smart Recommendations</h3>
                <p className="text-[var(--text-secondary)]">
                  Select your preferred work style - Focus, Group, Video Calls, Casual, or Lively - and our 
                  system will analyze community data to suggest the most suitable spaces. Each recommendation 
                  includes detailed metrics and real user insights.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal;