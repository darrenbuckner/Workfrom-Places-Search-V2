import React from 'react';
import { Sun, Moon, Sunset } from 'lucide-react';

const WelcomeBanner = ({ isSearchPerformed = false }) => {
  if (isSearchPerformed) {
    return null;
  }

  const hour = new Date().getHours();
  
  const getTimeBasedContent = () => {
    if (hour < 12) {
      return {
        greeting: "Good morning",
        Icon: Sun,
        message: "Find your perfect morning workspace nearby."
      };
    } else if (hour < 17) {
      return {
        greeting: "Good afternoon",
        Icon: Sunset,
        message: "Discover productive spaces in your area."
      };
    } else {
      return {
        greeting: "Good evening",
        Icon: Moon,
        message: "Find a calm evening workspace near you."
      };
    }
  };

  const { greeting, Icon, message } = getTimeBasedContent();

  return (
    <div className="animate-fadeIn mb-4">
      <div className="relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--accent-primary)]/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[var(--accent-primary)]/5 rounded-full blur-xl" />
        
        <div className="relative p-2 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Icon Container */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[var(--accent-primary)]/10 
                flex items-center justify-center">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent-primary)]" />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] 
                mb-1 flex items-center gap-2">
                {greeting}
                <span className="inline-block animate-wave origin-bottom-right">👋</span>
              </h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)]">
                {message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;