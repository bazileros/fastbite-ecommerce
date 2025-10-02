import './globals.css';

import { Suspense } from 'react';

import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { ConditionalFooter } from '@/components/conditional-footer';
import { ConditionalHeader } from '@/components/conditional-header';
import { ConvexProviderWrapper } from '@/components/convex-provider';
import { CookiePopup } from '@/components/cookie-popup';
import { ErrorBoundary } from '@/components/error-boundary';
import { Footer } from '@/components/footer';
import { ServerHeader } from '@/components/server-header';
import { StructuredData } from '@/components/structured-data';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/lib/cart-context';
import { CookieProvider } from '@/lib/cookie-context';
import { generateSEO } from '@/lib/seo';
import { ImageKitProvider } from '@imagekit/next';

const cakecafe = localFont({
  src: [
    {
      path: './fonts/Cakecafe.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Cakecafe.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-cakecafe',
});



export const metadata: Metadata = generateSEO({
	title: "FastBite - Premium Fast Food Experience",
	description:
		"Order premium fast food with customizable options for in-store pickup. Fresh ingredients, authentic flavors, and lightning-fast service in Cape Town.",
	keywords: [
		"fast food Cape Town",
		"burgers South Africa",
		"customizable meals",
		"fresh ingredients",
		"quick service restaurant",
		"FastBite",
		"food delivery",
		"in-store pickup",
		"premium fast food",
	],
	image: "/og-image.jpg",
	url: "/",
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const configuredImagekitUrl =
		process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKIT_URL_ENDPOINT || '';

	if (!configuredImagekitUrl && process.env.NODE_ENV === 'development') {
		console.warn('ImageKit urlEndpoint is not configured. Set NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT in your environment.');
	}

	const imagekitUrlEndpoint = configuredImagekitUrl || 'https://ik.imagekit.io/placeholder';

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/fastbite-logo.ico" sizes="any" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<meta name="theme-color" content="#ff6b35" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</head>
			<body className={`${cakecafe.variable} font-cakecafe`}>
				<ImageKitProvider urlEndpoint={imagekitUrlEndpoint}>
					<ConvexProviderWrapper>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
							<CookieProvider>
								<CartProvider>
									<StructuredData type="organization" />
									<StructuredData type="website" />
									<StructuredData type="localBusiness" />
									<div className="flex flex-col bg-background min-h-screen">
										<ConditionalHeader>
											<ServerHeader />
										</ConditionalHeader>
										<main className="flex-1">
											<ErrorBoundary>
												<Suspense
													fallback={
														<div className="flex justify-center items-center min-h-[400px]">
															<div className="text-center">
																<div className="mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
																<p className="text-muted-foreground">
																	Loading...
																</p>
															</div>
														</div>
													}
												>
													{children}
												</Suspense>
											</ErrorBoundary>
										</main>
										<ConditionalFooter>
											<Footer />
										</ConditionalFooter>
									</div>
									<Toaster />
									<CookiePopup />
								</CartProvider>
							</CookieProvider>
						</ThemeProvider>
					</ConvexProviderWrapper>
				</ImageKitProvider>
			</body>
		</html>
	);
}
