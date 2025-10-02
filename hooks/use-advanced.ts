import {
  useAction,
  useMutation,
  useQuery,
} from 'convex/react';
import {
  useCallback,
  useState,
} from 'react';

import { api } from '@/convex/_generated/api';
import { useAdminClaims } from '@/components/admin-layout-client';

// =============================================================================
// ADVANCED USER-AWARE HOOKS
// =============================================================================

/**
 * Advanced user hook that provides current user with permissions
 */
export function useUserContext() {
  const user = useQuery(api.queries.getCurrentUser);

  // Since we're using JWT-based permissions, permissions come from the user object
  // The user object now includes permissions derived from JWT roles
  const permissions = user?.permissions || null;

  return {
    user,
    permissions,
    isLoading: user === undefined,
    isAuthenticated: !!user,
    role: user?.role,
  };
}

/**
 * Permission-aware meals hook
 */
export function useMealsWithPermissions(options?: {
  category?: string;
  limit?: number;
  includeInactive?: boolean;
}) {
  const { permissions } = useUserContext();
  const meals = useQuery(api.queries.getMeals, options ?? {});

  return {
    meals,
    canCreate: permissions?.includes('meals:write') ?? false,
    canUpdate: permissions?.includes('meals:write') ?? false,
    canDelete: permissions?.includes('meals:write') ?? false,
    canViewInactive: permissions?.includes('meals:read') ?? false,
  };
}

/**
 * Permission-aware orders hook
 */
export function useOrdersWithPermissions(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const { permissions, user } = useUserContext();
  const claims = useAdminClaims();

  const queryArgs = claims ? {
    claims: {
      sub: claims.sub || '',
      email: claims.email || undefined,
      name: claims.name || undefined,
      roles: claims.roles || [],
      picture: claims.picture || undefined,
    },
    ...options
  } : "skip" as const;

  const orders = useQuery(api.queries.getOrders, queryArgs);

  return {
    orders,
    canView: permissions?.includes('orders:read') ?? false,
    canUpdateStatus: permissions?.includes('orders:write') ?? false,
    canCancel: permissions?.includes('orders:write') ?? false,
    canAssign: permissions?.includes('orders:write') ?? false,
    canRefund: permissions?.includes('orders:write') ?? false,
    currentUserId: user?._id,
  };
}

/**
 * Permission-aware users hook
 */
export function useUsersWithPermissions(options?: {
  role?: string;
  limit?: number;
  offset?: number;
}) {
  const { permissions } = useUserContext();
  const claims = useAdminClaims();

  const queryArgs = claims ? {
    claims: {
      sub: claims.sub || '',
      email: claims.email || undefined,
      name: claims.name || undefined,
      roles: claims.roles || [],
      picture: claims.picture || undefined,
    },
    ...options
  } : "skip" as const;

  const users = useQuery(api.queries.getUsers, queryArgs);

  return {
    users,
    canView: permissions?.includes('users:read') ?? false,
    canManage: permissions?.includes('users:write') ?? false,
  };
}

/**
 * Permission-aware categories hook
 */
export function useCategoriesWithPermissions(includeInactive?: boolean) {
  const { permissions } = useUserContext();
  const categories = useQuery(api.queries.getCategories, { includeInactive });

  return {
    categories,
    canManage: permissions?.includes('categories:write') ?? false,
  };
}

/**
 * Permission-aware analytics hook
 */
export function useAnalyticsWithPermissions(dateRange?: {
  start: number;
  end: number;
}) {
  const { permissions } = useUserContext();
  const claims = useAdminClaims();

  const queryArgs = claims ? {
    claims: {
      sub: claims.sub || '',
      email: claims.email || undefined,
      name: claims.name || undefined,
      roles: claims.roles || [],
      picture: claims.picture || undefined,
    },
    ...(dateRange && { dateRange })
  } : "skip" as const;

  const analytics = useQuery(api.queries.getAnalytics, queryArgs);

  return {
    analytics,
    canView: permissions?.includes('analytics:read') ?? false,
    canExport: permissions?.includes('reports:write') ?? false,
  };
}

/**
 * Permission-aware audit logs hook
 */
