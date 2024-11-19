import React from 'react';
import { Coffee, Github, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pb-6 px-4 mt-auto">
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--border-primary)]">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Coffee size={14} className="text-[var(--accent-primary)]" />
          <span className="text-xs">
            Find great workspaces, anywhere.
          </span>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--text-secondary)]">
          <a 
            href="https://github.com/workfrom" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors"
          >
            <Github size={14} />
            <span>Open Source</span>
          </a>
          
          <span className="hidden sm:inline text-[var(--text-tertiary)]">•</span>
          
          <div className="flex items-center gap-1.5">
            <span>Made with</span>
            <Heart size={12} className="text-[var(--accent-primary)]" />
            <span>© {currentYear}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;