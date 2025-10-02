# Contributing to FastBite

Welcome! We appreciate your interest in contributing to FastBite. This guide will help you get started with development and contribution processes.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:
- Be respectful and inclusive
- Focus on constructive feedback
- Help create a positive community
- Report any unacceptable behavior

## Getting Started

### Development Setup

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/your-username/fastbite.git
   cd fastbite
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development**:
   ```bash
   npm run dev
   ```

### Project Structure

```
fastbite/
├── app/                    # Next.js App Router pages
├── components/            # Reusable React components
├── lib/                   # Utilities, types, schemas
├── convex/                # Database schema and functions
├── docs/                  # Documentation
├── public/                # Static assets
└── tests/                 # Test files
```

## Development Workflow

### 1. Choose an Issue

- Check [Issues](https://github.com/your-repo/fastbite/issues) for open tasks
- Look for `good first issue` or `help wanted` labels
- Comment on the issue to indicate you're working on it

### 2. Create a Branch

```bash
# Create and switch to new branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

### 3. Make Changes

Follow our coding standards:
- Use TypeScript for all new code
- Follow ESLint and Prettier rules
- Write meaningful commit messages
- Add tests for new features

### 4. Test Your Changes

```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Manual testing
npm run dev
```

### 5. Commit and Push

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add user profile page

- Add profile page component
- Integrate with authentication
- Add form validation
- Update navigation"

# Push to your fork
git push origin feature/your-feature-name
```

### 6. Create Pull Request

- Go to GitHub and create a Pull Request
- Fill out the PR template
- Link to related issues
- Request review from maintainers

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types for function parameters and return values
- Use interfaces for object shapes
- Leverage utility types where appropriate

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

type CreateUserInput = Omit<User, 'id'>;

function createUser(input: CreateUserInput): Promise<User> {
  // implementation
}

// Avoid
function createUser(input: any): any {
  // implementation
}
```

### React Components

- Use functional components with hooks
- Add TypeScript interfaces for props
- Use meaningful component names
- Follow the single responsibility principle

```typescript
// Good
interface MealCardProps {
  meal: Meal;
  onAddToCart: (meal: Meal) => void;
}

export function MealCard({ meal, onAddToCart }: MealCardProps) {
  return (
    <Card>
      <h3>{meal.name}</h3>
      <p>{meal.description}</p>
      <Button onClick={() => onAddToCart(meal)}>
        Add to Cart
      </Button>
    </Card>
  );
}
```

### File Naming

- Use kebab-case for files: `meal-card.tsx`
- Use PascalCase for components: `MealCard`
- Use camelCase for utilities: `formatPrice.ts`

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

Examples:
```
feat: add meal customization dialog
fix: resolve cart total calculation bug
docs: update API documentation
refactor: simplify authentication logic
```

## Testing

### Unit Tests

Write unit tests for utilities and hooks:

```typescript
// __tests__/utils/formatPrice.test.ts
import { formatPrice } from '@/lib/utils';

describe('formatPrice', () => {
  it('formats price correctly', () => {
    expect(formatPrice(10.99)).toBe('$10.99');
    expect(formatPrice(5)).toBe('$5.00');
  });
});
```

### Component Tests

Test React components with Testing Library:

```typescript
// __tests__/components/MealCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MealCard } from '@/components/meal-card';

const mockMeal = {
  id: '1',
  name: 'Burger',
  description: 'Delicious burger',
  price: 10.99,
};

describe('MealCard', () => {
  it('displays meal information', () => {
    render(<MealCard meal={mockMeal} onAddToCart={jest.fn()} />);

    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('Delicious burger')).toBeInTheDocument();
    expect(screen.getByText('$10.99')).toBeInTheDocument();
  });

  it('calls onAddToCart when button is clicked', () => {
    const mockOnAddToCart = jest.fn();
    render(<MealCard meal={mockMeal} onAddToCart={mockOnAddToCart} />);

    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));

    expect(mockOnAddToCart).toHaveBeenCalledWith(mockMeal);
  });
});
```

### Integration Tests

Test complete user flows:

```typescript
// __tests__/integration/cart.test.tsx
describe('Cart Flow', () => {
  it('allows user to add items and checkout', async () => {
    // Render app with cart provider
    // Navigate to menu
    // Add items to cart
    // Go to checkout
    // Complete order
    // Verify order creation
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments for complex functions
- Document component props and usage
- Explain business logic in comments

```typescript
/**
 * Calculates the total price of cart items including customizations
 * @param items - Array of cart items
 * @returns Total price as a number
 */
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const basePrice = item.meal.price;
    const customizationsPrice = item.selectedToppings.reduce(
      (sum, topping) => sum + topping.price,
      0
    );
    return total + (basePrice + customizationsPrice) * item.quantity;
  }, 0);
}
```

### Component Documentation

Document component usage and props:

```typescript
// components/meal-card.tsx

/**
 * Displays a meal card with image, details, and add to cart functionality
 *
 * @example
 * ```tsx
 * <MealCard
 *   meal={meal}
 *   onAddToCart={(meal) => addToCart(meal)}
 * />
 * ```
 */
export function MealCard({ meal, onAddToCart }: MealCardProps) {
  // implementation
}
```

## Pull Request Process

### PR Template

Fill out the PR template completely:

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots
If applicable, add screenshots of the changes

## Checklist
- [ ] Code follows project standards
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process

1. **Automated Checks**: CI runs tests and linting
2. **Code Review**: Maintainers review code quality and logic
3. **Testing**: Ensure all tests pass and functionality works
4. **Approval**: At least one maintainer approval required
5. **Merge**: Squash merge with descriptive commit message

## Issue Reporting

### Bug Reports

When reporting bugs, include:

- **Steps to reproduce**: Clear steps to reproduce the issue
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: Browser, OS, Node version
- **Screenshots**: If applicable

### Feature Requests

For new features, include:

- **Problem**: What's the problem this solves?
- **Solution**: How should it work?
- **Alternatives**: Other solutions considered
- **Additional context**: Screenshots, examples

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Discord/Slack**: Real-time chat (if available)

### Getting Help

- Check existing issues and documentation first
- Search for similar problems
- Ask clear, specific questions
- Provide code examples when possible

## Recognition

Contributors are recognized through:
- GitHub contributor statistics
- Mention in release notes
- Contributor spotlight (for significant contributions)
- Invitation to become a maintainer (for consistent contributors)

## License

By contributing to FastBite, you agree that your contributions will be licensed under the same license as the project (MIT License).

Thank you for contributing to FastBite! 🚀