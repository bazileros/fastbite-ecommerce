/* eslint-disable @next/next/no-img-element */

'use client';

import {
  ChevronRight,
  Clock,
  Star,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStoreSettings } from '@/hooks/use-store-settings';
import { Image } from '@imagekit/next';

export function Hero() {
  const { getSetting, isLoading } = useStoreSettings();

  // Default values for when settings are loading or not set
  const heroTitle = getSetting('hero.title', 'Customize Your Perfect Meal') as string;
  const heroSubtitle = getSetting('hero.subtitle', 'Build your ideal fast food experience with premium ingredients, unlimited customization, and lightning-fast in-store pickup.') as string;
  const heroImage = getSetting('hero.image', 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=800') as string;
  const avgPickupTime = getSetting('hero.avgPickupTime', '15 Min') as string;
  const customerCount = getSetting('hero.customerCount', '10K+') as string;
  const rating = getSetting('hero.rating', '4.9') as string;

  if (isLoading) {
    return (
      <section className="relative bg-background-light dark:bg-background-dark overflow-hidden">
        <div className="mx-auto px-4 py-20 container">
          <div className="items-center gap-12 grid lg:grid-cols-2">
            <div className="space-y-8 animation-slide-up">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-orange-100 px-3 py-1 rounded-full w-fit text-primary">
                  <Star className="mr-1 w-3 h-3" />
                  Premium Fast Food Experience
                </Badge>
                <h1 className="font-display text-text-light dark:text-text-dark text-4xl md:text-6xl">
                  Loading...
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-background-light dark:bg-background-dark overflow-hidden">
      <div className="mx-auto px-4 py-20 container">
        <div className="items-center gap-12 grid lg:grid-cols-2">
          <div className="space-y-8 animation-slide-up">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-orange-100 px-3 py-1 rounded-full w-fit text-primary">
                <Star className="mr-1 w-3 h-3" />
                Premium Fast Food Experience
              </Badge>
              <h1 className="font-display text-text-light dark:text-text-dark text-4xl md:text-6xl leading-tight">
                {heroTitle.split(' ').slice(0, -2).join(' ')}
                <span className="block text-primary">
                  {heroTitle.split(' ').slice(-2).join(' ')}
                </span>
              </h1>
              <p className="max-w-lg text-text-secondary-light dark:text-text-secondary-dark text-xl leading-relaxed">
                {heroSubtitle}
              </p>
            </div>

            <div className="flex sm:flex-row flex-col gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-opacity-90 px-6 py-3 rounded-lg font-semibold text-white transition"
                onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start Ordering
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
              <Link href="/menu">
                <Button variant="outline" size="lg" className="hover:bg-gray-100 dark:hover:bg-gray-700 px-6 py-3 border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-text-light dark:text-text-dark transition">
                  View Menu
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              <div className="flex items-center space-x-2">
                <div className="flex justify-center items-center bg-primary/10 rounded-full w-10 h-10">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-text-light dark:text-text-dark">{avgPickupTime}</p>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Avg Pickup</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex justify-center items-center bg-primary/10 rounded-full w-10 h-10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-text-light dark:text-text-dark">{customerCount}</p>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Happy Customers</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative animation-fade-in">
            <div className="z-10 relative">
              <Image
                src={heroImage}
                alt="Delicious burger with customizable toppings"
                width={600}
                height={400}
                className="shadow-lg rounded-xl"
              />
              <div className="-right-6 -bottom-6 absolute flex items-center space-x-2 bg-card-light dark:bg-card-dark shadow-lg p-4 rounded-lg">
                <div className="flex justify-center items-center bg-primary rounded-full w-10 h-10 text-white">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-text-light dark:text-text-dark">{rating}</p>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}