# 🚨 DEPLOYMENT FIX REQUIRED 🚨

## Root Cause: Missing Critical Environment Variable

Your deployment is failing because **`CONVEX_WEBHOOK_SIGNING_SECRET`** is missing. This is a **REQUIRED** environment variable that your app checks at startup.

## Location of the Check

File: `lib/env-validation.ts` (line 26)
```typescript
const convexEnvConfig: EnvConfig = {
  required: [
    'NEXT_PUBLIC_CONVEX_URL',
    'CONVEX_WEBHOOK_SIGNING_SECRET',  // ← This is REQUIRED!
  ],
  // ...
};
```

File: `convex/http.ts` (line 39-41)
```typescript
const webhookSecret = process.env.CONVEX_WEBHOOK_SIGNING_SECRET;
if (!webhookSecret) {
  console.error("CONVEX_WEBHOOK_SIGNING_SECRET environment variable not set");
  // Server likely crashes here
}
```

## Immediate Action Required

### Step 1: Generate the Secret

Run this command to generate a secure random secret:

```bash
openssl rand -hex 32
```

Example output: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0`

### Step 2: Add to Coolify

Go to your Coolify dashboard and add this environment variable:

```bash
CONVEX_WEBHOOK_SIGNING_SECRET=<paste-the-generated-secret-here>
```

### Step 3: Add to Your Local `.env.local` (For Testing)

Add this line to your `.env.local` file:

```bash
CONVEX_WEBHOOK_SIGNING_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

## Complete Environment Variable List for Coolify

Here's the **COMPLETE** list of environment variables you need in Coolify:

```bash
# Application
NODE_ENV=production
PORT=3000
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com
NEXT_PUBLIC_APP_NAME=FastBite
NEXT_PUBLIC_APP_DESCRIPTION=Delicious Meals Delivered Fast

# Convex (Self-Hosted) - ALL THREE ARE REQUIRED!
NEXT_PUBLIC_CONVEX_URL=https://backend.usa-solarenergy.com
CONVEX_SELF_HOSTED_URL=https://backend.usa-solarenergy.com
CONVEX_SELF_HOSTED_ADMIN_KEY=self-hosted-convex|013b2cd03edc119d96b709d14b3b24574e4331e3ba1d07c0d6018028a05bdbcc16be054f8dbb9b2a861900868ebf97445f
CONVEX_WEBHOOK_SIGNING_SECRET=<generate-using-openssl-rand>

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

# Email (SMTP)
SMTP_HOST=mail.surestrat.co.za
SMTP_PORT=587
SMTP_USER=noreply@surestrat.co.za
SMTP_PASS=Z@lisile0611stuli
FROM_EMAIL=noreply@surestrat.co.za
FROM_NAME=FastBite Restaurant
```

## Why Your Deployment Was Failing

1. **Server starts** → Docker container builds successfully ✅
2. **Next.js initializes** → Begins loading your app code ✅
3. **Environment validation runs** → Checks for `CONVEX_WEBHOOK_SIGNING_SECRET` ❌
4. **Validation fails** → Throws error: "Environment variable CONVEX_WEBHOOK_SIGNING_SECRET is required but not set"
5. **Server crashes** → You see "no server" error

## After Adding the Variable

Once you add `CONVEX_WEBHOOK_SIGNING_SECRET` to Coolify:

1. Coolify will automatically trigger a rebuild
2. The build will succeed (same as before)
3. The server will start **AND STAY RUNNING** ✅
4. You'll be able to access your application

## Verification Steps

After deployment:

```bash
# 1. Check health endpoint
curl https://your-domain.com/api/health

# Should return: {"status": "ok"}

# 2. Check if homepage loads
curl https://your-domain.com

# Should return HTML content
```

## Need Help?

If you still see issues after adding the variable:

1. Check Coolify logs for the exact error message
2. Verify all environment variables are set (no typos)
3. Ensure your domain DNS is pointing to the Coolify server
4. Check if SSL certificate is properly configured

---

**Next Steps:**
1. ✅ Generate `CONVEX_WEBHOOK_SIGNING_SECRET` using `openssl rand -hex 32`
2. ✅ Add it to Coolify environment variables
3. ✅ Redeploy your application
4. ✅ Test the deployment
