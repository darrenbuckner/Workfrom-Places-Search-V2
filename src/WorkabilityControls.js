import React from 'react';
import { useTheme } from './ThemeProvider';

const WorkabilityControls = ({ 
  onSortChange, 
  currentSort,
  radius,
  setRadius,
  showSortControl = true,
  onSearch
}) => {
  const { isDark } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.();
  };

  const handleRadiusChange = (e) => {
    const value = Math.round(Number(e.target.value) * 10) / 10;
    const validValue = Math.max(0.5, Math.min(999, value));
    setRadius(validValue);
  };

  if (!showSortControl) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-4">
        <div className="w-[120px]">
          <label 
            htmlFor="radius" 
            className={`block text-sm font-medium mb-1.5 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Search Radius
          </label>
          <div className="relative">
            <input
              type="number"
              id="radius"
              min="0.5"
              max="999"
              step="0.1"
              value={radius}
              onChange={handleRadiusChange}
              className={`
                w-full h-10 px-3 pr-8 
                rounded-md
                transition-colors duration-200
                [appearance:textfield]
                [&::-webkit-outer-spin-button]:appearance-none
                [&::-webkit-inner-spin-button]:appearance-none
                ${isDark 
                  ? 'bg-[#2a3142] border-white/10 text-white placeholder-gray-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }
                ${isDark
                  ? 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 hover:border-blue-400'
                  : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 hover:border-gray-300'
                }
              `}
              placeholder="2"
            />
            <span 
              className={`
                absolute right-3 top-1/2 -translate-y-1/2
                text-sm pointer-events-none
                ${isDark ? 'text-gray-400' : 'text-gray-500'}
              `}
            >
              mi
            </span>
          </div>
        </div>
      </form>
    );
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
          rounded-full peer 
          peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
          peer-checked:after:border-white 
          peer-checked:bg-[var(--action-primary)]
          peer-checked:border-[var(--action-primary)]
          after:content-[''] 
          after:absolute 
          after:top-[2px] 
          after:start-[2px] 
          after:bg-text-tertiary
          after:border-none
          after:rounded-full 
          after:h-5 
          after:w-5 
          after:transition-all
          hover:border-[var(--action-primary-hover)]
          transition-colors"
        >
          <div className="relative w-full h-full select-none">
            <span className={`
              absolute left-1.5 top-1/2 -translate-y-1/2 
              text-[10px] font-medium 
              transition-opacity duration-200
              ${currentSort === 'score_high' ? 'opacity-0' : 'opacity-100'}
              ${isDark ? 'text-gray-400' : 'text-gray-500'}
            `}>
              OFF
            </span>
            <span className={`
              absolute right-1.5 top-1/2 -translate-y-1/2 
              text-[10px] font-medium text-white
              transition-opacity duration-200
              ${currentSort === 'score_high' ? 'opacity-100' : 'opacity-0'}
            `}>
              ON
            </span>
          </div>
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