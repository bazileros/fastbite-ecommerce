# Frontend Architecture

FastBite's frontend is built with Next.js 13+ App Router, TypeScript, and modern React patterns.

## Tech Stack

- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **State Management**: React Context + Convex
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## Project Structure

```
app/                    # Next.js App Router
├── layout.tsx         # Root layout with providers
├── page.tsx           # Home page
├── globals.css        # Global styles
├── (routes)/          # Route groups
│   ├── menu/
│   ├── checkout/
│   ├── admin/
│   └── auth/
└── api/               # API routes

components/            # Reusable components
├── ui/               # Radix UI wrappers
├── Header.tsx        # Navigation header
├── Footer.tsx        # Site footer
├── CartSheet.tsx     # Shopping cart
├── MealCard.tsx      # Meal display card
└── ...

lib/                  # Utilities and configurations
├── utils.ts          # Helper functions
├── types.ts          # TypeScript definitions
├── schemas.ts        # Zod validation schemas
├── cart-context.tsx  # Cart state management
├── convex-client.ts  # Convex client setup
└── ...

hooks/                # Custom React hooks
├── use-auth.ts       # Authentication hook
├── use-toast.ts      # Toast notifications
└── ...

public/               # Static assets
└── fastbite-logo.png
```

## Key Components

### Layout System (`app/layout.tsx`)

Root layout with essential providers:

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ConvexProvider client={convex}>
            <CartProvider>
              <Toaster />
              {children}
            </CartProvider>
          </ConvexProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Cart Management (`lib/cart-context.tsx`)

Global cart state using React Context:

```typescript
interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (mealId: string, quantity: number) => void;
  removeItem: (mealId: string) => void;
  clearCart: () => void;
  total: number;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Cart operations...
}
```

### UI Components (`components/ui/`)

Radix UI wrapper components for consistency:

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        // ...
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        // ...
      },
    },
  }
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

## Page Components

### Home Page (`app/page.tsx`)

```typescript
export default function HomePage() {
  return (
    <div>
      <HeroCarousel />
      <FeaturedMeals />
      <CategorySection />
      <NewsletterSignup />
    </div>
  );
}
```

### Menu Page (`app/menu/page.tsx`)

```typescript
export default function MenuPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const meals = useQuery(api.queries.getMeals);
  const categories = useQuery(api.queries.getCategories);

  // Filter and search logic...

  return (
    <div className="container mx-auto px-4">
      <MenuFilters />
      <MealGrid meals={filteredMeals} />
    </div>
  );
}
```

### Checkout Page (`app/checkout/page.tsx`)

```typescript
'use client';

export default function CheckoutPage() {
  const { items, total } = useCart();
  const createOrder = useMutation(api.mutations.createOrder);

  const handleSubmit = async (formData: CheckoutFormData) => {
    try {
      const orderId = await createOrder({
        items,
        total,
        pickupTime: formData.pickupTime,
        // ...
      });

      router.push(`/order-confirmation/${orderId}`);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <CheckoutForm onSubmit={handleSubmit} />
  );
}
```

## Custom Hooks

### Authentication Hook (`hooks/use-auth.ts`)

```typescript
import { useUser } from '@clerk/nextjs';

export function useAuth() {
  const { user, isLoaded } = useUser();

  return {
    user,
    isLoaded,
    isAuthenticated: !!user,
    role: user?.publicMetadata?.role as UserRole,
  };
}
```

### Convex Queries Hook

```typescript
export function useMeals(filters?: MealFilters) {
  return useQuery(
    api.queries.getMeals,
    filters ? { filters } : undefined
  );
}
```

## Forms and Validation

### Meal Creation Form

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function MealForm() {
  const form = useForm<MealFormData>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      // ...
    },
  });

  const createMeal = useMutation(api.mutations.createMeal);

  const onSubmit = async (data: MealFormData) => {
    try {
      await createMeal(data);
      form.reset();
      toast.success('Meal created successfully');
    } catch (error) {
      toast.error('Failed to create meal');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Other fields... */}
        <Button type="submit">Create Meal</Button>
      </form>
    </Form>
  );
}
```

## State Management

### Server State (Convex)

```typescript
// Real-time data fetching
const meals = useQuery(api.queries.getMeals);
const user = useQuery(api.queries.getCurrentUser);

// Mutations
const createMeal = useMutation(api.mutations.createMeal);
const updateMeal = useMutation(api.mutations.updateMeal);
```

### Client State (Context)

```typescript
// Cart context for local state
const { items, addItem, removeItem } = useCart();

// UI state with useState
const [isOpen, setIsOpen] = useState(false);
const [selectedCategory, setSelectedCategory] = useState<string>();
```

## Styling Approach

### Tailwind CSS Classes

```typescript
// Utility-first approach
<div className="flex items-center justify-between p-4 border-b">
  <h1 className="text-2xl font-bold">Menu</h1>
  <Button variant="outline">Add Item</Button>
</div>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

### CSS Variables and Themes

```css
/* globals.css */
:root {
  --primary: 222.2 84% 4.9%;
  --background: 0 0% 100%;
  /* ... */
}

.dark {
  --primary: 210 40% 98%;
  --background: 222.2 84% 4.9%;
  /* ... */
}
```

## Performance Optimizations

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src={meal.image}
  alt={meal.name}
  width={400}
  height={300}
  className="rounded-lg object-cover"
  priority // For above-the-fold images
  placeholder="blur"
/>
```

### Code Splitting

```typescript
// Dynamic imports for heavy components
const MealCustomizationDialog = dynamic(
  () => import('@/components/meal-customization-dialog'),
  { loading: () => <Skeleton /> }
);
```

### Memoization

```typescript
const MealCard = memo(function MealCard({ meal }: { meal: Meal }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{meal.name}</CardTitle>
        <CardDescription>{meal.description}</CardDescription>
      </CardHeader>
      {/* ... */}
    </Card>
  );
});
```

## Error Handling

### Error Boundaries

```typescript
// components/error-boundary.tsx
'use client';

export class ErrorBoundary extends Component {
  // Error boundary implementation
}
```

### API Error Handling

```typescript
try {
  await createMeal(formData);
} catch (error) {
  if (error instanceof ConvexError) {
    // Handle Convex-specific errors
    toast.error(error.message);
  } else {
    // Handle generic errors
    toast.error('Something went wrong');
  }
}
```

## Testing Strategy

### Component Testing

```typescript
// __tests__/MealCard.test.tsx
import { render, screen } from '@testing-library/react';

describe('MealCard', () => {
  it('displays meal information', () => {
    render(<MealCard meal={mockMeal} />);

    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('$10.99')).toBeInTheDocument();
  });
});
```

### Integration Testing

```typescript
// Test cart functionality
describe('Cart', () => {
  it('adds items to cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Test cart interactions
  });
});
```

## Development Workflow

### Local Development

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

### Component Development

1. Create component in appropriate folder
2. Add TypeScript types
3. Implement with proper error handling
4. Add tests
5. Update documentation

### Code Quality

- ESLint for code linting
- Prettier for code formatting
- Husky for pre-commit hooks
- TypeScript for type checking

## Deployment

### Build Process

```bash
# Production build
npm run build

# Export static files (if needed)
npm run export
```

### Environment Variables

```env
# Production environment
NEXT_PUBLIC_CONVEX_URL=https://your-convex-url
NEXT_PUBLIC_BASE_URL=https://your-domain.com
# ... other vars
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance