import { getCurrentUserWithRoles } from './users';
import { getPermissionsFromClaims } from './query_wrappers';
import { getPrimaryRole } from './auth_utils';
import { hasPermissionFromJWT } from './permissions';
import { query } from './_generated/server';
import { v } from 'convex/values';

// =============================================================================
// MEAL QUERIES
// =============================================================================

// Get all active meals with optional filtering
export const getMeals = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
    includeInactive: v.optional(v.boolean()),
    claims: v.optional(v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Check permissions if requesting inactive meals
    if (args.includeInactive && args.claims) {
      const permissions = getPermissionsFromClaims(args.claims);
      if (!hasPermissionFromJWT(permissions, 'meals:read')) {
        throw new Error("Insufficient permissions to view inactive meals");
      }
    }

    // Get all meals
    const allMeals = await ctx.db.query("meals").collect();

    // Filter by category if specified
    let meals = args.category
      ? allMeals.filter(meal => meal.category === args.category)
      : allMeals;

    // Filter active meals by default
    if (!args.includeInactive) {
      meals = meals.filter(meal => meal.isActive);
    }

    // Sort by creation time desc
    meals.sort((a, b) => b._creationTime - a._creationTime);

    // Apply limit
    if (args.limit) {
      meals = meals.slice(0, args.limit);
    }

    // Get all toppings, sides, and beverages for enrichment
    const allToppings = await ctx.db.query("toppings").collect();
    const allSides = await ctx.db.query("sides").collect();
    const allBeverages = await ctx.db.query("beverages").collect();

    // Enrich meals with customization data
    const enrichedMeals = meals.map(meal => {
      const toppings = allToppings.filter(topping =>
        meal.availableToppingIds?.includes(topping._id) && topping.isActive
      );
      const sides = allSides.filter(side =>
        meal.availableSideIds?.includes(side._id) && side.isActive
      );
      const beverages = allBeverages.filter(beverage =>
        meal.availableBeverageIds?.includes(beverage._id) && beverage.isActive
      );

      return {
        ...meal,
        availableToppings: toppings,
        availableSides: sides,
        availableBeverages: beverages,
      };
    });

    return enrichedMeals;
  },
});

// Get popular meals
export const getPopularMeals = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    // Get all meals and filter popular ones manually
    const allMeals = await ctx.db.query("meals").collect();
    const popularMeals = allMeals
      .filter(meal => meal.popular && meal.isActive)
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, limit);

    return popularMeals;
  },
});

// Search meals by name
export const searchMeals = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    // Get all meals and filter by search term manually
    const allMeals = await ctx.db.query("meals").collect();
    const searchResults = allMeals
      .filter(meal =>
        meal.isActive &&
        meal.name.toLowerCase().includes(args.searchTerm.toLowerCase())
      )
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, limit);

    return searchResults;
  },
});

// =============================================================================
// TOPPING QUERIES
// =============================================================================

// Get all toppings
export const getToppings = query({
  args: {
    includeInactive: v.optional(v.boolean()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let queryBuilder = ctx.db.query("toppings");

    // Filter active toppings by default
    if (!args.includeInactive) {
      queryBuilder = queryBuilder.filter((q) => q.eq(q.field("isActive"), true));
    }

    // Filter by category if specified
    if (args.category) {
      queryBuilder = queryBuilder.filter((q) => q.eq(q.field("category"), args.category));
    }

    const results = await queryBuilder.collect();

    // Sort by creation time desc
    results.sort((a, b) => b._creationTime - a._creationTime);

    return results;
  },
});

// Get topping by ID
export const getTopping = query({
  args: {
    toppingId: v.id("toppings"),
  },
  handler: async (ctx, args) => {
    const topping = await ctx.db.get(args.toppingId);
    if (!topping) {
      throw new Error("Topping not found");
    }

    return topping;
  },
});

// =============================================================================
// SIDE QUERIES
// =============================================================================

// Get all sides
export const getSides = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let queryBuilder = ctx.db.query("sides");

    // Filter active sides by default
    if (!args.includeInactive) {
      queryBuilder = queryBuilder.filter((q) => q.eq(q.field("isActive"), true));
    }

    const results = await queryBuilder.collect();

    // Sort by creation time desc
    results.sort((a, b) => b._creationTime - a._creationTime);

    return results;
  },
});

