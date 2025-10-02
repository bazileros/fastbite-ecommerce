import { useCookieConsent } from '@/lib/cookie-context';

/**
 * Hook to check if analytics cookies are allowed
 */
export function useAnalyticsConsent() {
  const { consent } = useCookieConsent();
  return consent?.analytics ?? false;
}

/**
 * Hook to check if marketing cookies are allowed
 */
export function useMarketingConsent() {
  const { consent } = useCookieConsent();
  return consent?.marketing ?? false;
}

/**
 * Hook to check if essential cookies are allowed (always true)
 */
export function useEssentialConsent() {
  return true; // Essential cookies are always allowed
}

/**
 * Utility function to initialize Google Analytics only if consent is given
 */
export function initializeAnalytics() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    });
  }
}

/**
 * Utility function to initialize marketing cookies only if consent is given
 */
export function initializeMarketing() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      ad_storage: 'granted',
    });
  }
}

/**
 * Utility function to deny non-essential cookies
 */
export function denyNonEssential() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
    });
  }
}