import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import WorkfromPlacesContent from './components/WorkfromPlacesContent';

function App() {
  return (
    <ThemeProvider>
      <WorkfromPlacesContent />
    </ThemeProvider>
  );
}

export default App;