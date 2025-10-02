# 🚨 NO SERVER ERROR - TROUBLESHOOTING GUIDE

## Current Situation

You're still seeing "no server" after deployment. This means the container is starting but the Node.js server is crashing.

## Most Likely Causes (in order of probability)

### 1. ⚠️ Missing `CONVEX_WEBHOOK_SIGNING_SECRET` in Coolify
**This is 90% likely the issue!**

**Check:** Go to Coolify → Your FastBite App → Environment Variables

**Look for:** `CONVEX_WEBHOOK_SIGNING_SECRET`

**If it's missing, add it:**
```
CONVEX_WEBHOOK_SIGNING_SECRET=08f30d1a46c8abff1109fc7d03f03d8850d81e7003e1fa60210bf8329d887d8d
```

Then **redeploy** the application.

---

### 2. 🔍 How to Check Coolify Logs

1. **Go to Coolify Dashboard**
2. **Select your FastBite application**
3. **Click on "Logs" tab**
4. **Look for error messages**, especially:
   - `Environment variable CONVEX_WEBHOOK_SIGNING_SECRET is required`
   - `NEXT_PUBLIC_CONVEX_URL is required`
   - `ECONNREFUSED` (connection refused)
   - `fetch failed` (network issues)

---

### 3. 📋 Complete Environment Variables Checklist

**Copy this entire list to Coolify Environment Variables:**

```bash
# ============= APPLICATION =============
NODE_ENV=production
PORT=3000
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com
NEXT_PUBLIC_APP_NAME=FastBite
NEXT_PUBLIC_APP_DESCRIPTION=Delicious Meals Delivered Fast

# ============= CONVEX (CRITICAL!) =============
NEXT_PUBLIC_CONVEX_URL=https://backend.usa-solarenergy.com
CONVEX_SELF_HOSTED_URL=https://backend.usa-solarenergy.com
CONVEX_SELF_HOSTED_ADMIN_KEY=self-hosted-convex|013b2cd03edc119d96b709d14b3b24574e4331e3ba1d07c0d6018028a05bdbcc16be054f8dbb9b2a861900868ebf97445f
CONVEX_WEBHOOK_SIGNING_SECRET=08f30d1a46c8abff1109fc7d03f03d8850d81e7003e1fa60210bf8329d887d8d

# ============= LOGTO =============
LOGTO_ENDPOINT=https://auth.usa-solarenergy.com/
LOGTO_APP_ID=0rwfvi2s56fndzox8t694
LOGTO_APP_SECRET=DaumoBvbbNTQTpdgLZGRmi7hbfv0jzBz
LOGTO_COOKIE_SECRET=3TfkgBqmOkTPKJkZaeVbT1rPXcfyEqRW
LOGTO_APP_ISSUER_ENDPOINT=https://auth.usa-solarenergy.com/oidc
LOGTO_APP_JWTS_URL=https://auth.usa-solarenergy.com/oidc/jwks

# ============= IMAGEKIT =============
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_chL4cwbAnaQlvwUplonD2jcqupE=
IMAGEKIT_PRIVATE_KEY=private_tyS8YbUg5ZpFmyYs5NHajTUBLmU=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/dk0ns8gjx/fastbite/

# ============= PAYSTACK =============
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_25b93cd12fbcad465754264275b6a1426d75baa2
PAYSTACK_SECRET_KEY=sk_test_47c9fcfaee9496f4e21a3bd2c6575f626485ac0b

# ============= EMAIL =============
SMTP_HOST=mail.surestrat.co.za
SMTP_PORT=587
SMTP_USER=noreply@surestrat.co.za
SMTP_PASS=Z@lisile0611stuli
FROM_EMAIL=noreply@surestrat.co.za
FROM_NAME=FastBite Restaurant
```

---

### 4. 🐳 Debug Commands (Run on Coolify Server via SSH)

If you have SSH access to your Coolify server:

```bash
# Download and run the debug script
curl -O https://raw.githubusercontent.com/bazileros/fastbite-ecommerce/main/debug-coolify.sh
chmod +x debug-coolify.sh
./debug-coolify.sh
```

Or run these commands individually:

```bash
# Find your container
docker ps -a | grep fastbite

# Check container logs (replace CONTAINER_ID with actual ID)
docker logs --tail 100 CONTAINER_ID

# Check if environment variables are set
docker exec CONTAINER_ID printenv | grep CONVEX

# Check if server.js exists
docker exec CONTAINER_ID ls -la /app/server.js

# Test health endpoint from inside container
docker exec CONTAINER_ID wget -qO- http://localhost:3000/api/health

# Check running processes
docker exec CONTAINER_ID ps aux
```

---

### 5. 🧪 Test External Services

Verify that your backend services are accessible:

```bash
# Test Convex backend
curl https://backend.usa-solarenergy.com

# Test Logto authentication
curl https://auth.usa-solarenergy.com/.well-known/openid-configuration

# Test ImageKit
curl https://ik.imagekit.io/dk0ns8gjx/fastbite/
```

If any of these fail, your server won't be able to connect to them.

---

## 🎯 Action Plan

### Step 1: Check Coolify Environment Variables (5 minutes)

1. Go to Coolify Dashboard
2. Find FastBite app
3. Go to Environment Variables
4. **Verify these 4 critical variables exist:**
   - `NEXT_PUBLIC_CONVEX_URL`
   - `CONVEX_SELF_HOSTED_URL`
   - `CONVEX_SELF_HOSTED_ADMIN_KEY`
   - `CONVEX_WEBHOOK_SIGNING_SECRET` ⚠️ **Most likely missing!**

### Step 2: Add Missing Variables

If `CONVEX_WEBHOOK_SIGNING_SECRET` is missing:

1. Click "Add Variable"
2. Name: `CONVEX_WEBHOOK_SIGNING_SECRET`
3. Value: `08f30d1a46c8abff1109fc7d03f03d8850d81e7003e1fa60210bf8329d887d8d`
4. Save

### Step 3: Redeploy

1. Click "Redeploy" button in Coolify, OR
2. Push a new commit to trigger auto-deploy

### Step 4: Check Logs (wait 2-5 minutes for build)

1. Go to Logs tab
2. Watch for errors
3. Look for successful startup message

### Step 5: Test

Once deployed, test the health endpoint:

```bash
curl https://your-domain.com/api/health
```

**Expected response:** `{"status":"ok"}`

---

## 📊 What the Logs Will Tell You

### ✅ Success Logs (What you WANT to see):

```
▲ Next.js 15.5.3
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

### ❌ Error Logs (What you DON'T want to see):

**Missing env var:**
```
Error: Environment variable CONVEX_WEBHOOK_SIGNING_SECRET is required but not set
```
**Solution:** Add the variable to Coolify

**Connection error:**
```
Error: fetch failed
cause: Error: connect ECONNREFUSED
```
**Solution:** Check if your Convex/Logto backends are accessible

---

## 🆘 Still Not Working?

If you've added all environment variables and it's still not working:

1. **Share the Coolify logs** (last 50 lines)
2. **Run the debug script** and share the output
3. **Check if DNS is pointing to the correct server**
4. **Verify SSL certificate is properly configured**

---

## 📝 Quick Reference

**Health Endpoint:** `https://your-domain.com/api/health`

**Expected Response:** `{"status":"ok"}`

**Critical Env Vars:**
- `CONVEX_WEBHOOK_SIGNING_SECRET` ← **ADD THIS!**
- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_SELF_HOSTED_URL`
- `CONVEX_SELF_HOSTED_ADMIN_KEY`

**Coolify Logs Location:** Dashboard → Your App → Logs Tab

---

## 💡 Pro Tip

After adding `CONVEX_WEBHOOK_SIGNING_SECRET`, the deployment should work immediately. This is the **#1 reason** for the "no server" error in your case.

The variable is **required** by your app's environment validation at startup and without it, the server crashes before it can serve any requests.
