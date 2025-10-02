'use client';

import {
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useStoreSettings } from '@/hooks/use-store-settings';

export function Footer() {
  const { getSetting, isLoading } = useStoreSettings();
  const currentYear = new Date().getFullYear();

  // Default values for when settings are loading or not set
  const storeName = getSetting('general.storeName', 'FastBite') as string;
  const storeDescription = getSetting('general.description', 'Premium fast food experience with customizable options and lightning-fast pickup.') as string;
  const address = getSetting('contact.address', '123 Fast Food Ave, City, State 12345') as string;
  const phone = getSetting('contact.phone', '(555) 123-4567') as string;
  const email = getSetting('contact.email', 'hello@fastbite.com') as string;
  const hours = getSetting('contact.hours', {
    monday: '9:00 AM - 10:00 PM',
    tuesday: '9:00 AM - 10:00 PM',
    wednesday: '9:00 AM - 10:00 PM',
    thursday: '9:00 AM - 10:00 PM',
    friday: '9:00 AM - 11:00 PM',
    saturday: '9:00 AM - 11:00 PM',
    sunday: '10:00 AM - 9:00 PM'
  }) as Record<string, string>;

  const socialLinks = getSetting('social', {
    instagram: '#',
    twitter: '#',
    facebook: '#'
  }) as Record<string, string>;

  if (isLoading) {
    return (
      <footer className="bg-card-light dark:bg-card-dark mt-20 border-gray-200 dark:border-gray-700 border-t">
        <div className="mx-auto px-4 py-12 container">
          <div className="text-center">
            <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading footer...</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-card-light dark:bg-card-dark mt-20 border-gray-200 dark:border-gray-700 border-t">
      <div className="mx-auto px-4 py-12 container">
        <div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex justify-center items-center bg-primary rounded-lg w-8 h-8 font-bold text-white text-lg">
                F
              </div>
              <span className="font-display text-text-light dark:text-text-dark text-xl">
                {storeName}
              </span>
            </div>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              {storeDescription}
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" asChild className="hover:bg-background-light dark:hover:bg-background-dark rounded-lg">
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild className="hover:bg-background-light dark:hover:bg-background-dark rounded-lg">
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild className="hover:bg-background-light dark:hover:bg-background-dark rounded-lg">
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                  <Facebook className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-text-light dark:text-text-dark">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/menu" className="text-text-secondary-light hover:text-primary dark:text-text-secondary-dark transition-colors">
                Menu
              </Link>
              <Link href="/about" className="text-text-secondary-light hover:text-primary dark:text-text-secondary-dark transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="text-text-secondary-light hover:text-primary dark:text-text-secondary-dark transition-colors">
                Contact
              </Link>
              <a href="#careers" className="text-text-secondary-light hover:text-primary dark:text-text-secondary-dark transition-colors">
                Careers
              </a>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-text-light dark:text-text-dark">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-text-secondary-light dark:text-text-secondary-dark">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{address}</span>
              </div>
              <div className="flex items-center space-x-2 text-text-secondary-light dark:text-text-secondary-dark">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-text-secondary-light dark:text-text-secondary-dark">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{email}</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-text-light dark:text-text-dark">Store Hours</h3>
            <div className="space-y-2 text-text-secondary-light dark:text-text-secondary-dark text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Mon-Thu: {hours.monday || '9:00 AM - 10:00 PM'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Fri-Sat: {hours.friday || '9:00 AM - 11:00 PM'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Sunday: {hours.sunday || '10:00 AM - 9:00 PM'}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 border-gray-200 dark:border-gray-700" />

        <div className="flex md:flex-row flex-col justify-between items-center space-y-4 md:space-y-0">
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
            © {currentYear} {storeName}. All rights reserved.
          </p>
          <div className="flex space-x-6 text-text-secondary-light dark:text-text-secondary-dark text-sm">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="hover:text-primary transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}