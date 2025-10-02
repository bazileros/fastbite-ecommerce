# Logto Authentication

Logto provides enterprise-grade authentication and authorization for FastBite.

## Overview

Logto handles:
- User registration and 2. **Assign permissions:**
   - **Check ALL permissions** from the `FastBite` resource (40+ permissions including banners, promotions, loyalty, reviews, notifications, delivery, payments, inventory)gin
- Social login (Google, GitHub, etc.)
- Role-based access control (RBAC)
- JWT token management
- User profile management

## Configuration

### Environment Variables
```env
# Logto Configuration
LOGTO_ENDPOINT=https://your-logto-instance.logto.app
LOGTO_APP_ID=your-app-id
LOGTO_APP_SECRET=your-app-secret
LOGTO_BASE_URL=http://localhost:3000
LOGTO_COOKIE_SECRET=your-random-secret-key
```

### Auth Configuration (`lib/logto.ts`)
```typescript
export const logtoConfig = {
  endpoint: process.env.LOGTO_ENDPOINT!,
  appId: process.env.LOGTO_APP_ID!,
  appSecret: process.env.LOGTO_APP_SECRET!,
  baseUrl: process.env.LOGTO_BASE_URL!,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET!,
};
```

## Setting Up RBAC in Logto (Sequential Steps)

### Step 1: Create API Resource with Unique Identifier

1. **Go to Logto Console** → **API Resources**
2. **Click "Create API resource"**
3. **Fill in details:**
   - **API Name:** `FastBite`
   - **API Identifier:** `https://fastbite.com/api` (must be unique URL)
   - **Token Format:** `JWT`
4. **Click "Create"**

### Step 2: Create Permissions within the API Resource

After creating the API resource, add permissions to it:

1. **Go to your API resource** → **Permissions** tab
2. **Click "Create permission"** for each permission:

**User Management:**
- `users:read` - View user profiles
- `users:write` - Create/edit users  
- `users:delete` - Delete users

**Menu Management:**
- `meals:read` - View menu items
- `meals:write` - Create/edit meals
- `meals:delete` - Delete meals
- `category:read` - View categories
- `categories:write` - Manage categories

**Order Management:**
- `orders:read` - View orders
- `orders:write` - Create/update orders
- `orders:delete` - Cancel/delete orders
- `orders:refund` - Process refunds

**Analytics:**
- `analytics:read` - View analytics
- `analytics:export` - Export reports

**Settings:**
- `settings:read` - View settings
- `settings:write` - Modify settings

**System:**
- `system:read` - System health
- `system:write` - System config

**Audit:**
- `audit:read` - View audit logs
- `audit:delete` - Clear audit logs

**Content Management:**
- `banners:read` - View promotional banners
- `banners:write` - Create/edit banners
- `banners:delete` - Delete banners

**Promotions & Loyalty:**
- `promotions:read` - View promotions and deals
- `promotions:write` - Create/edit promotions
- `promotions:delete` - Delete promotions
- `loyalty:read` - View loyalty programs
- `loyalty:write` - Manage loyalty programs
- `loyalty:delete` - Delete loyalty programs

**Customer Experience:**
- `reviews:read` - View customer reviews
- `reviews:write` - Respond to reviews
- `reviews:delete` - Remove reviews
- `notifications:read` - View notifications
- `notifications:write` - Send notifications
- `notifications:delete` - Delete notifications

**Operations:**
- `delivery:read` - View delivery settings
- `delivery:write` - Configure delivery zones
- `delivery:delete` - Remove delivery areas
- `payments:read` - View payment methods
- `payments:write` - Configure payments
- `payments:delete` - Remove payment methods
- `inventory:read` - Check inventory levels
- `inventory:write` - Update inventory
- `inventory:delete` - Remove inventory items

### Step 3: Create Roles and Assign Permissions

Now create roles and assign permissions from your API resource:

#### Create Customer Role
1. **Go to Roles** → **Create role**
2. **Role details:**
   - **Name:** `customer`
   - **Type:** `User`
   - **Description:** `Basic customer access`
3. **Assign permissions:**
   - Select your `FastBite` resource
   - Check: `meals:read`, `category:read`, `orders:read`, `orders:write`

#### Create Staff Role
1. **Create role:**
   - **Name:** `staff`
   - **Type:** `User`
   - **Description:** `Restaurant staff`
2. **Assign permissions:**
   - `meals:read`, `meals:write`, `category:read`, `orders:read`, `orders:write`, `orders:delete`, `analytics:read`

#### Create Manager Role
1. **Create role:**
   - **Name:** `manager`
   - **Type:** `User`
   - **Description:** `Restaurant management`
2. **Assign permissions:**
   - `meals:read`, `meals:write`, `meals:delete`, `category:read`, `categories:write`, `orders:read`, `orders:write`, `orders:delete`, `orders:refund`, `analytics:read`, `analytics:export`, `settings:read`, `settings:write`, `users:read`, `users:write`

