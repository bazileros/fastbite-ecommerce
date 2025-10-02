# Coolify Deployment Checklist for FastBite

## Critical Environment Variables for Self-Hosted Setup

**IMPORTANT**: Your deployment is failing because these environment variables are missing in Coolify. The server starts but immediately crashes when it can't connect to Convex.

### Required Environment Variables (Copy these to Coolify)

```bash
# =============================================================================
# APPLICATION
# =============================================================================
NODE_ENV=production
PORT=3000
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=FastBite
NEXT_PUBLIC_APP_DESCRIPTION=Delicious Meals Delivered Fast

# =============================================================================
# CONVEX (SELF-HOSTED) - CRITICAL!
# =============================================================================
NEXT_PUBLIC_CONVEX_URL=https://backend.usa-solarenergy.com
CONVEX_SELF_HOSTED_URL=https://backend.usa-solarenergy.com
CONVEX_SELF_HOSTED_ADMIN_KEY=self-hosted-convex|013b2cd03edc119d96b709d14b3b24574e4331e3ba1d07c0d6018028a05bdbcc16be054f8dbb9b2a861900868ebf97445f
CONVEX_WEBHOOK_SIGNING_SECRET=your-webhook-signing-secret

# =============================================================================
# LOGTO AUTHENTICATION
# =============================================================================
LOGTO_ENDPOINT=https://auth.usa-solarenergy.com/
LOGTO_APP_ID=0rwfvi2s56fndzox8t694
LOGTO_APP_SECRET=DaumoBvbbNTQTpdgLZGRmi7hbfv0jzBz
NEXT_PUBLIC_BASE_URL=https://your-domain.com
LOGTO_COOKIE_SECRET=3TfkgBqmOkTPKJkZaeVbT1rPXcfyEqRW
LOGTO_APP_ISSUER_ENDPOINT=https://auth.usa-solarenergy.com/oidc
LOGTO_APP_JWTS_URL=https://auth.usa-solarenergy.com/oidc/jwks

# =============================================================================
# IMAGEKIT
# =============================================================================
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_chL4cwbAnaQlvwUplonD2jcqupE=
IMAGEKIT_PRIVATE_KEY=private_tyS8YbUg5ZpFmyYs5NHajTUBLmU=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/dk0ns8gjx/fastbite/

# =============================================================================
# PAYSTACK
# =============================================================================
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_25b93cd12fbcad465754264275b6a1426d75baa2
PAYSTACK_SECRET_KEY=sk_test_47c9fcfaee9496f4e21a3bd2c6575f626485ac0b

# =============================================================================
# EMAIL (SMTP)
# =============================================================================
SMTP_HOST=mail.surestrat.co.za
SMTP_PORT=587
SMTP_USER=noreply@surestrat.co.za
SMTP_PASS=Z@lisile0611stuli
FROM_EMAIL=noreply@surestrat.co.za
FROM_NAME=FastBite Restaurant
```

## Deployment Steps

### 1. Add Environment Variables to Coolify

1. Go to your Coolify dashboard
2. Select your FastBite application
3. Navigate to **Environment Variables** section
4. Add **ALL** the variables listed above
5. Save the changes

### 2. Update Logto Callback URLs

In your Logto dashboard (https://auth.usa-solarenergy.com/):

1. Go to your application settings
2. Update **Redirect URI**: `https://your-domain.com/callback`
3. Update **Post Logout URI**: `https://your-domain.com`

### 3. Deploy

1. Push your code to the repository
2. Coolify will automatically trigger a new build
3. Wait for the build to complete (~2-5 minutes)

### 4. Verify Deployment

Check the following endpoints:

```bash
# Health check
curl https://your-domain.com/api/health

# Should return: {"status": "ok"}
```

### 5. Check Container Logs

If the deployment fails, check the logs in Coolify:

1. Go to your application
2. Click on **Logs** tab
3. Look for errors related to:
   - `NEXT_PUBLIC_CONVEX_URL is required`
   - `CONVEX_SELF_HOSTED_URL`
   - `LOGTO_ENDPOINT`
   - Connection errors

## Common Issues

### Issue 1: "No server" or Empty Response

**Cause**: Missing `CONVEX_SELF_HOSTED_URL` or `CONVEX_SELF_HOSTED_ADMIN_KEY`

**Solution**: Add these environment variables to Coolify

### Issue 2: Health Check Failing

**Cause**: Server crashes during startup due to missing env vars

**Solution**: 
1. Check container logs for specific error
2. Ensure ALL required env vars are set
3. Verify Convex backend is accessible from your server

### Issue 3: Authentication Errors

**Cause**: Logto callback URLs not configured

**Solution**: Update callback URLs in Logto dashboard to match your production domain

### Issue 4: Image Upload Failing

**Cause**: Missing ImageKit credentials

**Solution**: Verify `IMAGEKIT_PRIVATE_KEY` and `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` are set

## Debugging Commands

If you have SSH access to your Coolify server:

```bash
# Check if container is running
docker ps | grep fastbite

# View container logs
docker logs <container-id>

# Check environment variables inside container
docker exec <container-id> env | grep CONVEX

# Test health endpoint from inside container
docker exec <container-id> wget -qO- http://localhost:3000/api/health

# Check if server.js exists
docker exec <container-id> ls -la /app/server.js
```

## Security Checklist

- [ ] All API keys are production keys (not test keys)
- [ ] `LOGTO_COOKIE_SECRET` is a strong random string
- [ ] `CONVEX_SELF_HOSTED_ADMIN_KEY` is kept secret
- [ ] SMTP credentials are secure
- [ ] SSL certificate is enabled in Coolify
- [ ] CORS is properly configured
- [ ] Webhook URLs are configured in external services

## Post-Deployment

1. Test complete user flow:
   - Sign up / Sign in
   - Browse meals
   - Add to cart
   - Checkout (test mode)
   - Receive email confirmation

2. Monitor logs for errors
3. Set up uptime monitoring (e.g., UptimeRobot)
4. Configure backups
5. Document any custom configurations

## Support

If you continue to have issues:

1. Check Coolify logs for specific error messages
2. Verify Convex backend is accessible: `curl https://backend.usa-solarenergy.com`
3. Verify Logto is accessible: `curl https://auth.usa-solarenergy.com/.well-known/openid-configuration`
4. Check if ImageKit endpoint is accessible: `curl https://ik.imagekit.io/dk0ns8gjx/fastbite/`