// Get side by ID
export const getSide = query({
  args: {
    sideId: v.id("sides"),
  },
  handler: async (ctx, args) => {
    const side = await ctx.db.get(args.sideId);
    if (!side) {
      throw new Error("Side not found");
    }

    return side;
  },
});

// =============================================================================
// BEVERAGE QUERIES
// =============================================================================

// Get all beverages
export const getBeverages = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let queryBuilder = ctx.db.query("beverages");

    // Filter active beverages by default
    if (!args.includeInactive) {
      queryBuilder = queryBuilder.filter((q) => q.eq(q.field("isActive"), true));
    }

    const results = await queryBuilder.collect();

    // Sort by creation time desc
    results.sort((a, b) => b._creationTime - a._creationTime);

    return results;
  },
});

// Get beverage by ID
export const getBeverage = query({
  args: {
    beverageId: v.id("beverages"),
  },
  handler: async (ctx, args) => {
    const beverage = await ctx.db.get(args.beverageId);
    if (!beverage) {
      throw new Error("Beverage not found");
    }

    return beverage;
  },
});

// Get orders with role-based access
export const getOrders = query({
  args: {
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check if user has permission to view orders
    if (!hasPermissionFromJWT(permissions, 'orders:read')) {
      throw new Error("Insufficient permissions to view orders");
    }

    // Get all orders
    const allOrders = await ctx.db.query("orders").collect();

    let orders = allOrders;

    // Customers can only see their own orders
    if (!hasPermissionFromJWT(permissions, 'users:read')) {
      // Find user by subject to get their ID
      const user = await ctx.db
        .query("users")
        .withIndex("by_subject", (q) => q.eq("subject", claims.sub))
        .unique();

      if (user) {
        orders = orders.filter(order => order.userId === user._id);
      } else {
        // If user not found in database, return empty array
        orders = [];
      }
    }
    // Staff and above can see all orders
    else if (hasPermissionFromJWT(permissions, 'orders:read')) {
      // Apply status filter if provided
      if (args.status) {
        orders = orders.filter(order => order.status === args.status);
      }
    } else {
      throw new Error("Insufficient permissions to view orders");
    }

    // Sort by creation time desc
    orders.sort((a, b) => b._creationTime - a._creationTime);

    // Apply pagination manually
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    const paginatedResults = orders.slice(offset, offset + limit);

    return paginatedResults;
  },
});

// Get user's orders with meal details
export const getUserOrdersWithDetails = query({
  args: {
    userId: v.optional(v.id("users")),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    claims: v.optional(v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // If claims are provided, use JWT-based auth
    if (args.claims) {
      const { claims } = args;
      const permissions = getPermissionsFromClaims(claims);

      // Determine which user's orders to fetch
      const targetUserId = args.userId || claims.sub;

      // Check permissions - users can only view their own orders unless they have permission
      if (targetUserId !== claims.sub && !hasPermissionFromJWT(permissions, 'users:read')) {
        throw new Error("Insufficient permissions to view other users' orders");
      }

      // Get all orders and filter manually
      const allOrders = await ctx.db.query("orders").collect();
      let userOrders = allOrders.filter(order => order.userId === targetUserId);

      if (args.status) {
        userOrders = userOrders.filter(order => order.status === args.status);
      }

      // Sort by creation time desc
      userOrders.sort((a, b) => b._creationTime - a._creationTime);

      // Apply limit manually
      const limit = args.limit || 50;
      const limitedOrders = userOrders.slice(0, limit);

      // Get meal details for each order
      const ordersWithDetails = await Promise.all(
        limitedOrders.map(async (order) => {
          const itemsWithDetails = await Promise.all(
            order.items.map(async (item) => {
              const meal = await ctx.db.get(item.mealId);
              return {
                ...item,
                mealName: meal?.name || 'Unknown Meal',
                mealImage: meal?.image || '',
              };
            })
          );

          return {
            ...order,
            items: itemsWithDetails,
          };
        })
      );

      return ordersWithDetails;
    }

    // Fallback to old auth method for backward compatibility
    const currentUser = await getCurrentUserWithRoles(ctx);
    if (!currentUser) {
      // Return empty array instead of throwing error when not authenticated or user not found
      console.log("getUserOrdersWithDetails: User not found or not authenticated, returning empty array");
      return [];
    }

    // Determine which user's orders to fetch
    const targetUserId = args.userId || currentUser._id;

    // Check permissions - users can only view their own orders unless they have permission
    const userPermissions = currentUser.permissions || [];
    if (targetUserId !== currentUser._id && !hasPermissionFromJWT(userPermissions, 'users:read')) {
      throw new Error("Insufficient permissions to view other users' orders");
    }

    // Get all orders and filter manually
    const allOrders = await ctx.db.query("orders").collect();
    let userOrders = allOrders.filter(order => order.userId === targetUserId);

    if (args.status) {
      userOrders = userOrders.filter(order => order.status === args.status);
    }

    // Sort by creation time desc
    userOrders.sort((a, b) => b._creationTime - a._creationTime);

    // Apply limit manually
    const limit = args.limit || 50;
    const limitedOrders = userOrders.slice(0, limit);

    // Get meal details for each order
    const ordersWithDetails = await Promise.all(
      limitedOrders.map(async (order) => {
        const itemsWithDetails = await Promise.all(
          order.items.map(async (item) => {
            const meal = await ctx.db.get(item.mealId);
            return {
              ...item,
              mealName: meal?.name || 'Unknown Meal',
              mealImage: meal?.image || '',
            };
          })
        );

        return {
          ...order,
          items: itemsWithDetails,
        };
      })
    );

    return ordersWithDetails;
  },
});

// Get order with full details
export const getOrder = query({
  args: {
    orderId: v.id("orders"),
    claims: v.optional(v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // If claims are provided, use JWT-based auth
    if (args.claims) {
      const { claims } = args;
      const permissions = getPermissionsFromClaims(claims);

      // Get the order
      const order = await ctx.db.get(args.orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      // Check permissions - users can only view their own orders unless they have permission
      if (order.userId !== claims.sub && !hasPermissionFromJWT(permissions, 'users:read')) {
        throw new Error("Insufficient permissions to view this order");
      }

      // Get meal details for each item
      const itemsWithDetails = await Promise.all(
        order.items.map(async (item) => {
          const meal = await ctx.db.get(item.mealId);
          return {
            ...item,
            meal: meal ? {
              id: meal._id,
              name: meal.name,
              image: meal.image,
              price: meal.price,
              category: meal.category,
            } : null,
          };
        })
      );

      return {
        ...order,
        items: itemsWithDetails,
      };
    }

    // Fallback to old auth method for backward compatibility
    const user = await getCurrentUserWithRoles(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Check permissions
    const userPermissions = user.permissions || [];
    if (order.userId !== user._id && !hasPermissionFromJWT(userPermissions, 'orders:read')) {
      throw new Error("Insufficient permissions to view this order");
    }

    // Get meal details for each item
    const itemsWithDetails = await Promise.all(
      order.items.map(async (item) => {
        const meal = await ctx.db.get(item.mealId);
        return {
          ...item,
          meal: meal ? {
            id: meal._id,
            name: meal.name,
            image: meal.image,
            price: meal.price,
            category: meal.category,
          } : null,
        };
      })
    );

    return {
      ...order,
      items: itemsWithDetails,
    };
  },
});

// Get order by payment reference (for order confirmation after payment)
export const getOrderByPaymentReference = query({
  args: {
    reference: v.string(),
  },
  handler: async (ctx, args) => {
    // Find order by payment reference
    const order = await ctx.db
      .query("orders")
      .withIndex("by_payment_reference", (q) => q.eq("paymentReference", args.reference))
      .first();

    if (!order) {
      return null;
    }

    // Get meal details for each item
    const itemsWithDetails = await Promise.all(
      order.items.map(async (item) => {
        const meal = await ctx.db.get(item.mealId);
        return {
          ...item,
          meal: meal ? {
            id: meal._id,
            name: meal.name,
            image: meal.image,
            price: meal.price,
            category: meal.category,
          } : null,
        };
      })
    );

    // Get user details
    const user = await ctx.db.get(order.userId);

    return {
      ...order,
      items: itemsWithDetails,
      user: user ? {
        name: user.name,
        email: user.email,
      } : null,
    };
  },
});

// Get order statistics
export const getOrderStats = query({
  args: {
    claims: v.optional(v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    })),
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // Require authentication for order stats
    if (!args.claims || !args.claims.sub) {
      throw new Error("Authentication required");
    }

    const permissions = getPermissionsFromClaims(args.claims);

    // Check permissions
    if (!hasPermissionFromJWT(permissions, 'analytics:read')) {
      throw new Error("Insufficient permissions to view analytics");
    }

    // Get all orders
    const allOrders = await ctx.db.query("orders").collect();

    // Apply date filter if provided
    let orders = allOrders;
    if (args.dateRange) {
      const dateRange = args.dateRange;
      orders = orders.filter(order =>
        order.createdAt >= dateRange.start &&
        order.createdAt <= dateRange.end
      );
    }

    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      pendingOrders: orders.filter(o => o.status === "pending").length,
      completedOrders: orders.filter(o => o.status === "completed").length,
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
    };

    return stats;
  },
});

// =============================================================================
// USER QUERIES
// =============================================================================

// Get current user with JWT claims (bypass Convex auth)
export const getCurrentUserWithJWT = query({
  args: {
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

    // Try to find existing user
    const user = await ctx.db
      .query("users")
      .withIndex("by_subject", (q) => q.eq("subject", claims.sub))
      .unique();

    // Return user data with JWT-derived permissions
    return {
      _id: claims.sub,
      subject: claims.sub,
      email: claims.email,
      name: claims.name,
      avatar: claims.picture,
      role: getPrimaryRole(claims),
      permissions: permissions,
      // Include database fields if user exists
      ...(user && {
        phone: user.phone,
        isActive: user.isActive,
        isBlocked: user.isBlocked,
        lastActiveAt: user.lastActiveAt,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
    };
  },
});

// Get current user
export const getCurrentUser = query({
  handler: async (ctx) => {
    return await getCurrentUserWithRoles(ctx);
  },
});

// Get users (admin and manager only)
export const getUsers = query({
  args: {
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
    role: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check permissions
    if (!hasPermissionFromJWT(permissions, 'users:read')) {
      throw new Error("Insufficient permissions to view users");
    }

    // Get all users
    const allUsers = await ctx.db.query("users").collect();

    let results = allUsers;

    if (args.role) {
      results = results.filter(u => u.role === args.role);
    }

    // Sort manually
    results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    // Apply pagination manually
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    const paginatedResults = results.slice(offset, offset + limit);

    return paginatedResults;
  },
});

// Get user by ID
export const getUser = query({
  args: {
    userId: v.id("users"),
    claims: v.optional(v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // If claims are provided, use JWT-based auth
    if (args.claims) {
      const { claims } = args;
      const permissions = getPermissionsFromClaims(claims);

      // Users can view their own profile, admins can view all
      if (args.userId !== claims.sub && !hasPermissionFromJWT(permissions, 'users:read')) {
        throw new Error("Insufficient permissions to view user");
      }

      const targetUser = await ctx.db.get(args.userId);
      if (!targetUser) {
        throw new Error("User not found");
      }

      return targetUser;
    }

    // Fallback to old auth method for backward compatibility
    const currentUser = await getCurrentUserWithRoles(ctx);
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    // Users can view their own profile, admins can view all
    const userPermissions = currentUser.permissions || [];
    if (args.userId !== currentUser._id && !hasPermissionFromJWT(userPermissions, 'users:read')) {
      throw new Error("Insufficient permissions to view user");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    return targetUser;
  },
});

// =============================================================================
// CATEGORY QUERIES
// =============================================================================

// Get all categories
export const getCategories = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const queryBuilder = args.includeInactive
      ? ctx.db.query("categories")
      : ctx.db
          .query("categories")
          .filter((q) => q.eq(q.field("isActive"), true));

    const results = await queryBuilder.collect();

    // Sort manually by sortOrder
    results.sort((a, b) => a.sortOrder - b.sortOrder);

    return results;
  },
});

// Get category by ID
export const getCategory = query({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  },
});

// =============================================================================
// CART SESSION QUERIES
// =============================================================================

// Get cart session
export const getCartSession = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("cartSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      return null;
    }

    // Get meal details for each item
    const itemsWithDetails = await Promise.all(
      session.items.map(async (item) => {
        const meal = await ctx.db.get(item.mealId);
        return {
          ...item,
          meal: meal ? {
            id: meal._id,
            name: meal.name,
            image: meal.image,
            price: meal.price,
          } : null,
        };
      })
    );

    return {
      ...session,
      items: itemsWithDetails,
    };
  },
});

