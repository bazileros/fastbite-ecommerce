# Convex Backend

Convex is the backend-as-a-service platform powering FastBite's real-time database and serverless functions.

## Overview

Convex provides:
- Real-time database with automatic sync
- Serverless functions (mutations, queries, actions)
- Built-in authentication integration
- Type-safe client libraries

## Project Structure

```
convex/
├── _generated/          # Auto-generated types and client code
├── actions.ts          # Server actions (for external API calls)
├── auth.config.ts      # Authentication configuration
├── mutations.ts        # Database write operations
├── queries.ts          # Database read operations
├── schema.ts           # Database schema definition
├── secure.ts           # Security rules and permissions
└── seed.ts            # Database seeding functions
```

## Key Components

### Schema (`schema.ts`)
Defines the database structure using Convex's schema builder:
- Users table with roles and permissions
- Meals with customization options
- Orders and order management
- Categories for menu organization
- Audit logs for tracking changes

### Mutations (`mutations.ts`)
Database write operations:
- `createMeal` / `updateMeal` / `deleteMeal` - Meal management
- `createOrder` / `updateOrderStatus` - Order processing
- `createCategory` - Menu categories
- `upsertCartSession` - Guest cart management

### Queries (`queries.ts`)
Database read operations:
- `getMeals` - Fetch all active meals
- `getMealById` - Single meal details
- `getCategories` - Menu categories
- `getUserOrders` - Order history

### Authentication (`auth.config.ts`)
Configures Logto integration with Convex's auth system.

## Development Commands

```bash
# Start Convex development server
npm run convex:dev

# Deploy functions to production
npm run convex:deploy

# Seed database with sample data
npm run db:seed
```

## Security

Convex provides built-in security through:
- Row-level security (RLS) via `secure.ts`
- Authentication-required mutations
- Permission-based access control
- Audit logging for sensitive operations

## Best Practices

1. **Type Safety**: Use generated types from `_generated` folder
2. **Real-time**: Leverage Convex's real-time capabilities for live updates
3. **Security**: Always check permissions in mutations
4. **Performance**: Use appropriate indexes for queries
5. **Validation**: Validate input data using Zod schemas

## Integration with Frontend

The frontend connects to Convex via the `ConvexReactClient`:

```typescript
import { ConvexReactClient } from 'convex/react';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
```

Use React hooks for data fetching:
```typescript
import { useQuery, useMutation } from 'convex/react';

// Query data
const meals = useQuery(api.queries.getMeals);

// Execute mutations
const createMeal = useMutation(api.mutations.createMeal);
```