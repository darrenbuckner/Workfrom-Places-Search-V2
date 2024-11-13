import React from 'react';
import { List, Map, Brain, SlidersHorizontal } from 'lucide-react';

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
}) => {
  const views = [
    { id: 'insights', label: 'AI Insights', icon: Brain },
    { id: 'list', label: 'List View', icon: List },
    { id: 'map', label: 'Map View', icon: Map }
  ];

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
          >
            <SlidersHorizontal size={20} />
          </button>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:flex items-center justify-between border-b border-[var(--border-primary)]">
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
          <div className="flex items-center gap-3 px-4">
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
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>
        )}
      </div>

      {/* Context Bar */}
      <div className="flex items-center justify-between p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <div className="text-sm font-medium text-[var(--text-primary)]">
            {totalPlaces} places found
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            Within {radius} miles
          </div>
        </div>

        {viewMode === 'list' && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-[var--text-secondary]">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-[var(--bg-tertiary)] border border-[var(--border-primary)]
                rounded-md px-2 py-1 text-[var(--text-primary)]"
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