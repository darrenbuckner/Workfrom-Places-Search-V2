import React from 'react';
import { Loader, AlertCircle, AlertTriangle, CheckCircle, InfoIcon } from 'lucide-react';

export const LoadingSpinner = ({ size = 16, className = '' }) => {
  return (
    <svg 
      className={`animate-spin text-[var(--action-primary)] ${className}`}
      style={{ width: size, height: size }}
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Message variants
const MESSAGE_VARIANTS = {
  info: {
    icon: InfoIcon,
    styles: 'border-[var(--info)] bg-[var(--info)]/10 text-[var(--info)]'
  },
  success: {
    icon: CheckCircle,
    styles: 'border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]'
  },
  warning: {
    icon: AlertTriangle,
    styles: 'border-[var(--warning)] bg-[var(--warning)]/10 text-[var(--warning)]'
  },
  error: {
    icon: AlertCircle,
    styles: 'border-[var(--error)] bg-[var(--error)]/10 text-[var(--error)]'
  },
  loading: {
    icon: LoadingSpinner,
    styles: 'border-[var(--action-primary)] bg-[var(--action-primary)]/10 text-[var(--action-primary)]'
  }
};

export const Message = ({ 
  variant = 'info',
  message,
  description,
  action,
  onAction,
  className = ''
}) => {
  const config = MESSAGE_VARIANTS[variant] || MESSAGE_VARIANTS.info;
  const Icon = config.icon;
  
  return (
    <div className={`
      flex items-start gap-3 p-4 rounded-lg border
      transition-colors duration-200
      ${config.styles}
      ${className}
    `}>
      <div className="flex-shrink-0 mt-0.5">
        <Icon size={20} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium">
          {message}
        </div>
        {description && (
          <div className="mt-1 text-sm opacity-90">
            {description}
          </div>
        )}
        {action && (
          <button
            onClick={onAction}
            className="mt-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {action}
          </button>
        )}
      </div>
    </div>
  );
};

export const SearchProgressIndicator = ({ phase, error, usingSavedLocation }) => {
  // Don't show anything in initial state
  if (phase === 'initial') return null;

  if (error) {
    return (
      <div className="mt-4 max-w-lg mx-auto">
        <Message
          variant="error"
          message="Error"
          description={error}
        />
      </div>
    );
  }

  if (phase === 'locating' && !usingSavedLocation) {
    return (
      <div className="mt-4 max-w-lg mx-auto">
        <Message
          variant="loading"
          message="Getting your location"
          description="Please allow location access if prompted"
        />
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="mt-4 max-w-lg mx-auto">
        <Message
          variant="loading"
          message="Finding workspaces"
          description="Searching nearby places..."
        />
      </div>
    );
  }

  return null;
};

export const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-[var(--modal-overlay)] flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size={40} className="mx-auto mb-4" />
        <div className="text-[var(--text-primary)]">{message}</div>
      </div>
    </div>
  );
};

export const LoadingBlock = ({ 
  message = 'Loading...',
  className = ''
}) => {
  return (
    <div className={`
      flex items-center justify-center p-8
      bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]
      ${className}
    `}>
      <div className="text-center">
        <LoadingSpinner size={32} className="mx-auto mb-3" />
        <div className="text-[var(--text-secondary)]">{message}</div>
      </div>
    </div>
  );
};

export const LoadingButton = ({
  loading = false,
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      disabled={loading || disabled}
      className={`
        relative inline-flex items-center justify-center
        transition-colors duration-200
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {loading && (
        <LoadingSpinner size={16} className="absolute left-1/2 -ml-2" />
      )}
      <span className={loading ? 'invisible' : ''}>
        {children}
      </span>
    </button>
  );
};

export default {
  LoadingSpinner,
  Message,
  SearchProgressIndicator,
  LoadingOverlay,
  LoadingBlock,
  LoadingButton
};