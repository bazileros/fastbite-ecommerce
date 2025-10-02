import type { Meal } from '@/lib/seo';
import {
  generateBreadcrumbSchema,
  generateLocalBusinessSchema,
  generateMenuItemSchema,
  generateOrganizationSchema,
  generateWebsiteSchema,
} from '@/lib/seo';

interface StructuredDataProps {
  type: 'organization' | 'website' | 'localBusiness' | 'breadcrumb' | 'menuItem';
  data?: Meal | Array<{ name: string; url: string }>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  let schema: object | null = null;

  switch (type) {
    case 'organization':
      schema = generateOrganizationSchema();
      break;
    case 'website':
      schema = generateWebsiteSchema();
      break;
    case 'localBusiness':
      schema = generateLocalBusinessSchema();
      break;
    case 'breadcrumb':
      if (Array.isArray(data)) {
        schema = generateBreadcrumbSchema(data);
      }
      break;
    case 'menuItem':
      if (data && !Array.isArray(data)) {
        schema = generateMenuItemSchema(data as Meal);
      }
      break;
    default:
      return null;
  }

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}