// =============================================================================
// ANALYTICS QUERIES
// =============================================================================

// Get dashboard analytics (staff and above)
export const getAnalytics = query({
  args: {
    claims: v.optional(v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    })),
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // Require authentication for analytics
    if (!args.claims || !args.claims.sub) {
      throw new Error("Authentication required");
    }

    const permissions = getPermissionsFromClaims(args.claims);

    // Check permissions
    if (!hasPermissionFromJWT(permissions, 'analytics:read')) {
      throw new Error("Insufficient permissions to view analytics");
    }

    // Get date range or default to last 30 days
    const endDate = args.dateRange?.end || Date.now();
    const startDate = args.dateRange?.start || (endDate - 30 * 24 * 60 * 60 * 1000);

    // Get orders in date range
    const allOrders = await ctx.db.query("orders").collect();
    const orders = allOrders.filter(order =>
      order.createdAt >= startDate && order.createdAt <= endDate
    );

    // Get total users
    const totalUsers = await ctx.db.query("users").collect();

    // Get active meals
    const allMeals = await ctx.db.query("meals").collect();
    const activeMeals = allMeals.filter(meal => meal.isActive);

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const completedOrders = orders.filter(o => o.status === "completed");
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Get order status breakdown
    const statusBreakdown = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders: orders.length,
      totalRevenue,
      completedOrders: completedOrders.length,
      totalUsers: totalUsers.length,
      activeMeals: activeMeals.length,
      averageOrderValue,
      statusBreakdown,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  },
});

// =============================================================================
// STORE SETTINGS QUERIES
// =============================================================================

// Get all store settings (admin only)
export const getStoreSettings = query({
  args: {
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check permissions
    if (!hasPermissionFromJWT(permissions, 'settings:read')) {
      throw new Error("Insufficient permissions to view store settings");
    }

    const queryBuilder = ctx.db.query("storeSettings");
    if (args.category) {
      queryBuilder.filter((q) => q.eq(q.field("category"), args.category));
    }

    const results = await queryBuilder.collect();
    return results;
  },
});

// Get public store settings (for frontend)
export const getPublicStoreSettings = query({
  handler: async (ctx) => {
    const results = await ctx.db
      .query("storeSettings")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();

    // Convert to key-value object
    const settings: Record<string, unknown> = {};
    results.forEach(setting => {
      settings[setting.key] = setting.value;
    });

    return settings;
  },
});

// Get audit logs (admin and manager only)
export const getAuditLogs = query({
  args: {
    claims: v.object({
      sub: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      picture: v.optional(v.string()),
    }),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    action: v.optional(v.string()),
    resource: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { claims } = args;
    const permissions = getPermissionsFromClaims(claims);

    // Check permissions
    if (!hasPermissionFromJWT(permissions, 'audit:read')) {
      throw new Error("Insufficient permissions to view audit logs");
    }

    let queryBuilder = ctx.db.query("auditLogs");

    // Apply filters
    if (args.action) {
      queryBuilder = queryBuilder.filter((q) => q.eq(q.field("action"), args.action));
    }
    if (args.resource) {
      queryBuilder = queryBuilder.filter((q) => q.eq(q.field("resource"), args.resource));
    }
    if (args.userId) {
      queryBuilder = queryBuilder.filter((q) => q.eq(q.field("userId"), args.userId));
    }

    // Sort by timestamp desc
    const results = await queryBuilder.collect();
    results.sort((a, b) => b.timestamp - a.timestamp);

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    const paginatedResults = results.slice(offset, offset + limit);

    return paginatedResults;
  },
});

// =============================================================================
// ADMIN SESSION QUERIES
// =============================================================================

// Get valid admin session
export const getValidAdminSession = query({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      return null;
    }

    return session;
  },
});

// Get user by email (for login)
export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return user;
  },
});