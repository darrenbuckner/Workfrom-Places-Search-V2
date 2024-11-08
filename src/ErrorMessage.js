import React from 'react';
import { AlertCircle, RefreshCcw, WifiOff, X, AlertTriangle, Map, AlertOctagon, MapPin } from 'lucide-react';

const CUSTOM_ERRORS = {
  // Connectivity errors
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection.',
    icon: WifiOff,
    variant: 'error'
  },
  // Location errors
  LOCATION_DENIED: {
    code: 'LOCATION_DENIED',
    title: 'Location Access Denied',
    message: 'Please enable location access to find workspaces near you.',
    icon: MapPin,
    variant: 'warning'
  },
  LOCATION_UNAVAILABLE: {
    code: 'LOCATION_UNAVAILABLE',
    title: 'Location Unavailable',
    message: 'Unable to determine your location. Please try again.',
    icon: Map,
    variant: 'warning'
  },
  // API errors
  RATE_LIMIT: {
    code: 429,
    title: 'Too Many Requests',
    message: 'Please wait a moment before trying again.',
    icon: AlertOctagon,
    variant: 'warning'
  },
  NOT_FOUND: {
    code: 404,
    title: 'No Results Found',
    message: 'No workspaces found in this area. Try adjusting your search radius.',
    icon: AlertTriangle,
    variant: 'info'
  },
  // Generic errors
  DEFAULT: {
    code: 'DEFAULT',
    title: 'Error',
    message: 'Something went wrong. Please try again.',
    icon: AlertCircle,
    variant: 'error'
  }
};

const getErrorConfig = (error) => {
  // Handle network errors
  if (error.message?.includes('Failed to fetch') || error instanceof TypeError) {
    return CUSTOM_ERRORS.NETWORK_ERROR;
  }

  // Handle location errors
  if (error.code === 1) { // GeolocationPositionError.PERMISSION_DENIED
    return CUSTOM_ERRORS.LOCATION_DENIED;
  }
  if (error.code === 2) { // GeolocationPositionError.POSITION_UNAVAILABLE
    return CUSTOM_ERRORS.LOCATION_UNAVAILABLE;
  }

  // Handle API errors
  if (error.code === 429) {
    return CUSTOM_ERRORS.RATE_LIMIT;
  }
  if (error.code === 404) {
    return {
      ...CUSTOM_ERRORS.NOT_FOUND,
      message: error.message || CUSTOM_ERRORS.NOT_FOUND.message
    };
  }

  // Use custom error details if provided
  if (error.title && error.message) {
    return {
      ...CUSTOM_ERRORS.DEFAULT,
      title: error.title,
      message: error.message,
      variant: error.variant || 'error'
    };
  }

  // Default error
  return {
    ...CUSTOM_ERRORS.DEFAULT,
    message: error.message || CUSTOM_ERRORS.DEFAULT.message
  };
};

const getVariantStyles = (variant) => {
  switch (variant) {
    case 'error':
      return {
        container: 'border-red-500/20 bg-red-500/5',
        icon: 'text-red-500 bg-red-500/10',
        title: 'text-red-500',
        button: 'bg-red-500/10 hover:bg-red-500/20 text-red-500'
      };
    case 'warning':
      return {
        container: 'border-yellow-500/20 bg-yellow-500/5',
        icon: 'text-yellow-500 bg-yellow-500/10',
        title: 'text-yellow-500',
        button: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500'
      };
    case 'info':
      return {
        container: 'border-blue-500/20 bg-blue-500/5',
        icon: 'text-blue-500 bg-blue-500/10',
        title: 'text-blue-500',
        button: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-500'
      };
    default:
      return {
        container: 'border-red-500/20 bg-red-500/5',
        icon: 'text-red-500 bg-red-500/10',
        title: 'text-red-500',
        button: 'bg-red-500/10 hover:bg-red-500/20 text-red-500'
      };
  }
};

const ErrorMessage = ({ 
  error,
  onRetry,
  onDismiss,
  size = 'default', // 'default' | 'compact'
  className = '',
  showIcon = true
}) => {
  const config = getErrorConfig(error);
  const Icon = config.icon;
  const styles = getVariantStyles(config.variant);

  if (size === 'compact') {
    return (
      <div className={`
        flex items-center gap-3 p-3 rounded-lg transition-all
        ${styles.container}
        ${className}
      `}>
        {showIcon && (
          <Icon className={`w-5 h-5 flex-shrink-0 ${styles.icon}`} />
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${styles.title}`}>
            {config.message}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md
                text-sm font-medium transition-colors
                ${styles.button}
              `}
            >
              <RefreshCcw size={14} />
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <X size={14} className="text-[var(--text-secondary)]" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`
      rounded-lg border overflow-hidden transition-all
      ${styles.container}
      ${className}
    `}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {showIcon && (
            <div className="flex-shrink-0">
              <div className={`
                w-8 h-8 rounded-full
                flex items-center justify-center
                ${styles.icon}
              `}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium ${styles.title}`}>
              {config.title}
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {config.message}
            </p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <X size={14} className="text-[var(--text-secondary)]" />
            </button>
          )}
        </div>
        {onRetry && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={onRetry}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-md
                text-sm font-medium transition-colors
                ${styles.button}
              `}
            >
              <RefreshCcw size={14} />
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;