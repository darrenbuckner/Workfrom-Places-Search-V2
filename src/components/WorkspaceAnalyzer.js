import React, { useState } from 'react';
import { 
  Brain, Clock, Users, Wifi, Battery, 
  Volume2, Sparkles, ArrowRight, Coffee,
  Navigation, Zap 
} from 'lucide-react';

const WorkspaceAnalyzer = ({ 
  places,
  isAnalyzing,
  onPlaceClick,
  className = ''
}) => {
  const insights = [
    {
      id: 'focused',
      icon: Brain,
      title: 'Focus Zones',
      description: 'Perfect for deep work & concentration',
      color: 'emerald',
      getPlaces: () => places
        .filter(p => p.noise?.toLowerCase().includes('quiet'))
        .sort((a, b) => b.workabilityScore - a.workabilityScore)
        .slice(0, 3),
      metrics: (place) => [
        {
          icon: Volume2,
          value: place.noise || 'Unknown',
          good: place.noise?.toLowerCase().includes('quiet')
        },
        {
          icon: Wifi,
          value: place.download ? `${Math.round(place.download)} Mbps` : 'Unknown',
          good: place.download >= 25
        }
      ]
    },
    {
      id: 'team',
      icon: Users,
      title: 'Team Spaces',
      description: 'Ideal for collaboration & meetings',
      color: 'blue',
      getPlaces: () => places
        .filter(p => p.food === "1" && p.download >= 25)
        .sort((a, b) => b.workabilityScore - a.workabilityScore)
        .slice(0, 3),
      metrics: (place) => [
        {
          icon: Wifi,
          value: place.download ? `${Math.round(place.download)} Mbps` : 'Unknown',
          good: place.download >= 25
        },
        {
          icon: Coffee,
          value: place.food === "1" ? 'Food Available' : 'No Food',
          good: place.food === "1"
        }
      ]
    },
    {
      id: 'quick',
      icon: Zap,
      title: 'Quick Stops',
      description: 'Closest high-rated workspaces',
      color: 'purple',
      getPlaces: () => places
        .filter(p => p.distance <= 1)
        .sort((a, b) => b.workabilityScore - a.workabilityScore)
        .slice(0, 3),
      metrics: (place) => [
        {
          icon: Navigation,
          value: `${place.distance} miles`,
          good: place.distance <= 0.5
        },
        {
          icon: Battery,
          value: place.power || 'Unknown',
          good: place.power?.includes('range3')
        }
      ]
    }
  ];

  const [activeInsight, setActiveInsight] = useState(insights[0]);

  const InsightNavigation = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {insights.map(insight => {
        const isActive = activeInsight.id === insight.id;
        return (
          <button
            key={insight.id}
            onClick={() => setActiveInsight(insight)}
            className={`
              relative p-4 rounded-lg border transition-all
              ${isActive 
                ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5' 
                : 'border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]'
              }
            `}
          >
            {isActive && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--accent-primary)] rounded-t-lg" />
            )}
            
            <div className="flex flex-col items-start gap-2">
              <div className={`
                p-2 rounded-lg
                ${isActive 
                  ? 'bg-[var(--accent-primary)] text-[var(--button-text)]' 
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                }
              `}>
                <insight.icon size={18} />
              </div>
              
              <div className="text-left">
                <div className="font-medium text-[var(--text-primary)]">
                  {insight.title}
                </div>
                <div className="text-sm text-[var(--text-secondary)] mt-1">
                  {insight.description}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const WorkspaceInsightCard = ({ place, insight, isHighlighted }) => (
    <div 
      onClick={() => onPlaceClick(place)}
      className={`
        relative p-4 rounded-lg border cursor-pointer
        transition-all duration-200 group
        ${isHighlighted 
          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5' 
          : 'border-[var(--border-primary)] bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)]'
        }
      `}
    >
      {isHighlighted && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--accent-primary)] rounded-t-lg" />
      )}

      <div className="flex items-start gap-3">
        <div className={`
          flex-shrink-0 w-12 h-12 rounded-lg
          font-bold text-xl flex items-center justify-center
          ${isHighlighted
            ? 'bg-[var(--accent-primary)] text-[var(--button-text)]'
            : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
          }
        `}>
          {place.workabilityScore}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[var(--text-primary)] mb-1 truncate">
            {place.title}
          </h4>
          
          <div className="flex flex-wrap gap-3 mt-2">
            {insight.metrics(place).map((metric, index) => (
              <div 
                key={index}
                className={`
                  flex items-center gap-1.5 px-2 py-1 rounded-md text-xs
                  ${metric.good
                    ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                  }
                `}
              >
                <metric.icon size={12} />
                <span>{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className={`
        w-full mt-3 px-3 py-1.5 rounded text-sm font-medium
        flex items-center justify-center gap-1.5 transition-colors
        ${isHighlighted
          ? 'bg-[var(--accent-primary)] text-[var(--button-text)]'
          : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] group-hover:bg-[var(--bg-secondary)]'
        }
      `}>
        View Details
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );

  if (isAnalyzing) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-[var(--bg-secondary)] rounded-lg" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-[var(--bg-secondary)] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <InsightNavigation />

      {/* Workspace Cards */}
      <div className="space-y-4">
        {activeInsight.getPlaces().map((place, index) => (
          <WorkspaceInsightCard
            key={place.ID}
            place={place}
            insight={activeInsight}
            isHighlighted={index === 0}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkspaceAnalyzer;