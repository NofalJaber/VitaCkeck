'use client';

import { useState, useEffect } from 'react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed and running as a standalone app
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome from showing the default automatic install banner at the bottom
      e.preventDefault();
      // Save the event so it can be triggered later when the user clicks the button
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Cleanup the listener when the component unmounts
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the native Android install prompt
    deferredPrompt.prompt();

    // Wait for the user to accept or dismiss the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      // Clear the prompt so the button disappears after successful installation
      setDeferredPrompt(null);
    } else {
      console.log('User dismissed the install prompt');
    }
  };

  // Only render the button if the app is NOT installed AND the browser gave us the install prompt
  // (This automatically hides the button on iOS for now, since iOS doesnt fire this event)
  if (isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <button 
      onClick={handleInstallClick}
      className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow hover:bg-gray-100 transition-colors"
      aria-label="Install App"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    </button>
  );
}