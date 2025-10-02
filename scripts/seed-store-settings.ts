import { ConvexHttpClient } from 'convex/browser';

import { api } from '../convex/_generated/api';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error('NEXT_PUBLIC_CONVEX_URL environment variable is required');
}

const convex = new ConvexHttpClient(convexUrl);

async function seedStoreSettings() {
  console.log('🌱 Seeding store settings...');

  const defaultSettings = [
    // General settings
    {
      key: 'general.storeName',
      value: 'FastBite',
      description: 'The name of the store',
      category: 'general',
      isPublic: true,
    },
    {
      key: 'general.description',
      value: 'Premium fast food experience with customizable options and lightning-fast pickup.',
      description: 'Short description of the store',
      category: 'general',
      isPublic: true,
    },

    // Hero section
    {
      key: 'hero.title',
      value: 'Customize Your Perfect Meal',
      description: 'Main hero title',
      category: 'content',
      isPublic: true,
    },
    {
      key: 'hero.subtitle',
      value: 'Build your ideal fast food experience with premium ingredients, unlimited customization, and lightning-fast in-store pickup.',
      description: 'Hero subtitle/description',
      category: 'content',
      isPublic: true,
    },
    {
      key: 'hero.image',
      value: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Hero background image URL',
      category: 'appearance',
      isPublic: true,
    },
    {
      key: 'hero.avgPickupTime',
      value: '15 Min',
      description: 'Average pickup time displayed in hero',
      category: 'content',
      isPublic: true,
    },
    {
      key: 'hero.customerCount',
      value: '10K+',
      description: 'Customer count displayed in hero',
      category: 'content',
      isPublic: true,
    },
    {
      key: 'hero.rating',
      value: '4.9',
      description: 'Store rating displayed in hero',
      category: 'content',
      isPublic: true,
    },

    // Contact information
    {
      key: 'contact.address',
      value: '123 Fast Food Ave, City, State 12345',
      description: 'Store address',
      category: 'contact',
      isPublic: true,
    },
    {
      key: 'contact.phone',
      value: '(555) 123-4567',
      description: 'Store phone number',
      category: 'contact',
      isPublic: true,
    },
    {
      key: 'contact.email',
      value: 'hello@fastbite.com',
      description: 'Store email address',
      category: 'contact',
      isPublic: true,
    },
    {
      key: 'contact.hours',
      value: {
        monday: '9:00 AM - 10:00 PM',
        tuesday: '9:00 AM - 10:00 PM',
        wednesday: '9:00 AM - 10:00 PM',
        thursday: '9:00 AM - 10:00 PM',
        friday: '9:00 AM - 11:00 PM',
        saturday: '9:00 AM - 11:00 PM',
        sunday: '10:00 AM - 9:00 PM'
      },
      description: 'Store hours for each day',
      category: 'contact',
      isPublic: true,
    },

    // Social media links
    {
      key: 'social.instagram',
      value: '#',
      description: 'Instagram profile URL',
      category: 'social',
      isPublic: true,
    },
    {
      key: 'social.twitter',
      value: '#',
      description: 'Twitter profile URL',
      category: 'social',
      isPublic: true,
    },
    {
      key: 'social.facebook',
      value: '#',
      description: 'Facebook page URL',
      category: 'social',
      isPublic: true,
    },

    // About page content
    {
      key: 'about.heroTitle',
      value: 'About FastBite',
      description: 'About page hero title',
      category: 'content',
      isPublic: true,
    },
    {
      key: 'about.heroSubtitle',
      value: 'Bringing delicious, authentic flavors to your table with lightning-fast service',
      description: 'About page hero subtitle',
      category: 'content',
      isPublic: true,
    },
    {
      key: 'about.rating',
      value: '4.8',
      description: 'About page rating',
      category: 'content',
      isPublic: true,
    },
    {
      key: 'about.customerCount',
      value: '50K+',
      description: 'About page customer count',
      category: 'content',
      isPublic: true,
    },
    {
      key: 'about.story',
      value: {
        title: 'Our Story',
        paragraphs: [
          'FastBite was born from a simple idea: great food should not take forever. Founded in 2020 by a team of passionate food enthusiasts, we set out to revolutionize the fast-casual dining experience.',
          'What started as a small food truck serving fresh, authentic meals has grown into a beloved local institution. Our commitment to quality ingredients, innovative flavors, and exceptional service has made us the go-to destination for food lovers across the city.',
          'Today, FastBite continues to push boundaries, blending traditional recipes with modern techniques to create unforgettable dining experiences. Every meal is crafted with care, using only the finest ingredients and served with the warmth that has become our signature.'
        ],
        quote: '"FastBite isn\'t just about food—it\'s about creating moments of joy and connection through exceptional culinary experiences."',
        quoteAttribution: 'Our Founders'
      },
      description: 'About page story content',
      category: 'content',
      isPublic: true,
    },
    {
      key: 'about.mission',
      value: 'To deliver exceptional fast-casual dining experiences that combine authentic flavors, sustainable practices, and outstanding service, making every meal memorable and every customer feel valued.',
      description: 'Company mission statement',
      category: 'content',
      isPublic: true,
    },
    {
      key: 'about.vision',
      value: 'To become the leading fast-casual restaurant chain known for innovation, sustainability, and creating positive impact in communities worldwide.',
      description: 'Company vision statement',
      category: 'content',
      isPublic: true,
    },
    {
      key: 'about.stats',
      value: {
        customers: '50K+',
        dishes: '25',
        rating: '4.8',
        locations: '3'
      },
      description: 'About page statistics',
      category: 'content',
      isPublic: true,
    },
  ];

  try {
    // Use the seeding mutation that doesn't require authentication
    await convex.mutation(api.mutations.seedStoreSettings, {
      settings: defaultSettings,
    });

    console.log('✅ Store settings seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding store settings:', error);
  }
}

// Run the seed function
seedStoreSettings().catch(console.error);