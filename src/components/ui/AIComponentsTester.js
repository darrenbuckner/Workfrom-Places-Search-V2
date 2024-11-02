import React, { useState } from 'react';
import { AILoadingMessage, AIErrorMessage } from './AIComponents';

const AIComponentsTester = () => {
  const [showError, setShowError] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowError(false)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            !showError 
              ? 'bg-[var(--accent-primary)] text-white' 
              : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
          }`}
        >
          Show Loading State
        </button>
        <button
          onClick={() => setShowError(true)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            showError 
              ? 'bg-[var(--accent-primary)] text-white' 
              : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
          }`}
        >
          Show Error State
        </button>
      </div>

      <div className="border border-[var(--border-primary)] rounded-lg p-4 bg-[var(--bg-secondary)]">
        {showError ? (
          <AIErrorMessage 
            message="Unable to complete workspace analysis. Please try again."
            onRetry={() => setShowError(false)}
          />
        ) : (
          <AILoadingMessage />
        )}
      </div>
    </div>
  );
};

export default AIComponentsTester;