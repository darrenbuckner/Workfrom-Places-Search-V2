// Pagination.js
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const isPaginationDisabled = totalPages <= 1;

  if (isPaginationDisabled) {
    return (
      <div className="flex justify-center mt-4 space-x-2 opacity-50">
        <button
          disabled
          className="px-3 py-1 rounded bg-bg-secondary/50 text-text-tertiary cursor-not-allowed"
        >
          Previous
        </button>
        <span className="px-3 py-1 text-text-tertiary">
          Page 1 of 1
        </span>
        <button
          disabled
          className="px-3 py-1 rounded bg-bg-secondary/50 text-text-tertiary cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-4 space-x-2">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded transition-colors ${
          currentPage === 1
            ? 'bg-bg-secondary/50 text-text-tertiary cursor-not-allowed'
            : 'bg-bg-secondary text-text-primary hover:bg-bg-tertiary'
        }`}
      >
        Previous
      </button>
      <span className="px-3 py-1 text-text-primary">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded transition-colors ${
          currentPage === totalPages
            ? 'bg-bg-secondary/50 text-text-tertiary cursor-not-allowed'
            : 'bg-bg-secondary text-text-primary hover:bg-bg-tertiary'
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;