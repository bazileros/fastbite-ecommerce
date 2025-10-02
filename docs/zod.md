# Zod Validation

Zod provides runtime type validation and TypeScript type inference for FastBite.

## Overview

Zod schemas ensure:
- Type-safe API inputs and outputs
- Runtime validation of user data
- Automatic TypeScript type generation
- Clear error messages for invalid data

## Schema Location

Validation schemas are defined in `lib/schemas.ts`:

```typescript
import { z } from 'zod';

// User schemas
export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["customer", "staff", "manager", "admin"]),
});

// Meal schemas
export const mealSchema = z.object({
  name: z.string().min(1, "Meal name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  spiceLevel: z.enum(["mild", "medium", "hot"]),
  calories: z.number().int().positive("Calories must be a positive integer"),
});

// Order schemas
export const orderSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Order must contain at least one item"),
  total: z.number().positive("Total must be positive"),
  pickupTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
});
```

## Usage Patterns

### Form Validation

Used with React Hook Form for client-side validation:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(mealSchema),
  defaultValues: {
    name: '',
    description: '',
    price: 0,
    // ...
  }
});
```

### API Validation

Server-side validation in API routes:

```typescript
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = mealSchema.parse(body);

    // Data is now type-safe
    await createMeal(validatedData);

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { errors: error.errors },
        { status: 400 }
      );
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Convex Integration

Zod schemas work with Convex mutations:

```typescript
// In mutations.ts
import { z } from 'zod';

const createMealArgs = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  // ...
});

export const createMeal = mutation({
  args: createMealArgs.shape, // Use Zod schema shape
  handler: async (ctx, args) => {
    // args is now validated
  }
});
```

## Advanced Features

### Custom Validation

```typescript
// Custom email validation
const emailSchema = z.string().refine(
  (email) => email.endsWith('@company.com'),
  "Only company emails allowed"
);

// Conditional validation
const userSchema = z.object({
  role: z.enum(["customer", "staff"]),
  employeeId: z.string().optional(),
}).refine(
  (data) => data.role !== "staff" || data.employeeId,
  "Employee ID required for staff"
);
```

### Error Handling

```typescript
try {
  const result = schema.parse(inputData);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation errors
    const formattedErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    return { errors: formattedErrors };
  }
}
```

### Type Inference

Zod automatically generates TypeScript types:

```typescript
// Define schema
const mealSchema = z.object({
  name: z.string(),
  price: z.number(),
});

// Infer type
type Meal = z.infer<typeof mealSchema>;
// Equivalent to: { name: string; price: number; }
```

## Best Practices

1. **Centralize Schemas**: Keep all schemas in `lib/schemas.ts`
2. **Reuse Schemas**: Create base schemas and extend them
3. **Descriptive Messages**: Provide clear error messages
4. **Type Safety**: Use `z.infer<>` for TypeScript types
5. **Validation Order**: Validate early, fail fast
6. **Sanitization**: Combine with data sanitization

## Testing

Test your schemas:

```typescript
describe('mealSchema', () => {
  it('validates correct meal data', () => {
    const validMeal = {
      name: 'Burger',
      description: 'Delicious burger',
      price: 10.99,
      // ...
    };
    expect(() => mealSchema.parse(validMeal)).not.toThrow();
  });

  it('rejects invalid data', () => {
    const invalidMeal = { name: '', price: -5 };
    expect(() => mealSchema.parse(invalidMeal)).toThrow();
  });
});
```

## Common Patterns

### Pagination Schema
```typescript
const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});
```

### Search Schema
```typescript
const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
});
```

### File Upload Schema
```typescript
const fileSchema = z.object({
  file: z.instanceof(File),
  name: z.string(),
}).refine(
  (data) => data.file.size <= 5 * 1024 * 1024, // 5MB limit
  "File size must be less than 5MB"
);
```