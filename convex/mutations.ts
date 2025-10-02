import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';
import { mutation } from './_generated/server';
import {
  logAction,
  requireAuth,
  requirePermission,
} from './auth';
import { hasPermissionFromJWT } from './permissions';
import { getPermissionsFromClaims } from './query_wrappers';

// Helper function to get or create user from JWT claims
async function getOrCreateUserFromClaims(ctx: MutationCtx, claims: { sub: string; email?: string; name?: string; roles?: string[]; picture?: string }) {
  // Try to find existing user
  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_subject", (q) => q.eq("subject", claims.sub))
    .unique();

  if (existingUser) {
    return existingUser;
  }

  // Extract role from JWT
  const roles = claims.roles || [];
  const primaryRole = Array.isArray(roles) && roles.length > 0 ? roles[0] : 'customer';

  // Create new user record
  const userId = await ctx.db.insert("users", {
    subject: claims.sub,
    email: claims.email,
    name: claims.name,
    avatar: claims.picture,
    role: primaryRole as "customer" | "staff" | "manager" | "admin",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const newUser = await ctx.db.get(userId);
  if (!newUser) throw new Error("Failed to create user");

  return newUser;
}

// USER MANAGEMENT MUTATIONS
// =============================================================================

// Create or update user (used during authentication)
export const upsertUser = mutation({
  args: {
    subject: v.string(), // Logto user subject
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("customer"),
      v.literal("staff"),
      v.literal("manager"),
      v.literal("admin")
    )),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_subject", (q) => q.eq("subject", args.subject))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        phone: args.phone,
        email: args.email,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        subject: args.subject,
        email: args.email,
        name: args.name,
        phone: args.phone,
        role: args.role || "customer",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return userId;
    }
  },
});

// Ensure user exists (auto-provisioning for Logto)
export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 ensureUser mutation called");

    const identity = await ctx.auth.getUserIdentity();
    console.log("  - Identity from auth:", identity ? {
      subject: identity.subject,
      email: identity.email,
      name: identity.name,
      picture: identity.picture ? "present" : "null"
    } : "null");

    if (!identity) {
      console.log("❌ No identity, throwing error");
      throw new Error("Not authenticated");
    }

    // Try to find existing user by subject
    let user = await ctx.db
      .query("users")
      .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
      .unique();

    console.log("  - Existing user found:", user ? "yes" : "no");

    // If not found, create with default role
    if (!user) {
      console.log("📝 Creating new user...");
      const userId = await ctx.db.insert("users", {
        subject: identity.subject,
        email: identity.email ?? "",
        name: identity.name ?? "",
        avatar: typeof identity.picture === 'string' ? identity.picture : undefined,
        role: "customer", // default role
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      user = await ctx.db.get(userId);
      console.log("✅ New user created:", userId);
    } else {
      // Check if any data has actually changed before updating
      const identityPicture = identity.picture && identity.picture !== 'null' && typeof identity.picture === 'string' ? identity.picture : undefined;
      const hasChanges =
        user.name !== (identity.name ?? user.name) ||
        user.email !== (identity.email ?? user.email) ||
        user.avatar !== identityPicture;

      if (hasChanges) {
        console.log("🔄 Updating existing user (data changed)...");
        // Update existing user with latest info from Logto
        await ctx.db.patch(user._id, {
          name: identity.name ?? user.name,
          email: identity.email ?? user.email,
          avatar: identityPicture,
          updatedAt: Date.now(),
        });
        user = await ctx.db.get(user._id);
        console.log("✅ Existing user updated");
      } else {
        console.log("ℹ️ No changes detected, skipping update");
      }
    }

    console.log("🎯 ensureUser returning user:", user ? {
      id: user._id,
      name: user.name,
      email: user.email,
      subject: user.subject
    } : "null");

    return user;
  },
});

// Update user role (admin and manager only)
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    newRole: v.union(
      v.literal("customer"),
      v.literal("staff"),
      v.literal("manager"),
      v.literal("admin")
    ),
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check permissions
    if (!hasPermissionFromJWT(permissions, 'users:write')) {
      throw new Error("Insufficient permissions to update user roles");
    }

    // Get or create user
    const user = await getOrCreateUserFromClaims(ctx, claims);

    // Prevent users from demoting themselves
    if (args.userId === user._id && args.newRole !== "admin") {
      throw new Error("Cannot change your own admin role");
    }

    // Validate role hierarchy (managers can't promote to admin)
    if (user.role === "manager" && args.newRole === "admin") {
      throw new Error("Managers cannot promote users to admin");
    }

    await ctx.db.patch(args.userId, {
      role: args.newRole,
      updatedAt: Date.now(),
    });

    // Log the action
    await logAction(ctx, user._id, "UPDATE_USER_ROLE", "users", args.userId, { newRole: args.newRole });

    return { success: true };
  },
});

// Promote current user to admin (setup/initialization only)
export const promoteToAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);

    // Check if user is already admin
    if (user.role === "admin") {
      return { success: true, message: "User is already admin" };
    }

    // Check if there are any existing admins
    const existingAdmins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();

    // If there are existing admins, require admin permission to promote
    if (existingAdmins.length > 0) {
      requirePermission(user, 'users:write');
    }

    // Allow promotion if:
    // 1. No existing admins (initial setup)
    // 2. Current user has admin permissions
    await ctx.db.patch(user._id, {
      role: "admin",
      updatedAt: Date.now(),
    });

    // Log the action
    await logAction(ctx, user._id, "PROMOTE_TO_ADMIN", "users", user._id, {
      reason: existingAdmins.length === 0 ? "initial_setup" : "admin_promotion"
    });

    return { success: true, message: "Successfully promoted to admin" };
  },
});

// Invite user (admin only, or server-side)
export const inviteUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("customer"),
      v.literal("staff"),
      v.literal("manager"),
      v.literal("admin")
    ),
    claims: v.optional(v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Check permissions only if claims are provided (client-side calls)
    if (args.claims) {
      const permissions = getPermissionsFromClaims(args.claims);

      // Check permissions - only admins can invite users
      if (!hasPermissionFromJWT(permissions, 'users:write')) {
        throw new Error("Insufficient permissions to invite users");
      }
    }

    // Get or create user for logging (only if claims provided)
    let userId: Id<"users"> | undefined;
    if (args.claims) {
      const user = await getOrCreateUserFromClaims(ctx, args.claims);
      userId = user._id;
    }

    // Check if user with this email already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create invited user
    const invitedUserId = await ctx.db.insert("users", {
      subject: `invited-${Date.now()}`, // Temporary subject until they accept
      email: args.email,
      name: args.name,
      role: args.role,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      // Mark as invited but not yet active
      isActive: false,
    });

    // Log the action only if we have user context
    if (userId) {
      await logAction(ctx, userId, "INVITE_USER", "users", invitedUserId, {
        email: args.email,
        name: args.name,
        role: args.role
      });
    }

    return invitedUserId;
  },
});

// Toggle user block status (admin only)
export const toggleUserBlock = mutation({
  args: {
    userId: v.id("users"),
    blocked: v.boolean(),
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check permissions - only admins can block/unblock users
    if (!hasPermissionFromJWT(permissions, 'users:write')) {
      throw new Error("Insufficient permissions to block/unblock users");
    }

    // Get or create user
    const user = await getOrCreateUserFromClaims(ctx, claims);

    // Prevent blocking yourself
    if (args.userId === user._id) {
      throw new Error("Cannot block yourself");
    }

    // Get target user
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    // Prevent blocking other admins
    if (targetUser.role === "admin" && user.role !== "admin") {
      throw new Error("Only admins can block other admins");
    }

    await ctx.db.patch(args.userId, {
      isBlocked: args.blocked,
      updatedAt: Date.now(),
    });

    // Log the action
    await logAction(ctx, user._id, args.blocked ? "BLOCK_USER" : "UNBLOCK_USER", "users", args.userId, {
      blocked: args.blocked
    });

    return { success: true };
  },
});

// =============================================================================
// MEAL MANAGEMENT MUTATIONS
// =============================================================================

// Create meal (staff and above, or server-side)
export const createMeal = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    image: v.optional(v.string()), // ImageKit URL
    prepTime: v.string(),
    calories: v.number(),
    spiceLevel: v.union(v.literal("mild"), v.literal("medium"), v.literal("hot")),
    availableToppingIds: v.optional(v.array(v.id("toppings"))),
    availableSideIds: v.optional(v.array(v.id("sides"))),
    availableBeverageIds: v.optional(v.array(v.id("beverages"))),
    claims: v.optional(v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Check permissions only if claims are provided (client-side calls)
    if (args.claims) {
      const permissions = getPermissionsFromClaims(args.claims);

      // Check permissions
      if (!hasPermissionFromJWT(permissions, 'meals:write')) {
        throw new Error("Insufficient permissions to create meals");
      }
    }

    // Get or create user for logging (only if claims provided)
    let userId: Id<"users"> | undefined;
    if (args.claims) {
      const user = await getOrCreateUserFromClaims(ctx, args.claims);
      userId = user._id;
    }

    const mealData = {
      name: args.name,
      description: args.description,
      price: args.price,
      category: args.category,
      prepTime: args.prepTime,
      calories: args.calories,
      spiceLevel: args.spiceLevel,
      rating: 0,
      popular: false,
      customizable: true,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      availableToppingIds: args.availableToppingIds || [],
      availableSideIds: args.availableSideIds || [],
      availableBeverageIds: args.availableBeverageIds || [],
      ...(args.image && { image: args.image }),
    };

    const mealId = await ctx.db.insert("meals", mealData);

    // Log the action only if we have user context
    if (userId) {
      await logAction(ctx, userId, "CREATE_MEAL", "meals", mealId, { name: args.name, category: args.category });
    }

    return mealId;
  },
});

// Update meal (staff and above, or server-side)
export const updateMeal = mutation({
  args: {
    mealId: v.id("meals"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    image: v.optional(v.string()), // ImageKit URL
    prepTime: v.optional(v.string()),
    calories: v.optional(v.number()),
    spiceLevel: v.optional(v.union(v.literal("mild"), v.literal("medium"), v.literal("hot"))),
    popular: v.optional(v.boolean()),
    customizable: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
    availableToppingIds: v.optional(v.array(v.id("toppings"))),
    availableSideIds: v.optional(v.array(v.id("sides"))),
    availableBeverageIds: v.optional(v.array(v.id("beverages"))),
    claims: v.optional(v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Check permissions only if claims are provided (client-side calls)
    if (args.claims) {
      const permissions = getPermissionsFromClaims(args.claims);

      // Check permissions
      if (!hasPermissionFromJWT(permissions, 'meals:write')) {
        throw new Error("Insufficient permissions to update meals");
      }
    }

    // Get or create user for logging (only if claims provided)
    let userId: Id<"users"> | undefined;
    if (args.claims) {
      const user = await getOrCreateUserFromClaims(ctx, args.claims);
      userId = user._id;
    }

    // Get current meal for logging
    const currentMeal = await ctx.db.get(args.mealId);
    if (!currentMeal) {
      throw new Error("Meal not found");
    }

    const updateData: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    // Only include fields that are provided
    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.price !== undefined) updateData.price = args.price;
    if (args.category !== undefined) updateData.category = args.category;
    if (args.image !== undefined) updateData.image = args.image;
    if (args.prepTime !== undefined) updateData.prepTime = args.prepTime;
    if (args.calories !== undefined) updateData.calories = args.calories;
    if (args.spiceLevel !== undefined) updateData.spiceLevel = args.spiceLevel;
    if (args.popular !== undefined) updateData.popular = args.popular;
    if (args.customizable !== undefined) updateData.customizable = args.customizable;
    if (args.isActive !== undefined) updateData.isActive = args.isActive;
    if (args.availableToppingIds !== undefined) updateData.availableToppingIds = args.availableToppingIds;
    if (args.availableSideIds !== undefined) updateData.availableSideIds = args.availableSideIds;
    if (args.availableBeverageIds !== undefined) updateData.availableBeverageIds = args.availableBeverageIds;

    await ctx.db.patch(args.mealId, updateData);

    // Log the action only if we have user context
    if (userId) {
      await logAction(ctx, userId, "UPDATE_MEAL", "meals", args.mealId, { changes: updateData });
    }

    return { success: true };
  },
});

// Bulk update meal status (staff and above)
export const bulkUpdateMealStatus = mutation({
  args: {
    mealIds: v.array(v.id("meals")),
    isActive: v.boolean(),
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check permissions
    if (!hasPermissionFromJWT(permissions, 'meals:write')) {
      throw new Error("Insufficient permissions to update meals");
    }

    // Get or create user
    const user = await getOrCreateUserFromClaims(ctx, claims);

    const updateData = {
      isActive: args.isActive,
      updatedAt: Date.now(),
    };

    // Update all meals
    for (const mealId of args.mealIds) {
      await ctx.db.patch(mealId, updateData);
    }

    // Log the action
    await logAction(ctx, user._id, "BULK_UPDATE_MEAL_STATUS", "meals", undefined, {
      mealIds: args.mealIds,
      isActive: args.isActive,
      count: args.mealIds.length
    });

    return { success: true, updatedCount: args.mealIds.length };
  },
});

// Bulk delete meals (manager and admin only)
export const bulkDeleteMeals = mutation({
  args: {
    mealIds: v.array(v.id("meals")),
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check permissions
    if (!hasPermissionFromJWT(permissions, 'meals:delete')) {
      throw new Error("Insufficient permissions to delete meals");
    }

    // Get or create user
    const user = await getOrCreateUserFromClaims(ctx, claims);

    // Delete all meals
    for (const mealId of args.mealIds) {
      await ctx.db.delete(mealId);
    }

    // Log the action
    await logAction(ctx, user._id, "BULK_DELETE_MEALS", "meals", undefined, {
      mealIds: args.mealIds,
      count: args.mealIds.length
    });

    return { success: true, deletedCount: args.mealIds.length };
  },
});

// Delete single meal (manager and admin only, or server-side)
export const deleteMeal = mutation({
  args: {
    mealId: v.id("meals"),
    claims: v.optional(v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Check permissions only if claims are provided (client-side calls)
    if (args.claims) {
      const permissions = getPermissionsFromClaims(args.claims);

      // Check permissions
      if (!hasPermissionFromJWT(permissions, 'meals:delete')) {
        throw new Error("Insufficient permissions to delete meals");
      }
    }

    // Get or create user for logging (only if claims provided)
    let userId: Id<"users"> | undefined;
    if (args.claims) {
      const user = await getOrCreateUserFromClaims(ctx, args.claims);
      userId = user._id;
    }

    // Get meal for logging
    const meal = await ctx.db.get(args.mealId);
    if (!meal) {
      throw new Error("Meal not found");
    }

    await ctx.db.delete(args.mealId);

    // Log the action only if we have user context
    if (userId) {
      await logAction(ctx, userId, "DELETE_MEAL", "meals", args.mealId, { name: meal.name, category: meal.category });
    }

    return { success: true };
  },
});

// =============================================================================
// TOPPING MANAGEMENT MUTATIONS
// =============================================================================

// Create topping (staff and above)
export const createTopping = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.string(),
    image: v.optional(v.string()), // ImageKit URL
    isVegetarian: v.optional(v.boolean()),
    isVegan: v.optional(v.boolean()),
    allergens: v.optional(v.array(v.string())),
    calories: v.optional(v.number()),
    sortOrder: v.number(),
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check permissions
    if (!hasPermissionFromJWT(permissions, 'meals:write')) {
      throw new Error("Insufficient permissions to create toppings");
    }

    // Get or create user
    const user = await getOrCreateUserFromClaims(ctx, claims);

    const toppingId = await ctx.db.insert("toppings", {
      name: args.name,
      description: args.description,
      price: args.price,
      category: args.category,
      image: args.image,
      isActive: true,
      isVegetarian: args.isVegetarian,
      isVegan: args.isVegan,
      allergens: args.allergens,
      calories: args.calories,
      sortOrder: args.sortOrder,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log the action
    await logAction(ctx, user._id, "CREATE_TOPPING", "toppings", toppingId, { name: args.name, category: args.category });

    return toppingId;
  },
});

// Update topping (staff and above)
export const updateTopping = mutation({
  args: {
    toppingId: v.id("toppings"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    image: v.optional(v.string()), // ImageKit URL
    isActive: v.optional(v.boolean()),
    isVegetarian: v.optional(v.boolean()),
    isVegan: v.optional(v.boolean()),
    allergens: v.optional(v.array(v.string())),
    calories: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check permissions
    if (!hasPermissionFromJWT(permissions, 'meals:write')) {
      throw new Error("Insufficient permissions to update toppings");
    }

    // Get or create user
    const user = await getOrCreateUserFromClaims(ctx, claims);

    const updateData: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.price !== undefined) updateData.price = args.price;
    if (args.category !== undefined) updateData.category = args.category;
    if (args.image !== undefined) updateData.image = args.image;
    if (args.isActive !== undefined) updateData.isActive = args.isActive;
    if (args.isVegetarian !== undefined) updateData.isVegetarian = args.isVegetarian;
    if (args.isVegan !== undefined) updateData.isVegan = args.isVegan;
    if (args.allergens !== undefined) updateData.allergens = args.allergens;
    if (args.calories !== undefined) updateData.calories = args.calories;
    if (args.sortOrder !== undefined) updateData.sortOrder = args.sortOrder;

    await ctx.db.patch(args.toppingId, updateData);

    // Log the action
    await logAction(ctx, user._id, "UPDATE_TOPPING", "toppings", args.toppingId, { changes: updateData });

    return { success: true };
  },
});

// Delete topping (manager and admin only)
export const deleteTopping = mutation({
  args: {
    toppingId: v.id("toppings"),
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check permissions
    if (!hasPermissionFromJWT(permissions, 'meals:delete')) {
      throw new Error("Insufficient permissions to delete toppings");
    }

    // Get or create user
    const user = await getOrCreateUserFromClaims(ctx, claims);

    // Get topping for logging
    const topping = await ctx.db.get(args.toppingId);
    if (!topping) {
      throw new Error("Topping not found");
    }

    await ctx.db.delete(args.toppingId);

    // Log the action
    await logAction(ctx, user._id, "DELETE_TOPPING", "toppings", args.toppingId, { name: topping.name, category: topping.category });

    return { success: true };
  },
});

// =============================================================================
// SIDE MANAGEMENT MUTATIONS
// =============================================================================

// Create side (staff and above)
export const createSide = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.string(),
    image: v.optional(v.string()), // ImageKit URL
    isActive: v.optional(v.boolean()),
    isVegetarian: v.optional(v.boolean()),
    isVegan: v.optional(v.boolean()),
    allergens: v.optional(v.array(v.string())),
    calories: v.optional(v.number()),
    prepTime: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check permissions
    if (!hasPermissionFromJWT(permissions, 'meals:write')) {
      throw new Error("Insufficient permissions to create sides");
    }

    // Get or create user
    const user = await getOrCreateUserFromClaims(ctx, claims);

    const sideId = await ctx.db.insert("sides", {
      name: args.name,
      description: args.description,
      price: args.price,
      category: args.category,
      image: args.image,
      isActive: args.isActive ?? true,
      isVegetarian: args.isVegetarian,
      isVegan: args.isVegan,
      allergens: args.allergens,
      calories: args.calories,
      prepTime: args.prepTime,
      sortOrder: args.sortOrder ?? 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log the action
    await logAction(ctx, user._id, "CREATE_SIDE", "sides", sideId, { name: args.name });

    return sideId;
  },
});

// Update side (staff and above)
export const updateSide = mutation({
  args: {
    sideId: v.id("sides"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    image: v.optional(v.string()), // ImageKit URL
    isActive: v.optional(v.boolean()),
    isVegetarian: v.optional(v.boolean()),
    isVegan: v.optional(v.boolean()),
    allergens: v.optional(v.array(v.string())),
    calories: v.optional(v.number()),
    prepTime: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check permissions
    if (!hasPermissionFromJWT(permissions, 'meals:write')) {
      throw new Error("Insufficient permissions to update sides");
    }

    // Get or create user
    const user = await getOrCreateUserFromClaims(ctx, claims);

    const updateData: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.price !== undefined) updateData.price = args.price;
    if (args.category !== undefined) updateData.category = args.category;
    if (args.image !== undefined) updateData.image = args.image;
    if (args.isActive !== undefined) updateData.isActive = args.isActive;
    if (args.isVegetarian !== undefined) updateData.isVegetarian = args.isVegetarian;
    if (args.isVegan !== undefined) updateData.isVegan = args.isVegan;
    if (args.allergens !== undefined) updateData.allergens = args.allergens;
    if (args.calories !== undefined) updateData.calories = args.calories;
    if (args.prepTime !== undefined) updateData.prepTime = args.prepTime;
    if (args.sortOrder !== undefined) updateData.sortOrder = args.sortOrder;

    await ctx.db.patch(args.sideId, updateData);

    // Log the action
    await logAction(ctx, user._id, "UPDATE_SIDE", "sides", args.sideId, { changes: updateData });

    return { success: true };
  },
});

// Delete side (manager and admin only)
export const deleteSide = mutation({
  args: {
    sideId: v.id("sides"),
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check permissions
    if (!hasPermissionFromJWT(permissions, 'meals:delete')) {
      throw new Error("Insufficient permissions to delete sides");
    }

    // Get or create user
    const user = await getOrCreateUserFromClaims(ctx, claims);

    // Get side for logging
    const side = await ctx.db.get(args.sideId);
    if (!side) {
      throw new Error("Side not found");
    }

    await ctx.db.delete(args.sideId);

    // Log the action
    await logAction(ctx, user._id, "DELETE_SIDE", "sides", args.sideId, { name: side.name });

    return { success: true };
  },
});

// =============================================================================
// BEVERAGE MANAGEMENT MUTATIONS
// =============================================================================

// Create beverage (staff and above)
export const createBeverage = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.string(),
    image: v.optional(v.string()), // ImageKit URL
    isActive: v.optional(v.boolean()),
    isAlcoholic: v.optional(v.boolean()),
    isCaffeinated: v.optional(v.boolean()),
    allergens: v.optional(v.array(v.string())),
    calories: v.optional(v.number()),
    volume: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check permissions
    if (!hasPermissionFromJWT(permissions, 'meals:write')) {
      throw new Error("Insufficient permissions to create beverages");
    }

    // Get or create user
    const user = await getOrCreateUserFromClaims(ctx, claims);

    const beverageId = await ctx.db.insert("beverages", {
      name: args.name,
      description: args.description,
      price: args.price,
      category: args.category,
      image: args.image,
      isActive: args.isActive ?? true,
      isAlcoholic: args.isAlcoholic,
      isCaffeinated: args.isCaffeinated,
      allergens: args.allergens,
      calories: args.calories,
      volume: args.volume,
      sortOrder: args.sortOrder ?? 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log the action
    await logAction(ctx, user._id, "CREATE_BEVERAGE", "beverages", beverageId, { name: args.name });

    return beverageId;
  },
});

// Update beverage (staff and above)
export const updateBeverage = mutation({
  args: {
    beverageId: v.id("beverages"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    image: v.optional(v.string()), // ImageKit URL
    isActive: v.optional(v.boolean()),
    isAlcoholic: v.optional(v.boolean()),
    isCaffeinated: v.optional(v.boolean()),
    allergens: v.optional(v.array(v.string())),
    calories: v.optional(v.number()),
    volume: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check permissions
    if (!hasPermissionFromJWT(permissions, 'meals:write')) {
      throw new Error("Insufficient permissions to update beverages");
    }

    // Get or create user
    const user = await getOrCreateUserFromClaims(ctx, claims);

    const updateData: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.price !== undefined) updateData.price = args.price;
    if (args.category !== undefined) updateData.category = args.category;
    if (args.image !== undefined) updateData.image = args.image;
    if (args.isActive !== undefined) updateData.isActive = args.isActive;
    if (args.isAlcoholic !== undefined) updateData.isAlcoholic = args.isAlcoholic;
    if (args.isCaffeinated !== undefined) updateData.isCaffeinated = args.isCaffeinated;
    if (args.allergens !== undefined) updateData.allergens = args.allergens;
    if (args.calories !== undefined) updateData.calories = args.calories;
    if (args.volume !== undefined) updateData.volume = args.volume;
    if (args.sortOrder !== undefined) updateData.sortOrder = args.sortOrder;

    await ctx.db.patch(args.beverageId, updateData);

    // Log the action
    await logAction(ctx, user._id, "UPDATE_BEVERAGE", "beverages", args.beverageId, { changes: updateData });

    return { success: true };
  },
});

// Delete beverage (manager and admin only)
export const deleteBeverage = mutation({
  args: {
    beverageId: v.id("beverages"),
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check permissions
    if (!hasPermissionFromJWT(permissions, 'meals:delete')) {
      throw new Error("Insufficient permissions to delete beverages");
    }

    // Get or create user
    const user = await getOrCreateUserFromClaims(ctx, claims);

    // Get beverage for logging
    const beverage = await ctx.db.get(args.beverageId);
    if (!beverage) {
      throw new Error("Beverage not found");
    }

    await ctx.db.delete(args.beverageId);

    // Log the action
    await logAction(ctx, user._id, "DELETE_BEVERAGE", "beverages", args.beverageId, { name: beverage.name });

    return { success: true };
  },
});

// Create order
export const createOrder = mutation({
  args: {
    items: v.array(v.object({
      mealId: v.id("meals"),
      quantity: v.number(),
      selectedToppings: v.array(v.object({
        id: v.string(),
        name: v.string(),
        price: v.number(),
      })),
      selectedSides: v.array(v.object({
        id: v.string(),
        name: v.string(),
        price: v.number(),
      })),
      selectedBeverages: v.array(v.object({
        id: v.string(),
        name: v.string(),
        price: v.number(),
      })),
      totalPrice: v.number(),
      specialInstructions: v.optional(v.string()),
    })),
    total: v.number(),
    pickupTime: v.string(),
    specialInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Validate all meals exist and are active
    for (const item of args.items) {
      const meal = await ctx.db.get(item.mealId);
      if (!meal || !meal.isActive) {
        throw new Error(`Meal ${item.mealId} not found or inactive`);
      }
    }

    const orderId = await ctx.db.insert("orders", {
      userId: user._id,
      ...args,
      status: "pending",
      paymentStatus: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log the action
    await logAction(ctx, user._id, "CREATE_ORDER", "orders", orderId, { total: args.total, itemCount: args.items.length });

    return orderId;
  },
});

// Update order status (staff and above, or server-side)
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    assignedStaff: v.optional(v.id("users")),
    claims: v.optional(v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Check permissions only if claims are provided (client-side calls)
    if (args.claims) {
      const permissions = getPermissionsFromClaims(args.claims);

      // Get or create user
      const user = await getOrCreateUserFromClaims(ctx, args.claims);

      // For customers, only allow canceling their own orders
      if (user.role === "customer") {
        // Get order to check ownership
        const order = await ctx.db.get(args.orderId);
        if (!order) {
          throw new Error("Order not found");
        }

        if (order.userId !== user._id) {
          throw new Error("Can only modify your own orders");
        }
        if (args.status !== "cancelled") {
          throw new Error("Customers can only cancel orders");
        }
      } else if (!hasPermissionFromJWT(permissions, 'orders:write')) {
        throw new Error("Insufficient permissions to update order status");
      }
    }

    // Get order
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const updateData: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };

    // Handle status-specific updates
    if (args.status === "completed") {
      updateData.completedAt = Date.now();
    }

    // Assign staff if provided and user has permission
    if (args.assignedStaff && args.claims) {
      const permissions = getPermissionsFromClaims(args.claims);
      if (hasPermissionFromJWT(permissions, 'orders:write')) {
        updateData.assignedStaff = args.assignedStaff;
      }
    }

    await ctx.db.patch(args.orderId, updateData);

    // Log the action only if we have user context
    if (args.claims) {
      const user = await getOrCreateUserFromClaims(ctx, args.claims);
      await logAction(ctx, user._id, "UPDATE_ORDER_STATUS", "orders", args.orderId, {
        newStatus: args.status,
        assignedStaff: args.assignedStaff
      });
    }

    return { success: true };
  },
});

// Update order payment status (staff and above, or server-side)
export const updateOrderPaymentStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    transactionId: v.optional(v.string()),
    claims: v.optional(v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Check permissions only if claims are provided (client-side calls)
    if (args.claims) {
      const permissions = getPermissionsFromClaims(args.claims);
      if (!hasPermissionFromJWT(permissions, 'orders:write')) {
        throw new Error("Insufficient permissions to update order payment status");
      }
    }

    // Get order
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const updateData: Record<string, unknown> = {
      paymentStatus: args.status,
      updatedAt: Date.now(),
    };

    // Add transaction ID if provided
    if (args.transactionId) {
      updateData.paymentMethod = args.transactionId;
    }

    // Handle payment status specific updates
    if (args.status === "paid") {
      updateData.paymentMethod = args.transactionId || order.paymentMethod;
    } else if (args.status === "refunded") {
      updateData.refundedAt = Date.now();
      if (args.claims) {
        const user = await getOrCreateUserFromClaims(ctx, args.claims);
        updateData.refundedBy = user._id;
      }
    }

    await ctx.db.patch(args.orderId, updateData);

    // Log the action only if we have user context
    if (args.claims) {
      const user = await getOrCreateUserFromClaims(ctx, args.claims);
      await logAction(ctx, user._id, "UPDATE_ORDER_PAYMENT_STATUS", "orders", args.orderId, {
        newPaymentStatus: args.status,
        transactionId: args.transactionId
      });
    }

    return { success: true };
  },
});

// Cancel order (customer can cancel their own, staff can cancel any)
export const cancelOrder = mutation({
  args: {
    orderId: v.id("orders"),
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Get or create user
    const user = await getOrCreateUserFromClaims(ctx, claims);

    // Get order
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Check permissions - customers can only cancel their own orders
    if (user.role === "customer" && order.userId !== user._id) {
      throw new Error("Can only cancel your own orders");
    }

    // Staff and above can cancel any order
    if (!hasPermissionFromJWT(permissions, 'orders:write') && user.role === "customer") {
      // Additional check for customers - can only cancel if order is still pending
      if (order.status !== "pending") {
        throw new Error("Can only cancel pending orders");
      }
    }

    await ctx.db.patch(args.orderId, {
      status: "cancelled",
      cancelledAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log the action
    await logAction(ctx, user._id, "CANCEL_ORDER", "orders", args.orderId, { reason: "user_cancelled" });

    return { success: true };
  },
});

// Process refund (admin only)
export const processRefund = mutation({
  args: {
    orderId: v.id("orders"),
    amount: v.optional(v.number()),
    reason: v.optional(v.string()),
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check permissions - only admins can process refunds
    if (!hasPermissionFromJWT(permissions, 'orders:write')) {
      throw new Error("Insufficient permissions to process refunds");
    }

    // Get or create user
    const user = await getOrCreateUserFromClaims(ctx, claims);

    // Get order
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Can only refund paid orders
    if (order.paymentStatus !== "paid") {
      throw new Error("Can only refund paid orders");
    }

    await ctx.db.patch(args.orderId, {
      paymentStatus: "refunded",
      refundAmount: args.amount || order.total,
      refundReason: args.reason,
      refundedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log the action
    await logAction(ctx, user._id, "PROCESS_REFUND", "orders", args.orderId, {
      amount: args.amount || order.total,
      reason: args.reason
    });

    return { success: true };
  },
});

// =============================================================================
// CART SESSION MUTATIONS (for guest users)
// =============================================================================

// Create or update cart session
export const upsertCartSession = mutation({
  args: {
    sessionId: v.string(),
    items: v.array(v.object({
      mealId: v.id("meals"),
      quantity: v.number(),
      selectedToppings: v.array(v.object({
        id: v.string(),
        name: v.string(),
        price: v.number(),
      })),
      selectedSides: v.array(v.object({
        id: v.string(),
        name: v.string(),
        price: v.number(),
      })),
      selectedBeverages: v.array(v.object({
        id: v.string(),
        name: v.string(),
        price: v.number(),
      })),
      totalPrice: v.number(),
      specialInstructions: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const existingSession = await ctx.db
      .query("cartSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    if (existingSession) {
      await ctx.db.patch(existingSession._id, {
        items: args.items,
        expiresAt,
      });
      return existingSession._id;
    } else {
      const sessionId = await ctx.db.insert("cartSessions", {
        sessionId: args.sessionId,
        items: args.items,
        expiresAt,
        createdAt: Date.now(),
      });
      return sessionId;
    }
  },
});

// =============================================================================
// CATEGORY MANAGEMENT MUTATIONS
// =============================================================================

// Create category (staff and above, or server-side)
export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.string()), // ImageKit URL
    sortOrder: v.optional(v.number()),
    claims: v.optional(v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Check permissions only if claims are provided (client-side calls)
    if (args.claims) {
      const permissions = getPermissionsFromClaims(args.claims);

      // Check permissions
      if (!hasPermissionFromJWT(permissions, 'meals:write')) {
        throw new Error("Insufficient permissions to create categories");
      }
    }

    // Get or create user for logging (only if claims provided)
    let userId: Id<"users"> | undefined;
    if (args.claims) {
      const user = await getOrCreateUserFromClaims(ctx, args.claims);
      userId = user._id;
    }

    const categoryId = await ctx.db.insert("categories", {
      name: args.name,
      description: args.description,
      image: args.image,
      isActive: true,
      sortOrder: args.sortOrder ?? 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log the action only if we have user context
    if (userId) {
      await logAction(ctx, userId, "CREATE_CATEGORY", "categories", categoryId, { name: args.name });
    }

    return categoryId;
  },
});

// Update category (staff and above, or server-side)
export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.string()), // ImageKit URL
    sortOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    claims: v.optional(v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Check permissions only if claims are provided (client-side calls)
    if (args.claims) {
      const permissions = getPermissionsFromClaims(args.claims);

      // Check permissions
      if (!hasPermissionFromJWT(permissions, 'meals:write')) {
        throw new Error("Insufficient permissions to update categories");
      }
    }

    // Get or create user for logging (only if claims provided)
    let userId: Id<"users"> | undefined;
    if (args.claims) {
      const user = await getOrCreateUserFromClaims(ctx, args.claims);
      userId = user._id;
    }

    const updateData: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.image !== undefined) updateData.image = args.image;
    if (args.sortOrder !== undefined) updateData.sortOrder = args.sortOrder;
  if (args.isActive !== undefined) updateData.isActive = args.isActive;

    await ctx.db.patch(args.categoryId, updateData);

    // Log the action only if we have user context
    if (userId) {
      await logAction(ctx, userId, "UPDATE_CATEGORY", "categories", args.categoryId, { changes: updateData });
    }

    return { success: true };
  },
});

// Delete category (manager and admin only, or server-side)
export const deleteCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    claims: v.optional(v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Check permissions only if claims are provided (client-side calls)
    if (args.claims) {
      const permissions = getPermissionsFromClaims(args.claims);

      // Check permissions
      if (!hasPermissionFromJWT(permissions, 'meals:delete')) {
        throw new Error("Insufficient permissions to delete categories");
      }
    }

    // Get or create user for logging (only if claims provided)
    let userId: Id<"users"> | undefined;
    if (args.claims) {
      const user = await getOrCreateUserFromClaims(ctx, args.claims);
      userId = user._id;
    }

    // Get category for logging
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    await ctx.db.delete(args.categoryId);

    // Log the action only if we have user context
    if (userId) {
      await logAction(ctx, userId, "DELETE_CATEGORY", "categories", args.categoryId, { name: category.name });
    }

    return { success: true };
  },
});

