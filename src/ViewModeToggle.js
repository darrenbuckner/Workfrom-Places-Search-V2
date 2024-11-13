import React from 'react';
import { List, Map, Brain } from 'lucide-react';

const ViewModeToggle = ({ currentMode, onViewChange }) => {
  const modes = [
    {
      id: 'insights',
      icon: Brain,
      label: 'AI Insights',
      description: 'Smart workspace recommendations'
    },
    {
      id: 'list',
      icon: List,
      label: 'List View',
      description: 'Detailed workspace listings'
    },
    {
      id: 'map',
      icon: Map,
      label: 'Map View',
      description: 'Spatial workspace overview'
    }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;
        
        return (
          <button
            key={mode.id}
            onClick={() => onViewChange(mode.id)}
            className={`
              group flex items-center gap-3 px-3 py-2 rounded-lg border 
              transition-all duration-200 min-w-[140px]
              ${isActive 
                ? 'bg-[var(--action-primary)] border-[var(--action-primary)] text-[var(--button-text)]' 
                : 'border-[var(--border-primary)] hover:border-[var(--action-primary)] hover:bg-[var(--bg-tertiary)]'
              }
            `}
            aria-label={`Switch to ${mode.label}`}
          >
            <div className={`
              p-1.5 rounded-md transition-colors
              ${isActive
                ? 'bg-[var(--action-primary-hover)]'
                : 'bg-[var(--bg-secondary)] group-hover:bg-[var(--bg-primary)]'
              }
            `}>
              <Icon size={16} className={isActive ? 'text-[var(--button-text)]' : 'text-[var(--text-secondary)]'} />
            </div>
            
            <div className="flex flex-col items-start">
              <span className={`text-sm font-medium ${
                isActive ? 'text-[var(--button-text)]' : 'text-[var(--text-primary)]'
              }`}>
                {mode.label}
              </span>
              <span className={`text-xs ${
                isActive ? 'text-[var(--button-text)]/80' : 'text-[var(--text-secondary)]'
              }`}>
                {mode.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ViewModeToggle;