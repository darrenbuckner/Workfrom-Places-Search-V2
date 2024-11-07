import React from 'react';
import { Users, Zap, Globe, ArrowRight, Layout } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const WorkfromVirtualAd = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`
      relative border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden
      ${isDark 
        ? 'border-white/10 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)]' 
        : 'border-border-primary bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)]'
      }
    `}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Content Section */}
          <div>
            <h3 className={`text-xl font-bold mb-1 text-[var(--text-primary)]`}>
              Create Branded Virtual Spaces
            </h3>
            <p className={`text-sm text-[var(--text-secondary)]`}>
              Transform your online presence into an immersive workspace
            </p>
          </div>

          {/* CTA Button */}
          <a 
            href="https://www.workfrom.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`
              group inline-flex items-center justify-center whitespace-nowrap px-4 py-2 
              bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] 
              text-[var(--button-text)] text-sm rounded-full font-medium 
              transition-all duration-300
              shadow-sm hover:shadow-md
              border border-[var(--accent-primary)]
            `}
          >
            Start Building
            <ArrowRight 
              size={16} 
              className="ml-1 transform transition-transform duration-300 group-hover:translate-x-1" 
            />
          </a>
        </div>
        
        {/* Feature Icons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          {[
            { icon: Layout, label: 'Branded Spaces' },
            { icon: Users, label: 'Engagement Tools' },
            { icon: Globe, label: 'Analytics & Insights' },
            { icon: Zap, label: 'Automation' }
          ].map(({ icon: Icon, label }, index) => (
            <div 
              key={index} 
              className="flex items-center text-xs"
            >
              <div className={`
                p-1.5 rounded-full mr-2
                bg-[var(--accent-primary)]/10
                transition-colors
              `}>
                <Icon 
                  size={14} 
                  className="text-[var(--accent-primary)]"
                />
              </div>
              <span className={`
                font-light
                text-[var(--text-secondary)]
              `}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Subtle Bottom Gradient */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-1 opacity-30"
          style={{
            background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))'
          }}
        />
      </div>
    </div>
  );
};

export default WorkfromVirtualAd;