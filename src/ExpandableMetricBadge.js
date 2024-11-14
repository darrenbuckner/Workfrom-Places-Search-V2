import React from 'react';
import { 
  Wifi, Battery, Volume2, WifiOff,
  Info
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

const MetricTooltip = ({ children }) => (
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 
    opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
    <div className="relative">
      <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] 
        rounded-lg p-2 text-xs text-[var(--text-secondary)] shadow-lg">
        {children}
      </div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45
        bg-[var(--bg-primary)] border-r border-b border-[var(--border-primary)]" />
    </div>
  </div>
);

const ExpandableMetricBadge = ({ metric, className = "" }) => {
  const { isDark } = useTheme();

  const getBaseColors = (state) => {
    switch (state) {
      case 'success':
        return {
          bg: isDark ? "bg-emerald-400/10" : "bg-emerald-50",
          border: isDark ? "border-emerald-400/20" : "border-emerald-100",
          text: isDark ? "text-emerald-300" : "text-emerald-700",
          icon: isDark ? "text-emerald-400" : "text-emerald-600"
        };
      case 'warning':
        return {
          bg: isDark ? "bg-amber-400/10" : "bg-amber-50",
          border: isDark ? "border-amber-400/20" : "border-amber-100",
          text: isDark ? "text-amber-300" : "text-amber-700",
          icon: isDark ? "text-amber-400" : "text-amber-600"
        };
      case 'error':
        return {
          bg: isDark ? "bg-red-400/10" : "bg-red-50",
          border: isDark ? "border-red-400/20" : "border-red-100",
          text: isDark ? "text-red-300" : "text-red-700",
          icon: isDark ? "text-red-400" : "text-red-600"
        };
      default:
        return {
          bg: isDark ? "bg-slate-400/10" : "bg-slate-50",
          border: isDark ? "border-slate-400/20" : "border-slate-100",
          text: isDark ? "text-slate-300" : "text-slate-700",
          icon: isDark ? "text-slate-400" : "text-slate-600"
        };
    }
  };

  const getMetricState = (metric) => {
    if (metric.type === 'wifi') {
      if (metric.noWifi) return 'error';
      if (metric.download >= 50) return 'success';
      if (metric.download >= 25) return 'success';
      if (metric.download >= 10) return 'warning';
      if (metric.download) return 'warning';
      return 'default';
    }

    if (metric.type === 'power') {
      if (metric.powerValue?.includes('range3') || metric.powerValue?.includes('good')) return 'success';
      if (metric.powerValue?.includes('range2')) return 'warning';
      if (metric.powerValue?.includes('range1')) return 'warning';
      if (metric.powerValue === 'none') return 'error';
      return 'default';
    }

    if (metric.type === 'noise') {
      if (metric.noiseLevel?.toLowerCase().includes('quiet')) return 'success';
      if (metric.noiseLevel?.toLowerCase().includes('moderate')) return 'warning';
      if (metric.noiseLevel?.toLowerCase().includes('noisy')) return 'warning';
      return 'default';
    }

    return 'default';
  };

  const styles = getBaseColors(getMetricState(metric));

  return (
    <div className={`group relative ${className}`}>
      <div className={`
        inline-flex items-center gap-1.5 h-7 px-2.5
        whitespace-nowrap rounded-md
        transition-all duration-200 hover:scale-105
        ${styles.bg} ${styles.border} border
      `}>
        <metric.icon size={14} className={styles.icon} />
        <span className={`text-xs font-medium ${styles.text}`}>
          {metric.label}
        </span>
        <Info 
          size={12} 
          className={`
            opacity-50 group-hover:opacity-100 
            transition-opacity ml-0.5
            ${styles.icon}
          `} 
        />
      </div>

      {/* Make tooltip wider for better readability */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 
        opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
        <div className="relative">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] 
            rounded-lg p-3 text-xs shadow-lg">
            <div className="space-y-2">
              <p className="font-medium text-[var(--text-primary)]">
                {metric.details}
              </p>
              {metric.stats && (
                <ul className="space-y-1.5 mt-2 text-[var(--text-secondary)]">
                  {metric.stats.map((stat, index) => (
                    <li key={index} className="flex items-center gap-1.5">
                      <div className={`w-1 h-1 rounded-full ${styles.bg}`} />
                      {stat}
                    </li>
                  ))}
                </ul>
              )}
              {metric.recommendations && (
                <p className="text-[var(--text-secondary)] italic border-t 
                  border-[var(--border-primary)] pt-2 mt-2">
                  {metric.recommendations}
                </p>
              )}
            </div>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45
            bg-[var(--bg-primary)] border-r border-b border-[var(--border-primary)]" />
        </div>
      </div>
    </div>
  );
};

export default ExpandableMetricBadge;