#### Create Admin Role
1. **Create role:**
   - **Name:** `admin`
   - **Type:** `User`
   - **Description:** `System administrator`
2. **Assign permissions:**
   - **Check ALL permissions** from the `FastBite API` resource

### Step 4: Assign Roles to Users

1. **Go to Users** → Find your user
2. **Edit user** → **Roles** tab
3. **Assign roles** (e.g., assign `admin` to yourself)
4. **Save changes**

### Step 5: Update Next.js Configuration

Add the API resource to your Logto config:

```typescript
// app/logto.ts
export const logtoConfig: LogtoNextConfig = {
  // ... other config
  resources: ['https://fastbite.com/api'],
  scopes: [
    UserScope.Roles,
    UserScope.Email,
    UserScope.Identities,
    // Add specific permissions
    'meals:read',
    'orders:write',
    // ... add other scopes you need
  ],
};
```

## User Roles

FastBite implements a comprehensive role-based permission system with four user roles:

### Customer Role
**Basic users who can browse and place orders**

**Permissions:**
- **Menu Access:**
  - `meals:read` - View all menu items and details
  - `category:read` - Browse menu categories
- **Order Management:**
  - `orders:read` - View their own order history
  - `orders:write` - Place new orders and modify pending orders
  - `orders:delete` - Cancel their own pending orders
- **Profile Management:**
  - `profile:read` - View their own profile
  - `profile:write` - Update profile information
- **Loyalty Program:**
  - `loyalty:read` - View loyalty points and rewards
  - `loyalty:write` - Redeem rewards

**Restrictions:**
- Cannot access admin areas
- Cannot view other users' orders
- Cannot modify menu items
- Cannot access analytics or reports

### Staff Role
**Restaurant staff responsible for order processing**

**Permissions:**
- **Menu Access:**
  - `meals:read` - View all menu items
  - `meals:write` - Update meal availability and basic details
  - `category:read` - View menu categories
- **Order Management:**
  - `orders:read` - View all orders (customer and staff)
  - `orders:write` - Update order status (confirm, prepare, ready, complete)
  - `orders:delete` - Cancel orders with proper justification
  - `orders:assign` - Assign orders to staff members
- **Customer Support:**
  - `customers:read` - View customer profiles (for order support)
  - `customers:write` - Update customer preferences
- **Analytics:**
  - `analytics:read` - View basic sales reports and order statistics
- **Inventory:**
  - `inventory:read` - Check ingredient availability
  - `inventory:write` - Update inventory levels

**Restrictions:**
- Cannot delete menu items permanently
- Cannot modify pricing
- Cannot access system settings
- Cannot manage user accounts

### Manager Role
**Management personnel overseeing restaurant operations**

**Permissions:**
- **Menu Management:**
  - `meals:read` - View all menu items
  - `meals:write` - Create, update, and modify menu items
  - `meals:delete` - Permanently delete menu items
  - `category:read` - View all categories
  - `categories:write` - Create and manage menu categories
  - `categories:delete` - Delete categories
- **Order Management:**
  - `orders:read` - View all orders and detailed analytics
  - `orders:write` - Full order lifecycle management
  - `orders:delete` - Cancel any order
  - `orders:refund` - Process refunds
- **User Management:**
  - `users:read` - View all user accounts
  - `users:write` - Create staff accounts and update user info
  - `users:delete` - Deactivate user accounts
- **Analytics & Reports:**
  - `analytics:read` - Access all analytics and reporting
  - `analytics:export` - Export reports and data
- **Financial:**
  - `payments:read` - View payment records
  - `payments:refund` - Process payment refunds
- **Settings:**
  - `settings:read` - View store settings
  - `settings:write` - Modify operational settings (hours, policies)

**Restrictions:**
- Cannot access system-level settings
- Cannot manage admin accounts
- Cannot delete audit logs
- Cannot modify system integrations

### Admin Role
**System administrators with full access**

**Permissions:**
- **Complete System Access:**
  - All permissions from Manager role
  - `system:read` - Access system health and diagnostics
  - `system:write` - Modify system configuration
- **User Administration:**
  - `users:read` - View all users including admins
  - `users:write` - Create and modify any user account
  - `users:delete` - Delete any user account
  - `roles:manage` - Assign and modify user roles
- **System Settings:**
  - `settings:read` - View all system settings
  - `settings:write` - Modify all system settings
  - `settings:delete` - Reset settings to defaults
- **Integrations:**
  - `integrations:read` - View all third-party integrations
  - `integrations:write` - Configure and modify integrations
  - `integrations:delete` - Remove integrations
