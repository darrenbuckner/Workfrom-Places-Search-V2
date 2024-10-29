// Pagination.js
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, className, debug = false }) => {
  const isPaginationDisabled = totalPages <= 1;

  if (debug) {
    console.log('Pagination render:', {
      currentPage,
      totalPages,
      disabled: isPaginationDisabled
    });
  }

  if (isPaginationDisabled) {
    return null;
  }

  return (
    <div className={`flex justify-center mt-4 space-x-2 ${className}`}>
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded transition-colors ${
          currentPage === 1
            ? 'bg-[var(--bg-secondary)]/50 text-[var(--text-tertiary)] cursor-not-allowed'
            : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
        }`}
      >
        Previous
      </button>
      
      <span className="px-3 py-1 text-[var(--text-primary)]">
        Page {currentPage} of {totalPages}
      </span>
      
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded transition-colors ${
          currentPage === totalPages
            ? 'bg-[var(--bg-secondary)]/50 text-[var(--text-tertiary)] cursor-not-allowed'
            : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;