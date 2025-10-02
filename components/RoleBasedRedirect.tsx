"use client";

import {
  useEffect,
  useState,
} from 'react';

import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';

import { api } from '@/convex/_generated/api';

export function RoleBasedRedirect() {
  const router = useRouter();
  const [claims, setClaims] = useState<{
    sub: string;
    email?: string;
    name?: string;
    roles?: string[];
  } | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Fetch claims from the auth context
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch('/api/auth/claims');
        if (response.ok) {
          const data = await response.json();
          setClaims(data);
        }
      } catch (error) {
        console.error('Failed to fetch claims:', error);
      }
    };
    fetchClaims();
  }, []);

  const user = useQuery(
    api.queries.getCurrentUserWithJWT,
    claims ? {
      claims: {
        sub: claims.sub || '',
        email: claims.email || undefined,
        name: claims.name || undefined,
        roles: claims.roles || [],
        picture: undefined,
      }
    } : 'skip'
  );

  useEffect(() => {
    // Only redirect once per session and only on homepage
    if (user?.role && !hasRedirected) {
      const currentPath = window.location.pathname;
      
      // Check if user came from admin (they clicked "View Store")
      const cameFromAdmin = sessionStorage.getItem('viewing_store') === 'true';
      
      console.log("🔄 ROLE BASED REDIRECT DEBUG:");
      console.log("  - User role:", user.role);
      console.log("  - Current path:", currentPath);
      console.log("  - Came from admin:", cameFromAdmin);

      // Only redirect if:
      // 1. User is admin/manager
      // 2. On homepage (/)
      // 3. Didn't come from admin panel (clicking "View Store")
      if (
        (user.role === 'admin' || user.role === 'manager') &&
        currentPath === '/' &&
        !cameFromAdmin
      ) {
        console.log("  - Redirecting admin/manager to /admin");
        setHasRedirected(true);
        router.push('/admin');
      }
    }
  }, [user, router, hasRedirected]);

  return null; // This component doesn't render anything
}