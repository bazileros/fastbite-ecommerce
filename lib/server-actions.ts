"use server";

import { ConvexHttpClient } from 'convex/browser';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

// Type definitions
interface Customizations {
  toppings?: string[];
  sides?: string[];
  beverages?: string[];
  specialInstructions?: string;
}

interface UserPreferences {
  dietaryRestrictions?: string[];
  favoriteCategories?: string[];
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
}

interface PaymentMetadata {
  orderId: string;
  userId?: string;
  paymentMethod: string;
  amount: number;
  currency: string;
}

// Initialize Convex client
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error('NEXT_PUBLIC_CONVEX_URL is not configured');
}
const convex = new ConvexHttpClient(convexUrl);

// =============================================================================
// MEAL ACTIONS
// =============================================================================

export async function createMealAction(data: {
  name: string;
  description: string;
  price: number;
  image?: string; // ImageKit URL
  category: string;
  prepTime?: string;
  calories?: number;
  spiceLevel?: "mild" | "medium" | "hot";
  availableToppings?: Array<{
    id: string;
    name: string;
    price: number;
    category: string;
  }>;
  availableSides?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  availableBeverages?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}) {
  try {
    const mealData = {
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image,
      prepTime: data.prepTime || "15",
      calories: data.calories || 0,
      spiceLevel: data.spiceLevel || "mild",
      availableToppings: data.availableToppings || [],
      availableSides: data.availableSides || [],
      availableBeverages: data.availableBeverages || [],
    };
    return await convex.mutation(api.mutations.createMeal, mealData);
  } catch (error) {
    console.error("Failed to create meal:", error);
    throw new Error("Failed to create meal");
  }
}export async function updateMealAction(mealId: string, updates: Partial<{
  name: string;
  description: string;
  price: number;
  image?: string; // ImageKit URL
  category: string;
  prepTime: string;
  calories: number;
  spiceLevel: "mild" | "medium" | "hot";
  popular: boolean;
  customizable: boolean;
  isActive: boolean;
  availableToppings: Array<{
    id: string;
    name: string;
    price: number;
    category: string;
  }>;
  availableSides: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  availableBeverages: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}>) {
  try {
    return await convex.mutation(api.mutations.updateMeal, {
      mealId: mealId as Id<"meals">,
      ...updates
    });
  } catch (error) {
    console.error("Failed to update meal:", error);
    throw new Error("Failed to update meal");
  }
}

export async function deleteMealAction(mealId: string) {
  try {
    return await convex.mutation(api.mutations.deleteMeal, { mealId: mealId as Id<"meals"> });
  } catch (error) {
    console.error("Failed to delete meal:", error);
    throw new Error("Failed to delete meal");
  }
}

// =============================================================================
// ORDER ACTIONS
// =============================================================================

export async function createOrderAction(data: {
  userId: string;
  items: Array<{
    mealId: string;
    quantity: number;
    customizations?: Customizations;
    totalPrice: number;
  }>;
  total: number;
  paymentMethod: string;
  pickupTime: string;
  specialInstructions?: string;
}) {
  try {
    // Transform the data to match the mutation expectations
    const transformedData = {
      ...data,
      items: data.items.map(item => ({
        mealId: item.mealId as Id<"meals">,
        quantity: item.quantity,
        selectedToppings: [],
        selectedSides: [],
        selectedBeverages: [],
        totalPrice: item.totalPrice,
        specialInstructions: item.customizations?.specialInstructions
      }))
    };
    return await convex.mutation(api.mutations.createOrder, transformedData);
  } catch (error) {
    console.error("Failed to create order:", error);
    throw new Error("Failed to create order");
  }
}

export async function updateOrderStatusAction(orderId: string, status: string, _notes?: string) {
  try {
    return await convex.mutation(api.mutations.updateOrderStatus, {
      orderId: orderId as Id<"orders">,
      status: status as "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled"
    });
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw new Error("Failed to update order status");
  }
}

export async function cancelOrderAction(orderId: string, _reason: string) {
  try {
    // Use updateOrderStatus with cancelled status
    return await convex.mutation(api.mutations.updateOrderStatus, {
      orderId: orderId as Id<"orders">,
      status: "cancelled"
    });
  } catch (error) {
    console.error("Failed to cancel order:", error);
    throw new Error("Failed to cancel order");
  }
}

// =============================================================================
// USER ACTIONS
// =============================================================================

export async function inviteUserAction(data: {
  email: string;
  name: string;
  role: 'staff' | 'manager' | 'admin';
  redirectUrl?: string;
}) {
  try {
    // First create the user record in Convex
    const userResult = await convex.mutation(api.mutations.inviteUser, {
      email: data.email,
      name: data.name,
      role: data.role
    });

    // Then send invitation via Clerk API
    const clerkResponse = await fetch('https://api.clerk.com/v1/invitations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: data.email,
        redirect_url: data.redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation`,
        public_metadata: {
          role: data.role,
          invitedBy: 'admin'
        }
      }),
    });

    if (!clerkResponse.ok) {
      const errorData = await clerkResponse.json();
      console.error('Clerk invitation failed:', errorData);
      throw new Error('Failed to send invitation via Clerk');
    }

    const invitationData = await clerkResponse.json();
    console.log('Clerk invitation sent:', invitationData);

    return {
      success: true,
      userId: userResult,
      invitationId: invitationData.id
    };
  } catch (error) {
    console.error("Failed to invite user:", error);
    throw new Error("Failed to invite user");
  }
}

export async function updateUserAction(_userId: string, updates: Partial<{
  name: string;
  email: string;
  phone?: string;
  role: string;
  preferences?: UserPreferences;
}>) {
  try {
    // Note: updateUserProfile only updates current user's profile
    // For admin updates, we'd need a different mutation
    return await convex.mutation(api.mutations.updateUserProfile, {
      name: updates.name,
      phone: updates.phone
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    throw new Error("Failed to update user");
  }
}

export async function deleteUserAction(_userId: string) {
  try {
    // Note: deleteUser mutation doesn't exist, this would need to be implemented
    throw new Error("Delete user not implemented");
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw new Error("Failed to delete user");
  }
}

// =============================================================================
// CATEGORY ACTIONS
// =============================================================================

export async function createCategoryAction(data: {
  name: string;
  description?: string;
  image?: string; // ImageKit URL
  sortOrder?: number;
  isActive?: boolean;
}) {
  try {
    return await convex.mutation(api.mutations.createCategory, data);
  } catch (error) {
    console.error("Failed to create category:", error);
    throw new Error("Failed to create category");
  }
}

export async function updateCategoryAction(categoryId: string, updates: Partial<{
  name: string;
  description: string;
  image?: string; // ImageKit URL
  isActive: boolean;
  sortOrder: number;
}>) {
  try {
    return await convex.mutation(api.mutations.updateCategory, {
      categoryId: categoryId as Id<"categories">,
      ...updates
    });
  } catch (error) {
    console.error("Failed to update category:", error);
    throw new Error("Failed to update category");
  }
}

export async function deleteCategoryAction(categoryId: string) {
  try {
    return await convex.mutation(api.mutations.deleteCategory, {
      categoryId: categoryId as Id<"categories">
    });
  } catch (error) {
    console.error("Failed to delete category:", error);
    throw new Error("Failed to delete category");
  }
}

// =============================================================================
// CART ACTIONS
// =============================================================================

export async function addToCartAction(sessionId: string, item: {
  mealId: string;
  quantity: number;
  customizations?: Customizations;
  totalPrice: number;
}) {
  try {
    // Transform the data to match the mutation expectations
    const transformedItem = {
      mealId: item.mealId as Id<"meals">,
      quantity: item.quantity,
      selectedToppings: [],
      selectedSides: [],
      selectedBeverages: [],
      totalPrice: item.totalPrice,
      specialInstructions: item.customizations?.specialInstructions
    };

    // Get existing session or create new one
    const existingSession = await convex.query(api.queries.getCartSession, { sessionId });
    const items = existingSession ? [...existingSession.items, transformedItem] : [transformedItem];

    return await convex.mutation(api.mutations.upsertCartSession, {
      sessionId,
      items
    });
  } catch (error) {
    console.error("Failed to add to cart:", error);
    throw new Error("Failed to add to cart");
  }
}

export async function clearCartAction(sessionId: string) {
  try {
    return await convex.mutation(api.mutations.clearCartSession, { sessionId });
  } catch (error) {
    console.error("Failed to clear cart:", error);
    throw new Error("Failed to clear cart");
  }
}

// =============================================================================
// PAYMENT ACTIONS
// =============================================================================

export async function processPaymentAction(orderId: string, paymentData: {
  amount: number;
  currency: string;
  paymentMethod: string;
  metadata?: PaymentMetadata;
}) {
  try {
    return await convex.action(api.actions.processPayment, {
      orderId: orderId as Id<"orders">,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      metadata: paymentData.metadata
    });
  } catch (error) {
    console.error("Failed to process payment:", error);
    throw new Error("Failed to process payment");
  }
}

// =============================================================================
// EMAIL ACTIONS
// =============================================================================

export async function sendOrderConfirmationAction(orderId: string) {
  try {
    // Get current user to get their email
    const user = await convex.query(api.queries.getCurrentUser);
    if (!user) {
      throw new Error("User not found");
    }
    return await convex.action(api.actions.sendOrderConfirmation, {
      orderId: orderId as Id<"orders">,
      userEmail: user.email
    });
  } catch (error) {
    console.error("Failed to send order confirmation:", error);
    throw new Error("Failed to send order confirmation");
  }
}

// NOTE: Password reset and welcome emails are now handled by Logto authentication
// These actions are no longer needed as Logto manages all authentication emails

// =============================================================================
// IMAGE UPLOAD ACTIONS
// =============================================================================

/**
 * Upload an image to ImageKit via the API route
 * Returns the ImageKit URL string
 */
export async function uploadImageAction(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error("Failed to upload image:", error);
    throw new Error("Failed to upload image");
  }
}

// =============================================================================
// ANALYTICS ACTIONS
// =============================================================================

export async function getAnalyticsAction(dateRange?: {
  start: number;
  end: number;
}) {
  try {
    return await convex.action(api.actions.generateAnalyticsReport, { 
      dateRange: dateRange || { start: Date.now() - 30 * 24 * 60 * 60 * 1000, end: Date.now() },
      format: "json" as const
    });
  } catch (error) {
    console.error("Failed to get analytics:", error);
    throw new Error("Failed to get analytics");
  }
}