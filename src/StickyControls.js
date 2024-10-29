import React, { useState } from 'react';
import { List, Map, SlidersHorizontal, ArrowDown, ArrowUp } from 'lucide-react';
import CustomSelect from './CustomSelect';
import { useTheme } from './ThemeProvider';
import WorkabilityControls from './WorkabilityControls';
import GenAIInsights from './GenAIInsights';

const StickyControls = ({ 
  totalPlaces, 
  radius, 
  sortBy, 
  onSortChange, 
  viewMode, 
  setViewMode,
  currentFilters,
  onFilterChange,
  places,
  isSearching,
  onPhotoClick,
  onRecommendationMade,
}) => {
  const { isDark } = useTheme();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(false);
  
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
    <div className="sticky top-0 z-30 -mx-4 pb-8 bg-gradient-to-b from-bg-primary/50 to-transparent backdrop-blur-md">
      <div className={`
        backdrop-blur-sm border rounded-lg shadow-sm mt-3 mx-4
        ${isDark 
          ? 'bg-[#1a1f2c]/95 border-white/10' 
          : 'bg-white/95 border-gray-200'
        }
      `}>
        {/* Main Header */}
        <div className="p-4 border-b border-border-primary">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className={`
                text-sm font-medium
                ${isDark ? 'text-white' : 'text-gray-900'}
              `}>
                Found {totalPlaces} places within {radius} miles
              </span>
            </div>

            {/* Desktop View Toggle */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md
                bg-bg-secondary border border-border-primary">
                <span className="text-xs text-text-secondary">View:</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`
                      p-1.5 rounded transition-colors flex items-center
                      ${viewMode === 'list'
                        ? 'bg-[var(--action-primary)] text-white'
                        : isDark
                          ? 'text-white hover:bg-[#323950]'
                          : 'text-gray-600 hover:bg-gray-200'
                      }
                    `}
                    aria-label="List view"
                  >
                    <List size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`
                      p-1.5 rounded transition-colors flex items-center
                      ${viewMode === 'map'
                        ? 'bg-[var(--action-primary)] text-white'
                        : isDark
                          ? 'text-white hover:bg-[#323950]'
                          : 'text-gray-600 hover:bg-gray-200'
                      }
                    `}
                    aria-label="Map view"
                  >
                    <Map size={16} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowDesktopFilters(!showDesktopFilters)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md
                  bg-bg-secondary border border-border-primary
                  hover:bg-bg-tertiary transition-colors"
              >
                <SlidersHorizontal size={16} className="text-text-primary" />
                <span className="text-sm text-text-primary">Filters</span>
                {showDesktopFilters ? 
                  <ArrowUp size={16} className="text-text-secondary" /> :
                  <ArrowDown size={16} className="text-text-secondary" />
                }
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden flex items-center gap-2 px-3 py-1.5 rounded-md
                bg-bg-secondary border border-border-primary"
            >
              <SlidersHorizontal size={16} className="text-text-primary" />
              <span className="text-sm text-text-primary">Filters</span>
              {showMobileFilters ? 
                <ArrowUp size={16} className="text-text-secondary" /> :
                <ArrowDown size={16} className="text-text-secondary" />
              }
            </button>
          </div>
        </div>

        {/* Desktop Filters Section */}
        <div className={`
          hidden sm:block overflow-hidden transition-all duration-300
          ${!showDesktopFilters && 'h-0'}
          bg-bg-secondary/50
        `}>
          <div className="p-4 grid grid-cols-2 gap-8">
            {/* Space Type & Noise Level */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Filters</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-text-secondary mb-1.5 block">
                    Space Type
                  </label>
                  <CustomSelect
                    value={currentFilters.type}
                    onChange={(value) => onFilterChange('type', value)}
                    options={spaceTypes}
                    variant="minimal"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1.5 block">
                    Noise Level
                  </label>
                  <CustomSelect
                    value={currentFilters.noise}
                    onChange={(value) => onFilterChange('noise', value)}
                    options={noiseLevels}
                    variant="minimal"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Sort Controls */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Sort</h3>
              <div>
                <label className="text-xs text-text-secondary mb-1.5 block">
                  Workability Score
                </label>
                <WorkabilityControls 
                  onSortChange={onSortChange}
                  currentSort={sortBy}
                  showSortControl={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filters Panel */}
        <div className={`
          sm:hidden overflow-hidden transition-all duration-300
          ${showMobileFilters ? 'max-h-[400px]' : 'max-h-0'}
          bg-bg-secondary/50
        `}>
          <div className="p-4 space-y-4">
            {/* Mobile Filters */}
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-secondary">
                  Space Type
                </label>
                <CustomSelect
                  value={currentFilters.type}
                  onChange={(value) => onFilterChange('type', value)}
                  options={spaceTypes}
                  variant="minimal"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-secondary">
                  Noise Level
                </label>
                <CustomSelect
                  value={currentFilters.noise}
                  onChange={(value) => onFilterChange('noise', value)}
                  options={noiseLevels}
                  variant="minimal"
                  className="w-full"
                />
              </div>
            </div>

            {/* Mobile Sort and View */}
            <div className="space-y-3 pt-3 border-t border-border-primary">
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-secondary">
                  Sort by Score
                </label>
                <WorkabilityControls 
                  onSortChange={onSortChange}
                  currentSort={sortBy}
                  showSortControl={true}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-secondary">
                  View Mode
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`
                      flex-1 py-2 rounded transition-colors flex items-center justify-center gap-2
                      ${viewMode === 'list'
                        ? 'bg-[var(--action-primary)] text-white'
                        : 'bg-bg-secondary border border-border-primary text-text-primary'
                      }
                    `}
                  >
                    <List size={16} />
                    <span className="text-sm">List</span>
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`
                      flex-1 py-2 rounded transition-colors flex items-center justify-center gap-2
                      ${viewMode === 'map'
                        ? 'bg-[var(--action-primary)] text-white'
                        : 'bg-bg-secondary border border-border-primary text-text-primary'
                      }
                    `}
                  >
                    <Map size={16} />
                    <span className="text-sm">Map</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="border-t border-border-primary">
          <GenAIInsights
            places={places}
            isSearching={isSearching}
            onPhotoClick={onPhotoClick}
            onRecommendationMade={onRecommendationMade}
            className="backdrop-blur-none bg-transparent"
          />
        </div>

      </div>
    </div>
  );
};

export default StickyControls;