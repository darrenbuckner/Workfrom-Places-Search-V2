import React from 'react';
import { 
  Volume2,
  Coffee,
  Clock
} from 'lucide-react';

const PostSearchFilters = ({ 
  onFilterChange,
  className,
  currentFilters,
  disabled = false
}) => {
  const filterOptions = [
    {
      id: 'type',
      label: 'Space Type',
      icon: Coffee,
      options: [
        { value: 'any', label: 'All Spaces' },
        { value: 'commercial', label: 'Cafes & Shops' },
        { value: 'dedicated', label: 'Coworking' },
        { value: 'free', label: 'Free Spaces' }
      ]
    },
    {
      id: 'noise',
      label: 'Noise Level',
      icon: Volume2,
      options: [
        { value: 'any', label: 'Any Noise Level' },
        { value: 'quiet', label: 'Quieter' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'noisy', label: 'Lively' }
      ]
    }
  ];

  return (
    <div className={className}>
      <div className="grid gap-4 sm:grid-cols-2">
        {filterOptions.map(({ id, label, icon: Icon, options }) => (
          <div key={id} className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
              <Icon size={14} />
              {label}
            </label>
            <select
              value={currentFilters[id] || 'any'}
              onChange={(e) => onFilterChange(id, e.target.value)}
              disabled={disabled}
              className={`
                w-full h-10 px-3 rounded-md
                bg-[var(--bg-tertiary)] border border-[var(--border-primary)]
                text-[var(--text-primary)] text-sm
                hover:border-[var(--action-primary-border)]
                focus:border-[var(--action-primary)]
                focus:ring-1 focus:ring-[var(--action-primary-light)]
                transition-colors
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostSearchFilters;