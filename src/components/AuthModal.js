import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useScrollLock } from '../useScrollLock';
import { Loader } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, signup } = useAuth();

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setEmail('');
      setPassword('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      setError(error.message || 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-[var(--modal-backdrop)] backdrop-blur-xl"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md mx-4 p-6 bg-[var(--bg-primary)] 
        rounded-lg border border-[var(--border-primary)] shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">
          {mode === 'login' ? 'Log In' : 'Sign Up'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md 
                border border-[var(--border-primary)]
                bg-[var(--bg-secondary)]
                text-[var(--text-primary)]
                placeholder-[var(--text-secondary)]
                focus:outline-none focus:ring-2 
                focus:ring-[var(--accent-primary)]/20
                focus:border-[var(--accent-primary)]
                transition-colors"
              placeholder="Enter your email"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md 
                border border-[var(--border-primary)]
                bg-[var(--bg-secondary)]
                text-[var(--text-primary)]
                placeholder-[var(--text-secondary)]
                focus:outline-none focus:ring-2 
                focus:ring-[var(--accent-primary)]/20
                focus:border-[var(--accent-primary)]
                transition-colors"
              placeholder="Enter your password"
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-md
              bg-[var(--accent-primary)] 
              hover:bg-[var(--action-primary-hover)]
              active:bg-[var(--accent-primary)]
              disabled:opacity-50
              disabled:hover:bg-[var(--accent-primary)]
              text-[var(--button-text)]
              font-medium
              transition-colors
              focus:outline-none focus:ring-2 
              focus:ring-[var(--accent-primary)]/20
              relative
              overflow-hidden"
          >
            <span className={`inline-flex items-center gap-2 ${isSubmitting ? 'invisible' : ''}`}>
              {mode === 'login' ? 'Log In' : 'Sign Up'}
            </span>
            {isSubmitting && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader className="w-5 h-5 animate-spin" />
              </div>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            disabled={isSubmitting}
            className="text-sm text-[var(--accent-primary)] 
              hover:text-[var(--accent-secondary)]
              disabled:opacity-50
              transition-colors"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};