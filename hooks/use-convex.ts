import type { Id } from '@/convex/_generated/dataModel';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

// =============================================================================
// MEAL HOOKS
// =============================================================================

export function useMeals(options?: {
  category?: string;
  limit?: number;
  includeInactive?: boolean;
}) {
  return useQuery(api.queries.getMeals, options ?? {});
}

export function usePopularMeals(limit?: number) {
  return useQuery(api.queries.getPopularMeals, { limit });
}

export function useSearchMeals(searchTerm: string, limit?: number) {
  return useQuery(api.queries.searchMeals, { searchTerm, limit });
}

// =============================================================================
// ORDER HOOKS
// =============================================================================

export function useOrders(options?: {
  status?: string;
  limit?: number;
  offset?: number;
  claims?: {
    sub: string;
    email?: string;
    name?: string;
    roles?: string[];
    picture?: string;
  };
}) {
  const queryArgs = options?.claims ? {
    status: options.status,
    limit: options.limit,
    offset: options.offset,
    claims: options.claims
  } : "skip" as const;
  return useQuery(api.queries.getOrders, queryArgs);
}

export function useUserOrders(options?: {
  userId?: Id<"users">;
  status?: string;
  limit?: number;
  claims?: {
    sub: string;
    email?: string;
    name?: string;
    roles?: string[];
    picture?: string;
  };
}) {
  const queryArgs = options?.claims ? {
    userId: options.userId,
    status: options.status,
    limit: options.limit,
    claims: options.claims
  } : {
    userId: options?.userId,
    status: options?.status,
    limit: options?.limit
  };
  return useQuery(api.queries.getUserOrdersWithDetails, queryArgs);
}

export function useOrder(orderId: Id<"orders">, claims?: {
  sub: string;
  email?: string;
  name?: string;
  roles?: string[];
  picture?: string;
}) {
  const queryArgs = claims ? { orderId, claims } : { orderId };
  return useQuery(api.queries.getOrder, queryArgs);
}

export function useOrderStats(dateRange?: {
  start: number;
  end: number;
}, claims?: {
  sub: string;
  email?: string;
  name?: string;
  roles?: string[];
  picture?: string;
}) {
  const queryArgs = claims ? { dateRange, claims } : "skip" as const;
  return useQuery(api.queries.getOrderStats, queryArgs);
}

// =============================================================================
// USER HOOKS
// =============================================================================

export function useCurrentUser() {
  return useQuery(api.queries.getCurrentUser);
}

export function useUsers(options?: {
  role?: string;
  limit?: number;
  offset?: number;
  claims?: {
    sub: string;
    email?: string;
    name?: string;
    roles?: string[];
    picture?: string;
  };
}) {
  const queryArgs = options?.claims ? {
    role: options.role,
    limit: options.limit,
    offset: options.offset,
    claims: options.claims
  } : "skip" as const;
  return useQuery(api.queries.getUsers, queryArgs);
}

export function useUser(userId: Id<"users">, claims?: {
  sub: string;
  email?: string;
  name?: string;
  roles?: string[];
  picture?: string;
}) {
  const queryArgs = claims ? { userId, claims } : { userId };
  return useQuery(api.queries.getUser, queryArgs);
}

// =============================================================================
// CATEGORY HOOKS
// =============================================================================

export function useCategories(includeInactive?: boolean) {
  return useQuery(api.queries.getCategories, { includeInactive });
}

export function useCategory(categoryId: Id<"categories">) {
  return useQuery(api.queries.getCategory, { categoryId });
}

// =============================================================================
// CART HOOKS
// =============================================================================

export function useCartSession(sessionId: string) {
  return useQuery(api.queries.getCartSession, { sessionId });
}

// =============================================================================
// ANALYTICS HOOKS
// =============================================================================

export function useAnalytics(dateRange?: {
  start: number;
  end: number;
}, claims?: {
  sub: string;
  email?: string;
  name?: string;
  roles?: string[];
  picture?: string;
}) {
  const queryArgs = claims ? { dateRange, claims } : "skip" as const;
  return useQuery(api.queries.getAnalytics, queryArgs);
}

// =============================================================================
// AUDIT LOG HOOKS
// =============================================================================

export function useAuditLogs(options?: {
  userId?: Id<"users">;
  action?: string;
  resource?: string;
  limit?: number;
  offset?: number;
  claims?: {
    sub: string;
    email?: string;
    name?: string;
    roles?: string[];
    picture?: string;
  };
}) {
  const queryArgs = options?.claims ? {
    userId: options.userId,
    action: options.action,
    resource: options.resource,
    limit: options.limit,
    offset: options.offset,
    claims: options.claims
  } : "skip" as const;
  return useQuery(api.queries.getAuditLogs, queryArgs);
}