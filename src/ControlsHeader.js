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

const MobileViewTab = ({ id, label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`
      flex flex-col items-center gap-1 p-2 rounded-md transition-colors
      ${isActive 
        ? 'bg-[var(--action-primary)] text-[var(--button-text)]' 
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
      }
    `}
  >
    <Icon size={20} />
    <span className="text-[10px] font-medium">{label}</span>
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
    { id: 'insights', label: 'Insights', icon: Brain },
    { id: 'guide', label: 'Guide', icon: Sparkles },
    { id: 'list', label: 'List', icon: List },
    { id: 'map', label: 'Map', icon: Map }
  ];

  const renderContextInfo = () => {
    if (viewMode === 'insights') {
      return (
        <div className="text-sm font-medium text-[var(--text-primary)]">
          AI-powered recommendations
        </div>
      );
    }
    
    if (viewMode === 'guide') {
      return (
        <div className="text-sm font-medium text-[var(--text-primary)]">
          Workspaces by atmosphere
        </div>
      );
    }

    // Existing return for list/map views
    return (
      <div className="text-sm whitespace-nowrap">
        <span className="font-medium text-[var(--text-primary)]">
          {totalPlaces} places found
        </span>
        <span className="text-[var(--text-secondary)] ml-2">
          within {radius} miles
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)]">
      {/* Mobile Header */}
      <div className="flex sm:hidden items-center justify-between p-3 border-b border-[var(--border-primary)]">
        <div className="flex items-center gap-2">
          {views.map(view => (
            <MobileViewTab
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
              flex flex-col items-center gap-1 p-2 rounded-md transition-colors
              ${showFilters
                ? 'bg-[var(--action-primary)] text-[var(--button-text)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }
            `}
          >
            <SlidersHorizontal size={20} />
            <span className="text-[10px] font-medium">Filters</span>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 p-4">
        {renderContextInfo()}

        {viewMode === 'list' && (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <label className="text-sm text-[var(--text-secondary)]">Sort by:</label>
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