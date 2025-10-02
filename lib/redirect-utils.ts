/**
 * Redirect utilities for post-login navigation
 */

const REDIRECT_KEY = 'fastbite_redirect_after_login';

export interface RedirectDestination {
  path: string;
  reason: 'checkout' | 'admin' | 'menu' | 'profile';
}

/**
 * Store the intended destination before redirecting to login
 */
export function storeRedirectDestination(destination: RedirectDestination) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REDIRECT_KEY, JSON.stringify(destination));
  }
}

/**
 * Get and clear the stored redirect destination
 */
export function getAndClearRedirectDestination(): RedirectDestination | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(REDIRECT_KEY);
    if (stored) {
      localStorage.removeItem(REDIRECT_KEY);
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error parsing redirect destination:', error);
  }

  return null;
}

/**
 * Determine the appropriate redirect destination based on user role and context
 */
export function getRedirectDestination(userRole: string, currentPath: string): string {
  // Check if there's a stored destination
  const storedDestination = getAndClearRedirectDestination();

  if (storedDestination) {
    // If user was checking out, always return to checkout
    if (storedDestination.reason === 'checkout') {
      return storedDestination.path;
    }
  }

  // Role-based redirects
  if (userRole === 'admin' || userRole === 'manager') {
    // Don't redirect if already on admin pages
    if (!currentPath.startsWith('/admin')) {
      return '/admin';
    }
  }

  // Default to menu/storefront
  return '/storefront';
}

/**
 * Store checkout redirect before login
 */
export function storeCheckoutRedirect() {
  storeRedirectDestination({
    path: '/checkout',
    reason: 'checkout'
  });
}

/**
 * Store admin redirect before login
 */
export function storeAdminRedirect() {
  storeRedirectDestination({
    path: '/admin',
    reason: 'admin'
  });
}