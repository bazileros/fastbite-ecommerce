// Example usage of cookie consent hooks in components

'use client';

import {
  useAnalyticsConsent,
  useMarketingConsent,
} from '@/lib/cookie-utils';

import { useEffect } from 'react';

export function AnalyticsTracker() {
  const analyticsAllowed = useAnalyticsConsent();

  useEffect(() => {
    if (analyticsAllowed && typeof window !== 'undefined') {
      // Initialize Google Analytics or other analytics tools
      console.log('Analytics tracking enabled');
      // Example: gtag('config', 'GA_MEASUREMENT_ID');
    }
  }, [analyticsAllowed]);

  return null; // This component doesn't render anything
}

export function MarketingBanner() {
  const marketingAllowed = useMarketingConsent();

  if (!marketingAllowed) {
    return null; // Don't show marketing content if not consented
  }

  return (
    <div className="bg-blue-100 p-4 rounded-lg">
      <h3 className="font-display">Special Offer!</h3>
      <p>Get 20% off your next order with our newsletter.</p>
    </div>
  );
}