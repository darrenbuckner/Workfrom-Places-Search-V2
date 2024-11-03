import React from 'react';

const SearchResultsContainer = ({ children, places, searchPhase }) => {
  // Always render the container after initial search
  const searchSection = children[0];
  const genAISection = places.length > 0 ? children[1] : null;
  const resultsSection = children[2]; // No longer conditional on places.length

  return (
    <div className="border border-[var(--border-primary)] rounded-lg shadow-sm mb-6 bg-[var(--bg-secondary)]">
      {/* Search Section */}
      <div className="p-4">
        {searchSection}
      </div>
      
      {/* GenAI Quick Match Section */}
      {genAISection && (
        <div className="border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
          <div className="p-4">
            {genAISection}
          </div>
        </div>
      )}
      
      {/* Results Section - Always render after initial search */}
      <div className="border-t border-[var(--border-primary)]">
        {resultsSection}
      </div>
    </div>
  );
};

export default SearchResultsContainer;