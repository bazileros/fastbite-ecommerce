'use client';

import {
  useEffect,
  useMemo,
  useRef,
} from 'react';

import {
  useMutation,
  useQuery,
} from 'convex/react';

import { signInAction } from '@/app/actions/sign-in';
import { signOutAction } from '@/app/actions/sign-out';
import { convex } from '@/components/convex-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { api } from '@/convex/_generated/api';

interface AuthButtonsProps {
  isAuthenticated: boolean;
  claims: { sub?: string; email?: string; name?: string; roles?: string[]; picture?: string } | null;
  accessToken?: string | null;
}

export function AuthButtonsClient({ isAuthenticated, claims, accessToken }: AuthButtonsProps) {
  // Create a stable claims object that only changes when content actually changes
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

  // Always call the hook with the stable claims
  const currentUser = useQuery(api.queries.getCurrentUserWithJWT, {
    claims: stableClaims
  });

  // Mutation to ensure user exists in database
  const ensureUser = useMutation(api.mutations.ensureUser);

  // Track if we've already called ensureUser to prevent duplicate calls
  const ensureUserCalled = useRef(false);

  // Set Convex auth when accessToken changes (only for non-admin contexts)
  useEffect(() => {
    console.log('AuthButtons - setting Convex auth, accessToken:', accessToken ? `${accessToken.substring(0, 50)}...` : 'undefined');
    if (accessToken) {
      convex.setAuth(async () => accessToken);
    } else if (accessToken === null) {
      convex.clearAuth();
    }
    // If accessToken is undefined, don't change auth (admin context)
  }, [accessToken]);

  // Auto-create user in database if authenticated but no database record exists
  useEffect(() => {
    // Only call ensureUser when:
    // 1. User is authenticated
    // 2. We have claims
    // 3. currentUser query has loaded (not undefined)
    // 4. currentUser is null (no user record found)
    // 5. We have an accessToken (Convex auth is set)
    // 6. We haven't already called ensureUser
    if (isAuthenticated && claims && currentUser === null && accessToken && !ensureUserCalled.current) {
      console.log('User authenticated but not in database, creating user record...');
      ensureUserCalled.current = true;
      ensureUser().catch((error) => {
        console.error('Failed to create user record:', error);
        // Reset on error so we can retry
        ensureUserCalled.current = false;
      });
    }
    
    // Reset the flag if user becomes unauthenticated
    if (!isAuthenticated || !accessToken) {
      ensureUserCalled.current = false;
    }
  }, [isAuthenticated, claims, currentUser, accessToken, ensureUser]);

  console.log('AuthButtons - isAuthenticated:', isAuthenticated);
  console.log('AuthButtons - claims:', claims);
  console.log('AuthButtons - stableClaims:', stableClaims);
  console.log('AuthButtons - currentUser:', currentUser);

  // Function to get initials
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U'; // Default for unknown user
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <ErrorBoundary
          fallback={
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="flex justify-center items-center bg-gray-200 rounded-full w-8 h-8">
                <span className="text-xs">?</span>
              </div>
              <span className="text-sm">Loading...</span>
            </div>
          }
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={claims?.picture} alt={claims?.name || 'User'} />
            <AvatarFallback className="text-xs">
              {getInitials(claims?.name, claims?.email)}
            </AvatarFallback>
          </Avatar>
          {!currentUser?._id && (
            <div className="flex items-center space-x-2">
              <span className="bg-yellow-100 px-2 py-1 rounded text-yellow-800 text-xs">
                Setting up account...
              </span>
            </div>
          )}
        </ErrorBoundary>
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={signInAction}>
      <button
        type="submit"
        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        Sign in
      </button>
    </form>
  );
}