export function useAuditLogsWithPermissions(options?: {
  limit?: number;
  offset?: number;
}) {
  const { permissions } = useUserContext();
  const claims = useAdminClaims();

  const queryArgs = claims ? {
    claims: {
      sub: claims.sub || '',
      email: claims.email || undefined,
      name: claims.name || undefined,
      roles: claims.roles || [],
      picture: claims.picture || undefined,
    },
    ...options
  } : "skip" as const;

  const auditLogs = useQuery(api.queries.getAuditLogs, queryArgs);

  return {
    auditLogs,
    canView: permissions?.includes('audit:read') ?? false,
  };
}

// =============================================================================
// ADVANCED CRUD HOOKS WITH PERMISSIONS
// =============================================================================

/**
 * Complete meal management hook with all CRUD operations
 */
export function useMealManagement() {
  const { permissions } = useUserContext();

  // Queries
  const meals = useQuery(api.queries.getMeals, { includeInactive: permissions?.includes('meals:read') });
  const popularMeals = useQuery(api.queries.getPopularMeals, { limit: 10 });

  // Mutations
  const createMeal = useMutation(api.mutations.createMeal);
  const updateMeal = useMutation(api.mutations.updateMeal);
  const deleteMeal = useMutation(api.mutations.deleteMeal);

  // Actions
  const uploadImage = useAction(api.actions.uploadImage);

  return {
    // Data
    meals,
    popularMeals,

    // Permissions
    canCreate: permissions?.includes('meals:write') ?? false,
    canUpdate: permissions?.includes('meals:write') ?? false,
    canDelete: permissions?.includes('meals:write') ?? false,

    // Operations
    createMeal: permissions?.includes('meals:write') ? createMeal : null,
    updateMeal: permissions?.includes('meals:write') ? updateMeal : null,
  deleteMeal: permissions?.includes('meals:write') ? deleteMeal : null,
  uploadImage,
  };
}

/**
 * Complete order management hook with all CRUD operations
 */
export function useOrderManagement() {
  const { permissions, user } = useUserContext();
  const claims = useAdminClaims();

  const orderStatsArgs = claims ? {
    claims: {
      sub: claims.sub || '',
      email: claims.email || undefined,
      name: claims.name || undefined,
      roles: claims.roles || [],
      picture: claims.picture || undefined,
    }
  } : "skip" as const;

  // Queries
  const orders = useQuery(api.queries.getOrders, orderStatsArgs);
  const userOrdersArgs = claims ? {
    limit: 20,
    claims: {
      sub: claims.sub || '',
      email: claims.email || undefined,
      name: claims.name || undefined,
      roles: claims.roles || [],
      picture: claims.picture || undefined,
    }
  } : { limit: 20 };
  const userOrders = useQuery(api.queries.getUserOrdersWithDetails, userOrdersArgs);
  const orderStats = useQuery(api.queries.getOrderStats, orderStatsArgs);

  // Mutations
  const createOrder = useMutation(api.mutations.createOrder);
  const updateOrderStatus = useMutation(api.mutations.updateOrderStatus);
  const updateOrderPaymentStatus = useMutation(api.mutations.updateOrderPaymentStatus);

  // Actions
  const processPayment = useAction(api.actions.processPayment);
  const verifyPayment = useAction(api.actions.verifyPayment);
  const processRefund = useAction(api.actions.processRefund);
  const sendOrderConfirmation = useAction(api.actions.sendOrderConfirmation);

  return {
    // Data
    orders,
    userOrders,
    orderStats,

    // Permissions
    canView: permissions?.includes('orders:read') ?? false,
    canCreate: true, // All authenticated users can create orders
    canUpdateStatus: permissions?.includes('orders:write') ?? false,
    canCancel: permissions?.includes('orders:write') ?? false,
    canAssign: permissions?.includes('orders:write') ?? false,
    canRefund: permissions?.includes('orders:write') ?? false,

    // Operations
    createOrder,
    updateOrderStatus: permissions?.includes('orders:write') ? updateOrderStatus : null,
    updateOrderPaymentStatus: permissions?.includes('orders:write') ? updateOrderPaymentStatus : null,
    processPayment,
    verifyPayment,
    processRefund: permissions?.includes('orders:write') ? processRefund : null,
    sendOrderConfirmation,

    // Context
    currentUserId: user?._id,
  };
}

/**
 * Complete user management hook with all CRUD operations
 */
