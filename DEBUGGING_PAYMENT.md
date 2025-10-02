# 🔍 Debugging Payment Initialization Issue

## The Problem
"Redirecting to payment but nothing happens"

## What I Found & Fixed

### ✅ Fixed: Missing Parameter in createOrder Mutation
**Issue:** The `createOrder` mutation wasn't accepting `paymentReference` parameter, causing the API call to fail.

**Fixed by adding:**
```typescript
paymentReference: v.optional(v.string()), // Add payment reference parameter
```

This was causing the payment initialization to fail silently.

---

## How to Check Server Logs

### If using Coolify/Docker:
```bash
# SSH into your server
ssh your-server

# View application logs
docker logs -f <container-name> --tail 100

# Or if using Coolify
coolify logs <app-name>
```

### If using npm/node directly:
```bash
# Check the terminal where the server is running
# Look for errors in the output
```

### If using PM2:
```bash
pm2 logs fastbite --lines 100
```

---

## What to Look For in Logs

### 1. **Payment Initialization Errors**
Look for:
```
Payment initialization failed: [error details]
Failed to initialize payment
```

### 2. **Convex Errors**
Look for:
```
Error: Missing required field: paymentReference
ConvexError: Invalid argument
Mutation failed
```

### 3. **Paystack API Errors**
Look for:
```
Failed to initialize payment
Payment initialization failed
Paystack API error
```

### 4. **Missing Environment Variables**
Look for:
```
PAYSTACK_SECRET_KEY is not configured
NEXT_PUBLIC_CONVEX_URL is required
```

---

## Common Issues & Solutions

### Issue 1: "Invalid argument" error
**Cause:** The mutation doesn't accept the parameter being passed.  
**Fix:** ✅ Already fixed - added `paymentReference` to mutation args.

### Issue 2: User not authenticated
**Cause:** `requireAuth(ctx)` fails because user isn't logged in.  
**Symptoms:** 
- Error: "Authentication required"
- Order creation fails
- Nothing in console

**Check:**
```javascript
// In browser console
console.log(document.cookie); // Should see Logto session cookie
```

**Solution:**
- Make sure user is logged in before checkout
- Check Logto authentication is working
- Check cookies are being set

### Issue 3: Paystack API error
**Cause:** Invalid Paystack keys or API issue.  
**Check your .env.local:**
```bash
PAYSTACK_SECRET_KEY=sk_test_xxxxx  # Must start with sk_test_ or sk_live_
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx  # Must start with pk_test_ or pk_live_
```

**Test Paystack connection:**
```bash
curl -X GET "https://api.paystack.co/bank" \
  -H "Authorization: Bearer YOUR_SECRET_KEY"
```

Should return list of banks if key is valid.

### Issue 4: CORS or Network Error
**Symptoms:**
- Browser console shows network error
- Request fails with CORS error
- No server logs

**Check browser console:**
```javascript
// Look for:
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

---

## Step-by-Step Debugging

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try checking out
4. Look for errors

**Expected to see:**
```
POST /api/payment/initialize
Response: { success: true, authorization_url: "https://...", ... }
```

**If you see error:**
```
Failed to initialize payment
```
Then check the Network tab for the actual error response.

### Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Try checkout
3. Find the `/api/payment/initialize` request
4. Click on it
5. Check Response tab

**Successful response:**
```json
{
  "success": true,
  "authorization_url": "https://checkout.paystack.com/...",
  "reference": "order_...",
  "orderId": "..."
}
```

**Error response:**
```json
{
  "error": "Failed to initialize payment",
  "details": "Error message here"
}
```

### Step 3: Check Server Logs
Look for the actual error from your API route.

### Step 4: Test Authentication
```javascript
// In browser console
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)
```

Should return user session. If not, user isn't logged in.

---

## Quick Tests

### Test 1: Check if user is authenticated
```bash
# Browser console
console.log(document.cookie);
```
Should see cookies with "logto" in the name.

### Test 2: Test Convex connection
```bash
# Browser console
fetch('https://backend.surestrat.xyz/api/health')
  .then(r => r.json())
  .then(console.log)
```

### Test 3: Test Paystack keys
```bash
# On server
curl -X GET "https://api.paystack.co/bank" \
  -H "Authorization: Bearer sk_test_47c9fcfaee9496f4e21a3bd2c6575f626485ac0b"
```

---

## What I Fixed

1. ✅ Added `paymentReference` parameter to `createOrder` mutation
2. ✅ Updated mutation to properly store the payment reference

**This should fix the "nothing happens" issue.**

---

## Next Steps

1. **Rebuild and Deploy** (if in production):
   ```bash
   npm run build
   # Then restart your application
   ```

2. **Test locally** (if in development):
   ```bash
   npm run dev
   # Try checkout again
   ```

3. **Check logs** as described above

4. **Report back** with:
   - Browser console errors
   - Network tab response
   - Server log errors

---

## Expected Flow After Fix

1. User clicks "Complete Order" ✅
2. Toast shows "Redirecting to checkout..." ✅
3. API call to `/api/payment/initialize` ✅
4. Order created in Convex ✅
5. Paystack payment initialized ✅
6. Browser redirects to Paystack checkout page ✅
7. User completes payment ✅
8. Redirected to order confirmation ✅

---

## If Still Not Working

**Check these in order:**

1. ☑️ Is user logged in? (Check browser cookies)
2. ☑️ Are Paystack keys valid? (Test with curl)
3. ☑️ Is Convex backend accessible? (Check CONVEX_URL)
4. ☑️ Are there any console errors? (Check browser DevTools)
5. ☑️ Are there any server errors? (Check server logs)

**Then provide:**
- Browser console screenshot
- Network tab screenshot of the failed request
- Server log snippet with the error

This will help me identify the exact issue! 🎯
