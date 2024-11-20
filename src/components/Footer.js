import React from 'react';
import { Coffee, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="footer-wrapper">
      <footer className="fixed-footer">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Coffee size={14} className="text-[var(--accent-primary)]" />
            <span className="text-xs">
              Find great workspaces, anywhere. <span>© {currentYear}</span>
            </span>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        /* Ensure the page content has room for the footer */
        #root {
          min-height: 100vh;
          padding-bottom: var(--footer-height, 80px);
          position: relative;
        }

        /* Footer wrapper to maintain proper spacing */
        .footer-wrapper {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: var(--footer-height, 80px);
        }

        /* Fixed footer with backdrop blur */
        .fixed-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--bg-primary);
          backdrop-filter: blur(8px);
          border-top: 1px solid var(--border-primary);
          padding: 1rem 0;
          z-index: 50;
          height: var(--footer-height, 80px);
          display: flex;
          align-items: center;
        }

        /* Mobile adjustments */
        @media (max-width: 640px) {
          :root {
            --footer-height: 80px;
          }
          
          /* Ensure content doesn't get hidden on mobile */
          .fixed-footer {
            padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 1rem);
          }
        }
      `}</style>
    </div>
  );
};

export default Footer;