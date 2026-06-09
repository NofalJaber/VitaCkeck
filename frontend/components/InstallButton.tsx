'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function InstallButton() {
  const { t } = useLanguage(); // Preluăm traducerile din hook
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowModal(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowModal(true);
    }
  };

  if (isInstalled) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="w-[52px] h-[52px] rounded-xl bg-primary/10 flex items-center justify-center transition-colors hover:bg-primary/20 focus:outline-none"
        aria-label="Install App"
        title={t.installTooltip}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground bg-muted p-1.5 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <h3 className="text-xl font-bold mb-2 text-foreground">{t.installTitle}</h3>
            <p className="text-muted-foreground mb-6 text-sm">{t.installDesc}</p>

            <ol className="space-y-4 text-sm text-foreground mb-8">
              <li className="flex items-start gap-3 bg-muted/40 p-3 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                <span className="leading-relaxed">{t.installStep1}</span>
              </li>
              <li className="flex items-start gap-3 bg-muted/40 p-3 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                <span className="leading-relaxed">{t.installStep2}</span>
              </li>
              <li className="flex items-start gap-3 bg-muted/40 p-3 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                <span className="leading-relaxed">{t.installStep3}</span>
              </li>
            </ol>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              {t.gotIt}
            </button>
          </div>
        </div>
      )}
    </>
  );
}