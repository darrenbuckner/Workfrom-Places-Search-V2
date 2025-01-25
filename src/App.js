import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import WorkfromPlacesContent from './components/WorkfromPlacesContent';
import WorkfromHeader from './WorkfromHeader';
import { FavoritesList } from './components/FavoritesList';
import HowItWorksModal from './HowItWorksModal';

function App() {
  const [showHowItWorks, setShowHowItWorks] = React.useState(false);

  // Add a check for favorites route
  const isFavoritesRoute = window.location.pathname === '/favorites';

  if (isFavoritesRoute) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
          <WorkfromHeader 
            onShowHowItWorks={() => setShowHowItWorks(true)}
            className="mb-4"
          />
          <div className="h-16" />
          <div className="flex-1 container mx-auto px-4 max-w-2xl">
            <FavoritesList />
          </div>
          {showHowItWorks && <HowItWorksModal setShowModal={setShowHowItWorks} />}
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <WorkfromPlacesContent />
    </ThemeProvider>
  );
}

export default App;