# Setup Guide

Complete setup instructions for FastBite development and deployment.

## Prerequisites

Before setting up FastBite, ensure you have:

- **Node.js**: Version 18.17 or higher
- **npm**: Version 9.0 or higher (or yarn/pnpm)
- **Git**: Version control system
- **Docker**: For containerized development (optional but recommended)
- **MinIO**: For file storage (or cloud storage alternative)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/fastbite.git
cd fastbite
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template and configure:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration (see Environment Variables section below).

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see FastBite running!

## Environment Variables

### Required Variables

```env
# Next.js
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Convex
NEXT_PUBLIC_CONVEX_URL=your-convex-deployment-url

# Logto Authentication
LOGTO_ENDPOINT=https://your-logto-instance.logto.app
LOGTO_APP_ID=your-app-id
LOGTO_APP_SECRET=your-app-secret
LOGTO_BASE_URL=http://localhost:3000
LOGTO_COOKIE_SECRET=your-random-secret-key

# Paystack Payments
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_SECRET_KEY=sk_test_your_secret_key

# MinIO Storage
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=fastbite-images
MINIO_USE_SSL=false
MINIO_PUBLIC_URL=http://localhost:9000/fastbite-images

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Generating Secrets

#### Cookie Secret
```bash
# Generate random secret
openssl rand -base64 32
```

#### Logto Setup
1. Create account at [Logto](https://logto.io)
2. Create new application
3. Configure redirect URIs:
   - `http://localhost:3000/api/auth/callback`
   - `http://localhost:3000/auth/callback`
4. Copy App ID and Secret

#### Convex Setup
1. Install Convex CLI: `npm install -g convex`
2. Login: `npx convex login`
3. Initialize: `npx convex dev`
4. Copy deployment URL

## Database Setup

### Convex Database

1. **Initialize Convex**:
   ```bash
   npx convex dev
   ```

2. **Deploy Schema**:
   ```bash
   npx convex deploy
   ```

3. **Seed Database**:
   ```bash
   npm run db:seed
   ```

### Database Schema

FastBite uses the following main tables:
- `users` - User accounts and roles
- `meals` - Menu items with customization
- `orders` - Customer orders
- `categories` - Menu categories
- `cartSessions` - Guest shopping carts
- `auditLogs` - System activity logs

## File Storage Setup

### MinIO (Local Development)

1. **Start MinIO Server**:
   ```bash
   docker run -p 9000:9000 -p 9090:9090 \
     -e MINIO_ROOT_USER=minioadmin \
     -e MINIO_ROOT_PASSWORD=minioadmin \
     minio/minio server /data --console-address ":9090"
   ```

2. **Access MinIO Console**:
   - URL: `http://localhost:9090`
   - Username: `minioadmin`
   - Password: `minioadmin`

3. **Create Bucket**:
   - Create bucket named `fastbite-images`
   - Set public read policy

### Cloud Storage (Production)

For production, use AWS S3, Google Cloud Storage, or DigitalOcean Spaces:

```env
# AWS S3 Example
MINIO_ENDPOINT=s3.amazonaws.com
MINIO_ACCESS_KEY=your-aws-access-key
MINIO_SECRET_KEY=your-aws-secret-key
MINIO_BUCKET_NAME=your-bucket-name
MINIO_USE_SSL=true
MINIO_PUBLIC_URL=https://your-cdn-url.com
```

## Authentication Setup

### Logto Configuration

1. **Create Application**:
   - Go to Logto Console
   - Create "Traditional Web" application
   - Set redirect URIs

2. **Configure Social Login** (Optional):
   - Add Google, GitHub, or other providers
   - Configure OAuth credentials

3. **User Roles**:
   - Configure custom user roles in Logto
   - Map to FastBite roles (customer, staff, manager, admin)

### Permission Setup

FastBite uses role-based permissions:

```typescript
// Permission mapping
const permissions = {
  customer: ['place_orders', 'view_menu'],
  staff: ['place_orders', 'view_menu', 'manage_orders'],
  manager: ['place_orders', 'view_menu', 'manage_orders', 'manage_menu'],
  admin: ['all_permissions']
};
```

