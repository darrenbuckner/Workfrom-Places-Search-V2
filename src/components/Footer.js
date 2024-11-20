import React from 'react';
import { Coffee, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Spacer div to ensure content isn't hidden behind footer */}
      <div className="h-36 sm:h-24" /> 

      <footer className="sticky bottom-0 w-full bg-[var(--bg-primary)] py-4 px-4 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-center sm:justify-center gap-2 text-[var(--text-secondary)]">
          <Coffee size={14} className="text-[var(--accent-primary)]" />
          <span className="text-xs">
            Find great workspaces, anywhere. <span>© {currentYear}</span>
          </span>
        </div>
      </footer>
    </>
  );
};

export default Footer;