import React from 'react';
import { AlertCircle, RefreshCcw, WifiOff, X, AlertTriangle, Map, AlertOctagon, MapPin } from 'lucide-react';
import SearchControls from './SearchControls';

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

const metersToMiles = (meters) => {
  return (meters * 0.000621371).toFixed(1);
};

const AlertIcon = ({ error }) => {
  const Icon = error.icon || AlertCircle;
  return (
    <div className="flex-shrink-0 mt-0.5">
      <Icon size={20} className="text-[var(--text-warning)]" />
    </div>
  );
};

const ErrorMessage = ({ 
  error,
  onRetry,
  onRetryWithLargerRadius,
  onRetryWithMaxRadius,
  radius,
  setRadius,
  locationName
}) => {
  const config = getErrorConfig(error);
  const Icon = config.icon;
  const styles = getVariantStyles(config.variant);
  const isNoResults = error?.message?.includes('No workspaces found') || error?.isNoResults;

  if (isNoResults) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 p-4 rounded-lg border border-[var(--border-warning)] bg-[var(--bg-warning)]">
          <AlertTriangle className="w-5 h-5 text-[var(--text-warning)] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-[var(--text-warning)]">
              No workspaces found
            </h3>
            <p className="mt-1 text-sm text-[var(--text-warning)]/90">
              {error.message || `We couldn't find any workspaces within ${metersToMiles(radius)} miles of ${locationName || 'your location'}. Try increasing your search radius or searching in a different area.`}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <h4 className="font-medium text-[var(--text-primary)] mb-3">
            Adjust search radius
          </h4>
          <SearchControls
            radius={radius}
            setRadius={setRadius}
            onSearch={onRetry}
            onRadiusChange={setRadius}
            hideLocationInput
            compact
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4">
      <div className="flex items-start gap-3">
        <AlertIcon error={config} />
        <div className="flex-1">
          <h3 className="font-medium text-[var(--text-primary)]">
            {config.title || 'Error'}
          </h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {config.message}
          </p>
          <div className="mt-3 flex gap-3">
            {config.canRetryWithMaxRadius && (
              <button
                onClick={onRetryWithMaxRadius}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium
                  rounded-md bg-[var(--accent-primary)] text-[var(--button-text)]
                  hover:bg-[var(--accent-primary-hover)] transition-colors"
              >
                Try with 5-mile radius
              </button>
            )}
            {config.canRetryWithLargerRadius && (
              <button
                onClick={onRetryWithLargerRadius}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium
                  rounded-md bg-[var(--bg-tertiary)] text-[var(--text-primary)]
                  hover:bg-[var(--bg-tertiary-hover)] transition-colors"
              >
                Try larger radius
              </button>
            )}
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium
                rounded-md bg-[var(--bg-tertiary)] text-[var(--text-primary)]
                hover:bg-[var(--bg-tertiary-hover)] transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;