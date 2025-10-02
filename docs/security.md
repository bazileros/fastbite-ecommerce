# Security Guide

Comprehensive security measures and best practices for FastBite.

## Authentication & Authorization

### Logto Integration

FastBite uses Logto for enterprise-grade authentication:

- **JWT Tokens**: Secure token-based authentication
- **Multi-factor Authentication**: Optional 2FA support
- **Social Login**: OAuth integration with Google, GitHub, etc.
- **Session Management**: Secure cookie-based sessions

### Role-Based Access Control (RBAC)

Four user roles with specific permissions:

```typescript
enum UserRole {
  CUSTOMER = 'customer',    // Place orders, view menu
  STAFF = 'staff',         // Manage orders, view menu
  MANAGER = 'manager',     // Manage menu, orders, staff
  ADMIN = 'admin'          // Full system access
}

const permissions = {
  canCreateMeals: ['manager', 'admin'],
  canUpdateMeals: ['manager', 'admin'],
  canDeleteMeals: ['admin'],
  canManageOrders: ['staff', 'manager', 'admin'],
  canManageUsers: ['admin'],
  canViewAnalytics: ['manager', 'admin'],
};
```

### Permission Checks

All sensitive operations include permission validation:

```typescript
// In Convex mutations
export const createMeal = mutation({
  args: { /* meal data */ },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db.query("users")
      .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
      .unique();

    if (!hasPermission(user.role, "canCreateMeals")) {
      throw new Error("Insufficient permissions");
    }

    // Proceed with operation...
  }
});
```

## Data Protection

### Input Validation

All user inputs are validated using Zod schemas:

```typescript
// API input validation
export async function POST(request: Request) {
  const body = await request.json();

  try {
    const validatedData = mealSchema.parse(body);
    // Data is now type-safe and validated
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { errors: error.errors },
        { status: 400 }
      );
    }
  }
}
```

### SQL Injection Prevention

Convex automatically prevents SQL injection through:
- Parameterized queries
- Type-safe database operations
- Built-in sanitization

### XSS Protection

Frontend security measures:
- React's automatic XSS prevention
- Content Security Policy (CSP) headers
- Input sanitization
- Safe HTML rendering

## Payment Security

### Paystack Integration

Secure payment processing:
- **PCI Compliance**: Paystack handles card data
- **Tokenization**: Sensitive data never touches your servers
- **Webhook Verification**: Cryptographic signature validation

### Webhook Security

```typescript
// Webhook signature verification
const expectedSignature = crypto
  .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
  .update(requestBody)
  .digest('hex');

if (signature !== expectedSignature) {
  return Response.json({ error: 'Invalid signature' }, { status: 401 });
}
```

## File Upload Security

### Upload Validation

Comprehensive file validation:

```typescript
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  // File type validation
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return Response.json({ error: 'Invalid file type' }, { status: 400 });
  }

  // File size validation (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: 'File too large' }, { status: 400 });
  }

  // Filename sanitization
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
}
```

### Storage Security

MinIO/S3 security measures:
- **Private Buckets**: Restrict public access
- **Pre-signed URLs**: Time-limited access tokens
- **Access Control**: IAM policies and roles
- **Encryption**: Server-side encryption

## API Security

### Rate Limiting

Prevent abuse with rate limiting:

```typescript
// Using middleware
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
```

### CORS Configuration

Proper CORS setup:

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGINS },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ];
  },
};
```

### API Authentication

All API routes require authentication:

```typescript
// Protected API route
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Proceed with authenticated request...
}
```

## Infrastructure Security

### Environment Variables

Secure environment variable management:

```env
# Never commit secrets
# Use .env.local for development
# Use platform secrets for production

# Generate strong secrets
JWT_SECRET=openssl rand -base64 32
COOKIE_SECRET=openssl rand -base64 32
```

### HTTPS Enforcement

Force HTTPS in production:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' &&
      !request.url.startsWith('https://')) {
    return NextResponse.redirect(
      request.url.replace('http://', 'https://'),
      301
    );
  }
}
```

### Security Headers

