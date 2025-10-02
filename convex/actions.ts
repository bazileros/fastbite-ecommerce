import { v } from 'convex/values';

import { api } from './_generated/api';
import { action } from './_generated/server';
import {
  hasPermissionFromJWT,
  ROLE_PERMISSIONS,
} from './permissions';

// Extend the identity type to include Logto-specific claims
interface LogtoIdentity {
  subject: string;
  email?: string;
  name?: string;
  roles?: string[];
  permissions?: string[];
  picture?: string;
  [key: string]: unknown;
}

// Type definitions
type AnalyticsReportResult = {
  format: "json" | "csv";
  data: Record<string, unknown> | string;
  filename?: string;
};

type Order = {
  userId: string;
  paymentStatus: string;
  total: number;
  paymentMethod?: string;
};

type RefundResponse = {
  status: boolean;
  data?: {
    id: string;
  };
  message?: string;
};

// =============================================================================
// EMAIL ACTIONS
// =============================================================================

// Send order confirmation email
export const sendOrderConfirmation = action({
  args: {
    orderId: v.id("orders"),
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Get order details
    const order = await ctx.runQuery(api.queries.getOrder, { orderId: args.orderId });

    // Send email via API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: args.userEmail,
        subject: `Order Confirmation #${args.orderId}`,
        template: "order-confirmation",
        data: { order },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return { success: true };
  },
});

// Send role change notification
export const sendRoleChangeNotification = action({
  args: {
    userId: v.id("users"),
    newRole: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user details
    const user = await ctx.runQuery(api.queries.getUser, { userId: args.userId });
    if (!user.email) {
      throw new Error("User email is required for role change notification");
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: user.email,
        subject: "Your Role Has Been Updated",
        template: "role-change",
        data: {
          userName: user.name,
          newRole: args.newRole,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return { success: true };
  },
});



// =============================================================================
// PAYMENT ACTIONS
// =============================================================================

// Process payment with Paystack
export const processPayment = action({
  args: {
    orderId: v.id("orders"),
    amount: v.number(),
    paymentMethod: v.string(),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    paymentUrl?: string;
    reference?: string;
  }> => {
    try {
      // Get user email for Paystack
      const order = await ctx.runQuery(api.queries.getOrder, { orderId: args.orderId });
      const user = await ctx.runQuery(api.queries.getUser, { userId: order.userId });
      if (!user.email) {
        throw new Error("User email is required for payment processing");
      }

      // Initialize Paystack payment via API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'initialize',
          amount: args.amount,
          orderId: args.orderId,
          email: user.email,
          metadata: args.metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize payment');
      }

      const paystackResponse = await response.json();

      if (paystackResponse.status) {
        // Update order with payment reference
        await ctx.runMutation(api.mutations.updateOrderPaymentStatus, {
          orderId: args.orderId,
          status: "pending",
        });

        return {
          success: true,
          paymentUrl: paystackResponse.data.authorization_url,
          reference: paystackResponse.data.reference,
        };
      } else {
        throw new Error(paystackResponse.message);
      }
    } catch (error) {
      console.error("Payment processing failed:", error);

      // Update order payment status to failed
      await ctx.runMutation(api.mutations.updateOrderPaymentStatus, {
        orderId: args.orderId,
        status: "failed",
      });

      throw new Error("Payment processing failed");
    }
  },
});

// Verify payment status
export const verifyPayment = action({
  args: {
    reference: v.string(),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          reference: args.reference,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      const verification = await response.json();

      if (verification.status && verification.data.status === "success") {
        // Update order payment status
        await ctx.runMutation(api.mutations.updateOrderPaymentStatus, {
          orderId: args.orderId,
          status: "paid",
          transactionId: args.reference,
        });

        // Update order status to confirmed
        await ctx.runMutation(api.mutations.updateOrderStatus, {
          orderId: args.orderId,
          status: "confirmed",
        });

        // Send confirmation email
        const order = await ctx.runQuery(api.queries.getOrder, { orderId: args.orderId });
        // Get user email from the order's userId
        const user = await ctx.runQuery(api.queries.getUser, { userId: order.userId });
        if (!user.email) {
          throw new Error("User email is required for order confirmation");
        }
        await ctx.runAction(api.actions.sendOrderConfirmation, {
          orderId: args.orderId,
          userEmail: user.email,
        });

        return { success: true, status: "paid" };
      } else {
        await ctx.runMutation(api.mutations.updateOrderPaymentStatus, {
          orderId: args.orderId,
          status: "failed",
        });

        return { success: false, status: "failed" };
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
      throw new Error("Payment verification failed");
    }
  },
});

// Process refund
export const processRefund = action({
  args: {
    orderId: v.id("orders"),
    amount: v.optional(v.number()),
    reason: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    refundId?: string;
  }> => {
    // Get current user
    const user = await ctx.runQuery(api.queries.getCurrentUser);
    if (!user || !hasPermissionFromJWT(user.permissions || [], 'orders:refund')) {
      throw new Error("Insufficient permissions to process refunds");
    }

    try {
      // Get order details
      const order: Order = await ctx.runQuery(api.queries.getOrder, { orderId: args.orderId });

      if (order.paymentStatus !== "paid") {
        throw new Error("Can only refund paid orders");
      }

      // Process refund with Paystack via API
      const refundAmount = args.amount || order.total;
      const response: Response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'refund',
          transactionId: order.paymentMethod || '',
          amount: refundAmount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      const refund: RefundResponse = await response.json();

      if (refund.status) {
        // Update order payment status
        await ctx.runMutation(api.mutations.updateOrderPaymentStatus, {
          orderId: args.orderId,
          status: "refunded",
        });

        // Log the refund action
        await ctx.runMutation(api.mutations.createAuditLog, {
          action: "PROCESS_REFUND",
          resource: "orders",
          resourceId: args.orderId,
          details: {
            amount: refundAmount,
            reason: args.reason,
            refundId: refund.data?.id,
          },
        });

        return { success: true, refundId: refund.data?.id };
      } else {
        throw new Error(refund.message);
      }
    } catch (error) {
      console.error("Refund processing failed:", error);
      throw new Error("Refund processing failed");
    }
  },
});

// =============================================================================
// IMAGE UPLOAD ACTIONS (ImageKit)
// =============================================================================

// Upload image to ImageKit (placeholder - actual upload handled by frontend)
export const uploadImage = action({
  args: {
    imageUrl: v.string(),
    fileName: v.string(),
  },
  handler: async (_ctx, args): Promise<{ success: boolean; imageUrl: string }> => {
    // Since we're using ImageKit, images are uploaded directly from the frontend
    // This action just validates and returns the ImageKit URL
    return { success: true, imageUrl: args.imageUrl };
  },
});

// =============================================================================
// UTILITY ACTIONS
// =============================================================================

// Clean up expired cart sessions
// TODO: Implement as a scheduled function or mutation
// export const cleanupExpiredSessions = action({
//   handler: async (ctx) => {
//     // This would need to be implemented as a mutation since actions can't query directly
//   },
// });

// Generate analytics report
export const generateAnalyticsReport = action({
  args: {
    dateRange: v.object({
      start: v.number(),
      end: v.number(),
    }),
    format: v.union(v.literal("json"), v.literal("csv")),
  },
  handler: async (ctx, args): Promise<AnalyticsReportResult> => {
    // Get current user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Extract claims from identity
    const claims = {
      sub: identity.subject,
      email: identity.email,
      name: identity.name,
      roles: (identity as LogtoIdentity).roles || [],
      picture: (identity as LogtoIdentity).picture,
    };

    // Check permissions using the claims
    const roles = claims.roles || [];
    const primaryRole = Array.isArray(roles) && roles.length > 0 ? roles[0] : 'customer';
    const rolePermissions = ROLE_PERMISSIONS[primaryRole as keyof typeof ROLE_PERMISSIONS] || ROLE_PERMISSIONS.customer;
    const permissions: string[] = [];
    if (rolePermissions.canViewAnalytics) permissions.push('analytics:read');
    if (rolePermissions.canExportReports) permissions.push('analytics:export');

    if (!hasPermissionFromJWT(permissions, 'analytics:export')) {
      throw new Error("Insufficient permissions to export reports");
    }

    // Get analytics data
    const analytics: Record<string, unknown> = await ctx.runQuery(api.queries.getAnalytics, {
      claims,
      dateRange: args.dateRange,
    });

    if (args.format === "csv") {
      // Convert to CSV format
      const csvData = convertAnalyticsToCSV(analytics);
      return {
        format: "csv",
        data: csvData,
        filename: `analytics-${args.dateRange.start}-${args.dateRange.end}.csv`,
      };
    }

    return {
      format: "json",
      data: analytics,
    };
  },
});

// Convert analytics to CSV
function convertAnalyticsToCSV(analytics: Record<string, unknown>): string {
  const headers = [
    "Metric",
    "Value"
  ];

  const rows = [
    ["Total Orders", analytics.totalOrders],
    ["Total Revenue", `R${(analytics.totalRevenue as number).toFixed(2)}`],
    ["Completed Orders", analytics.completedOrders],
    ["Total Users", analytics.totalUsers],
    ["Active Meals", analytics.activeMeals],
    ["Average Order Value", `R${(analytics.averageOrderValue as number).toFixed(2)}`],
  ];

  // Add status breakdown
  const statusBreakdown = analytics.statusBreakdown as Record<string, number>;
  Object.entries(statusBreakdown).forEach(([status, count]) => {
    rows.push([`Status: ${status}`, count]);
  });

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  return csvContent;
}