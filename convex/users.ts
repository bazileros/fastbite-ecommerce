import {
  query,
  type QueryCtx,
} from './_generated/server';
import { ROLE_PERMISSIONS } from './permissions';

// Extend the identity type to include Logto-specific claims
interface LogtoIdentity {
  subject: string;
  email?: string;
  name?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: unknown;
}

export const getUsers = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("users").collect();
	},
});

export const getRecentUsers = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("users").order("desc").take(5);
	},
});

export const current = query({
	args: {},
	handler: async (ctx) => {
		return await getCurrentUser(ctx);
	},
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
	const userRecord = await getCurrentUser(ctx);
	if (!userRecord) throw new Error("Can't get current user");
	return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (identity === null) {
		return null;
	}
	
	// Find user by Logto subject
	const user = await ctx.db
		.query("users")
		.withIndex("by_subject", (q) => q.eq("subject", identity.subject))
		.unique();
	
	return user;
}

export async function getCurrentUserWithRoles(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity() as LogtoIdentity | null;
	if (identity === null) {
		return null;
	}
	
	// Extract roles from the JWT token (Logto includes roles when UserScope.Roles is requested)
	const roles = identity.roles || [];
	const primaryRole = Array.isArray(roles) && roles.length > 0 ? roles[0] : 'customer';
	
	// Map role to permissions using our permission system
	// Logto doesn't provide permissions directly in JWT, so we derive them from roles
	const rolePermissions = ROLE_PERMISSIONS[primaryRole as keyof typeof ROLE_PERMISSIONS] || ROLE_PERMISSIONS.customer;
	
	// Convert role permissions object to array of permission strings that match Logto scopes
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
	
	// Return user info from JWT only - no database lookup needed
	return {
		_id: identity.subject || '',
		subject: identity.subject || '',
		email: identity.email || '',
		name: identity.name || '',
		avatar: typeof identity.picture === 'string' ? identity.picture : undefined,
		phone: undefined, // Phone not available from JWT
		role: primaryRole,
		permissions: permissions,
	};
}
