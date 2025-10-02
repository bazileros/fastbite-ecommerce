import { ConvexHttpClient } from 'convex/browser';

import { api } from '../convex/_generated/api';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error('NEXT_PUBLIC_CONVEX_URL environment variable is required');
}

const convex = new ConvexHttpClient(convexUrl);

async function seedDatabase() {
  console.log('🌱 Seeding database with sample data...');

  try {
    // Create sample users
    console.log('Creating sample users...');
    const adminUser = await convex.mutation(api.mutations.upsertUser, {
      subject: 'admin_logto_subject_123',
      email: 'admin@fastbite.com',
      name: 'Admin User',
      role: 'admin',
    });
    console.log('✅ Admin user created:', adminUser);

    const staffUser = await convex.mutation(api.mutations.upsertUser, {
      subject: 'staff_logto_subject_456',
      email: 'staff@fastbite.com',
      name: 'Staff User',
      role: 'staff',
    });
    console.log('✅ Staff user created:', staffUser);

    const customerUser = await convex.mutation(api.mutations.upsertUser, {
      subject: 'customer_logto_subject_789',
      email: 'customer@fastbite.com',
      name: 'Customer User',
      role: 'customer',
    });
    console.log('✅ Customer user created:', customerUser);

    // Create sample categories
    console.log('Creating sample categories...');
    await convex.mutation(api.mutations.createCategory, {
      name: 'Burgers',
      description: 'Juicy, flavorful burgers',
      sortOrder: 1,
    });
    console.log('✅ Burger category created');

    await convex.mutation(api.mutations.createCategory, {
      name: 'Pizza',
      description: 'Wood-fired pizzas',
      sortOrder: 2,
    });
    console.log('✅ Pizza category created');

    // Create sample toppings
    console.log('Creating sample toppings...');
    const extraCheeseTopping = await convex.mutation(api.mutations.createTopping, {
      name: 'Extra Cheese',
      description: 'Additional cheese',
      price: 1.50,
      category: 'cheese',
      sortOrder: 1,
      claims: {
        sub: 'admin_logto_subject_123',
        email: 'admin@fastbite.com',
        name: 'Admin User',
        roles: ['admin'],
      },
    });
    console.log('✅ Extra cheese topping created');

    const baconTopping = await convex.mutation(api.mutations.createTopping, {
      name: 'Bacon',
      description: 'Crispy bacon strips',
      price: 2.00,
      category: 'protein',
      sortOrder: 2,
      claims: {
        sub: 'admin_logto_subject_123',
        email: 'admin@fastbite.com',
        name: 'Admin User',
        roles: ['admin'],
      },
    });
    console.log('✅ Bacon topping created');

    const extraMozzarellaTopping = await convex.mutation(api.mutations.createTopping, {
      name: 'Extra Mozzarella',
      description: 'Additional mozzarella cheese',
      price: 2.00,
      category: 'cheese',
      sortOrder: 3,
      claims: {
        sub: 'admin_logto_subject_123',
        email: 'admin@fastbite.com',
        name: 'Admin User',
        roles: ['admin'],
      },
    });
    console.log('✅ Extra mozzarella topping created');

    const pepperoniTopping = await convex.mutation(api.mutations.createTopping, {
      name: 'Pepperoni',
      description: 'Spicy pepperoni slices',
      price: 3.00,
      category: 'protein',
      sortOrder: 4,
      claims: {
        sub: 'admin_logto_subject_123',
        email: 'admin@fastbite.com',
        name: 'Admin User',
        roles: ['admin'],
      },
    });
    console.log('✅ Pepperoni topping created');

    // Create sample sides
    console.log('Creating sample sides...');
    const friesSide = await convex.mutation(api.mutations.createSide, {
      name: 'French Fries',
      description: 'Crispy golden fries',
      price: 3.99,
      category: 'sides',
      sortOrder: 1,
      claims: {
        sub: 'admin_logto_subject_123',
        email: 'admin@fastbite.com',
        name: 'Admin User',
        roles: ['admin'],
      },
    });
    console.log('✅ French fries side created');

    const onionRingsSide = await convex.mutation(api.mutations.createSide, {
      name: 'Onion Rings',
      description: 'Crispy battered onion rings',
      price: 4.99,
      category: 'sides',
      sortOrder: 2,
      claims: {
        sub: 'admin_logto_subject_123',
        email: 'admin@fastbite.com',
        name: 'Admin User',
        roles: ['admin'],
      },
    });
    console.log('✅ Onion rings side created');

    const garlicBreadSide = await convex.mutation(api.mutations.createSide, {
      name: 'Garlic Bread',
      description: 'Toasted garlic bread with herbs',
      price: 4.99,
      category: 'sides',
      sortOrder: 3,
      claims: {
        sub: 'admin_logto_subject_123',
        email: 'admin@fastbite.com',
        name: 'Admin User',
        roles: ['admin'],
      },
    });
    console.log('✅ Garlic bread side created');

    const saladSide = await convex.mutation(api.mutations.createSide, {
      name: 'Caesar Salad',
      description: 'Fresh Caesar salad with croutons',
      price: 5.99,
      category: 'sides',
      sortOrder: 4,
      claims: {
        sub: 'admin_logto_subject_123',
        email: 'admin@fastbite.com',
        name: 'Admin User',
        roles: ['admin'],
      },
    });
    console.log('✅ Caesar salad side created');

    // Create sample beverages
    console.log('Creating sample beverages...');
    const colaBeverage = await convex.mutation(api.mutations.createBeverage, {
      name: 'Cola',
      description: 'Classic cola drink',
      price: 2.49,
      category: 'sodas',
      sortOrder: 1,
      claims: {
        sub: 'admin_logto_subject_123',
        email: 'admin@fastbite.com',
        name: 'Admin User',
        roles: ['admin'],
      },
    });
    console.log('✅ Cola beverage created');

    const spriteBeverage = await convex.mutation(api.mutations.createBeverage, {
      name: 'Sprite',
      description: 'Lemon-lime soda',
      price: 2.49,
      category: 'sodas',
      sortOrder: 2,
      claims: {
        sub: 'admin_logto_subject_123',
        email: 'admin@fastbite.com',
        name: 'Admin User',
        roles: ['admin'],
      },
    });
    console.log('✅ Sprite beverage created');

    const lemonadeBeverage = await convex.mutation(api.mutations.createBeverage, {
      name: 'Lemonade',
      description: 'Fresh lemonade',
      price: 2.99,
      category: 'non-alcoholic',
      sortOrder: 3,
      claims: {
        sub: 'admin_logto_subject_123',
        email: 'admin@fastbite.com',
        name: 'Admin User',
        roles: ['admin'],
      },
    });
    console.log('✅ Lemonade beverage created');

    // Create sample meals
    console.log('Creating sample meals...');
    const burgerMeal = await convex.mutation(api.mutations.createMeal, {
      name: 'Classic Cheeseburger',
      description: 'Juicy beef patty with cheese, lettuce, tomato, and our special sauce',
      price: 12.99,
      category: 'Burgers',
      prepTime: '10 min',
      calories: 650,
      spiceLevel: 'mild',
      availableToppingIds: [extraCheeseTopping, baconTopping],
      availableSideIds: [friesSide, onionRingsSide],
      availableBeverageIds: [colaBeverage, spriteBeverage],
    });
    console.log('✅ Burger meal created');

    const pizzaMeal = await convex.mutation(api.mutations.createMeal, {
      name: 'Margherita Pizza',
      description: 'Fresh mozzarella, tomato sauce, and basil on our signature crust',
      price: 15.99,
      category: 'Pizza',
      prepTime: '15 min',
      calories: 800,
      spiceLevel: 'mild',
      availableToppingIds: [extraMozzarellaTopping, pepperoniTopping],
      availableSideIds: [garlicBreadSide, saladSide],
      availableBeverageIds: [colaBeverage, lemonadeBeverage],
    });
    console.log('✅ Pizza meal created');

    // Create sample orders
    console.log('Creating sample orders...');
    const order1 = await convex.mutation(api.mutations.createOrder, {
      items: [
        {
          mealId: burgerMeal,
          quantity: 1,
          selectedToppings: [{ id: 'bacon', name: 'Bacon', price: 2.00 }],
          selectedSides: [{ id: 'fries', name: 'French Fries', price: 3.99 }],
          selectedBeverages: [{ id: 'cola', name: 'Cola', price: 2.49 }],
          totalPrice: 12.99 + 2.00 + 3.99 + 2.49,
        },
      ],
      total: 21.47,
      pickupTime: 'ASAP',
    });
    console.log('✅ Order 1 created');

    const order2 = await convex.mutation(api.mutations.createOrder, {
      items: [
        {
          mealId: pizzaMeal,
          quantity: 2,
          selectedToppings: [],
          selectedSides: [{ id: 'garlic-bread', name: 'Garlic Bread', price: 4.99 }],
          selectedBeverages: [{ id: 'lemonade', name: 'Lemonade', price: 2.99 }],
          totalPrice: (15.99 * 2) + 4.99 + 2.99,
        },
      ],
      total: 40.95,
      pickupTime: 'In 30 minutes',
    });
    console.log('✅ Order 2 created');

    // Update order statuses
    await convex.mutation(api.mutations.updateOrderStatus, {
      orderId: order1,
      status: 'completed',
    });
    console.log('✅ Order 1 marked as completed');

    await convex.mutation(api.mutations.updateOrderStatus, {
      orderId: order2,
      status: 'preparing',
    });
    console.log('✅ Order 2 marked as preparing');

    console.log('🎉 Database seeded successfully!');
    console.log('You can now access the admin dashboard at /admin');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seedDatabase().catch(console.error);