import { ROLE_PERMISSIONS, hasPermissionFromJWT } from './permissions';

export interface JWTClaims {
  sub: string;
  email?: string;
  name?: string;
  roles?: string[];
  picture?: string;
}

/**
 * Extract permissions from JWT claims based on user roles
 */
export function extractPermissionsFromClaims(claims: JWTClaims): string[] {
  const roles = claims.roles || [];
  const primaryRole = Array.isArray(roles) && roles.length > 0 ? roles[0] : 'customer';

  const rolePermissions = ROLE_PERMISSIONS[primaryRole as keyof typeof ROLE_PERMISSIONS] || ROLE_PERMISSIONS.customer;

  const permissions: string[] = [];

  // Map our internal permissions to Logto permission format
  if (rolePermissions.canViewMeals) permissions.push('meals:read');
  if (rolePermissions.canCreateMeals) permissions.push('meals:write');
  if (rolePermissions.canDeleteMeals) permissions.push('meals:delete');
  if (rolePermissions.canManageCategories) permissions.push('categories:write');
  if (rolePermissions.canViewOrders) permissions.push('orders:read');
  if (rolePermissions.canUpdateOrderStatus) permissions.push('orders:write');
  if (rolePermissions.canCancelOrders) permissions.push('orders:delete');
  if (rolePermissions.canRefundOrders) permissions.push('orders:refund');
  if (rolePermissions.canViewAnalytics) permissions.push('analytics:read');
  if (rolePermissions.canExportReports) permissions.push('analytics:export');
  if (rolePermissions.canViewUsers) permissions.push('users:read');
  if (rolePermissions.canManageUsers) permissions.push('users:write', 'users:delete');
  if (rolePermissions.canManageSettings) permissions.push('settings:read', 'settings:write');
  if (rolePermissions.canManageIntegrations) permissions.push('system:read', 'system:write');
  if (rolePermissions.canViewAuditLogs) permissions.push('audit:read');

  return permissions;
}

/**
 * Check if user has a specific permission based on JWT claims
 */
export function hasPermission(claims: JWTClaims, requiredPermission: string): boolean {
  const permissions = extractPermissionsFromClaims(claims);
  return hasPermissionFromJWT(permissions, requiredPermission);
}

/**
 * Get the primary role from JWT claims
 */
export function getPrimaryRole(claims: JWTClaims): string {
  const roles = claims.roles || [];
  return Array.isArray(roles) && roles.length > 0 ? roles[0] : 'customer';
}

/**
 * Create a permission checker function for a specific set of claims
 */
export function createPermissionChecker(claims: JWTClaims) {
  return (requiredPermission: string) => hasPermission(claims, requiredPermission);
}

/**
 * Validate that claims are present and valid
 */
export function validateClaims(claims?: JWTClaims | null): claims is JWTClaims {
  return !!(claims?.sub);
}