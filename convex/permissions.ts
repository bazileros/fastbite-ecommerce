// User roles and their hierarchy
export const ROLES = {
  CUSTOMER: "customer",
  STAFF: "staff",
  MANAGER: "manager",
  ADMIN: "admin",
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Role permissions mapping
export interface RolePermissions {
  // User management
  canManageUsers: boolean;
  canViewUsers: boolean;

  // Menu management
  canCreateMeals: boolean;
  canUpdateMeals: boolean;
  canDeleteMeals: boolean;
  canViewMeals: boolean;

  // Category management
  canManageCategories: boolean;

  // Order management
  canViewOrders: boolean;
  canUpdateOrderStatus: boolean;
  canCancelOrders: boolean;
  canAssignOrders: boolean;
  canRefundOrders: boolean;

  // Analytics & Reports
  canViewAnalytics: boolean;
  canExportReports: boolean;

  // System settings
  canManageSettings: boolean;
  canManageIntegrations: boolean;

  // Audit logs
  canViewAuditLogs: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  customer: {
    canManageUsers: false,
    canViewUsers: false,
    canCreateMeals: false,
    canUpdateMeals: false,
    canDeleteMeals: false,
    canViewMeals: true,
    canManageCategories: false,
    canViewOrders: true, // Only their own orders
    canUpdateOrderStatus: false,
    canCancelOrders: true, // Only their own orders
    canAssignOrders: false,
    canRefundOrders: false,
    canViewAnalytics: false,
    canExportReports: false,
    canManageSettings: false,
    canManageIntegrations: false,
    canViewAuditLogs: false,
  },
  staff: {
    canManageUsers: false,
    canViewUsers: true,
    canCreateMeals: false,
    canUpdateMeals: true,
    canDeleteMeals: false,
    canViewMeals: true,
    canManageCategories: false,
    canViewOrders: true,
    canUpdateOrderStatus: true,
    canCancelOrders: true,
    canAssignOrders: false,
    canRefundOrders: false,
    canViewAnalytics: true,
    canExportReports: false,
    canManageSettings: false,
    canManageIntegrations: false,
    canViewAuditLogs: false,
  },
  manager: {
    canManageUsers: true,
    canViewUsers: true,
    canCreateMeals: true,
    canUpdateMeals: true,
    canDeleteMeals: true,
    canViewMeals: true,
    canManageCategories: true,
    canViewOrders: true,
    canUpdateOrderStatus: true,
    canCancelOrders: true,
    canAssignOrders: true,
    canRefundOrders: true,
    canViewAnalytics: true,
    canExportReports: true,
    canManageSettings: true,
    canManageIntegrations: false,
    canViewAuditLogs: true,
  },
  admin: {
    canManageUsers: true,
    canViewUsers: true,
    canCreateMeals: true,
    canUpdateMeals: true,
    canDeleteMeals: true,
    canViewMeals: true,
    canManageCategories: true,
    canViewOrders: true,
    canUpdateOrderStatus: true,
    canCancelOrders: true,
    canAssignOrders: true,
    canRefundOrders: true,
    canViewAnalytics: true,
    canExportReports: true,
    canManageSettings: true,
    canManageIntegrations: true,
    canViewAuditLogs: true,
  },
};

// Helper function to check user role hierarchy
export function requireRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [ROLES.CUSTOMER]: 0,
    [ROLES.STAFF]: 1,
    [ROLES.MANAGER]: 2,
    [ROLES.ADMIN]: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Helper function to check if user has a specific permission from JWT
export function hasPermissionFromJWT(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission);
}

// Helper function to check if user has any of the required permissions
export function hasAnyPermissionFromJWT(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

// Helper function to check if user has all of the required permissions
export function hasAllPermissionsFromJWT(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}