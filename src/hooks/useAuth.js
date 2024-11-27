import { useState, useEffect, useCallback } from 'react';
import { useMemberstack } from '@memberstack/react';

// Custom error class for auth-specific errors
class AuthError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  MEMBER_NOT_FOUND: 'No account found with this email address.',
  MEMBER_EXISTS: 'An account with this email already exists.',
  SERVICE_UNAVAILABLE: 'Authentication service is not initialized.',
  DEFAULT_LOGIN: 'Unable to sign in. Please check your credentials and try again.',
  DEFAULT_SIGNUP: 'Unable to create account. Please try again.',
  DEFAULT_LOGOUT: 'Failed to sign out. Please try again.'
};

export const useAuth = () => {
  const [state, setState] = useState({
    isLoading: true,
    user: null
  });
  
  const memberstack = useMemberstack();

  // Check if the auth service is available
  const validateService = useCallback(() => {
    if (!memberstack) {
      throw new AuthError('service_unavailable', ERROR_MESSAGES.SERVICE_UNAVAILABLE);
    }
  }, [memberstack]);

  // Handle auth errors consistently
  const handleAuthError = useCallback((error, defaultMessage) => {
    console.error('Auth error:', error);

    switch (error.code) {
      case 'invalid-credentials':
        throw new AuthError('invalid_credentials', ERROR_MESSAGES.INVALID_CREDENTIALS);
      case 'member-not-found':
        throw new AuthError('member_not_found', ERROR_MESSAGES.MEMBER_NOT_FOUND);
      case 'member-exists':
        throw new AuthError('member_exists', ERROR_MESSAGES.MEMBER_EXISTS);
      default:
        throw new AuthError('auth_error', defaultMessage);
    }
  }, []);

  // Common function to update user and trigger page refresh
  const updateUserAndRefresh = useCallback((userData) => {
    setState(prev => ({ ...prev, user: userData }));
    window.location.reload();
    return userData;
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        validateService();
        const currentMember = await memberstack.getCurrentMember();
        setState({
          user: currentMember?.data || null,
          isLoading: false
        });
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setState({
          user: null,
          isLoading: false
        });
      }
    };

    initializeAuth();
  }, [memberstack, validateService]);

  // Login handler
  const login = useCallback(async (email, password) => {
    try {
      validateService();
      
      const result = await memberstack.loginMemberEmailPassword({
        email,
        password,
        remember: true
      });

      if (!result?.data) {
        throw new Error('Login failed - no data returned');
      }

      return updateUserAndRefresh(result.data);
    } catch (error) {
      handleAuthError(error, ERROR_MESSAGES.DEFAULT_LOGIN);
    }
  }, [memberstack, validateService, handleAuthError, updateUserAndRefresh]);

  // Signup handler
  const signup = useCallback(async (email, password) => {
    try {
      validateService();
      
      const result = await memberstack.signupMemberEmailPassword({
        email,
        password,
        remember: true
      });

      if (!result?.data) {
        throw new Error('Signup failed - no data returned');
      }

      return updateUserAndRefresh(result.data);
    } catch (error) {
      handleAuthError(error, ERROR_MESSAGES.DEFAULT_SIGNUP);
    }
  }, [memberstack, validateService, handleAuthError, updateUserAndRefresh]);

  // Logout handler
  const logout = useCallback(async () => {
    try {
      validateService();
      await memberstack.logout();
      setState(prev => ({ ...prev, user: null }));
    } catch (error) {
      handleAuthError(error, ERROR_MESSAGES.DEFAULT_LOGOUT);
    }
  }, [memberstack, validateService, handleAuthError]);

  return {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: Boolean(state.user),
    login,
    signup,
    logout
  };
};