## Payment Setup

### Paystack Configuration

1. **Create Account**:
   - Sign up at [Paystack](https://paystack.com)
   - Complete business verification

2. **Get API Keys**:
   - Test keys for development
   - Live keys for production

3. **Webhook Setup**:
   - Set webhook URL: `https://your-domain.com/api/payments/webhook`
   - Subscribe to events: `charge.success`, `charge.failure`

### Testing Payments

Use Paystack test cards:
- **Success**: `4084084084084081` (any future expiry, CVV: 408)
- **Failure**: Use amount `100.00` to trigger failure

## Docker Development

### Development with Docker

1. **Build Development Image**:
   ```bash
   docker build -t fastbite:dev .
   ```

2. **Run Development Container**:
   ```bash
   docker run -p 3000:3000 \
     -v $(pwd):/app \
     -v /app/node_modules \
     fastbite:dev npm run dev
   ```

### Docker Compose (Full Stack)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Paystack Testing Profile

For local SSL testing with Paystack:

```bash
# Start with nginx for SSL
docker-compose --profile paystack-testing up -d
```

## Production Deployment

### Build for Production

```bash
# Build application
npm run build

# Export static files (if using static export)
npm run export
```

### Environment Variables (Production)

```env
# Production URLs
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment-url

# Live API keys
PAYSTACK_PUBLIC_KEY=paystack-public-key-placeholder
PAYSTACK_SECRET_KEY=paystack-secret-key-placeholder

# Production storage
MINIO_ENDPOINT=your-production-endpoint
MINIO_USE_SSL=true
```

### Deployment Options

#### Vercel (Recommended)

1. **Connect Repository**:
   - Import project to Vercel
   - Configure environment variables

2. **Deploy**:
   - Automatic deployments on push
   - Preview deployments for PRs

#### Docker Deployment

```bash
# Build production image
docker build -t fastbite:latest .

# Run production container
docker run -p 3000:3000 fastbite:latest
```

#### Coolify Deployment

FastBite is optimized for Coolify deployment:

1. **Connect Repository**:
   - Add project to Coolify
   - Configure environment variables

2. **Deploy**:
   - Coolify handles reverse proxy
   - Automatic SSL certificates
   - Database migrations

## Testing Setup

### Unit Tests

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Integration Tests

```bash
# Run E2E tests
npm run test:e2e
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Menu browsing and filtering
- [ ] Adding items to cart
- [ ] Checkout process
- [ ] Payment processing
- [ ] Order confirmation
- [ ] Admin panel access

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

#### Database Connection Issues
```bash
# Check Convex status
npx convex dev --status

# Redeploy functions
npm run convex:deploy
```

#### Authentication Problems
- Check Logto configuration
- Verify redirect URIs
- Clear browser cookies

#### Payment Issues
- Verify Paystack keys
- Check webhook URL
- Test with Paystack dashboard

### Debug Mode

Enable debug logging:

```env
DEBUG=*
LOGTO_DEBUG=true
PAYSTACK_DEBUG=true
```

### Health Checks

```bash
# Check application health
curl http://localhost:3000/api/health

# Check Convex connection
npx convex run queries:getMeals
```

## Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm run build:analyze

# Optimize images
npm run optimize-images
```

### Database Optimization

```bash
# Run database migrations
npm run db:migrate

# Seed production data
npm run db:seed:prod
```

## Security Checklist

- [ ] Environment variables configured
- [ ] HTTPS enabled in production
- [ ] Authentication properly configured
- [ ] Payment webhooks secured
- [ ] File upload validation in place
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Sensitive data not logged

## Support

### Getting Help

1. **Documentation**: Check this setup guide and component docs
2. **Issues**: Report bugs on GitHub
3. **Discussions**: Join community discussions
4. **Professional Support**: Contact maintainers for enterprise support

### Useful Commands

```bash
# View all available scripts
npm run

# Check system status
npm run health

# Reset development environment
npm run reset:dev

# Clean all caches
npm run clean
```