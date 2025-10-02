import {
  type LogtoNextConfig,
  UserScope,
} from '@logto/next';

export const logtoConfig: LogtoNextConfig = {
	appId: process.env.LOGTO_APP_ID || "",
	appSecret: process.env.LOGTO_APP_SECRET || "",
	endpoint: process.env.LOGTO_ENDPOINT || "",
	baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
	cookieSecret:
		process.env.LOGTO_COOKIE_SECRET ||
		"a_very_long_random_string_at_least_32_characters",
	cookieSecure: process.env.NODE_ENV === "production",
	// Remove resources to get tokens for the client itself (matches Convex audience)
	// resources: ['https://fastbite.com/api'],
	scopes: [
		UserScope.Roles,
		UserScope.Email,
    UserScope.Identities,
    UserScope.Profile,  // Add profile scope for avatar, name, etc.
    // Core permissions
    'audit:delete', 'audit:read',
    'settings:read', 'settings:write',
    'analytics:read', 'analytics:export',
    'users:read', 'users:write', 'users:delete',
    'meals:read', 'meals:write', 'meals:delete',
    'category:read', 'categories:write',
    'orders:read', 'orders:write', 'orders:delete', 'orders:refund',
    'system:read', 'system:write',
    // Additional permissions for complete restaurant management
    'banners:read', 'banners:write', 'banners:delete',
    'promotions:read', 'promotions:write', 'promotions:delete',
    'loyalty:read', 'loyalty:write', 'loyalty:delete',
    'reviews:read', 'reviews:write', 'reviews:delete',
    'notifications:read', 'notifications:write', 'notifications:delete',
    'delivery:read', 'delivery:write', 'delivery:delete',
    'payments:read', 'payments:write', 'payments:delete',
    'inventory:read', 'inventory:write', 'inventory:delete',
	],
};
