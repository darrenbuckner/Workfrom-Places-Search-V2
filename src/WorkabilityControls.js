import React from 'react';

const WorkabilityControls = ({ 
  onSortChange, 
  currentSort,
  radius,
  setRadius,
  showSortControl = true,
  onSearch
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.();
  };

  const handleRadiusChange = (e) => {
    const value = Math.max(1, Math.min(999, Number(e.target.value)));
    setRadius(value);
  };

  if (!showSortControl) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-4">
        <div className="w-32">
          <label htmlFor="radius" className="block text-sm font-medium text-text-primary mb-1.5">
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
              onChange={handleRadiusChange}
              className="w-full px-3 rounded-md bg-[#2a3142] border border-border-primary text-white 
                placeholder-text-tertiary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 
                pr-8 h-10 shadow-sm transition-colors [appearance:textfield] 
                [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                hover:border-accent-secondary"
              placeholder="2"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm pointer-events-none">
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
          peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent-primary/30 
          rounded-full peer 
          peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
          peer-checked:after:border-white 
          peer-checked:bg-accent-primary 
          peer-checked:border-accent-primary
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
          hover:border-accent-secondary
          transition-colors">
          <span className="flex items-center justify-center w-full h-full">
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium select-none">
              <span className={`absolute left-1.5 transition-opacity ${currentSort === 'score_high' ? 'opacity-0' : 'opacity-100'} text-text-secondary`}>
                OFF
              </span>
              <span className={`absolute right-1.5 transition-opacity ${currentSort === 'score_high' ? 'opacity-100' : 'opacity-0'} text-white`}>
                ON
              </span>
            </span>
          </span>
        </div>
        <span className="ml-2 text-sm font-medium text-text-primary">
          Sort by score
        </span>
      </label>
    </div>
  );
};

export default WorkabilityControls;