- **Audit & Security:**
  - `audit:read` - Access all audit logs
  - `audit:delete` - Clear audit logs (with caution)
  - `security:read` - View security settings
  - `security:write` - Modify security policies
- **Financial:**
  - `payments:read` - Access all payment data
  - `payments:write` - Modify payment configurations
  - `payments:refund` - Process any refund
- **Data Management:**
  - `data:export` - Export all system data
  - `data:import` - Import data
  - `data:backup` - Create system backups

**Special Capabilities:**
- Override any permission check
- Access emergency admin functions
- Modify system-level configurations
- Manage other admin accounts

## Permission Matrix

| Permission | Customer | Staff | Manager | Admin |
|------------|----------|-------|---------|-------|
| meals:read | ✅ | ✅ | ✅ | ✅ |
| meals:write | ❌ | ⚠️* | ✅ | ✅ |
| meals:delete | ❌ | ❌ | ✅ | ✅ |
| categories:write | ❌ | ❌ | ✅ | ✅ |
| category:read | ✅ | ✅ | ✅ | ✅ |
| orders:read | ⚠️** | ✅ | ✅ | ✅ |
| orders:write | ⚠️** | ✅ | ✅ | ✅ |
| orders:delete | ⚠️** | ✅ | ✅ | ✅ |
| analytics:read | ❌ | ✅ | ✅ | ✅ |
| users:read | ❌ | ⚠️*** | ✅ | ✅ |
| users:write | ❌ | ❌ | ✅ | ✅ |
| settings:read | ❌ | ❌ | ✅ | ✅ |
| settings:write | ❌ | ❌ | ✅ | ✅ |
| system:write | ❌ | ❌ | ❌ | ✅ |
| audit:read | ❌ | ❌ | ❌ | ✅ |
| banners:read | ✅ | ❌ | ✅ | ✅ |
| banners:write | ❌ | ❌ | ✅ | ✅ |
| promotions:read | ✅ | ❌ | ✅ | ✅ |
| promotions:write | ❌ | ❌ | ✅ | ✅ |
| loyalty:read | ✅ | ❌ | ✅ | ✅ |
| reviews:read | ✅ | ✅ | ✅ | ✅ |
| notifications:write | ❌ | ❌ | ✅ | ✅ |

**Legend:**
- ✅ = Full access
- ⚠️* = Limited access (availability only)
- ⚠️** = Own orders only
- ⚠️*** = Customer data for support
- ❌ = No access

## Role Assignment

### Automatic Assignment
- New users are automatically assigned the **customer** role
- Role upgrades require admin approval

### Manual Assignment
- Admins can assign roles through the Logto dashboard
- Role changes are logged in audit trails
- Users are notified of role changes

### Role Verification
- Roles are verified on every request via JWT tokens
- No database lookups required for permission checks
- Roles are cached in JWT tokens for performance

## Authentication Flow

### Frontend Integration

1. **Login/Signup**: Users authenticate via Logto
2. **Token Exchange**: JWT tokens are exchanged with Convex
3. **Session Management**: Cookies maintain user sessions
4. **Permission Checks**: Role-based UI rendering

### Key Components

#### Auth Buttons (`components/AuthButtons.tsx`)
Provides login/logout functionality with social providers.

#### Auth Context (`lib/auth-actions.ts`)
Server actions for authentication operations.

#### Protected Routes
Routes are protected using Next.js middleware and role checks.

## Social Login Setup

Logto supports multiple social providers:

1. **Google**: Enable in Logto dashboard
2. **GitHub**: Configure OAuth app
3. **Apple**: iOS/macOS integration
4. **Custom**: Enterprise SSO providers

## Security Features

- **JWT Tokens**: Secure token-based authentication
- **Cookie Security**: HttpOnly, Secure, SameSite cookies
- **CSRF Protection**: Built-in CSRF token validation
- **Rate Limiting**: Prevents brute force attacks
- **Audit Logging**: Tracks authentication events

## Development

### Local Development
```bash
# Start Logto locally (if self-hosted)
npm run logto:start

# Or use Logto Cloud
# Configure environment variables to point to cloud instance
```

### Testing Authentication
```typescript
// Test user login
const { user } = await signIn('google');

// Test role-based access
if (user.role === 'admin') {
  // Show admin features
}
```

## Troubleshooting

### Common Issues

1. **Invalid Token**: Check JWT expiration and refresh logic
2. **Role Mismatch**: Verify user roles in Logto dashboard
3. **Cookie Issues**: Ensure proper cookie configuration
4. **CORS Errors**: Configure allowed origins in Logto

### Debug Mode
Enable debug logging:
```env
LOGTO_DEBUG=true
```

## Integration with Convex

Logto integrates seamlessly with Convex authentication:

```typescript
// In Convex mutations
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Not authenticated");

// Get user from database
const user = await ctx.db.query("users")
  .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
  .unique();
```