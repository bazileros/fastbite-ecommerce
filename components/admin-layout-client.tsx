"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';

import { AdminSidebar } from '@/components/admin-sidebar';
import { ErrorBoundary } from '@/components/error-boundary';
import { api } from '@/convex/_generated/api';

interface AdminLayoutClientProps {
  isAuthenticated: boolean;
  claims: { sub?: string; email?: string | null; name?: string | null; roles?: string[]; picture?: string | null } | null;
  children: React.ReactNode;
}

// Create a context to share claims with child components
const AdminClaimsContext = createContext<{ claims: AdminLayoutClientProps['claims'] } | null>(null);

export function useAdminClaims() {
  const context = useContext(AdminClaimsContext);
  if (!context) {
    throw new Error('useAdminClaims must be used within AdminLayoutClient');
  }
  return context.claims;
}

export function AdminLayoutClient({ isAuthenticated, claims, children }: AdminLayoutClientProps) {
  const router = useRouter();

  // Create stable claims object to prevent infinite re-renders
  const stableClaims = useMemo(() => {
    return claims ? {
      sub: claims.sub || '',
      email: claims.email || undefined,
      name: claims.name || undefined,
      roles: claims.roles || [],
      picture: claims.picture || undefined,
    } : {
      sub: '',
      email: undefined,
      name: undefined,
      roles: [],
      picture: undefined,
    };
  }, [claims]);

  // Use the JWT-based query to get user data
  const user = useQuery(api.queries.getCurrentUserWithJWT, {
    claims: stableClaims
  });

  useEffect(() => {
    // Don't check anything while user is loading
    if (user === undefined) {
      return;
    }

    if (!isAuthenticated || user === null) {
      router.push('/');
      return;
    }

    // Check if user has admin or manager role
    if (user.role !== 'admin' && user.role !== 'manager') {
      router.push('/');
    }
  }, [user, isAuthenticated, router]);

  // Show loading state while checking authentication
  if (user === undefined) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
          <h1 className="mb-2 font-display font-bold text-xl">Checking permissions...</h1>
          <p className="text-muted-foreground">Please wait while we verify your access.</p>
        </div>
      </div>
    );
  }

  // Don't render children if user is not authenticated or doesn't have permission
  if (!isAuthenticated || !user || (user.role !== 'admin' && user.role !== 'manager')) {
    return null;
  }

  return (
    <AdminClaimsContext.Provider value={{ claims }}>
      <div className="flex bg-gradient-to-br from-background via-background/95 to-background/90 min-h-screen">
        <ErrorBoundary>
          <AdminSidebar user={user as NonNullable<typeof user>} />
        </ErrorBoundary>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto px-4 lg:px-10 py-6 lg:py-10 w-full max-w-7xl">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </AdminClaimsContext.Provider>
  );
}