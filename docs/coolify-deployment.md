# Coolify Deployment Guide for FastBite

This guide covers deploying FastBite on Coolify with automatic SSL via Traefik/Caddy.

## Prerequisites

- A Coolify instance (self-hosted or cloud)
- A domain name pointing to your Coolify server
- GitHub/GitLab repository access
- Required service accounts:
  - Convex account (database)
  - Logto account (authentication)
  - Paystack account (payments)
  - ImageKit account (image storage)

## Architecture Overview

```
Internet → Cloudflare/DNS
    ↓
Coolify Server (Traefik/Caddy)
    ↓
Docker Container (FastBite Next.js App)
    ↓
External Services:
    - Convex (Database)
    - Logto (Auth)
    - Paystack (Payments)
    - ImageKit (Images)
```

## Step 1: Prepare Your Repository

Ensure your repository has these files:
- ✅ `Dockerfile` - Multi-stage production build
- ✅ `docker-compose.yml` - Coolify-compatible configuration
- ✅ `.dockerignore` - Optimized build context
- ✅ `next.config.js` - With `output: 'standalone'`

## Step 2: Create a New Resource in Coolify

1. **Login to Coolify Dashboard**
2. **Click "New Resource"**
3. **Select "Docker Compose"**
4. **Configure Repository:**
   - Repository URL: `https://github.com/your-username/fastbite.git`
   - Branch: `main` (or your production branch)
   - Build Pack: `Docker Compose`

## Step 3: Configure Environment Variables

In Coolify, add these environment variables:

### Required Variables

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=FastBite
DOMAIN=your-domain.com

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-name

# Logto Authentication
LOGTO_ENDPOINT=https://your-tenant.logto.app
LOGTO_APP_ID=your-app-id
LOGTO_APP_SECRET=your-app-secret
NEXT_PUBLIC_LOGTO_ENDPOINT=https://your-tenant.logto.app
LOGTO_SCOPES=openid,profile,email,roles,custom_data

# Paystack
PAYSTACK_SECRET_KEY=paystack-secret-key-placeholder
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=paystack-public-key-placeholder

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your-public-key
IMAGEKIT_PRIVATE_KEY=your-private-key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id/

# Security
JWT_SECRET=your-super-secure-random-string-minimum-32-chars
NEXT_TELEMETRY_DISABLED=1
```

### Optional Variables

```bash
# Email (if using)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@fastbite.com
FROM_NAME=FastBite

# Analytics (optional)
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

## Step 4: Configure Domain & SSL

1. **In Coolify Dashboard:**
   - Go to your FastBite resource
   - Click "Domains" tab
   - Add your domain: `fastbite.example.com`
   - Enable "Generate Let's Encrypt Certificate"

2. **DNS Configuration:**
   ```
   Type: A Record
   Name: fastbite (or @ for root domain)
   Value: [Your Coolify Server IP]
   TTL: Auto or 300
   ```

3. **Wildcard SSL (optional):**
   If you want `*.fastbite.com` support:
   ```
   Type: A Record
   Name: *
   Value: [Your Coolify Server IP]
   ```

## Step 5: Deploy

1. **Initial Deployment:**
   - Click "Deploy" in Coolify
   - Monitor build logs
   - Wait for "Deployment Successful" message

2. **Verify Health:**
   ```bash
   curl https://your-domain.com/api/health
   ```

3. **Expected Response:**
   ```json
   {
     "status": "ok",
     "timestamp": "2024-10-02T12:00:00.000Z"
   }
   ```

## Step 6: Post-Deployment Configuration

### 1. Configure Logto Callbacks

In Logto dashboard, add redirect URIs:
```
https://your-domain.com/callback
https://your-domain.com/api/auth/callback
https://your-domain.com/sign-in
```

Add post logout redirect URIs:
```
https://your-domain.com
```

### 2. Configure Paystack Webhook

In Paystack dashboard:
- Webhook URL: `https://your-domain.com/api/webhooks/paystack`
- Events to send:
  - `charge.success`
  - `charge.failed`
  - `transfer.success`
  - `transfer.failed`

Test webhook:
```bash
curl -X POST https://your-domain.com/api/webhooks/paystack \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: test" \
  -d '{"event":"charge.success"}'
```

### 3. Verify Convex Connection

Check Convex dashboard for active connections from your production domain.

### 4. Test ImageKit Upload

Upload a test image through the admin panel to verify ImageKit integration.

## Monitoring & Logs

### View Application Logs

In Coolify:
1. Go to your resource
2. Click "Logs" tab
3. View real-time application logs

### Health Checks

Coolify automatically monitors:
- Container health via Docker healthcheck
- HTTP endpoint: `/api/health`
- Restart policy: `unless-stopped`

### Manual Log Inspection

```bash
# SSH into Coolify server
ssh user@coolify-server

# View container logs
docker logs fastbite-fastbite-1 --tail 100 -f

# Check container status
docker ps | grep fastbite

# Inspect container
docker inspect fastbite-fastbite-1
```

## Scaling & Performance

### Horizontal Scaling

