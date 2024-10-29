import React from 'react';
import { Brain, Coffee, Users, Wifi, Battery, Volume2, MapPin } from 'lucide-react';

const getCategoryIcon = (category) => {
  switch (category) {
    case 'environment':
      return <Users className="w-4 h-4" />;
    case 'productivity':
      return <Brain className="w-4 h-4" />;
    case 'amenities':
      return <Coffee className="w-4 h-4" />;
    case 'accessibility':
      return <MapPin className="w-4 h-4" />;
    default:
      return <Brain className="w-4 h-4" />;
  }
};

const StrategicInsights = ({ insights }) => {
  const getCategoryColor = (category) => {
    switch (category) {
      case 'environment':
        return 'bg-emerald-500';
      case 'productivity':
        return 'bg-blue-500';
      case 'amenities':
        return 'bg-amber-500';
      case 'accessibility':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg border border-border-primary bg-bg-secondary transition-shadow hover:shadow-md"
          >
            {/* Category Indicator */}
            <div className={`absolute top-0 left-0 h-1 w-full ${getCategoryColor(insight.category)}`} />
            
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-full ${getCategoryColor(insight.category)} bg-opacity-10`}>
                  {getCategoryIcon(insight.category)}
                </div>
                <h3 className="font-medium text-text-primary">
                  {insight.title}
                </h3>
              </div>
              
              <p className="text-sm text-text-secondary leading-relaxed">
                {insight.description}
              </p>

              {/* Importance Indicator */}
              <div className="mt-3 pt-3 border-t border-border-primary">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">
                    Impact Level
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-4 rounded-sm transition-colors ${
                          i < insight.importance
                            ? getCategoryColor(insight.category)
                            : 'bg-bg-tertiary'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrategicInsights;