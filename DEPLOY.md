# 🚀 FastBite Deployment Quick Reference

## One-Command Deploy Status Check

```bash
# Verify production readiness
./scripts/check-production-ready.sh
```

## Environment Variables (Required)

```bash
# Core Application
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-domain.com
DOMAIN=your-domain.com

# Convex (Database)
NEXT_PUBLIC_CONVEX_URL=https://prod-deployment.convex.cloud

# Logto (Auth)
LOGTO_ENDPOINT=https://your-tenant.logto.app
LOGTO_APP_ID=app_xxxxx
LOGTO_APP_SECRET=secret_xxxxx

# Paystack (Payments)
PAYSTACK_SECRET_KEY=paystack-secret-key-placeholder
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=paystack-public-key-placeholder

# ImageKit (Images)
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_xxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxx
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id/

# Security
JWT_SECRET=minimum-32-character-random-string
```

## Coolify Deployment Steps

1. **Add Resource**: Docker Compose → GitHub repo → `main` branch
2. **Add Env Vars**: Copy from `.env.production.example`
3. **Add Domain**: `your-domain.com` → Enable SSL
4. **Deploy**: Click Deploy → Monitor logs
5. **Verify**: `curl https://your-domain.com/api/health`

## DNS Configuration

```
Type: A
Name: @ (or your-subdomain)
Value: [Coolify Server IP]
TTL: 300
```

## Post-Deployment Callbacks

### Logto
- Redirect: `https://your-domain.com/callback`
- Post Logout: `https://your-domain.com`

### Paystack
- Webhook: `https://your-domain.com/api/webhooks/paystack`
- Events: `charge.success`, `charge.failed`

## Health Check

```bash
# Application
curl https://your-domain.com/api/health

# SSL
curl -vI https://your-domain.com 2>&1 | grep -i ssl

# Response Time
time curl -s https://your-domain.com > /dev/null
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check logs → Clear cache → Rebuild |
| 502 Bad Gateway | Container not started → Check health |
| SSL not working | Verify DNS → Check ports 80/443 |
| Auth fails | Verify Logto callbacks |
| Payments fail | Check Paystack webhook |

## Rollback

```bash
# In Coolify UI
1. Go to Deployments tab
2. Select previous deployment
3. Click "Redeploy"
```

## Documentation

- Full Guide: `docs/coolify-deployment.md`
- Production Readiness: `docs/PRODUCTION_READY.md`
- Tech Stack: `README.md`

---

**Status**: ✅ Production Ready  
**Last Updated**: October 2, 2025
