import React from 'react';
import { Brain, X, ArrowRight } from 'lucide-react';

const AnalysisSection = ({ title, children }) => (
  <div className="p-4 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
    <h3 className="font-medium mb-3 text-[var(--text-primary)]">{title}</h3>
    {children}
  </div>
);

const WorkspaceAnalysis = ({ 
  analysis, 
  isAnalyzing, 
  error,
  onHide,
  onPlaceClick 
}) => {
  if (error) {
    return (
      <div className="mb-6">
        <div className="border border-red-500 rounded-lg p-4 bg-red-50">
          <p className="text-red-600">Error analyzing workspaces: {error}</p>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="mb-6">
        <div className="border border-[var(--border-primary)] rounded-lg p-4 bg-[var(--bg-secondary)]">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[var(--accent-primary)]" />
              <div className="h-4 bg-[var(--bg-tertiary)] rounded w-48"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-[var(--bg-tertiary)] rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const { bestFor, timeBasedRecommendations, uniqueFeatures } = analysis;

  return (
    <div className="mb-6">
      <div className="border border-[var(--accent-secondary)] rounded-lg bg-[var(--bg-primary)] relative">
        <button
          onClick={onHide}
          className="absolute right-4 top-4 p-1.5 rounded-full 
            bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] 
            text-[var--text-secondary] transition-colors"
        >
          <X size={16} />
        </button>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-[var(--accent-primary)]" />
            <h2 className="text-lg font-medium text-[var(--text-primary)]">
              Workspace Analysis
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AnalysisSection title="Best For Work Styles">
              {Object.entries(bestFor).map(([style, data]) => (
                <div
                  key={style}
                  className="group mb-3 last:mb-0 cursor-pointer"
                  onClick={() => onPlaceClick(data.name)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                    <h4 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]">
                      {style.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                  </div>
                  <div className="ml-3 text-sm text-[var(--text-secondary)]">
                    {data.name} - {data.reason}
                  </div>
                </div>
              ))}
            </AnalysisSection>

            <AnalysisSection title="Time-Based Recommendations">
              {Object.entries(timeBasedRecommendations).map(([time, data]) => (
                <div
                  key={time}
                  className="group mb-3 last:mb-0 cursor-pointer"
                  onClick={() => onPlaceClick(data.name)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                    <h4 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]">
                      {time.charAt(0).toUpperCase() + time.slice(1)}
                    </h4>
                  </div>
                  <div className="ml-3 text-sm text-[var(--text-secondary)]">
                    {data.name} - {data.reason}
                  </div>
                </div>
              ))}
            </AnalysisSection>
          </div>

          <AnalysisSection title="Notable Features" className="mt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {uniqueFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="group cursor-pointer"
                  onClick={() => onPlaceClick(feature.placeName)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]">
                      {feature.placeName}
                    </span>
                  </div>
                  <div className="ml-3 text-sm text-[var(--text-secondary)]">
                    {feature.feature} - {feature.description}
                  </div>
                </div>
              ))}
            </div>
          </AnalysisSection>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceAnalysis;