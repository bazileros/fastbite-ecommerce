'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  denyNonEssential,
  initializeAnalytics,
  initializeMarketing,
} from './cookie-utils';
import { CookieConsent } from './types';

interface CookieContextType {
  consent: CookieConsent | null;
  setConsent: (consent: CookieConsent) => void;
  showPopup: boolean;
  setShowPopup: (show: boolean) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  acceptEssential: () => void;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

const COOKIE_CONSENT_KEY = 'fastbite-cookie-consent';

export function CookieProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<CookieConsent | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (storedConsent) {
      try {
        const parsedConsent = JSON.parse(storedConsent);
        setConsentState(parsedConsent);
      } catch (error) {
        console.error('Error parsing cookie consent:', error);
        setShowPopup(true);
      }
    } else {
      setShowPopup(true);
    }
  }, []);

  const setConsent = (newConsent: CookieConsent) => {
    setConsentState(newConsent);
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newConsent));
    setShowPopup(false);

    // Apply cookie consent settings
    if (newConsent.analytics) {
      initializeAnalytics();
    }
    if (newConsent.marketing) {
      initializeMarketing();
    }
    if (!newConsent.analytics && !newConsent.marketing) {
      denyNonEssential();
    }
  };

  const acceptAll = () => {
    setConsent({
      essential: true,
      analytics: true,
      marketing: true,
    });
  };

  const rejectAll = () => {
    setConsent({
      essential: true, // Essential cookies are always accepted
      analytics: false,
      marketing: false,
    });
  };

  const acceptEssential = () => {
    setConsent({
      essential: true,
      analytics: false,
      marketing: false,
    });
  };

  return (
    <CookieContext.Provider
      value={{
        consent,
        setConsent,
        showPopup,
        setShowPopup,
        acceptAll,
        rejectAll,
        acceptEssential,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieProvider');
  }
  return context;
}