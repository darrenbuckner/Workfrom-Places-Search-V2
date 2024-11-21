import React from 'react';
import { Wifi, WifiOff, Battery, Volume2 } from 'lucide-react';

const MetricInsight = ({ icon: Icon, title, detail, quality, className = "" }) => {
  const getQualityColor = (quality) => {
    switch (quality) {
      case 'excellent':
        return 'text-[var(--success)] dark:text-[var(--success)]';
      case 'good':
        return 'text-[var(--info)] dark:text-[var(--info)]';
      case 'limited':
        return 'text-[var(--warning)] dark:text-[var(--warning)]';
      case 'poor':
        return 'text-[var(--error)] dark:text-[var(--error)]';
      default:
        return 'text-[var(--text-tertiary)]';
    }
  };

  return (
    <div className={`
      p-4 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)]
      ${className}
    `}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 
          flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[var(--accent-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-[var(--text-primary)] mb-1">
            {title}
          </h4>
          <p className="text-sm text-[var(--text-secondary)]">
            {detail}
          </p>
          {quality && (
            <div className={`text-xs font-medium mt-2 ${getQualityColor(quality)}`}>
              {quality === 'excellent' && '✨ Great for remote work'}
              {quality === 'good' && '👍 Good for most work'}
              {quality === 'limited' && '⚡ Best for short sessions'}
              {quality === 'poor' && '⚠️ Consider alternatives'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WorkabilityMetrics = ({ place }) => {
  // WiFi assessment
  const getWifiMetric = () => {
    if (place.no_wifi === "1") {
      return {
        icon: WifiOff,
        title: "No WiFi Available",
        detail: "This location does not provide WiFi access. Consider bringing a mobile hotspot.",
        quality: 'poor'
      };
    }

    if (place.download) {
      const speed = Math.round(place.download);
      let quality, detail;

      if (speed >= 50) {
        quality = 'excellent';
        detail = `${speed}+ Mbps - Perfect for video calls, file transfers, and multi-device use.`;
      } else if (speed >= 25) {
        quality = 'good';
        detail = `${speed}+ Mbps - Suitable for video calls and general work.`;
      } else if (speed >= 10) {
        quality = 'limited';
        detail = `${speed}+ Mbps - OK for basic tasks, may struggle with video.`;
      } else {
        quality = 'poor';
        detail = `${speed} Mbps - Limited speed, best for basic browsing.`;
      }

      return {
        icon: Wifi,
        title: `WiFi Speed: ${speed} Mbps`,
        detail,
        quality
      };
    }

    return {
      icon: Wifi,
      title: "WiFi Available",
      detail: "Speed data not available. Ask staff about typical performance.",
      quality: null
    };
  };

  // Power availability assessment
  const getPowerMetric = () => {
    const powerValue = String(place.power || '').toLowerCase();
    
    if (powerValue.includes('range3') || powerValue.includes('good')) {
      return {
        icon: Battery,
        title: "Abundant Power Access",
        detail: "Most seats have easy outlet access. Great for long work sessions.",
        quality: 'excellent'
      };
    }
    
    if (powerValue.includes('range2')) {
      return {
        icon: Battery,
        title: "Moderate Power Access",
        detail: "Outlets available at about half the seats. Choose seating strategically.",
        quality: 'good'
      };
    }
    
    if (powerValue.includes('range1')) {
      return {
        icon: Battery,
        title: "Limited Power Access",
        detail: "Few outlets available. Come with devices charged.",
        quality: 'limited'
      };
    }
    
    if (powerValue === 'none') {
      return {
        icon: Battery,
        title: "No Power Outlets",
        detail: "No public power access. Bring fully charged devices.",
        quality: 'poor'
      };
    }

    return {
      icon: Battery,
      title: "Power Availability Unknown",
      detail: "Ask staff about outlet locations.",
      quality: null
    };
  };

  // Noise level assessment
  const getNoiseMetric = () => {
    const noise = String(place.noise_level || place.noise || "").toLowerCase();
    
    if (noise.includes('quiet')) {
      return {
        icon: Volume2,
        title: "Quiet Environment",
        detail: "Library-like atmosphere. Perfect for focused work.",
        quality: 'excellent'
      };
    }
    
    if (noise.includes('moderate')) {
      return {
        icon: Volume2,
        title: "Moderate Noise Level",
        detail: "Typical cafe atmosphere. Good for most work styles.",
        quality: 'good'
      };
    }
    
    if (noise.includes('noisy') || noise.includes('lively')) {
      return {
        icon: Volume2,
        title: "Lively Atmosphere",
        detail: "Energetic environment. Bring noise-canceling headphones.",
        quality: 'limited'
      };
    }

    return {
      icon: Volume2,
      title: "Noise Level Varies",
      detail: "Sound levels may change throughout the day.",
      quality: null
    };
  };

  return (
    <div className="space-y-3">
      <MetricInsight {...getWifiMetric()} />
      <MetricInsight {...getPowerMetric()} />
      <MetricInsight {...getNoiseMetric()} />
    </div>
  );
};

export default WorkabilityMetrics;