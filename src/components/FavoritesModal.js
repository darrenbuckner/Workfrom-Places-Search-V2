import React from 'react';
import { X } from 'lucide-react';
import { FavoritesList } from './FavoritesList';

const FavoritesModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col md:overflow-hidden">
      <div className="absolute inset-0 bg-[var(--modal-backdrop)] backdrop-blur-xl" />
      
      <div className="relative flex-grow flex md:items-center md:justify-center overflow-hidden">
        <div className="w-full h-full md:w-[90vw] md:max-w-6xl md:h-[85vh] 
          md:rounded-lg overflow-hidden relative
          bg-[var(--bg-primary)] border border-[var(--border-primary)]
          shadow-[var(--shadow-lg)]">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="hidden md:flex absolute right-4 top-4 z-20 items-center justify-center 
              w-8 h-8 rounded-full
              bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] 
              text-[var(--text-primary)] transition-colors"
          >
            <X size={20} />
          </button>

          {/* Mobile Header */}
          <div className="flex-shrink-0 md:hidden sticky top-0 z-20 bg-[var(--bg-primary)] border-b border-[var(--border-primary)]">
            <div className="flex items-center justify-between p-3">
              <button 
                onClick={onClose}
                className="flex items-center text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                <X size={20} className="mr-1" />
                <span className="text-sm font-medium">Close</span>
              </button>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Favorites
              </h2>
              <div className="w-8" /> {/* Spacer for alignment */}
            </div>
          </div>

          <div className="h-full overflow-y-auto">
            <FavoritesList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesModal; 