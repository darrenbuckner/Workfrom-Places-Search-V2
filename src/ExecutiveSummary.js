import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Brain, TrendingUp } from 'lucide-react';

const ExecutiveSummary = ({ summary, metrics }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-accent-primary/5 border border-accent-primary/20 rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-accent-primary" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-text-primary mb-1">
              Executive Summary
            </h2>
            <p className="text-sm text-text-secondary">
              Expert analysis of the local workspace landscape
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-bg-secondary border border-border-primary rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <metric.icon className="w-4 h-4 text-accent-primary" />
                <span className="text-xs text-text-secondary">
                  {metric.label}
                </span>
              </div>
              <div className="font-medium text-text-primary">
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Text */}
        <div className={`relative ${!isExpanded && 'max-h-24 overflow-hidden'}`}>
          <p className="text-sm text-text-primary leading-relaxed">
            {summary}
          </p>
          
          {/* Gradient Overlay */}
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-accent-primary/5 to-transparent" />
          )}
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-accent-primary hover:text-accent-secondary transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Read More
            </>
          )}
        </button>
      </div>

      {/* Trending Patterns */}
      <div className="border-t border-accent-primary/10 bg-accent-primary/[0.03] px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-accent-primary" />
          <span className="font-medium text-accent-primary">
            Key Pattern
          </span>
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          {metrics.topPattern}
        </p>
      </div>
    </div>
  );
};

export default ExecutiveSummary;