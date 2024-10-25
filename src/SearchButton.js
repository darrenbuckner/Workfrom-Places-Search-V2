import React from 'react';
import { Search } from 'lucide-react';

const SearchButton = ({ onClick, disabled, searchPhase, hasLocation }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-8 py-2 h-10 rounded-lg font-medium
        shadow-[0_0_20px_rgba(59,130,246,0.15)]
        transition-all duration-300
        ${disabled ? 
          'bg-bg-secondary text-text-tertiary cursor-not-allowed' : 
          'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]'
        }
        flex items-center justify-center gap-2 min-w-[120px]
        border border-blue-500/20
      `}
    >
      <Search size={18} className={disabled ? '' : 'animate-pulse'} />
      <span>
        {searchPhase === 'locating' ? 'Locating...' :
         searchPhase === 'loading' ? 'Searching...' :
         hasLocation ? 'Search Again' : 'Search'}
      </span>
      
      {/* Glow effect */}
      {!disabled && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600/20 to-blue-400/20 blur opacity-50 group-hover:opacity-75 transition-opacity" />
      )}
    </button>
  );
};

export default SearchButton;