To run multiple instances:
```yaml
# In docker-compose.yml
services:
  fastbite:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Resource Limits

Coolify allows setting:
- CPU limits
- Memory limits
- Restart policies

Recommended for production:
- CPU: 1-2 cores
- Memory: 1-2GB
- Restart: `unless-stopped`

## Troubleshooting

### Build Fails

**Issue:** Build fails with "out of memory"
```bash
# Solution: Increase build resources in Coolify
# Settings → Server → Build Resources → Increase Memory
```

**Issue:** Module not found errors
```bash
# Solution: Clear build cache and rebuild
# In Coolify: Deploy → Force Rebuild
```

### Container Won't Start

**Issue:** Port 3000 already in use
```bash
# Check Coolify port mappings
# Ensure no other service uses port 3000
```

**Issue:** Environment variables missing
```bash
# Verify all required env vars are set in Coolify
# Check logs for specific missing variables
```

### SSL Certificate Issues

**Issue:** Certificate not generating
```bash
# Verify DNS points to Coolify server
dig your-domain.com

# Check Coolify logs for Let's Encrypt errors
# Ensure ports 80 and 443 are open
```

### Database Connection Issues

**Issue:** Cannot connect to Convex
```bash
# Verify NEXT_PUBLIC_CONVEX_URL is correct
# Check Convex dashboard for connection errors
# Ensure production deployment is active
```

## Automatic Deployments

### Enable Auto-Deploy on Git Push

In Coolify:
1. Go to your resource settings
2. Enable "Automatic Deployment"
3. Configure branch: `main`
4. Set deployment mode: `On Push`

Coolify will automatically:
- Pull latest code on git push
- Build Docker image
- Deploy new version
- Zero-downtime deployment

### Manual Deployment

```bash
# Push to trigger deployment
git push origin main

# Or use Coolify webhook
curl -X POST https://your-coolify-instance.com/webhooks/deploy/your-webhook-id
```

## Backup & Recovery

### Database Backups

Convex handles backups automatically. To export:
```bash
# Use Convex CLI
npx convex export --prod
```

### Configuration Backup

Backup your Coolify environment variables:
1. Export from Coolify dashboard
2. Store securely (1Password, AWS Secrets Manager)

### Disaster Recovery

1. Keep `.env.example` updated
2. Document all external service configurations
3. Use infrastructure as code (docker-compose.yml)
4. Regular testing of deployment process

## Security Best Practices

### 1. Environment Variables
- ✅ Never commit secrets to git
- ✅ Use Coolify's built-in secret management
- ✅ Rotate secrets regularly
- ✅ Use different keys for staging/production

### 2. Network Security
- ✅ Enable Cloudflare proxy (optional)
- ✅ Configure WAF rules
- ✅ Enable DDoS protection
- ✅ Use HTTPS only

### 3. Container Security
- ✅ Run as non-root user (already configured)
- ✅ Minimize image size
- ✅ Regular security updates
- ✅ Scan images for vulnerabilities

### 4. Application Security
- ✅ Enable CORS properly
- ✅ Implement rate limiting
- ✅ Validate all inputs
- ✅ Sanitize user data

## Performance Optimization

### 1. CDN Configuration

Use Cloudflare in front of Coolify:
```
DNS → Cloudflare (CDN) → Coolify → Docker Container
```

Benefits:
- Global CDN
- DDoS protection
- Caching static assets
- Analytics

### 2. Caching Strategy

Configure caching headers in Next.js:
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### 3. Image Optimization

Using ImageKit (already configured):
- Automatic format conversion (WebP/AVIF)
- Responsive images
- Lazy loading
- CDN delivery

## Cost Estimation

### Coolify Self-Hosted
- VPS (2GB RAM, 2 vCPU): $10-20/month
- Domain: $10-15/year
- Total: ~$15-25/month

### External Services
- Convex: Free tier (1GB) → $25/month (Pro)
- Logto: Free tier (7,500 MAU) → $16/month (Pro)
- Paystack: Free (transaction fees apply)
- ImageKit: Free tier (20GB) → $49/month (paid)
- Total: $0-90/month depending on usage

### Total Monthly Cost
- Minimal: $15/month (free tiers)
- Production: $100-150/month (paid tiers)

## Support & Resources

- **Coolify Docs:** https://coolify.io/docs
- **FastBite Issues:** GitHub Issues
- **Convex Support:** Discord
- **Logto Support:** Discord
- **Paystack Support:** support@paystack.com

## Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Domain DNS configured and propagated
- [ ] SSL certificate issued and valid
- [ ] Health check endpoint responding
- [ ] Logto callbacks configured
- [ ] Paystack webhooks configured
- [ ] ImageKit upload tested
- [ ] Database migrations completed
- [ ] Admin user created
- [ ] Sample data loaded (optional)
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Load testing completed
- [ ] Security scan passed

## Production Launch 🚀

1. Final deployment verification
2. Monitor logs for 24 hours
3. Set up alerts for errors
4. Document any issues
5. Celebrate! 🎉

---

**Need help?** Check the [troubleshooting section](#troubleshooting) or open an issue on GitHub.