export function useUserManagement() {
  const { permissions } = useUserContext();
  const claims = useAdminClaims();

  const queryArgs = claims ? {
    claims: {
      sub: claims.sub || '',
      email: claims.email || undefined,
      name: claims.name || undefined,
      roles: claims.roles || [],
      picture: claims.picture || undefined,
    },
    limit: 50
  } : "skip" as const;

  // Queries
  const users = useQuery(api.queries.getUsers, queryArgs);

  // Mutations
  const updateUserRole = useMutation(api.mutations.updateUserRole);
  const updateUserProfile = useMutation(api.mutations.updateUserProfile);

  // Actions
  const sendRoleChangeNotification = useAction(api.actions.sendRoleChangeNotification);

  return {
    // Data
    users,

    // Permissions
    canView: permissions?.includes('users:read') ?? false,
    canManage: permissions?.includes('users:write') ?? false,

    // Operations
    updateUserRole: permissions?.includes('users:write') ? updateUserRole : null,
    updateUserProfile,
    sendRoleChangeNotification: permissions?.includes('users:write') ? sendRoleChangeNotification : null,
  };
}

/**
 * Complete category management hook with all CRUD operations
 */
export function useCategoryManagement() {
  const { permissions } = useUserContext();

  // Queries
  const categories = useQuery(api.queries.getCategories, { includeInactive: true });

  // Mutations
  const createCategory = useMutation(api.mutations.createCategory);
  const updateCategory = useMutation(api.mutations.updateCategory);
  const deleteCategory = useMutation(api.mutations.deleteCategory);

  return {
    // Data
    categories,

    // Permissions
    canManage: permissions?.includes('categories:write') ?? false,

    // Operations
    createCategory: permissions?.includes('categories:write') ? createCategory : null,
    updateCategory: permissions?.includes('categories:write') ? updateCategory : null,
    deleteCategory: permissions?.includes('categories:write') ? deleteCategory : null,
  };
}

/**
 * Complete analytics and reporting hook
 */
export function useAnalyticsManagement() {
  const { permissions } = useUserContext();
  const claims = useAdminClaims();

  const analyticsArgs = claims ? {
    claims: {
      sub: claims.sub || '',
      email: claims.email || undefined,
      name: claims.name || undefined,
      roles: claims.roles || [],
      picture: claims.picture || undefined,
    }
  } : "skip" as const;

  const auditLogsArgs = claims ? {
    claims: {
      sub: claims.sub || '',
      email: claims.email || undefined,
      name: claims.name || undefined,
      roles: claims.roles || [],
      picture: claims.picture || undefined,
    },
    limit: 100
  } : "skip" as const;

  // Queries
  const analytics = useQuery(api.queries.getAnalytics, analyticsArgs);
  const auditLogs = useQuery(api.queries.getAuditLogs, auditLogsArgs);

  // Actions
  const generateAnalyticsReport = useAction(api.actions.generateAnalyticsReport);

  return {
    // Data
    analytics,
    auditLogs,

    // Permissions
    canView: permissions?.includes('analytics:read') ?? false,
    canExport: permissions?.includes('reports:write') ?? false,
    canViewAuditLogs: permissions?.includes('audit:read') ?? false,

    // Operations
    generateAnalyticsReport: permissions?.includes('reports:write') ? generateAnalyticsReport : null,
  };
}

/**
 * Cart and session management hook
 */
export function useCartManagement(sessionId: string) {
  // Queries
  const cartSession = useQuery(api.queries.getCartSession, { sessionId });

  // Mutations
  const upsertCartSession = useMutation(api.mutations.upsertCartSession);
  const clearCartSession = useMutation(api.mutations.clearCartSession);

  return {
    // Data
    cartSession,

    // Operations
    upsertCartSession,
    clearCartSession,
  };
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook for optimistic updates with error handling
 */
export function useOptimisticMutation<TArgs extends Record<string, unknown>, TResult>(
  mutation: (args: TArgs) => Promise<TResult>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (args: TArgs, optimisticUpdate?: () => void) => {
    setIsLoading(true);
    setError(null);

    try {
      // Apply optimistic update if provided
      optimisticUpdate?.();

      const result = await mutation(args);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mutation]);

  return {
    execute,
    isLoading,
    error,
  };
}

// Re-export for convenience
export * from './use-convex';