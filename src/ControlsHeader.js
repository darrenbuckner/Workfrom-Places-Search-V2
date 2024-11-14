import React from 'react';
import { List, Map, Brain, SlidersHorizontal, MapPin } from 'lucide-react';

const ViewTab = ({ id, label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`
      relative flex items-center gap-2 px-4 py-3
      text-sm font-medium transition-colors
      ${isActive 
        ? 'text-[var(--action-primary)]' 
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
      }
    `}
  >
    <Icon size={18} />
    <span className="hidden sm:inline">{label}</span>
    {isActive && (
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--action-primary)]" />
    )}
  </button>
);

const ControlsHeader = ({
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,
  totalPlaces,
  radius,
  sortBy,
  setSortBy,
  locationName,
  disabled = false,
}) => {
  const views = [
    { id: 'insights', label: 'AI Insights', icon: Brain },
    { id: 'list', label: 'List View', icon: List },
    { id: 'map', label: 'Map View', icon: Map }
  ];

  const renderContextInfo = () => {
    if (viewMode === 'insights') {
      return (
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-[var(--text-secondary)]" />
          <div className="text-sm">
            <span className="font-medium text-[var(--text-primary)]">
              Located {totalPlaces} places
            </span>
            <span className="text-[var(--text-secondary)] ml-1">
              within {radius} miles
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-[var(--text-secondary)]" />
        <div className="text-sm">
          <span className="font-medium text-[var(--text-primary)]">
            {totalPlaces} places
          </span>
          <span className="text-[var(--text-secondary)] ml-1">
            within {radius} miles
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)]">
      {/* Mobile Header */}
      <div className="flex sm:hidden items-center justify-between p-3 border-b border-[var(--border-primary)]">
        <div className="flex items-center gap-2">
          {views.map(view => (
            <button
              key={view.id}
              onClick={() => setViewMode(view.id)}
              className={`
                p-2 rounded-md transition-colors
                ${viewMode === view.id 
                  ? 'bg-[var(--action-primary)] text-[var(--button-text)]' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }
              `}
              disabled={disabled}
            >
              <view.icon size={20} />
            </button>
          ))}
        </div>
        
        {viewMode !== 'insights' && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              p-2 rounded-md transition-colors
              ${showFilters
                ? 'bg-[var(--action-primary)] text-[var(--button-text)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }
            `}
            disabled={disabled}
          >
            <SlidersHorizontal size={20} />
          </button>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:flex items-center justify-between p-4">
        <div className="flex items-center">
          {views.map(view => (
            <ViewTab
              key={view.id}
              id={view.id}
              label={view.label}
              icon={view.icon}
              isActive={viewMode === view.id}
              onClick={setViewMode}
            />
          ))}
        </div>

        {viewMode !== 'insights' && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md
              transition-colors text-sm font-medium
              ${showFilters
                ? 'bg-[var(--action-primary)] text-[var(--button-text)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }
            `}
            disabled={disabled}
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        )}
      </div>

      {/* Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 p-4 border-t border-[var(--border-primary)]">
        {renderContextInfo()}

        {viewMode === 'list' && (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <label className="text-sm text-[var(--text-secondary)]">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-[var(--bg-tertiary)] border border-[var(--border-primary)]
                rounded-md px-2 py-1 text-[var(--text-primary)]"
              disabled={disabled}
            >
              <option value="distance">Distance</option>
              <option value="score_high">Highest Rated</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlsHeader;