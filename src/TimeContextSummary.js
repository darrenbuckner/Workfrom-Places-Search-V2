import React from 'react';
import { Zap, Wifi, Users, Coffee, MapPin, Battery, Volume2, Building } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const TimeContextSummary = ({ analysisData, places, locationName }) => {
  const { isDark } = useTheme();

  if (!places?.length) return null;

  // Get workspace distribution
  const getWorkspaceTypes = () => {
    const types = places.reduce((acc, place) => {
      const type = place.type?.toLowerCase() || 'other';
      if (type.includes('coffee') || type.includes('cafe')) {
        acc.cafes++;
      } else if (type.includes('coworking') || type.includes('dedicated')) {
        acc.coworking++;
      } else if (type.includes('library') || type.includes('public')) {
        acc.free++;
      }
      return acc;
    }, { cafes: 0, coworking: 0, free: 0 });

    return types;
  };

  // Get noise level distribution
  const getNoiseDistribution = () => {
    return places.reduce((acc, place) => {
      const noise = String(place.noise_level || place.noise || "").toLowerCase();
      if (noise.includes('quiet') || noise.includes('low')) {
        acc.quiet++;
      } else if (noise.includes('moderate') || noise.includes('average')) {
        acc.moderate++;
      } else if (noise.includes('noisy') || noise.includes('high')) {
        acc.noisy++;
      }
      return acc;
    }, { quiet: 0, moderate: 0, noisy: 0 });
  };

  // Get key metrics
  const getAreaMetrics = () => {
    const metrics = {
      highSpeedWifi: places.filter(p => p.download >= 50).length,
      goodPower: places.filter(p => p.power?.includes('range3')).length,
      hasFood: places.filter(p => p.food === "1").length,
      hasCoffee: places.filter(p => p.coffee === "1").length,
      hasOutdoor: places.filter(p => p.outdoor_seating === "1" || p.outside === "1").length
    };

    return metrics;
  };

  const workspaceTypes = getWorkspaceTypes();
  const noiseDistribution = getNoiseDistribution();
  const metrics = getAreaMetrics();

  // Prepare the focus cards data
  const focusCards = [
    {
      icon: Building,
      title: "Space Types",
      stats: [
        { label: "Cafes & Shops", value: workspaceTypes.cafes },
        { label: "Coworking", value: workspaceTypes.coworking },
        { label: "Free Spaces", value: workspaceTypes.free }
      ],
      color: isDark ? "text-blue-400" : "text-blue-600",
      bgColor: isDark ? "bg-blue-400/10" : "bg-blue-600/10"
    },
    {
      icon: Volume2,
      title: "Noise Levels",
      stats: [
        { label: "Quiet", value: noiseDistribution.quiet },
        { label: "Moderate", value: noiseDistribution.moderate },
        { label: "Lively", value: noiseDistribution.noisy }
      ],
      color: isDark ? "text-purple-400" : "text-purple-600",
      bgColor: isDark ? "bg-purple-400/10" : "bg-purple-600/10"
    }
  ];

  // Helper for percentage calculation
  const getPercentage = (value) => {
    return Math.round((value / places.length) * 100);
  };

  return (
    <div className="rounded-lg border border-[var(--border-primary)] overflow-hidden bg-[var(--bg-secondary)]">
      {/* Header with location and total count */}
      <div className="p-4 border-b border-[var(--border-primary)]">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[var(--text-secondary)]" />
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">
            {locationName || 'Area Overview'}
          </h3>
        </div>
        <p className="text-lg font-medium text-[var(--text-primary)] mt-1">
          {places.length} workspace{places.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Key Statistics Grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {focusCards.map((card, index) => (
          <div
            key={index}
            className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] overflow-hidden"
          >
            <div className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg ${card.bgColor} 
                  flex items-center justify-center`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {card.title}
                </span>
              </div>
              <div className="space-y-2">
                {card.stats.map((stat, statIndex) => (
                  <div key={statIndex} className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">
                      {stat.label}
                    </span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {stat.value > 0 && `${getPercentage(stat.value)}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Amenities Summary */}
      <div className="px-4 py-3 bg-[var(--bg-primary)] border-t border-[var(--border-primary)]">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-sm text-[var(--text-secondary)]">
              {getPercentage(metrics.highSpeedWifi)}% fast WiFi
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Battery className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-sm text-[var(--text-secondary)]">
              {getPercentage(metrics.goodPower)}% good power
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Coffee className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-sm text-[var(--text-secondary)]">
              {getPercentage(metrics.hasCoffee)}% serve coffee
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeContextSummary;