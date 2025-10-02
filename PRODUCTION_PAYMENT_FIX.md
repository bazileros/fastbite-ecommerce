# Production Payment Issue - Diagnosis & Fix

**Date**: October 2, 2025  
**Status**: ⚠️ Issues Identified - Action Required  
**Environment**: Production (https://shop.surestrat.xyz)

---

## 🔴 Critical Issues Identified

### Issue #1: Webhook URL Mismatch ❌

**Problem:**
- **Your Paystack Webhook URL**: `https://shop.surestrat.xyz/api/paystack/webhook`
- **Actual Code Endpoint**: `https://shop.surestrat.xyz/api/payments/webhook`
- **Result**: Paystack is sending webhooks to wrong endpoint, so orders never get confirmed

**Impact**: 
- Payments succeed in Paystack ✅
- But orders in database stay "pending" ❌
- Webhook never fires, so order status never updates ❌

**Fix Required:**
1. Go to Paystack Dashboard → Settings → Webhooks
2. Update webhook URL to: `https://shop.surestrat.xyz/api/payments/webhook`
3. Save changes

---

### Issue #2: Order Confirmation Page Not Verifying Payment ❌

**Problem:**
- The `/order-confirmation` page shows hardcoded mock data
- It doesn't verify payment with Paystack
- It doesn't fetch real order details from Convex
- Users see fake data instead of their actual order

**Impact**:
- Users see "success" but with wrong order details
- No validation that payment actually succeeded
- Cannot track real order status

**Fix Applied:**
- ✅ Updated order-confirmation page to verify payment via `/api/payment/verify`
- ✅ Added loading states while verifying
- ✅ Added error handling for failed verification
- ✅ Shows real order data (when available)
- ⚠️ Still needs Convex query to fetch complete order details

---

### Issue #3: Missing Order Fetch After Payment ⚠️

**Problem:**
- After payment verification, we don't fetch the full order details from Convex
- The order-confirmation page can't show order items, customizations, etc.

**Fix Needed:**
Create a Convex query to fetch order by payment reference or orderId

---

## 🔧 Fixes Applied

### 1. Updated Order Confirmation Page ✅

**File**: `app/(storefront)/order-confirmation/page.tsx`

**Changes:**
- Added payment verification on page load
- Uses Paystack reference from URL query parameter
- Calls `/api/payment/verify` to confirm payment
- Shows loading state while verifying
- Shows error state if verification fails
- Displays real order data (partial - needs Convex integration)

**User Flow Now:**
1. User completes payment on Paystack ✅
2. Redirected to `/order-confirmation?reference=xxx` ✅
3. Page verifies payment with Paystack ✅
4. Shows loading spinner while verifying ✅
5. On success: Shows order details ✅
6. On failure: Shows error with helpful message ✅

---

## 📋 Required Actions

### CRITICAL - Fix Webhook URL (5 minutes)

**Steps:**
1. Login to Paystack Dashboard: https://dashboard.paystack.com
2. Navigate to: **Settings** → **API Keys & Webhooks**
3. Scroll to **Webhook URL** section
4. Update URL to: `https://shop.surestrat.xyz/api/payments/webhook`
5. Click **Save**
6. Click **Test Webhook** to verify it works

**Verification:**
After saving, test a payment and check:
- Server logs should show: `"Received Paystack webhook: charge.success"`
- Order status in database should update to "confirmed"
- Order payment status should update to "paid"

---

### IMPORTANT - Create Order Fetch Query (30 minutes)

**What's Needed:**
Create a Convex query to fetch order details after payment verification.

**File to Create**: `convex/queries.ts` (or add to existing queries)

**Add this query:**
```typescript
export const getOrderByReference = query({
  args: {
    reference: v.string(),
  },
  handler: async (ctx, { reference }) => {
    // Find order by payment reference
    // Note: You'll need to store the reference in the order when creating it
    const order = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("paymentReference"), reference))
      .first();
    
    if (!order) {
      return null;
    }

    // Fetch related data (meals, user, etc.)
    const items = await Promise.all(
      order.items.map(async (item) => {
        const meal = await ctx.db.get(item.mealId);
        return {
          ...item,
          meal: meal ? {
            name: meal.name,
            image: meal.image,
          } : null,
        };
      })
    );

    return {
      ...order,
      items,
    };
  },
});
```

**Then update**: `app/(storefront)/order-confirmation/page.tsx`

Add this after payment verification:
```typescript
// Fetch order details from Convex
const orderResponse = await fetch('/api/orders/by-reference', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ reference }),
});

if (orderResponse.ok) {
  const order = await orderResponse.json();
  setOrderDetails(order);
}
```

---

### RECOMMENDED - Add Payment Reference to Orders (15 minutes)

**Why:**
Currently, orders don't store the Paystack payment reference, making it hard to look them up after payment.

**File to Update**: `app/api/payment/initialize/route.ts`

**Change:**
When creating order in Convex, add the reference:

```typescript
const orderId = await convex.mutation(api.mutations.createOrder, {
  items: items.map((item: CartItem) => ({
    // ... existing fields
  })),
  total: amount,
  paymentReference: reference, // ADD THIS
  // ... rest of fields
});
```

**Also Update Schema**: `convex/schema.ts`

Add to orders table:
```typescript
orders: defineTable({
  // ... existing fields
  paymentReference: v.optional(v.string()),
  // ... rest
}),
```

---

## 🧪 Testing Checklist

After applying fixes, test this flow:

### Test Payment Flow
- [ ] Go to checkout page
- [ ] Fill in customer details
- [ ] Click "Complete Order"
- [ ] Redirected to Paystack payment page
- [ ] Enter test card details:
  ```
  Card: 5531886652142950
  CVV: 564
  Expiry: 10/30
  OTP: 123456
  ```
- [ ] Click "Pay"
- [ ] Should redirect to `/order-confirmation?reference=xxx`

### Verify Order Confirmation Page
- [ ] Shows loading spinner initially
- [ ] Then shows "Payment verified successfully" toast
- [ ] Displays correct order number
- [ ] Shows correct total amount
- [ ] Shows order items (once Convex query added)
- [ ] Shows order status tracking

### Verify Backend
- [ ] Check server logs for webhook: `"Received Paystack webhook: charge.success"`
- [ ] Check Convex database - order status should be "confirmed"
- [ ] Check Convex database - payment status should be "paid"
- [ ] Check order has transaction ID stored

### Verify Webhook
- [ ] Go to Paystack Dashboard → Transactions
- [ ] Click on test transaction
- [ ] Scroll to "Webhooks" section
- [ ] Should show "200 OK" response from your webhook

---

## 🐛 Debugging

### If Webhook Still Not Firing

**Check Paystack Dashboard:**
1. Go to: Settings → Webhooks
2. Verify URL is: `https://shop.surestrat.xyz/api/payments/webhook`
3. Check "Webhook Logs" for delivery attempts
4. Look for error messages

**Check Server Logs:**
```bash
# If you have SSH access to production
# Check application logs for webhook events
tail -f /var/log/your-app/app.log | grep webhook
```

**Test Webhook Manually:**
```bash
# Send test webhook to your production endpoint
curl -X POST https://shop.surestrat.xyz/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: test-signature" \
  -d '{"event":"charge.success","data":{"reference":"test"}}'
```

### If Order Confirmation Shows Error

**Check Browser Console:**
- Look for errors in Network tab
- Check if `/api/payment/verify` returns 200
- Verify response contains expected data

**Check API Response:**
```bash
# Test verify endpoint
curl -X POST https://shop.surestrat.xyz/api/payment/verify \
  -H "Content-Type: application/json" \
  -d '{"reference":"your_reference_here"}'
```

---

## 📊 Environment Variables Check

Verify these are set in production:

```bash
# Required for payments
PAYSTACK_SECRET_KEY=sk_live_xxxxx  # Must be LIVE key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
NEXT_PUBLIC_BASE_URL=https://shop.surestrat.xyz

# Required for Convex
NEXT_PUBLIC_CONVEX_URL=https://backend.usa-solarenergy.com
```

**To check (if you have access):**
```bash
# SSH into production server
env | grep PAYSTACK
env | grep CONVEX
```

---

## 📈 Success Metrics

After fixes are deployed, you should see:

- ✅ Webhook success rate: 100% (check Paystack dashboard)
- ✅ Orders automatically confirmed after payment
- ✅ Payment verification on order-confirmation page
- ✅ Real order data displayed to users
- ✅ No more "payment succeeded but nothing happened"

---

## 🔗 Related Files

**Modified:**
- `app/(storefront)/order-confirmation/page.tsx` ✅

**Need to Update:**
- `convex/queries.ts` - Add getOrderByReference query
- `convex/schema.ts` - Add paymentReference field
- `app/api/payment/initialize/route.ts` - Store payment reference

**Working Correctly:**
- `app/api/payments/webhook/route.ts` ✅
- `app/api/payment/verify/route.ts` ✅
- `app/api/payment/initialize/route.ts` ✅

---

## 🆘 Support

**Paystack Webhook Issues:**
- Docs: https://paystack.com/docs/payments/webhooks
- Support: support@paystack.com

**Convex Issues:**
- Docs: https://docs.convex.dev
- Discord: https://convex.dev/community

**Next.js Issues:**
- Docs: https://nextjs.org/docs

---

## ✅ Summary

**Main Problem:** Webhook URL mismatch causing orders to never get confirmed.

**Quick Fix (5 min):** Update Paystack webhook URL to `/api/payments/webhook`

**Complete Fix (1 hour):**
1. Update webhook URL ✅
2. Add Convex query for order fetching
3. Store payment reference in orders
4. Test complete payment flow

**Current Status:**
- Payment verification on order-confirmation page ✅
- Still need to fetch full order details from Convex ⚠️
- Webhook URL needs to be fixed in Paystack dashboard ❌

---

**Questions?** Check the debugging section or review server logs for more details.
