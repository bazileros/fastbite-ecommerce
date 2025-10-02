import {
  ChevronRight,
  Home,
} from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1 text-muted-foreground text-sm', className)}
    >
      <Link
        href="/"
        className="flex items-center hover:text-foreground transition-colors"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Home</span>
      </Link>

      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center">
          <ChevronRight className="mx-1 w-4 h-4" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground" aria-current="page">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Generate breadcrumb data for different pages
export function getBreadcrumbData(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const href = '/' + segments.slice(0, i + 1).join('/');

    let label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Custom labels for specific routes
    switch (segment) {
      case 'menu':
        label = 'Menu';
        break;
      case 'about':
        label = 'About Us';
        break;
      case 'contact':
        label = 'Contact';
        break;
      case 'loyalty':
        label = 'Loyalty Program';
        break;
      case 'order-confirmation':
        label = 'Order Confirmation';
        break;
      case 'checkout':
        label = 'Checkout';
        break;
    }

    breadcrumbs.push({
      label,
      href: i === segments.length - 1 ? undefined : href,
    });
  }

  return breadcrumbs;
}