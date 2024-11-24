import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Navigation } from 'lucide-react';

const RadiusSelect = ({ 
  radius, 
  onRadiusChange, 
  disabled = false,
  variant = 'primary',  // 'primary' | 'secondary'
  className = '' 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const itemRefs = useRef([]);
  
  const radiusPresets = [
    { value: 0.5, label: '0.5 miles', description: 'Walking', icon: Navigation },
    { value: 2, label: '2 miles', description: 'Biking', icon: Navigation },
    { value: 5, label: '5 miles', description: 'Short Drive', icon: Navigation },
    { value: 10, label: '10 miles', description: 'Driving', icon: Navigation }
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

  useEffect(() => {
    if (showMenu && focusedIndex >= 0) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, showMenu]);

  const handleKeyDown = (e) => {
    if (!showMenu) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setShowMenu(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, radiusPresets.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onRadiusChange(radiusPresets[focusedIndex].value);
          setShowMenu(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowMenu(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
      default:
        break;
    }
  };

  const baseButtonStyles = variant === 'primary'
    ? `
      bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)] 
      text-[var(--button-text)] ring-[var(--action-primary)]/30
      shadow-sm hover:shadow
      focus:ring-4 focus:ring-[var(--action-primary)]/20
    `
    : `
      bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] 
      text-[var(--text-primary)] ring-[var(--action-primary)]/20
      border border-[var(--border-primary)]
      hover:border-[var(--action-primary-border)]
      focus:ring-4 focus:border-[var(--action-primary)]
    `;

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={showMenu}
        aria-label={`Select radius, currently ${radius} miles`}
        className={`
          h-12 px-4 rounded-lg flex items-center justify-between gap-2
          font-medium transition-all min-w-[100px] select-none
          outline-none focus-visible:outline-none
          ${baseButtonStyles}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        <span>{radius} mi</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} 
        />
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setShowMenu(false)}
          />
          <div 
            role="listbox"
            aria-label="Select radius"
            className="absolute z-50 right-0 mt-2 w-56 p-1.5 rounded-lg shadow-lg
              border border-[var(--border-primary)]
              bg-[var(--bg-primary)] backdrop-blur-sm"
          >
            {radiusPresets.map(({ value, label, description, icon: Icon }, index) => (
              <button
                key={value}
                ref={el => itemRefs.current[index] = el}
                role="option"
                aria-selected={value === radius}
                onClick={() => {
                  onRadiusChange(value);
                  setShowMenu(false);
                }}
                onKeyDown={handleKeyDown}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`
                  w-full px-3 py-2.5 rounded-md text-left
                  transition-all duration-200 outline-none
                  ${value === radius
                    ? 'bg-[var(--action-primary)] text-[var(--button-text)]'
                    : index === focusedIndex
                      ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                      : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${value === radius
                      ? 'bg-[var(--button-text)]/10'
                      : 'bg-[var(--bg-tertiary)]'
                    }
                  `}>
                    <Icon 
                      size={16} 
                      className={value === radius ? 'text-[var(--button-text)]' : 'text-[var(--text-secondary)]'}
                      style={{ 
                        transform: `rotate(${45 * index}deg)` 
                      }} 
                    />
                  </div>
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className={`text-xs mt-0.5 ${
                      value === radius 
                        ? 'text-[var(--button-text)]/80' 
                        : 'text-[var(--text-secondary)]'
                    }`}>
                      {description}
                    </div>
                  </div>
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