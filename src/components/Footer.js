import React from 'react';
import { Coffee, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Spacer div to ensure content isn't hidden behind footer */}
      <div className="h-36 sm:h-24" /> 

      <footer className="sticky bottom-0 w-full bg-[var(--bg-primary)] border-t border-[var(--border-primary)] py-4 px-4 z-10">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Coffee size={14} className="text-[var(--accent-primary)]" />
            <span className="text-xs">
              Find great workspaces, anywhere.
            </span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5">
              <span>Made with</span>
              <Heart size={12} className="text-[var(--accent-primary)]" />
              <span>© {currentYear}</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;