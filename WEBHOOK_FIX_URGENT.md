# 🚨 URGENT FIX REQUIRED - Paystack Webhook URL

## The Problem

Your webhook URL in Paystack dashboard is **WRONG**.

**Current URL (❌ WRONG):**
```
https://shop.surestrat.xyz/api/paystack/webhook
```

**Correct URL (✅ NEEDED):**
```
https://shop.surestrat.xyz/api/payments/webhook
```

---

## Why This Matters

- Payments succeed in Paystack ✅
- But Paystack sends webhook to wrong URL ❌
- Your webhook handler never receives the event ❌
- Orders stay "pending" forever ❌
- Users pay but orders never confirm ❌

---

## How to Fix (5 minutes)

### Step 1: Login to Paystack
Go to: https://dashboard.paystack.com

### Step 2: Navigate to Webhooks
Click: **Settings** → **API Keys & Webhooks**

### Step 3: Update Webhook URL
Find the "Webhook URL" field and change it to:
```
https://shop.surestrat.xyz/api/payments/webhook
```

### Step 4: Save
Click the **Save** button

### Step 5: Test
Click **Test Webhook** button to verify it works

---

## Verification

After saving, you should see in Paystack:
- ✅ Webhook Status: Active
- ✅ Test webhook returns: 200 OK

In your server logs after a test payment:
```
Received Paystack webhook: charge.success
Processing successful payment for order xxx, reference: yyy
✅ Successfully processed payment for order xxx
```

---

## What Happens After Fix

1. User completes payment ✅
2. Paystack sends webhook to CORRECT URL ✅
3. Your server receives webhook ✅
4. Order status updates to "confirmed" ✅
5. Payment status updates to "paid" ✅
6. Everything works perfectly ✅

---

## This is the ONLY thing broken!

Everything else has been fixed:
- ✅ Payment verification working
- ✅ Order confirmation page working
- ✅ Database schema updated
- ✅ All code ready

Just need to **change one URL in Paystack dashboard**.

---

**⏰ Do this now! Takes 5 minutes.**
