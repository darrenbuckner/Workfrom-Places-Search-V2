import React from 'react';
import { Search } from 'lucide-react';

const SearchButton = ({ onClick, disabled, searchPhase, hasLocation }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-6 py-2 h-10 rounded-lg font-medium
        shadow-[0_0_20px_var(--action-primary-border)]
        transition-all duration-300
        ${disabled ? 
          'bg-bg-secondary text-text-tertiary cursor-not-allowed' : 
          'bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)] text-white'
        }
        flex items-center justify-center gap-2
        whitespace-nowrap min-w-[140px]
        border border-[var(--action-primary-border)]
      `}
    >
      <Search size={18} className={disabled ? '' : 'animate-pulse'} />
      <span className="inline-block">
        {searchPhase === 'locating' ? 'Locating...' :
         searchPhase === 'loading' ? 'Searching...' :
         hasLocation ? 'Search Again' : 'Search'}
      </span>
      
      {!disabled && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[var(--action-primary-light)] to-[var(--action-primary-light)] blur opacity-50 group-hover:opacity-75 transition-opacity" />
      )}
    </button>
  );
};

export default SearchButton;