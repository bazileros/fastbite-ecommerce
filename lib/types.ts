export interface Topping {
  _id: string;
  _creationTime: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string; // ImageKit URL
  isActive: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  allergens?: string[];
  calories?: number;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface Side {
  _id: string;
  _creationTime: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string; // ImageKit URL
  isActive: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  allergens?: string[];
  calories?: number;
  prepTime?: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface Beverage {
  _id: string;
  _creationTime: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string; // ImageKit URL
  isActive: boolean;
  isAlcoholic?: boolean;
  isCaffeinated?: boolean;
  allergens?: string[];
  calories?: number;
  volume?: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface Meal {
  _id: string;
  _creationTime: number;
  name: string;
  description: string;
  price: number;
  image?: string; // ImageKit URL
  category: string;
  rating: number;
  prepTime: string;
  calories: number;
  spiceLevel: 'mild' | 'medium' | 'hot';
  popular: boolean;
  customizable: boolean;
  isActive: boolean;
  availableToppingIds?: string[];
  availableSideIds?: string[];
  availableBeverageIds?: string[];
  availableToppings?: Topping[];
  availableSides?: Side[];
  availableBeverages?: Beverage[];
  createdAt: number;
  updatedAt: number;
}

export interface CartItem {
  id: string;
  meal: Meal;
  quantity: number;
  toppings: Topping[];
  sides: Side[];
  beverages: Beverage[];
  totalPrice: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  paymentStatus: 'pending' | 'completed' | 'failed';
  pickupTime: string;
  createdAt: string;
  updatedAt: string;
}

// Cookie consent types
export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

// Google Analytics types
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'consent',
      targetId: string,
      config?: {
        [key: string]: string | number | boolean | undefined;
      }
    ) => void;
  }
}