import React, { useState } from 'react';
import { 
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Volume2,
  Check
} from 'lucide-react';
import CustomSelect from './CustomSelect';

const PostSearchFilters = ({ 
  onFilterChange,
  className,
  currentFilters
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const spaceTypes = [
    { value: 'any', label: 'Any Type' },
    { value: 'commercial', label: 'Cafes & Shops' },
    { value: 'dedicated', label: 'Coworking' },
    { value: 'free', label: 'Free Spaces' }
  ];

  const noiseLevels = [
    { value: 'any', label: 'Any Level' },
    { value: 'quiet', label: 'Quieter' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'noisy', label: 'Lively' }
  ];

  const isFilterActive = (filterType, value) => {
    return currentFilters[filterType] === value;
  };

  return (
    <div className={`${className} border border-border-primary rounded-lg bg-bg-secondary`}>
      <div className="p-4">
        {/* Basic Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Space Type Filter */}
          <CustomSelect
            label="Space Type"
            value={currentFilters.type}
            onChange={(value) => onFilterChange('type', value)}
            options={spaceTypes}
            className="flex-1 min-w-[200px]"
          />

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`self-end h-10 px-4 flex items-center gap-1.5 transition-colors border 
              rounded-md bg-bg-tertiary 
              ${Object.values(currentFilters).some(value => value !== 'any' && value !== false)
                ? 'text-accent-primary border-accent-primary hover:border-accent-secondary'
                : 'text-text-primary border-border-primary hover:border-accent-secondary'
              }`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">
              {showAdvanced ? 'Hide filters' : 'More filters'}
            </span>
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 pt-6 border-t border-border-primary mt-6">
            {/* Noise Level */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Noise Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {noiseLevels.map(({ value, label }) => {
                  const isActive = isFilterActive('noise', value);
                  return (
                    <button
                      key={value}
                      onClick={() => onFilterChange('noise', value)}
                      className={`relative p-3 rounded-md border transition-colors text-left group ${
                        isActive
                          ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                          : 'border-border-primary hover:border-accent-primary/50 bg-bg-tertiary text-text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Volume2 
                          size={14} 
                          className={isActive ? 'text-accent-primary' : 'text-text-secondary'} 
                        />
                        <span className="font-medium">{label}</span>
                        {isActive && (
                          <Check size={14} className="ml-auto text-accent-primary" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostSearchFilters;