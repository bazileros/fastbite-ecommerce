import { z } from 'zod';

// Core data schemas
export const ToppingSchema = z.object({
  id: z.string().min(1, 'Topping ID is required'),
  name: z.string().min(1, 'Topping name is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  category: z.string().min(1, 'Category is required'),
});

export const SideSchema = z.object({
  id: z.string().min(1, 'Side ID is required'),
  name: z.string().min(1, 'Side name is required'),
  price: z.number().min(0, 'Price must be non-negative'),
});

export const BeverageSchema = z.object({
  id: z.string().min(1, 'Beverage ID is required'),
  name: z.string().min(1, 'Beverage name is required'),
  price: z.number().min(0, 'Price must be non-negative'),
});

export const MealSchema = z.object({
  id: z.string().min(1, 'Meal ID is required'),
  name: z.string().min(1, 'Meal name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  image: z.string().url('Valid image URL is required'),
  category: z.string().min(1, 'Category is required'),
  rating: z.number().min(0).max(5, 'Rating must be between 0 and 5'),
  prepTime: z.string().min(1, 'Prep time is required'),
  calories: z.number().min(0, 'Calories must be non-negative'),
  spiceLevel: z.enum(['mild', 'medium', 'hot']),
  popular: z.boolean(),
  customizable: z.boolean(),
  toppings: z.array(ToppingSchema).optional(),
  sides: z.array(SideSchema).optional(),
  beverages: z.array(BeverageSchema).optional(),
});

export const CartItemSchema = z.object({
  id: z.string().min(1, 'Cart item ID is required'),
  meal: MealSchema,
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  toppings: z.array(ToppingSchema),
  sides: z.array(SideSchema),
  beverages: z.array(BeverageSchema),
  totalPrice: z.number().min(0, 'Total price must be non-negative'),
});

export const UserSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  email: z.string().email('Valid email is required'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
});

export const OrderSchema = z.object({
  id: z.string().min(1, 'Order ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  items: z.array(CartItemSchema).min(1, 'Order must contain at least one item'),
  total: z.number().min(0, 'Total must be non-negative'),
  status: z.enum(['pending', 'preparing', 'ready', 'completed']),
  paymentStatus: z.enum(['pending', 'completed', 'failed']),
  pickupTime: z.string().min(1, 'Pickup time is required'),
  createdAt: z.string().min(1, 'Created date is required'),
  updatedAt: z.string().min(1, 'Updated date is required'),
});

// Admin form schemas
export const NewMealFormSchema = z.object({
  name: z.string().min(1, 'Meal name is required').max(100, 'Name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  price: z.number().min(0, 'Price must be non-negative').max(1000, 'Price too high'),
  category: z.string().min(1, 'Category is required'),
  image: z.string().url('Valid image URL is required').optional().or(z.literal('')),
  prepTime: z.string().min(1, 'Prep time is required'),
  calories: z.number().min(0, 'Calories must be non-negative').max(5000, 'Calories too high'),
  spiceLevel: z.enum(['mild', 'medium', 'hot']),
});

export const BannerFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  subtitle: z.string().max(200, 'Subtitle too long').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  ctaText: z.string().min(1, 'CTA text is required').max(50, 'CTA text too long'),
  ctaLink: z.string().min(1, 'CTA link is required'),
  badgeText: z.string().max(50, 'Badge text too long').optional(),
  image: z.string().url('Valid image URL is required').optional().or(z.literal('')),
});

export const CarouselSettingsSchema = z.object({
  autoPlayInterval: z.number().min(1).max(30, 'Interval must be between 1-30 seconds'),
  transitionSpeed: z.number().min(100).max(1000, 'Speed must be between 100-1000ms'),
  showDots: z.boolean(),
  autoPlayEnabled: z.boolean(),
});

// Checkout form schemas
export const CustomerInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number too long'),
  specialInstructions: z.string().max(500, 'Instructions too long').optional(),
});

export const CheckoutFormSchema = z.object({
  customerInfo: CustomerInfoSchema,
  paymentMethod: z.enum(['card', 'cash']),
  pickupTime: z.string().min(1, 'Pickup time is required'),
});

// Report export schemas
export const ReportExportSchema = z.object({
  format: z.enum(['pdf', 'csv', 'excel']),
  dateRange: z.object({
    start: z.string().min(1, 'Start date is required'),
    end: z.string().min(1, 'End date is required'),
  }),
  includeCharts: z.boolean(),
  email: z.string().email('Valid email is required').optional(),
});

// Cookie consent schema
export const CookieConsentSchema = z.object({
  essential: z.boolean(),
  analytics: z.boolean(),
  marketing: z.boolean(),
});

// Type exports for TypeScript
export type Topping = z.infer<typeof ToppingSchema>;
export type Side = z.infer<typeof SideSchema>;
export type Beverage = z.infer<typeof BeverageSchema>;
export type Meal = z.infer<typeof MealSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type User = z.infer<typeof UserSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type NewMealForm = z.infer<typeof NewMealFormSchema>;
export type BannerForm = z.infer<typeof BannerFormSchema>;
export type CarouselSettings = z.infer<typeof CarouselSettingsSchema>;
export type CustomerInfo = z.infer<typeof CustomerInfoSchema>;
export type CheckoutForm = z.infer<typeof CheckoutFormSchema>;
export type ReportExport = z.infer<typeof ReportExportSchema>;
export type CookieConsent = z.infer<typeof CookieConsentSchema>;

// Validation helper functions
export const validateMeal = (data: unknown) => MealSchema.safeParse(data);
export const validateCartItem = (data: unknown) => CartItemSchema.safeParse(data);
export const validateOrder = (data: unknown) => OrderSchema.safeParse(data);
export const validateNewMealForm = (data: unknown) => NewMealFormSchema.safeParse(data);
export const validateBannerForm = (data: unknown) => BannerFormSchema.safeParse(data);
export const validateCheckoutForm = (data: unknown) => CheckoutFormSchema.safeParse(data);
export const validateReportExport = (data: unknown) => ReportExportSchema.safeParse(data);