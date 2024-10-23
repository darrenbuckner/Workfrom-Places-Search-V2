import React from 'react';

const WorkabilityControls = ({ 
  onSortChange, 
  currentSort,
  radius,
  setRadius,
  showSortControl = true  // Controls whether to show sort toggle
}) => {
  // If not showing sort control, only show radius input
  if (!showSortControl) {
    return (
      <div className="flex items-center gap-4">
        <div className="w-24"> {/* Reduced width container */}
          <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
            Search Radius
          </label>
          <div className="relative">
            <input
              type="number"
              id="radius"
              min="1"
              max="999"
              maxLength="3"
              value={radius}
              onChange={(e) => {
                const value = Math.max(1, Math.min(999, Number(e.target.value)));
                setRadius(value);
              }}
              className="w-full rounded border-gray-300 shadow-sm pr-8"
              placeholder="2"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              mi
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Show toggle for sort control
  return (
    <div className="flex items-center gap-2">
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={currentSort === 'score_high'}
          onChange={(e) => onSortChange(e.target.checked ? 'score_high' : 'none')}
          className="sr-only peer"
        />
        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
        <span className="ml-2 text-sm font-medium text-gray-700">
          Sort by score
        </span>
      </label>
    </div>
  );
};

export default WorkabilityControls;