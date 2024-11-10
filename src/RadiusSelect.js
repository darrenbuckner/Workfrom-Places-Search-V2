import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const RadiusSelect = ({ 
  radius, 
  onRadiusChange, 
  disabled = false,
  variant = 'primary',
  className = '' 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  
  const radiusPresets = [
    { value: 0.5, label: '0.5mi', description: 'Walking' },
    { value: 2, label: '2mi', description: 'Biking' },
    { value: 5, label: '5mi', description: 'Short Drive' },
    { value: 10, label: '10mi', description: 'Driving' }
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
    if (showMenu && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const dropdownWidth = 400;
      
      let left;
      if (buttonRect.right + dropdownWidth > windowWidth) {
        left = Math.max(0, windowWidth - dropdownWidth - 16);
      } else {
        left = Math.max(16, buttonRect.left);
      }

      setMenuStyle({
        position: 'fixed',
        top: buttonRect.bottom + 8,
        left: left,
        width: Math.min(dropdownWidth, windowWidth - 32),
      });
    }
  }, [showMenu]);

  const handleRadiusSelect = (value) => {
    onRadiusChange(value);
    setShowMenu(false);
  };

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
            style={menuStyle}
            className="z-50 p-4 rounded-lg shadow-lg
              border border-[var(--border-primary)]
              bg-[var(--bg-primary)]/95 backdrop-blur-md"
          >
            <div className="grid grid-cols-2 gap-3">
              {radiusPresets.map(({ value, label, description }) => (
                <button
                  key={value}
                  onClick={() => handleRadiusSelect(value)}
                  className={`
                    p-3 rounded-md transition-colors text-left
                    border border-[var(--border-primary)]
                    ${value === radius
                      ? 'bg-[var(--action-primary)] text-[var(--button-text)] border-transparent'
                      : 'bg-[var(--bg-secondary)]/95 hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                    }
                  `}
                >
                  <div className="font-medium">{label}</div>
                  <div className={`text-xs mt-0.5 ${
                    value === radius ? 'text-[var(--button-text)]/80' : 'text-[var(--text-secondary)]'
                  }`}>
                    {description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RadiusSelect;