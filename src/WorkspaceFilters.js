import React, { useState } from 'react';
import { 
  Wifi, 
  Battery,
  Clock,
  Building,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react';

const WorkspaceFilters = ({ 
  filters, 
  onFilterChange,
  className 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const powerLevels = [
    { value: 'any', label: 'Any Power' },
    { value: 'range1', label: 'Limited', description: 'Less than 25% of seats' },
    { value: 'range2', label: 'Good', description: '25-50% of seats' },
    { value: 'range3', label: 'Plenty', description: 'More than 50% of seats' }
  ];

  const spaceTypes = [
    { value: 'any', label: 'Any Type' },
    { value: 'commercial', label: 'Cafes & Shops', description: 'Coffee shops, cafes, bars' },
    { value: 'dedicated', label: 'Coworking', description: 'Dedicated workspace' },
    { value: 'free', label: 'Free Spaces', description: 'Libraries, public spaces' }
  ];

  const wifiSpeeds = [
    { value: 0, label: 'Any Speed' },
    { value: 10, label: '10+ Mbps', description: 'Good for basic work' },
    { value: 25, label: '25+ Mbps', description: 'Video calls' },
    { value: 50, label: '50+ Mbps', description: 'Heavy uploading' }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Basic Filters */}
      <div className="flex flex-wrap gap-4">
        {/* WiFi Speed Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            WiFi Speed
          </label>
          <select
            value={filters.minWifiSpeed}
            onChange={(e) => onFilterChange('minWifiSpeed', Number(e.target.value))}
            className="w-full h-10 bg-bg-secondary border border-border-primary rounded-md px-3 
              text-text-primary hover:border-accent-secondary focus:border-accent-primary 
              focus:ring-1 focus:ring-accent-primary/50 transition-colors"
          >
            {wifiSpeeds.map(speed => (
              <option key={speed.value} value={speed.value}>
                {speed.label}
              </option>
            ))}
          </select>
        </div>

        {/* Space Type Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Space Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
            className="w-full h-10 bg-bg-secondary border border-border-primary rounded-md px-3 
              text-text-primary hover:border-accent-secondary focus:border-accent-primary 
              focus:ring-1 focus:ring-accent-primary/50 transition-colors"
          >
            {spaceTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1.5 text-accent-primary hover:text-accent-secondary text-sm font-medium transition-colors"
      >
        <SlidersHorizontal size={14} />
        {showAdvanced ? 'Hide advanced filters' : 'Show advanced filters'}
        {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-6 pt-2">
          {/* Power Availability */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Power Availability
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {powerLevels.map(({ value, label, description }) => (
                <button
                  key={value}
                  onClick={() => onFilterChange('minPower', value)}
                  className={`p-3 rounded-md border transition-colors text-left ${
                    filters.minPower === value
                      ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                      : 'border-border-primary hover:border-accent-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Battery size={14} className={filters.minPower === value ? 'text-accent-primary' : 'text-text-secondary'} />
                    <span className="font-medium">{label}</span>
                  </div>
                  {description && (
                    <div className="text-xs text-text-secondary mt-1">
                      {description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Hours Filter */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Hours
            </label>
            <button
              onClick={() => onFilterChange('openNow', !filters.openNow)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm transition-colors ${
                filters.openNow
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-secondary border border-border-primary text-text-primary hover:border-accent-primary/50'
              }`}
            >
              <Clock size={14} />
              Open Now
            </button>
            <p className="mt-2 text-xs text-text-secondary">
              Filters places based on current day's operating hours
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceFilters;