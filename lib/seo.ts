import type { Metadata } from 'next';

import { getBaseUrl } from '@/lib/utils';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  structuredData?: object;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  calories: number;
}

export function generateSEO(props: SEOProps): Metadata {
  const {
    title = 'FastBite - Premium Fast Food Experience',
    description = 'Order premium fast food with customizable options for in-store pickup. Fresh ingredients, authentic flavors, and lightning-fast service.',
    keywords = ['fast food', 'burgers', 'chicken', 'customizable meals', 'quick service', 'fresh ingredients'],
    image = '/og-image.jpg',
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
    noindex = false,
  } = props;

  const baseUrl = getBaseUrl();
  const canonicalUrl = url ? `${baseUrl}${url}` : baseUrl;
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  const metadata: Metadata = {
    title: {
      default: title,
      template: '%s | FastBite',
    },
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : [{ name: 'FastBite Team' }],
    creator: 'FastBite',
    publisher: 'FastBite',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'FastBite',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@fastbite',
      site: '@fastbite',
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-site-verification-code',
    },
  };

  // Add article-specific metadata
  if (type === 'article' && (publishedTime || modifiedTime || author || section || tags)) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
      section,
      tags,
    };
  }

  return metadata;
}

// Structured Data Generators
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FastBite',
    url: getBaseUrl(),
    logo: `${getBaseUrl()}/logo.png`,
    description: 'Premium fast food with customizable options for in-store pickup',
    foundingDate: '2020',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+27-21-123-4567',
      contactType: 'customer service',
      availableLanguage: 'English',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Main Street',
      addressLocality: 'Cape Town',
      addressRegion: 'Western Cape',
      postalCode: '8001',
      addressCountry: 'ZA',
    },
    sameAs: [
      'https://www.facebook.com/fastbite',
      'https://www.instagram.com/fastbite',
      'https://www.twitter.com/fastbite',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'FastBite Menu',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'MenuItem',
            name: 'Ultimate Beast Burger',
            description: 'Double beef patties with all the fixings',
          },
        },
      ],
    },
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FastBite',
    url: getBaseUrl(),
    description: 'Premium fast food with customizable options',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${getBaseUrl()}/menu?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${getBaseUrl()}${crumb.url}`,
    })),
  };
}

export function generateMenuItemSchema(meal: Meal) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    name: meal.name,
    description: meal.description,
    image: meal.image,
    offers: {
      '@type': 'Offer',
      price: meal.price,
      priceCurrency: 'ZAR',
      availability: 'https://schema.org/InStock',
    },
    nutrition: {
      '@type': 'NutritionInformation',
      calories: `${meal.calories} calories`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: meal.rating,
      reviewCount: '100', // This should be dynamic
    },
  };
}

export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'FastBite',
    image: `${getBaseUrl()}/restaurant-image.jpg`,
    telephone: '+27-21-123-4567',
    priceRange: 'R',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Main Street',
      addressLocality: 'Cape Town',
      addressRegion: 'Western Cape',
      postalCode: '8001',
      addressCountry: 'ZA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -33.9249,
      longitude: 18.4241,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '11:00',
        closes: '22:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '12:00',
        closes: '23:00',
      },
    ],
    servesCuisine: ['American', 'Fast Food', 'Burgers'],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1250',
    },
  };
}