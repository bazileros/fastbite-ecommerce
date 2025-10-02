"use client";

import { ErrorBoundary } from '@/components/error-boundary';
import { HeaderSkeleton } from '@/components/skeletons';
import { Suspense } from 'react';
import { usePathname } from 'next/navigation';

interface ConditionalHeaderProps {
  children: React.ReactNode;
}

export function ConditionalHeader({ children }: ConditionalHeaderProps) {
	const pathname = usePathname();

	// Don't show the main header on admin pages
	if (pathname?.startsWith('/admin')) {
		return null;
	}

	return (
		<ErrorBoundary>
			<Suspense fallback={<HeaderSkeleton />}>
				{children}
			</Suspense>
		</ErrorBoundary>
	);
}