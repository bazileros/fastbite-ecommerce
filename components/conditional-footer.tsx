"use client";

import { usePathname } from 'next/navigation';

import { ErrorBoundary } from '@/components/error-boundary';

interface ConditionalFooterProps {
  children: React.ReactNode;
}

export function ConditionalFooter({ children }: ConditionalFooterProps) {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
}
