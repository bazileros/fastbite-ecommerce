# TypeScript Types

FastBite uses TypeScript for type safety across the entire application stack.

## Overview

TypeScript provides:
- Compile-time type checking
- Better IDE support and autocomplete
- Self-documenting code
- Reduced runtime errors

## Type Definitions

### Core Types (`lib/types.ts`)

```typescript
// User types
export interface User {
  _id: Id<"users">;
  subject: string; // Logto subject
  name: string;
  email: string;
  role: "customer" | "staff" | "manager" | "admin";
  createdAt: number;
  updatedAt: number;
}

// Meal types
export interface Meal {
  _id: Id<"meals">;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  prepTime: string;
  calories: number;
  spiceLevel: "mild" | "medium" | "hot";
  popular: boolean;
  customizable: boolean;
  isActive: boolean;
  availableToppings: Topping[];
  availableSides: Side[];
  availableBeverages: Beverage[];
  createdAt: number;
  updatedAt: number;
}

// Customization types
export interface Topping {
  id: string;
  name: string;
  price: number;
  category: string; // "protein", "vegetables", "cheese", "sauce"
}

export interface Side {
  id: string;
  name: string;
  price: number;
}

export interface Beverage {
  id: string;
  name: string;
  price: number;
}

// Cart and Order types
export interface CartItem {
  mealId: Id<"meals">;
  quantity: number;
  selectedToppings: SelectedTopping[];
  selectedSides: SelectedSide[];
  selectedBeverages: SelectedBeverage[];
  totalPrice: number;
  specialInstructions?: string;
}

export interface Order {
  _id: Id<"orders">;
  userId: Id<"users">;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  pickupTime: string;
  specialInstructions?: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  assignedStaff?: Id<"users">;
}

// Enums
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";
```

## Generated Types

### Convex Generated Types

Convex automatically generates types from your schema:

```typescript
// From convex/_generated/dataModel.d.ts
import type { DataModelFromSchemaDefinition } from "convex/server";

export type Doc<TTableName extends TableNames> = Expand<
  ObjectType<Schema[Extract<TableNames, TTableName>]>
>;

export type Id<TTableName extends TableNames> = string & {
  __tableName: TTableName;
};
```

### API Types

Generated API types for client usage:

```typescript
// From convex/_generated/server.d.ts
export declare const api: {
  queries: {
    getMeals: QueryBuilder<null, Meal[]>;
    getMealById: QueryBuilder<{ mealId: Id<"meals"> }, Meal | null>;
    getUserOrders: QueryBuilder<null, Order[]>;
  };
  mutations: {
    createMeal: MutationBuilder<CreateMealArgs, Id<"meals">>;
    updateMeal: MutationBuilder<UpdateMealArgs, { success: boolean }>;
    createOrder: MutationBuilder<CreateOrderArgs, Id<"orders">>;
  };
};
```

## Utility Types

### React Hook Form Types

```typescript
import { UseFormReturn } from 'react-hook-form';

// Form data types
export type MealFormData = Omit<Meal, '_id' | 'createdAt' | 'updatedAt'>;

export type OrderFormData = {
  items: CartItem[];
  pickupTime: string;
  specialInstructions?: string;
};

// Form hook types
export type MealForm = UseFormReturn<MealFormData>;
export type OrderForm = UseFormReturn<OrderFormData>;
```

### API Response Types

```typescript
// Generic API response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search response
export interface SearchResponse<T> {
  data: T[];
  query: string;
  totalResults: number;
}
```

## Component Props Types

### UI Component Props

```typescript
// Button component props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
}

// Dialog component props
export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}
```

### Page Component Props

```typescript
// Menu page props
export interface MenuPageProps {
  searchParams: {
    category?: string;
    search?: string;
    sort?: "name" | "price" | "rating";
  };
}

// Admin dashboard props
export interface AdminDashboardProps {
  user: User;
  stats: {
    totalOrders: number;
    totalRevenue: number;
    activeMeals: number;
  };
}
```

## Type Guards

### Runtime Type Checking

```typescript
// Type guard for user roles
export function isStaffRole(role: string): role is UserRole {
  return ["staff", "manager", "admin"].includes(role);
}

// Type guard for order status
export function isActiveOrder(status: OrderStatus): boolean {
  return ["pending", "confirmed", "preparing", "ready"].includes(status);
}

// Type guard for meal customization
export function hasCustomizations(meal: Meal): boolean {
  return meal.availableToppings.length > 0 ||
         meal.availableSides.length > 0 ||
         meal.availableBeverages.length > 0;
}
```

## Advanced Types

### Generic Utility Types

```typescript
// Make all properties optional except specified ones
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Extract nested type from union
export type ExtractType<T, U> = T extends { type: U } ? T : never;

// Deep partial for nested objects
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

### Database Query Types

```typescript
// Query filter types
export type MealFilters = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  spiceLevel?: SpiceLevel;
  isPopular?: boolean;
  isActive?: boolean;
};

// Sort options
export type MealSortOption =
  | "name"
  | "price"
  | "rating"
  | "createdAt"
  | "-name"
  | "-price"
  | "-rating"
  | "-createdAt";
```

## Best Practices

1. **Strict Mode**: Enable strict TypeScript settings
2. **Interface vs Type**: Use interfaces for objects, types for unions
3. **Generic Constraints**: Use constraints for reusable generics
4. **Branded Types**: Use branded types for domain-specific strings
5. **Utility Types**: Leverage built-in utility types (Partial, Pick, etc.)
6. **Type Assertions**: Avoid `as any`, use proper type guards instead

## Development Tips

### Auto-import Types
Configure your IDE to auto-import types from `lib/types.ts`.

### Type Checking
Run type checking during development:
```bash
npm run type-check
```

### Convex Type Generation
Regenerate Convex types after schema changes:
```bash
npm run convex:dev  # Types auto-generate
```

### Debugging Types
Use TypeScript's `keyof`, `typeof`, and `instanceof` for debugging complex types.