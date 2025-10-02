'use client';

import {
  Suspense,
  useState,
} from 'react';

import {
  Clock,
  Menu,
  Moon,
  Phone,
  ShoppingCart,
  Store,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

import { AuthButtonsClient } from '@/components/AuthButtons';
import { CartSheet } from '@/components/cart-sheet';
import { ErrorBoundary } from '@/components/error-boundary';
import { SearchBar } from '@/components/search-bar';
import { SearchSkeleton } from '@/components/skeletons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/lib/cart-context';
import { Image } from '@imagekit/next';

interface HeaderProps {
  isAuthenticated: boolean;
  claims: Record<string, unknown> | null;
  accessToken: string | null;
}

export function Header({ isAuthenticated, claims, accessToken }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { items } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const navigation = [
    { name: 'Menu', href: '/menu' },
    ...(isAuthenticated ? [{ name: 'My Orders', href: '/orders' }] : []),
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
  <header className="top-0 z-50 sticky bg-background-light dark:bg-background-dark shadow-black/5 shadow-sm backdrop-blur-sm w-full">
      <div className="mx-auto px-4 container">
        <div className="flex justify-between items-center py-4 min-h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex flex-shrink-0 items-center space-x-2 hover:opacity-80 transition-opacity duration-200">
            <div className="relative w-8 h-8">
              <Image
                src="/fastbite-logo.png"
                alt="FastBite Logo"
                fill
                sizes="32px"
                className="object-contain hover:scale-105 transition-transform duration-200"
                priority
              />
            </div>
            <span className="font-display text-text-light dark:text-text-dark text-2xl">
              FastBite
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex flex-shrink-0 items-center space-x-8">
            <div className="hidden xl:block">
              <ErrorBoundary fallback={<div className="flex justify-center items-center bg-background-light dark:bg-background-dark rounded-lg w-64 h-10 text-text-secondary-light dark:text-text-secondary-dark text-sm">Search unavailable</div>}>
                <Suspense fallback={<SearchSkeleton />}>
                  <SearchBar />
                </Suspense>
              </ErrorBoundary>
            </div>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-semibold text-text-light hover:text-primary dark:text-text-dark transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Store Info - Desktop */}
          <div className="hidden 2xl:flex flex-shrink-0 items-center space-x-6 text-text-secondary-light dark:text-text-secondary-dark text-sm">
            <div className="flex items-center space-x-2 hover:text-text-light dark:hover:text-text-dark transition-colors duration-200">
              <Store className="flex-shrink-0 w-4 h-4" />
              <span className="truncate">In-store pickup</span>
            </div>
            <div className="flex items-center space-x-2 hover:text-text-light dark:hover:text-text-dark transition-colors duration-200">
              <Clock className="flex-shrink-0 w-4 h-4" />
              <span className="whitespace-nowrap">9AM - 10PM</span>
            </div>
            <div className="flex items-center space-x-2 hover:text-text-light dark:hover:text-text-dark transition-colors duration-200">
              <Phone className="flex-shrink-0 w-4 h-4" />
              <span className="whitespace-nowrap">(555) 123-4567</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex flex-shrink-0 items-center space-x-4">
            {/* Search - Tablet and below */}
            <div className="hidden xl:hidden md:block">
              <SearchBar />
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="hover:bg-background-light dark:hover:bg-background-dark p-2 rounded-lg transition-all duration-200"
            >
              <Sun className="w-4 h-4 rotate-0 dark:-rotate-90 scale-100 dark:scale-0 transition-all duration-300" />
              <Moon className="absolute w-4 h-4 rotate-90 dark:rotate-0 scale-0 dark:scale-100 transition-all duration-300" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Button */}
            <AuthButtonsClient isAuthenticated={isAuthenticated} claims={claims} accessToken={accessToken} />

            {/* Cart */}
            <ErrorBoundary fallback={
              <Button variant="ghost" size="sm" className="relative hover:bg-background-light dark:hover:bg-background-dark p-2 rounded-lg transition-all duration-200">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden lg:inline ml-2">Cart</span>
              </Button>
            }>
              <Suspense fallback={
                <Button variant="ghost" size="sm" className="relative hover:bg-background-light dark:hover:bg-background-dark p-2 rounded-lg transition-all duration-200">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden lg:inline ml-2">Cart</span>
                </Button>
              }>
                <CartSheet>
                  <Button variant="ghost" size="sm" className="relative hover:bg-background-light dark:hover:bg-background-dark p-2 rounded-lg transition-all duration-200">
                    <ShoppingCart className="w-4 h-4" />
                    {totalItems > 0 && (
                      <Badge className="-top-2 -right-2 absolute bg-primary p-0 rounded-full w-5 h-5 text-white text-xs">
                        {totalItems}
                      </Badge>
                    )}
                    <span className="hidden lg:inline ml-2">Cart</span>
                  </Button>
                </CartSheet>
              </Suspense>
            </ErrorBoundary>

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden hover:bg-background-light dark:hover:bg-background-dark p-2 rounded-lg transition-all duration-200">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-card-light dark:bg-card-dark w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="relative w-6 h-6">
                      <Image
                        src="/fastbite-logo.png"
                        alt="FastBite Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <SheetTitle className="font-display text-text-light dark:text-text-dark text-left">FastBite Menu</SheetTitle>
                  </div>
                  <SheetDescription className="text-text-secondary-light dark:text-text-secondary-dark text-left">
                    Navigate through our fast food experience
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-8">
                  <div className="mb-4">
                    <ErrorBoundary fallback={<div className="flex justify-center items-center bg-background-light dark:bg-background-dark rounded-lg w-full h-10 text-text-secondary-light dark:text-text-secondary-dark text-sm">Search unavailable</div>}>
                      <Suspense fallback={<SearchSkeleton />}>
                        <SearchBar />
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center font-semibold text-text-light hover:text-primary dark:text-text-dark text-lg transition-all hover:translate-x-2 duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="space-y-3 mt-8 pt-4 border-gray-200 dark:border-gray-700 border-t text-text-secondary-light dark:text-text-secondary-dark text-sm">
                    <div className="flex items-center space-x-2 hover:text-text-light dark:hover:text-text-dark transition-colors duration-200">
                      <Store className="w-4 h-4" />
                      <span>In-store pickup only</span>
                    </div>
                    <div className="flex items-center space-x-2 hover:text-text-light dark:hover:text-text-dark transition-colors duration-200">
                      <Clock className="w-4 h-4" />
                      <span>Open: 9AM - 10PM</span>
                    </div>
                    <div className="flex items-center space-x-2 hover:text-text-light dark:hover:text-text-dark transition-colors duration-200">
                      <Phone className="w-4 h-4" />
                      <span>(555) 123-4567</span>
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}