import React, { useState } from 'react';
import { ThemeProvider } from './ThemeProvider';
import WorkfromPlacesContent from './components/WorkfromPlacesContent';
import { MemberstackProvider } from '@memberstack/react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthModal } from './components/AuthModal';

// IMPORTANT: Make sure this matches your Memberstack public key exactly
const MEMBERSTACK_CONFIG = {
  publicKey: process.env.REACT_APP_MEMBERSTACK_PUBLIC_KEY,
  onUnauthorized: () => {
    // Handle unauthorized access
    console.log('Unauthorized access attempt');
  },
  onError: (error) => {
    // Handle any Memberstack errors
    console.error('Memberstack error:', error);
  }
};

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  return (
    <MemberstackProvider config={MEMBERSTACK_CONFIG}>
      <ThemeProvider>
        <ProtectedRoute>
          <WorkfromPlacesContent />
        </ProtectedRoute>
        {showAuthModal && (
          <AuthModal 
            isOpen={showAuthModal}
            onClose={handleCloseAuthModal}
          />
        )}
      </ThemeProvider>
    </MemberstackProvider>
  );
}

export default App;