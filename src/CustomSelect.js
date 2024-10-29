import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  label,
  className = '',
  variant = 'default', // 'default' | 'minimal'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  const selectedOption = options.find(opt => opt.value === value);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const buttonStyles = variant === 'minimal' 
    ? `w-full h-8 px-2 text-sm
       ${isDark 
         ? 'bg-[#323950] border-white/10 hover:bg-[#3a4259]' 
         : 'bg-white border-gray-200 hover:bg-gray-50'
       }
       border rounded-md text-text-primary 
       hover:border-accent-secondary focus:border-accent-primary 
       focus:ring-1 focus:ring-accent-primary/50 transition-colors`
    : `w-full h-10 px-3 bg-bg-tertiary border border-border-primary rounded-md
       text-text-primary hover:border-accent-secondary focus:border-accent-primary 
       focus:ring-1 focus:ring-accent-primary/50 transition-colors`;

  const dropdownStyles = `
    absolute z-50 w-full mt-1 py-1 rounded-md shadow-lg overflow-auto
    backdrop-blur-sm
    ${isDark 
      ? 'bg-[#2a3142]/95 border-white/10' 
      : 'bg-white/95 border-gray-200'
    }
    border
  `;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative" ref={selectRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={buttonStyles}
        >
          <div className="flex items-center justify-between">
            <span className="truncate text-sm">
              {selectedOption?.label}
            </span>
            {isOpen ? (
              <ChevronUp size={14} className="text-text-secondary flex-shrink-0 ml-1" />
            ) : (
              <ChevronDown size={14} className="text-text-secondary flex-shrink-0 ml-1" />
            )}
          </div>
        </button>
        
        {isOpen && (
          <div className={dropdownStyles}>
            <div className="rounded-md">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-3 py-1.5 text-left transition-colors text-sm
                    ${value === option.value 
                      ? 'text-accent-primary bg-accent-primary/10' 
                      : 'text-text-primary hover:bg-bg-tertiary'
                    }
                  `}
                >
                  <span className="block truncate">{option.label}</span>
                  {option.description && (
                    <span className="block text-xs text-text-secondary mt-0.5">
                      {option.description}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;