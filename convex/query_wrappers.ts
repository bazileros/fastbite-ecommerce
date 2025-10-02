import { v } from "convex/values";
import {
	extractPermissionsFromClaims,
	hasPermission,
	type JWTClaims,
	validateClaims,
} from "./auth_utils";

/**
 * Create a claims validator for query args
 */
export const claimsValidator = v.optional(
	v.object({
		sub: v.string(),
		email: v.optional(v.string()),
		name: v.optional(v.string()),
		roles: v.optional(v.array(v.string())),
		picture: v.optional(v.string()),
	}),
);

/**
 * Validate claims and check permission within a query handler
 */
export function requirePermission(
	claims: JWTClaims | undefined,
	requiredPermission: string,
): void {
	if (!claims || !validateClaims(claims)) {
		throw new Error("Authentication required");
	}

	if (!hasPermission(claims, requiredPermission)) {
		throw new Error(`Insufficient permissions: ${requiredPermission} required`);
	}
}

/**
 * Validate claims for optional authentication within a query handler
 */
export function validateOptionalClaims(
	claims: JWTClaims | undefined,
): claims is JWTClaims {
	return claims ? validateClaims(claims) : false;
}

/**
 * Check permission if claims are provided (for optional auth scenarios)
 */
export function checkPermissionIfAuthenticated(
	claims: JWTClaims | undefined,
	requiredPermission: string,
): boolean {
	if (!claims || !validateClaims(claims)) {
		return false;
	}

	return hasPermission(claims, requiredPermission);
}

/**
 * Extract permissions from claims (replaces the repetitive permission mapping code)
 */
export function getPermissionsFromClaims(claims: JWTClaims): string[] {
	return extractPermissionsFromClaims(claims);
}