Comprehensive security headers:

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=()' },
        ],
      },
    ];
  },
};
```

## Monitoring & Logging

### Audit Logging

Track all sensitive operations:

```typescript
// In mutations
await ctx.db.insert("auditLogs", {
  userId: user._id,
  action: "CREATE_MEAL",
  resource: "meals",
  resourceId: mealId,
  details: { name: args.name },
  timestamp: Date.now(),
  ipAddress: ctx.request?.ip,
  userAgent: ctx.request?.userAgent,
});
```

### Error Monitoring

Monitor and alert on security events:

```typescript
// Error tracking
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Security Monitoring

Monitor for suspicious activity:
- Failed login attempts
- Unusual API usage patterns
- File upload anomalies
- Payment failures

## Incident Response

### Security Incident Procedure

1. **Detection**: Monitor alerts and logs
2. **Assessment**: Evaluate impact and scope
3. **Containment**: Isolate affected systems
4. **Recovery**: Restore from clean backups
5. **Lessons Learned**: Update security measures

### Breach Notification

In case of security breach:
- Notify affected users within 72 hours
- Provide clear communication about the breach
- Offer credit monitoring services
- Cooperate with authorities if required

## Compliance

### Data Protection

GDPR and data protection compliance:
- **Data Minimization**: Collect only necessary data
- **Purpose Limitation**: Use data only for stated purposes
- **Storage Limitation**: Retain data only as long as needed
- **Data Subject Rights**: Allow users to access, update, delete their data

### Privacy Policy

Maintain clear privacy policy covering:
- Data collection practices
- Cookie usage
- Third-party integrations
- User rights and choices

## Development Security

### Code Security

Security practices for development:
- **Dependency Scanning**: Regular vulnerability checks
- **Code Reviews**: Security-focused code reviews
- **Static Analysis**: Automated security testing
- **Secrets Management**: Never commit secrets to code

### Secure Coding Guidelines

```typescript
// Avoid common vulnerabilities

// 1. SQL Injection - Use parameterized queries (Convex handles this)
// 2. XSS - Use React's built-in protection
// 3. CSRF - Use proper CORS and CSRF tokens
// 4. Authentication Bypass - Always check permissions
// 5. Information Disclosure - Don't leak sensitive data in errors

// Secure password handling
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 12);

// Secure random generation
const crypto = require('crypto');
const sessionToken = crypto.randomBytes(32).toString('hex');
```

## Third-Party Security

### Vendor Assessment

Regular security assessment of third parties:
- **Logto**: Enterprise authentication security
- **Paystack**: PCI DSS compliance
- **Convex**: Database security and encryption
- **MinIO**: Object storage security

### Supply Chain Security

Secure dependency management:
```json
// package.json
{
  "scripts": {
    "audit": "npm audit",
    "audit:fix": "npm audit fix",
    "deps:check": "npm outdated"
  }
}
```

## Security Testing

### Penetration Testing

Regular security testing:
- **Automated Scanning**: OWASP ZAP, Burp Suite
- **Manual Testing**: Ethical hacking
- **Dependency Scanning**: Snyk, Dependabot
- **Container Scanning**: Trivy, Clair

### Security Checklist

Pre-deployment security checklist:
- [ ] All secrets in environment variables
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Authentication working
- [ ] Authorization enforced
- [ ] Input validation in place
- [ ] File uploads secured
- [ ] Rate limiting configured
- [ ] Audit logging enabled
- [ ] Error messages sanitized
- [ ] Dependencies updated
- [ ] Security scan passed

## Emergency Contacts

### Security Team
- **Security Lead**: security@fastbite.com
- **DevOps**: devops@fastbite.com
- **Legal**: legal@fastbite.com

### External Resources
- **CERT**: Report security vulnerabilities
- **Law Enforcement**: For criminal activity
- **Payment Provider**: Paystack security team

## Updates and Maintenance

### Security Updates

Regular security maintenance:
- **Weekly**: Review security logs and alerts
- **Monthly**: Update dependencies and patches
- **Quarterly**: Security assessment and testing
- **Annually**: Comprehensive security audit

### Training

Security awareness training for team members covering:
- Phishing recognition
- Secure coding practices
- Incident reporting procedures
- Data handling guidelines