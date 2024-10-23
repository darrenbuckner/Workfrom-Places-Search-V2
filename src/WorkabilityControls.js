import React from 'react';

const WorkabilityControls = ({ 
    onSortChange, 
    currentSort,
    radius,
    setRadius
  }) => {
    return (
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort by Workability Score
          </label>
          <select
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full rounded border-gray-300 shadow-sm"
          >
            <option value="score_high">Highest Score First</option>
            <option value="score_low">Lowest Score First</option>
            <option value="none">No sorting</option>
          </select>
        </div>
        
        <div className="flex-1">
          <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
            Search Radius (miles)
          </label>
          <input
            type="number"
            id="radius"
            min="0.1"
            max="50"
            step="0.1"
            value={radius}
            onChange={(e) => setRadius(Math.max(0.1, Math.min(50, Number(e.target.value))))}
            onFocus={(e) => e.target.select()}
            className="w-32 rounded border-gray-300 shadow-sm"
            placeholder="Miles"
          />
        </div>
      </div>
    );
  };

export default WorkabilityControls;