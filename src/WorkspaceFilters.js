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
    <div className={`rounded-lg border border-[var(--border-primary)] ${className}`}>
      {/* Basic Filters Section */}
      <div className="p-4 space-y-4">
        {/* Filter Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[var(--text-primary)]">
            Filter Results
          </h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md
              text-[var(--text-secondary)] hover:text-[var(--text-primary)]
              hover:bg-[var(--bg-tertiary)] transition-colors text-sm"
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">
              {showAdvanced ? 'Less filters' : 'More filters'}
            </span>
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Basic Filter Controls */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* WiFi Speed Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              WiFi Speed
            </label>
            <select
              value={filters.minWifiSpeed}
              onChange={(e) => onFilterChange('minWifiSpeed', Number(e.target.value))}
              className="w-full h-10 px-3 rounded-md
                bg-[var(--bg-tertiary)] border border-[var(--border-primary)]
                text-[var(--text-primary)] text-sm
                hover:border-[var(--action-primary-border)]
                focus:border-[var(--action-primary)]
                focus:ring-1 focus:ring-[var(--action-primary-light)]
                transition-colors"
            >
              {wifiSpeeds.map(speed => (
                <option key={speed.value} value={speed.value}>
                  {speed.label}
                </option>
              ))}
            </select>
          </div>

          {/* Space Type Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Space Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => onFilterChange('type', e.target.value)}
              className="w-full h-10 px-3 rounded-md
                bg-[var(--bg-tertiary)] border border-[var(--border-primary)]
                text-[var(--text-primary)] text-sm
                hover:border-[var(--action-primary-border)]
                focus:border-[var(--action-primary)]
                focus:ring-1 focus:ring-[var(--action-primary-light)]
                transition-colors"
            >
              {spaceTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <div className="p-4 space-y-6">
            {/* Power Availability */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Power Availability
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {powerLevels.map(({ value, label, description }) => (
                  <button
                    key={value}
                    onClick={() => onFilterChange('minPower', value)}
                    className={`p-3 rounded-md border transition-colors text-left ${
                      filters.minPower === value
                        ? 'border-[var(--action-primary)] bg-[var(--action-primary-light)] text-[var(--action-primary)]'
                        : 'border-[var(--border-primary)] hover:border-[var(--action-primary-border)] bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Battery size={14} className={
                        filters.minPower === value 
                          ? 'text-[var(--action-primary)]' 
                          : 'text-[var(--text-secondary)]'
                      } />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    {description && (
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        {description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Hours Filter */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Hours
              </label>
              <button
                onClick={() => onFilterChange('openNow', !filters.openNow)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm transition-colors ${
                  filters.openNow
                    ? 'bg-[var(--action-primary)] text-[var(--button-text)]'
                    : 'bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] hover:border-[var(--action-primary-border)]'
                }`}
              >
                <Clock size={14} />
                Open Now
              </button>
              <p className="text-xs text-[var(--text-secondary)]">
                Filters places based on current day's operating hours
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceFilters;