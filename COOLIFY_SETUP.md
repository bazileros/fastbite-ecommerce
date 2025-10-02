# 🚀 Coolify Deployment Instructions

## Quick Fix for "No Server" Error

### The Problem
Your Coolify deployment is failing with "no server" because **`CONVEX_WEBHOOK_SIGNING_SECRET`** is not set in Coolify's environment variables.

### The Solution (2 minutes)

1. **Go to Coolify Dashboard**
2. **Click on your FastBite application**
3. **Go to "Environment Variables" tab**
4. **Click "Add Variable"**
5. **Add this variable:**
   ```
   Name: CONVEX_WEBHOOK_SIGNING_SECRET
   Value: 08f30d1a46c8abff1109fc7d03f03d8850d81e7003e1fa60210bf8329d887d8d
   ```
6. **Click "Save"**
7. **Click "Redeploy"** or push a new commit

That's it! Your deployment will work after adding this variable.

---

## Why Did This Happen?

The docker-compose.yml file has `NODE_ENV=production` hardcoded, which is correct. However, Coolify needs **all other environment variables** to be configured in its dashboard.

The app validates that `CONVEX_WEBHOOK_SIGNING_SECRET` exists at startup, and without it, the server crashes immediately.

---

## About NODE_ENV

**You tried to delete `NODE_ENV` from Coolify, but it said:**
> "Cannot delete environment variable 'NODE_ENV'. Please remove it from the Docker Compose file first."

**Don't delete NODE_ENV!** It's supposed to be there. The docker-compose.yml file correctly sets:
```yaml
environment:
  - NODE_ENV=production  # ✅ This is correct! Keep it!
  - PORT=3000
```

Leave `NODE_ENV=production` in the docker-compose.yml file. It's not causing any issues.

---

## Complete Environment Variables for Coolify

Add **ALL** of these to Coolify Environment Variables (not in docker-compose):

```bash
# Convex (Self-Hosted) - ALL REQUIRED!
NEXT_PUBLIC_CONVEX_URL=https://backend.usa-solarenergy.com
CONVEX_SELF_HOSTED_URL=https://backend.usa-solarenergy.com
CONVEX_SELF_HOSTED_ADMIN_KEY=self-hosted-convex|013b2cd03edc119d96b709d14b3b24574e4331e3ba1d07c0d6018028a05bdbcc16be054f8dbb9b2a861900868ebf97445f
CONVEX_WEBHOOK_SIGNING_SECRET=08f30d1a46c8abff1109fc7d03f03d8850d81e7003e1fa60210bf8329d887d8d

# Logto Authentication
LOGTO_ENDPOINT=https://auth.usa-solarenergy.com/
LOGTO_APP_ID=0rwfvi2s56fndzox8t694
LOGTO_APP_SECRET=DaumoBvbbNTQTpdgLZGRmi7hbfv0jzBz
LOGTO_COOKIE_SECRET=3TfkgBqmOkTPKJkZaeVbT1rPXcfyEqRW
LOGTO_APP_ISSUER_ENDPOINT=https://auth.usa-solarenergy.com/oidc
LOGTO_APP_JWTS_URL=https://auth.usa-solarenergy.com/oidc/jwks

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_chL4cwbAnaQlvwUplonD2jcqupE=
IMAGEKIT_PRIVATE_KEY=private_tyS8YbUg5ZpFmyYs5NHajTUBLmU=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/dk0ns8gjx/fastbite/

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_25b93cd12fbcad465754264275b6a1426d75baa2
PAYSTACK_SECRET_KEY=sk_test_47c9fcfaee9496f4e21a3bd2c6575f626485ac0b

# Email
SMTP_HOST=mail.surestrat.co.za
SMTP_PORT=587
SMTP_USER=noreply@surestrat.co.za
SMTP_PASS=Z@lisile0611stuli
FROM_EMAIL=noreply@surestrat.co.za
FROM_NAME=FastBite Restaurant

# Application (update with your actual domain)
NEXT_PUBLIC_BASE_URL=https://your-actual-domain.com
NEXT_PUBLIC_APP_NAME=FastBite
NEXT_PUBLIC_APP_DESCRIPTION=Delicious Meals Delivered Fast
NEXT_TELEMETRY_DISABLED=1
```

---

## How to Add Multiple Variables in Coolify

### Option 1: One by One (Slow but Safe)
1. Click "Add Variable"
2. Enter name and value
3. Click "Save"
4. Repeat for each variable

### Option 2: Bulk Import (Faster)
1. Look for "Import from .env" or "Bulk Add" button
2. Paste all variables at once
3. Click "Save"

---

## After Adding Variables

1. **Redeploy** the application (click "Redeploy" button)
2. **Wait 2-5 minutes** for build to complete
3. **Check logs** for successful startup
4. **Test health endpoint:**
   ```bash
   curl https://your-domain.com/api/health
   ```
   Expected: `{"status":"ok"}`

---

## Verification Steps

### 1. Check Coolify Logs
Look for this SUCCESS message:
```
▲ Next.js 15.5.3
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

### 2. Check Environment Variables are Set
In Coolify logs, you should see the build process complete without errors about missing environment variables.

### 3. Test the Application
```bash
# Health check
curl https://your-domain.com/api/health

# Homepage
curl https://your-domain.com
```

---

## Common Mistakes

❌ **Trying to delete NODE_ENV** - Don't do this! It's supposed to be in docker-compose.yml

❌ **Not adding CONVEX_WEBHOOK_SIGNING_SECRET** - This is the #1 cause of the "no server" error

❌ **Adding variables to docker-compose.yml instead of Coolify** - Environment variables should be in Coolify's dashboard, not in docker-compose.yml

❌ **Using localhost URLs in production** - Make sure NEXT_PUBLIC_BASE_URL uses your actual domain

---

## Still Having Issues?

If the deployment still fails after adding `CONVEX_WEBHOOK_SIGNING_SECRET`:

1. **Check Coolify logs** for the specific error message
2. **Verify all environment variables** are set (no typos)
3. **Test external services** are accessible:
   ```bash
   curl https://backend.usa-solarenergy.com
   curl https://auth.usa-solarenergy.com/.well-known/openid-configuration
   ```
4. **Share the Coolify logs** (last 50 lines) for further debugging

---

## Summary

✅ **Keep `NODE_ENV=production` in docker-compose.yml**  
✅ **Add `CONVEX_WEBHOOK_SIGNING_SECRET` to Coolify environment variables**  
✅ **Add all other secrets to Coolify environment variables**  
✅ **Redeploy and test**  

That's all you need to do! 🎉
