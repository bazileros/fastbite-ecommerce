"use client";

import { useState } from 'react';

import {
  Menu,
  Moon,
  Sun,
  User,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AuthButtonsClient } from '@/components/AuthButtons';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Image } from '@imagekit/next';

interface AdminHeaderProps {
  user: {
    subject: string;
    email?: string;
    name?: string;
    role: string;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Menu Management', href: '/admin/menu', icon: '🍽️' },
    { name: 'Toppings', href: '/admin/toppings', icon: '🥗' },
    { name: 'Sides', href: '/admin/sides', icon: '🍟' },
    { name: 'Beverages', href: '/admin/beverages', icon: '🥤' },
    { name: 'Categories', href: '/admin/categories', icon: '📁' },
    { name: 'Orders', href: '/admin/orders', icon: '📋' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
    { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="top-0 z-50 sticky bg-background/95 backdrop-blur-md border-b w-full glass-effect">
      <div className="mx-auto px-4 container">
        <div className="flex justify-between items-center py-3 min-h-[72px]">
          {/* Logo */}
          <Link href="/admin" className="flex flex-shrink-0 items-center space-x-2 hover:opacity-80 transition-opacity duration-200">
            <div className="relative w-8 h-8">
              <Image
                src="/fastbite-logo.png"
                alt="FastBite Admin"
                fill
                sizes="32px"
                className="object-contain hover:scale-105 transition-transform duration-200"
                priority
              />
            </div>
            <span className="bg-clip-text bg-gradient-to-r from-primary hover:from-primary/90 to-primary/70 hover:to-primary/60 font-bold text-transparent text-xl transition-all duration-200">
              FastBite Admin
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex flex-shrink-0 items-center space-x-6 xl:space-x-8">
            {adminNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  isActive(item.href)
                    ? 'text-primary'
                    : 'text-foreground/80 hover:text-primary'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </span>
                <span className={`-bottom-1 left-0 absolute bg-primary h-0.5 transition-all duration-200 ${
                  isActive(item.href) ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            ))}
          </nav>

          {/* Admin Info */}
          <div className="hidden xl:flex flex-shrink-0 items-center space-x-4 text-muted-foreground text-sm">
            <div className="flex items-center space-x-2 hover:text-foreground transition-colors duration-200">
              <User className="flex-shrink-0 w-4 h-4" />
              <span>Administrator Panel</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex flex-shrink-0 items-center space-x-1 xl:space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="hover:bg-primary/10 p-2 transition-all duration-200 hover-lift"
            >
              <Sun className="w-4 h-4 rotate-0 dark:-rotate-90 scale-100 dark:scale-0 transition-all duration-300" />
              <Moon className="absolute w-4 h-4 rotate-90 dark:rotate-0 scale-0 dark:scale-100 transition-all duration-300" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* View Store Button */}
            <Link href="/storefront">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                View Store
              </Button>
            </Link>

            {/* User Button */}
            <AuthButtonsClient isAuthenticated={true} claims={{ sub: user.subject, email: user.email || undefined, name: user.name }} />

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden hover:bg-primary/10 p-2 transition-all duration-200 hover-lift">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="relative w-6 h-6">
                      <Image
                        src="/fastbite-logo.png"
                        alt="FastBite Admin"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <SheetTitle className="text-left">Admin Panel</SheetTitle>
                  </div>
                  <SheetDescription className="text-left">
                    Manage your restaurant operations
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-8">
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center font-medium text-lg transition-all hover:translate-x-2 duration-200 ${
                        isActive(item.href)
                          ? 'text-primary'
                          : 'text-foreground hover:text-primary'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="mr-3 text-xl">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  <div className="mt-8 pt-4 border-t">
                    <Link
                      href="/storefront"
                      className="flex items-center font-medium text-foreground hover:text-primary text-lg transition-all hover:translate-x-2 duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="mr-3">🏪</span>
                      <span>View Storefront</span>
                    </Link>
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