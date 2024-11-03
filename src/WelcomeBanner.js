import React from 'react';
import { Coffee, Sun, Moon, Sunset } from 'lucide-react';

const WelcomeBanner = () => {
  // Get current hour to show appropriate greeting
  const hour = new Date().getHours();
  
  // Determine greeting and icon based on time of day
  const getTimeBasedContent = () => {
    if (hour < 12) {
      return {
        greeting: "Hello",
        Icon: Sun,
        message: "Let's find your perfect morning workspace."
      };
    } else if (hour < 17) {
      return {
        greeting: "Hi",
        Icon: Sunset,
        message: "Let's find a productive afternoon spot."
      };
    } else {
      return {
        greeting: "Welcome",
        Icon: Moon,
        message: "Let's find a calm evening workspace."
      };
    }
  };

  const { greeting, Icon, message } = getTimeBasedContent();

  return (
    <div className="mb-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-medium text-[var(--text-primary)]">
            {greeting}, friend! 👋
          </h2>
          <p className="text-[var(--text-secondary)] mt-1">
            {message}
          </p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default WelcomeBanner;