import React from 'react';
import { Volume2 } from 'lucide-react';
import CustomSelect from './CustomSelect';
import { useTheme } from './ThemeProvider';

const PostSearchFilters = ({ 
  onFilterChange,
  className,
  currentFilters
}) => {
  const { isDark } = useTheme();
  
  const spaceTypes = [
    { value: 'any', label: 'All Spaces' },
    { value: 'commercial', label: 'Cafes & Shops' },
    { value: 'dedicated', label: 'Dedicated' },
    { value: 'free', label: 'Free Spaces' }
  ];

  const noiseLevels = [
    { value: 'any', label: 'Any Noise Level' },
    { value: 'quiet', label: 'Quieter' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'noisy', label: 'Lively' }
  ];

  return (
    <div className={`
      ${className}
      flex items-center gap-3 px-4 py-2
      rounded-md border
      ${isDark 
        ? 'bg-[#2a3142] border-white/10' 
        : 'bg-gray-50 border-gray-200'
      }
    `}>
      <div className="text-xs font-medium text-text-secondary">
        Filters:
      </div>
      
      <div className="flex items-center gap-2">
        <CustomSelect
          value={currentFilters.type}
          onChange={(value) => onFilterChange('type', value)}
          options={spaceTypes}
          variant="minimal"
          className="w-[140px]"
        />

        <CustomSelect
          value={currentFilters.noise}
          onChange={(value) => onFilterChange('noise', value)}
          options={noiseLevels}
          variant="minimal"
          className="w-[140px]"
        />
      </div>
    </div>
  );
};

export default PostSearchFilters;