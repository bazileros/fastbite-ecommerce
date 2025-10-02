import {
  defineSchema,
  defineTable,
} from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Users table - optional records for users who have interacted with the system
  // Most user data and roles come from Logto JWT tokens
  users: defineTable({
    subject: v.string(), // Logto subject ID - primary identifier
    email: v.optional(v.string()), // Cached from JWT for convenience
    name: v.optional(v.string()), // Cached from JWT for convenience
    avatar: v.optional(v.string()), // Cached from JWT for convenience
    phone: v.optional(v.string()), // User can update this
    role: v.optional(v.union( // Local role override if needed
      v.literal("customer"),
      v.literal("staff"),
      v.literal("manager"),
      v.literal("admin")
    )),
    // User management fields
    isActive: v.optional(v.boolean()), // Whether user account is active
    isBlocked: v.optional(v.boolean()), // Whether user is blocked
    lastActiveAt: v.optional(v.number()), // Last activity timestamp
    lastLoginAt: v.optional(v.number()), // Last login timestamp
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_subject", ["subject"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Meals table with comprehensive meal data
  meals: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    image: v.optional(v.string()), // ImageKit URL
    rating: v.number(),
    prepTime: v.string(),
    calories: v.number(),
    spiceLevel: v.union(
      v.literal("mild"),
      v.literal("medium"),
      v.literal("hot")
    ),
    popular: v.boolean(),
    customizable: v.boolean(),
    isActive: v.boolean(),
    // Customization options - now reference separate tables
    availableToppingIds: v.optional(v.array(v.id('toppings'))),
    availableSideIds: v.optional(v.array(v.id('sides'))),
    availableBeverageIds: v.optional(v.array(v.id('beverages'))),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_popular", ["popular"])
    .index("by_active", ["isActive"])
    .index("by_name", ["name"]),

  // Categories table for dynamic category management
  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.string()), // ImageKit URL
    isActive: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_active", ["isActive"])
    .index("by_sort_order", ["sortOrder"]),

  // Toppings table for meal customization
  toppings: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.string(), // e.g., 'protein', 'vegetable', 'sauce', 'cheese'
    image: v.optional(v.string()), // ImageKit URL
    isActive: v.boolean(),
    isVegetarian: v.optional(v.boolean()),
    isVegan: v.optional(v.boolean()),
    allergens: v.optional(v.array(v.string())), // e.g., ['nuts', 'dairy', 'gluten']
    calories: v.optional(v.number()),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_active", ["isActive"])
    .index("by_sort_order", ["sortOrder"]),

  // Sides table for meal add-ons
  sides: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.string(), // e.g., 'starch', 'vegetable', 'salad'
    image: v.optional(v.string()), // ImageKit URL
    isActive: v.boolean(),
    isVegetarian: v.optional(v.boolean()),
    isVegan: v.optional(v.boolean()),
    allergens: v.optional(v.array(v.string())),
    calories: v.optional(v.number()),
    prepTime: v.optional(v.string()),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_active", ["isActive"])
    .index("by_sort_order", ["sortOrder"]),

  // Beverages table for drink options
  beverages: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.string(), // e.g., 'soft-drink', 'juice', 'coffee', 'tea', 'alcohol'
    image: v.optional(v.string()), // ImageKit URL
    isActive: v.boolean(),
    isAlcoholic: v.optional(v.boolean()),
    isCaffeinated: v.optional(v.boolean()),
    allergens: v.optional(v.array(v.string())),
    calories: v.optional(v.number()),
    volume: v.optional(v.string()), // e.g., '330ml', '500ml'
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_active", ["isActive"])
    .index("by_sort_order", ["sortOrder"]),

  // Orders table with comprehensive order tracking
  orders: defineTable({
    userId: v.id("users"),
    items: v.array(v.object({
      mealId: v.id("meals"),
      quantity: v.number(),
      // Selected customizations
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
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    paymentMethod: v.optional(v.string()),
    pickupTime: v.string(),
    specialInstructions: v.optional(v.string()),
    // Staff assignments
    assignedStaff: v.optional(v.id("users")),
    preparedBy: v.optional(v.id("users")),
    completedAt: v.optional(v.number()),
    // Cancellation fields
    cancelledAt: v.optional(v.number()),
    cancelledBy: v.optional(v.id("users")),
    cancelReason: v.optional(v.string()),
    // Refund fields
    refundAmount: v.optional(v.number()),
    refundReason: v.optional(v.string()),
    refundTransactionId: v.optional(v.string()),
    refundedAt: v.optional(v.number()),
    refundedBy: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_payment_status", ["paymentStatus"])
    .index("by_created_at", ["createdAt"])
    .index("by_assigned_staff", ["assignedStaff"]),

  // Cart sessions for guest users
  cartSessions: defineTable({
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
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_expires", ["expiresAt"]),

  // Admin sessions for dashboard authentication
  adminSessions: defineTable({
    userId: v.id("users"),
    sessionToken: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    lastActivityAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_token", ["sessionToken"])
    .index("by_user", ["userId"])
    .index("by_expires", ["expiresAt"]),

  // Store settings and configuration
  storeSettings: defineTable({
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),
    category: v.string(), // 'general', 'contact', 'social', 'content', 'appearance'
    isPublic: v.boolean(), // Whether this setting can be viewed by non-admin users
    updatedBy: v.optional(v.id("users")), // Optional for seeding
    updatedAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_category", ["category"])
    .index("by_public", ["isPublic"]),

  // Audit log for tracking important actions
  auditLogs: defineTable({
    userId: v.optional(v.id("users")),
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    details: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_resource", ["resource"])
    .index("by_timestamp", ["timestamp"]),

  // Email templates and configurations
  emailTemplates: defineTable({
    name: v.string(),
    subject: v.string(),
    htmlContent: v.string(),
    textContent: v.optional(v.string()),
    variables: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_active", ["isActive"]),

  // Admin settings for system-wide configuration
  adminSettings: defineTable({
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),
    updatedBy: v.optional(v.id("users")),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"]),
});