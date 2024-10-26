import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const CustomSelect = ({ 
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
    ? `w-full h-10 px-3 bg-bg-secondary border border-border-primary rounded-md
       text-text-primary hover:border-accent-secondary focus:border-accent-primary 
       focus:ring-1 focus:ring-accent-primary/50 transition-colors`
    : `w-full h-10 px-3 bg-bg-tertiary border border-border-primary rounded-md
       text-text-primary hover:border-accent-secondary focus:border-accent-primary 
       focus:ring-1 focus:ring-accent-primary/50 transition-colors`;

  const dropdownStyles = variant === 'minimal'
    ? `absolute z-50 w-full mt-1 py-1 rounded-md shadow-lg overflow-auto
       bg-bg-secondary border border-border-primary`
    : `absolute z-50 w-full mt-1 py-1 rounded-md shadow-lg overflow-auto
       bg-bg-secondary border border-border-primary backdrop-blur-sm`;

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
            <span className="truncate">{selectedOption?.label}</span>
            {isOpen ? (
              <ChevronUp size={16} className="text-text-secondary flex-shrink-0 ml-2" />
            ) : (
              <ChevronDown size={16} className="text-text-secondary flex-shrink-0 ml-2" />
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
                  className={`w-full px-3 py-2 text-left transition-colors
                    ${value === option.value 
                      ? 'text-accent-primary bg-accent-primary/10' 
                      : 'text-text-primary hover:bg-bg-tertiary'
                    }`}
                >
                  <span className="block truncate">{option.label}</span>
                  {option.description && (
                    <span className="block text-sm text-text-secondary mt-0.5">
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