import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const RadiusSelect = ({ 
  radius, 
  onRadiusChange, 
  disabled = false,
  variant = 'primary',  // 'primary' | 'secondary'
  className = '' 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  
  const radiusPresets = [
    { value: 0.5, label: '0.5 miles', description: 'Walking' },
    { value: 2, label: '2 miles', description: 'Biking' },
    { value: 5, label: '5 miles', description: 'Short Drive' },
    { value: 10, label: '10 miles', description: 'Driving' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const baseButtonStyles = variant === 'primary'
    ? 'bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)] text-[var(--button-text)]'
    : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]';

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled}
        className={`
          h-12 px-4 rounded-lg flex items-center justify-between gap-2
          font-medium transition-colors min-w-[100px]
          ${baseButtonStyles}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        <span>{radius}mi</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} 
        />
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setShowMenu(false)}
          />
          <div 
            className="absolute z-50 right-0 mt-2 w-48 p-1 rounded-lg shadow-lg
              border border-[var(--border-primary)]
              bg-[var(--bg-primary)]/95 backdrop-blur-sm"
          >
            {radiusPresets.map(({ value, label, description }) => (
              <button
                key={value}
                onClick={() => {
                  onRadiusChange(value);
                  setShowMenu(false);
                }}
                className={`
                  w-full px-3 py-2 rounded-md text-left
                  transition-all duration-200
                  ${value === radius
                    ? 'bg-[var(--action-primary)] text-[var(--button-text)]'
                    : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{label}</span>
                  <span className={`text-xs ${
                    value === radius 
                      ? 'text-[var(--button-text)]/80' 
                      : 'text-[var(--text-secondary)]'
                  }`}>
                    {description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RadiusSelect;