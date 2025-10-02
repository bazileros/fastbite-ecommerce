import type { Id } from './_generated/dataModel';
import type {
  MutationCtx,
  QueryCtx,
} from './_generated/server';
import {
  hasPermissionFromJWT,
  requireRole as checkRole,
  ROLE_PERMISSIONS,
  type UserRole,
} from './permissions';

// Types for our auth system
export interface AuthenticatedUser {
  _id: Id<'users'>;
  subject: string;
  email?: string;
  name?: string;
  avatar?: string;
  phone?: string;
  role: string;
  permissions: string[];
  isActive?: boolean;
  isBlocked?: boolean;
  lastActiveAt?: number;
  lastLoginAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface JWTUser {
  _id: Id<'users'>;
  subject: string;
  email?: string;
  name?: string;
  avatar?: string;
  phone?: string;
  role: UserRole;
  permissions: string[];
}

export interface AuthResult {
  user: AuthenticatedUser;
  isAuthenticated: true;
}

export interface UnauthResult {
  user: null;
  isAuthenticated: false;
}

export type AuthCheckResult = AuthResult | UnauthResult;

/**
 * Get the current authenticated user from JWT claims only (no database lookup)
 */
export async function getCurrentUserFromJWT(ctx: QueryCtx | MutationCtx): Promise<JWTUser | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  // Extract roles from JWT
  const roles = identity.roles || [];
  const primaryRole = Array.isArray(roles) && roles.length > 0 ? roles[0] : 'customer';

  // Map role to permissions
  const rolePermissions = getPermissionsForRole(primaryRole as UserRole);

  return {
    _id: identity.subject as Id<'users'>,
    subject: identity.subject as string,
    email: identity.email || undefined,
    name: identity.name || undefined,
    avatar: typeof identity.picture === 'string' ? identity.picture : undefined,
    phone: undefined, // Not available from JWT
    role: primaryRole as UserRole,
    permissions: rolePermissions,
  };
}

/**
 * Get or create user in database (auto-provisioning)
 */
export async function getOrCreateCurrentUser(ctx: MutationCtx): Promise<AuthenticatedUser | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  // Try to find existing user
  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
    .unique();

  if (existingUser) {
    // Add permissions to the user object
    const permissions = getPermissionsForRole(existingUser.role || 'customer');
    return { ...existingUser, permissions } as AuthenticatedUser;
  }

  // Extract role from JWT
  const roles = identity.roles || [];
  const primaryRole = Array.isArray(roles) && roles.length > 0 ? roles[0] : 'customer';

  // Create new user record
  const userId = await ctx.db.insert("users", {
    subject: identity.subject,
    email: identity.email,
    name: identity.name,
    avatar: typeof identity.picture === 'string' ? identity.picture : undefined,
    role: primaryRole as UserRole,
    isActive: true,
    lastLoginAt: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const newUser = await ctx.db.get(userId);
  if (!newUser) return null;

  // Add permissions to the user object
  const permissions = getPermissionsForRole(newUser.role || 'customer');
  return { ...newUser, permissions } as AuthenticatedUser;
}

/**
 * Get user from database by ID
 */
export async function getUserById(ctx: QueryCtx | MutationCtx, userId: Id<'users'>): Promise<AuthenticatedUser | null> {
  const user = await ctx.db.get(userId);
  if (!user) return null;

  // Add permissions to the user object
  const permissions = getPermissionsForRole(user.role || 'customer');
  return { ...user, permissions } as AuthenticatedUser;
}

/**
 * Ensure user is authenticated and return auth result
 */
export async function requireAuth(ctx: MutationCtx): Promise<AuthenticatedUser> {
  const jwtUser = await getCurrentUserFromJWT(ctx);
  if (!jwtUser) throw new Error("Not authenticated");

  // Create user if they don't exist
  let dbUser = await ctx.db
    .query("users")
    .withIndex("by_subject", (q) => q.eq("subject", jwtUser.subject))
    .unique();

  if (!dbUser) {
    const userId = await ctx.db.insert("users", {
      subject: jwtUser.subject,
      email: jwtUser.email,
      name: jwtUser.name,
      role: jwtUser.role as "customer" | "staff" | "manager" | "admin",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    dbUser = await ctx.db.get(userId);
  }

  if (!dbUser) throw new Error("Failed to create or retrieve user");

  // Return user with permissions
  const permissions = getPermissionsForRole(dbUser.role || 'customer');
  return { ...dbUser, permissions } as AuthenticatedUser;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: AuthenticatedUser, permission: string): boolean {
  return hasPermissionFromJWT(user.permissions, permission);
}

/**
 * Require a specific permission, throw error if not granted
 */
export function requirePermission(user: AuthenticatedUser, permission: string, errorMessage?: string): void {
  if (!hasPermission(user, permission)) {
    throw new Error(errorMessage || `Insufficient permissions: ${permission} required`);
  }
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: AuthenticatedUser, role: UserRole): boolean {
  try {
    checkRole(user.role as UserRole, role);
    return true;
  } catch {
    return false;
  }
}

/**
 * Require a specific role, throw error if not granted
 */
export function requireRole(user: AuthenticatedUser, role: UserRole, errorMessage?: string): void {
  if (!hasRole(user, role)) {
    throw new Error(errorMessage || `${role} role required`);
  }
}

/**
 * Check if user can access their own resource or has admin permissions
 */
export function canAccessResource(user: AuthenticatedUser, resourceUserId: Id<'users'>, permission: string): boolean {
  // Users can always access their own resources
  if (user._id === resourceUserId) return true;

  // Otherwise check for the required permission
  return hasPermission(user, permission);
}

/**
 * Log an audit action
 */
export async function logAction(
  ctx: MutationCtx,
  userId: Id<'users'>,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  await ctx.db.insert("auditLogs", {
    userId,
    action,
    resource,
    resourceId: resourceId?.toString(),
    details,
    timestamp: Date.now(),
  });
}

/**
 * Get permissions for a specific role
 */
function getPermissionsForRole(role: string): string[] {
  const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || ROLE_PERMISSIONS.customer;

  const permissions: string[] = [];

  // Map internal permissions to Logto permission format
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