// Update current user's profile
export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const updateData: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updateData.name = args.name;
    if (args.phone !== undefined) updateData.phone = args.phone;

    await ctx.db.patch(user._id, updateData);

    return { success: true };
  },
});

// Clear cart session
export const clearCartSession = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the session
    const session = await ctx.db
      .query("cartSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});

// Create audit log entry
export const createAuditLog = mutation({
  args: {
    userId: v.optional(v.id("users")),
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    details: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auditLogId = await ctx.db.insert("auditLogs", {
      userId: args.userId,
      action: args.action,
      resource: args.resource,
      resourceId: args.resourceId,
      details: args.details,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      timestamp: Date.now(),
    });

    return auditLogId;
  },
});

// =============================================================================
// STORE SETTINGS MUTATIONS
// =============================================================================

// Update store setting (admin only)
export const updateStoreSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    category: v.string(),
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check permissions - only admins can update store settings
    if (!hasPermissionFromJWT(permissions, 'admin:write')) {
      throw new Error("Insufficient permissions to update store settings");
    }

    // Get or create user
    const user = await getOrCreateUserFromClaims(ctx, claims);

    // Check if setting exists
    const existingSetting = await ctx.db
      .query("storeSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existingSetting) {
      // Update existing setting
      await ctx.db.patch(existingSetting._id, {
        value: args.value,
        category: args.category,
        updatedBy: user._id,
        updatedAt: Date.now(),
      });

      // Log the action
      await logAction(ctx, user._id, "UPDATE_STORE_SETTING", "storeSettings", existingSetting._id, {
        key: args.key,
        oldValue: existingSetting.value,
        newValue: args.value
      });

      return { success: true };
    } else {
      // Create new setting
      const settingId = await ctx.db.insert("storeSettings", {
        key: args.key,
        value: args.value,
        category: args.category,
        isPublic: false, // Default to private for admin-created settings
        updatedBy: user._id,
        updatedAt: Date.now(),
      });

      // Log the action
      await logAction(ctx, user._id, "CREATE_STORE_SETTING", "storeSettings", settingId, {
        key: args.key,
        value: args.value
      });

      return { success: true };
    }
  },
});

// Seed store settings (for initial setup, no auth required)
export const seedStoreSettings = mutation({
  args: {
    settings: v.array(v.object({
      key: v.string(),
      value: v.any(),
      description: v.optional(v.string()),
      category: v.string(),
      isPublic: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    // No authentication required for seeding
    const results = [];

    for (const setting of args.settings) {
      // Check if setting already exists
      const existing = await ctx.db
        .query("storeSettings")
        .withIndex("by_key", (q) => q.eq("key", setting.key))
        .first();

      if (!existing) {
        const settingId = await ctx.db.insert("storeSettings", {
          ...setting,
          updatedAt: Date.now(),
        });
        results.push(settingId);
      }
    }

    return { success: true, created: results.length };
  },
});