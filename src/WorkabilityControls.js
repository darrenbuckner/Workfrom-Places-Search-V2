import React from 'react';
import { useTheme } from './ThemeProvider';

const WorkabilityControls = ({ 
  onSortChange, 
  currentSort,
  showSortControl = true
}) => {
  const { isDark } = useTheme();

  if (!showSortControl) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={currentSort === 'score_high'}
          onChange={(e) => onSortChange(e.target.checked ? 'score_high' : 'none')}
          className="sr-only peer"
        />
        <div className="relative w-11 h-6 bg-bg-secondary border border-border-primary
          peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--action-primary-light)]
          rounded-full peer dark:bg-gray-700 
          peer-checked:after:translate-x-full 
          peer-checked:after:border-white 
          peer-checked:bg-[var(--action-primary)]
          peer-checked:border-[var(--action-primary)]
          after:content-[''] 
          after:absolute 
          after:bg-[var(--bg-primary)]
          after:border 
          after:border-gray-300
          after:rounded-full 
          after:h-5 
          after:w-5 
          after:transition-all
          after:top-[1px]
          after:left-[1px]
          hover:border-[var(--action-primary-hover)]
          transition-colors
        ">
          <span className={`
            absolute left-1 top-1/2 -translate-y-1/2 
            text-[10px] font-medium 
            transition-opacity duration-200
            ${currentSort === 'score_high' ? 'opacity-0' : 'opacity-100'}
            ${isDark ? 'text-gray-400' : 'text-gray-500'}
          `}>
            OFF
          </span>
          <span className={`
            absolute right-1 top-1/2 -translate-y-1/2 
            text-[10px] font-medium text-white
            transition-opacity duration-200
            ${currentSort === 'score_high' ? 'opacity-100' : 'opacity-0'}
          `}>
            ON
          </span>
        </div>
        <span className={`ml-2 text-sm font-medium ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Sort by score
        </span>
      </label>
    </div>
  );
};

export default WorkabilityControls;