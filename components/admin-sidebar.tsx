"use client";

import { useState } from 'react';

import {
  BarChart3,
  ChevronLeft,
  FolderOpen,
  Home,
  LayoutDashboard,
  Menu,
  Moon,
  Settings,
  ShoppingBag,
  Sun,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Image } from '@imagekit/next';

interface AdminSidebarProps {
  user: {
    subject: string;
    email?: string;
    name?: string;
    role: string;
  };
}

const navigationGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Menu Management',
    items: [
      { name: 'Meals', href: '/admin/menu', icon: UtensilsCrossed },
      { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
      { name: 'Toppings', href: '/admin/toppings', icon: ShoppingBag },
      { name: 'Sides', href: '/admin/sides', icon: ShoppingBag },
      { name: 'Beverages', href: '/admin/beverages', icon: ShoppingBag },
    ],
  },
  {
    title: 'Operations',
    items: [
      { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
      { name: 'Users', href: '/admin/users', icon: Users },
    ],
  },
  {
    title: 'System',
    items: [
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const { theme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex justify-between items-center p-4">
        <Link href="/admin" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="relative flex-shrink-0 w-8 h-8">
            <Image
              src="/fastbite-logo.png"
              alt="FastBite"
              fill
              sizes="32px"
              className="object-contain"
              priority
            />
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <span className="bg-clip-text bg-gradient-to-r from-primary to-primary/70 font-bold text-transparent text-lg whitespace-nowrap">
              FastBite Admin
            </span>
          )}
        </Link>
        {isMobileOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              {(!isCollapsed || isMobileOpen) && (
                <h3 className="px-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  {group.title}
                </h3>
              )}
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        active
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className={`flex-shrink-0 w-5 h-5 ${active ? 'animate-pulse' : ''}`} />
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator />

      {/* Bottom Actions */}
      <div className="space-y-2 p-4">
        {/* View Store */}
        <Link 
          href="/" 
          className="block"
          onClick={() => {
            // Mark that user is intentionally viewing the store
            sessionStorage.setItem('viewing_store', 'true');
          }}
        >
          <Button
            variant="outline"
            size="sm"
            className={`w-full ${isCollapsed && !isMobileOpen ? 'px-2' : ''}`}
          >
            <Home className="w-4 h-4" />
            {(!isCollapsed || isMobileOpen) && <span className="ml-2">View Store</span>}
          </Button>
        </Link>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className={`w-full ${isCollapsed && !isMobileOpen ? 'px-2' : ''}`}
        >
          <Sun className="w-4 h-4 rotate-0 dark:-rotate-90 scale-100 dark:scale-0 transition-all" />
          <Moon className="absolute w-4 h-4 rotate-90 dark:rotate-0 scale-0 dark:scale-100 transition-all" />
          {(!isCollapsed || isMobileOpen) && <span className="ml-2">Toggle Theme</span>}
        </Button>

        {/* User Info - Desktop Only */}
        {!isMobileOpen && (
          <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
            <Separator className="my-2" />
            <div className="flex items-center space-x-2 p-2 text-muted-foreground text-sm">
              <Users className="flex-shrink-0 w-4 h-4" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-xs truncate">
                  {user.name || user.email}
                </p>
                <p className="text-xs truncate">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden top-4 left-4 z-50 fixed"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <button
          type="button"
          className="lg:hidden z-40 fixed inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`top-0 left-0 z-50 fixed bg-background border-r w-72 h-screen transition-transform duration-300 lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {sidebarContent}
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`top-0 left-0 z-30 fixed hidden lg:flex flex-col bg-background border-r h-screen transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}

        {/* Collapse Toggle - Desktop Only */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="top-20 -right-3 z-50 absolute bg-background hover:bg-accent shadow-md p-0 border rounded-full w-6 h-6"
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
          />
        </Button>
      </aside>

      {/* Spacer for desktop sidebar */}
      <div className={`hidden lg:block ${isCollapsed ? 'w-20' : 'w-64'}`} />
    </>
  );
}
