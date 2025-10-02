"use client";

import {
  useEffect,
  useState,
} from 'react';

import {
  Beef,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Cookie,
  Drumstick,
  Star,
  Utensils,
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Image } from '@imagekit/next';

// Banner images that will rotate
const bannerImages = [
  {
    id: 1,
    image: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=800",
    alt: "Delicious fast food meal"
  },
  {
    id: 2,
    image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    alt: "Fresh ingredients"
  },
  {
    id: 3,
    image: "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=800",
    alt: "Quality fast food"
  }
];

// Menu categories data
const menuCategories = [
  {
    id: 'burgers',
    name: 'Signature Burgers',
    description: 'Premium beef patties with gourmet toppings',
    itemCount: 12,
    icon: Beef,
    color: 'from-orange-500 to-red-500',
    href: '/menu?category=burgers'
  },
  {
    id: 'chicken',
    name: 'Crispy Chicken',
    description: 'Hand-breaded chicken with secret spices',
    itemCount: 8,
    icon: Drumstick,
    color: 'from-yellow-500 to-orange-500',
    href: '/menu?category=chicken'
  },
  {
    id: 'sides',
    name: 'Sides & Snacks',
    description: 'Loaded fries, onion rings, and more',
    itemCount: 15,
    icon: Utensils,
    color: 'from-green-500 to-emerald-500',
    href: '/menu?category=sides'
  },
  {
    id: 'beverages',
    name: 'Beverages',
    description: 'Refreshing drinks and shakes',
    itemCount: 10,
    icon: Coffee,
    color: 'from-blue-500 to-cyan-500',
    href: '/menu?category=beverages'
  },
  {
    id: 'desserts',
    name: 'Sweet Treats',
    description: 'Indulgent desserts and ice cream',
    itemCount: 6,
    icon: Cookie,
    color: 'from-pink-500 to-rose-500',
    href: '/menu?category=desserts'
  }
];

export function HeroCarousel() {
  const [currentImage, setCurrentImage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality for images
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % bannerImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % bannerImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImage(index);
  };

  return (
  <section className="relative bg-gradient-to-br from-orange-50 dark:from-background-dark dark:via-background-dark/95 to-red-50 dark:to-background-dark/90 py-16 md:py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5"></div>
      </div>

      <div className="relative mx-auto px-4 container">
        {/* Hero Content */}
        <div className="mb-16 text-center">
          <div className="inline-block mb-6">
            <Badge variant="secondary" className="bg-primary/10 border-primary/20 text-primary">
              <Star className="mr-1 w-3 h-3" />
              Premium Fast Food Experience
            </Badge>
          </div>

          <h1 className="mb-6 font-display font-bold text-4xl md:text-6xl lg:text-7xl tracking-tight">
            Explore Our
            <span className="block bg-clip-text bg-gradient-to-r from-primary to-primary/70 text-transparent">
              Menu
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground text-lg md:text-xl leading-relaxed">
            Every item is crafted with premium ingredients and can be fully customized to your taste
          </p>

          <div className="flex sm:flex-row flex-col justify-center gap-4">
            <Link href="/menu">
              <Button size="lg" className="px-8 py-4 font-semibold text-lg">
                View Full Menu
              </Button>
            </Link>
          </div>
        </div>

        {/* Image Carousel */}
        <div className="mb-16">
          <div className="mx-auto max-w-4xl">
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative bg-white/5 shadow-2xl backdrop-blur-sm border-4 border-white/20 rounded-3xl overflow-hidden">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={bannerImages[currentImage].image}
                    alt={bannerImages[currentImage].alt}
                    fill
                    className="object-cover transition-all duration-700 ease-in-out"
                    priority
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>

                {/* Navigation Controls */}
                <div className="bottom-6 left-1/2 absolute -translate-x-1/2 transform">
                  <div className="flex items-center space-x-4 bg-black/30 backdrop-blur-md px-6 py-3 rounded-full">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={prevImage}
                      className="hover:bg-white/20 w-10 h-10 text-white hover:text-white"
                      onMouseEnter={() => setIsAutoPlaying(false)}
                      onMouseLeave={() => setIsAutoPlaying(true)}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <div className="flex space-x-3">
                      {bannerImages.map((image, index) => (
                        <button
                          key={`dot-${image.id}`}
                          type="button"
                          onClick={() => goToImage(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentImage
                              ? 'bg-white scale-125'
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                          onMouseEnter={() => setIsAutoPlaying(false)}
                          onMouseLeave={() => setIsAutoPlaying(true)}
                        />
                      ))}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={nextImage}
                      className="hover:bg-white/20 w-10 h-10 text-white hover:text-white"
                      onMouseEnter={() => setIsAutoPlaying(false)}
                      onMouseLeave={() => setIsAutoPlaying(true)}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Side Navigation Arrows */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevImage}
                  className="top-1/2 left-4 absolute hover:bg-white/20 w-12 h-12 text-white hover:text-white hover:scale-110 transition-all -translate-y-1/2 duration-300 transform"
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextImage}
                  className="top-1/2 right-4 absolute hover:bg-white/20 w-12 h-12 text-white hover:text-white hover:scale-110 transition-all -translate-y-1/2 duration-300 transform"
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-8">
          <h2 className="mb-12 font-display font-bold text-2xl md:text-3xl text-center">
            All Categories
          </h2>

          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {menuCategories.map((category) => (
              <Link key={category.id} href={category.href}>
                <Card className="group shadow-lg hover:shadow-xl border-0 transition-all hover:-translate-y-2 duration-300 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${category.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <category.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Category Name */}
                    <h3 className="mb-2 font-display font-bold group-hover:text-primary text-lg transition-colors duration-300">
                      {category.name}
                    </h3>

                    {/* Description */}
                    <p className="mb-4 text-muted-foreground text-sm leading-relaxed">
                      {category.description}
                    </p>

                    {/* Item Count */}
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-muted-foreground text-sm">
                        {category.itemCount} items available
                      </span>
                      <span className="font-semibold text-primary transition-transform group-hover:translate-x-1 duration-300">
                        Browse →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Category */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-primary to-primary/80 p-8 md:p-12 rounded-3xl text-white text-center">
            <div className="mx-auto max-w-2xl">
              <Badge variant="secondary" className="bg-white/20 mb-4 border-white/30 text-white">
                Most Popular
              </Badge>

              <h3 className="mb-4 font-display font-bold text-2xl md:text-3xl">
                Signature Burgers
              </h3>

              <p className="mb-6 text-white/90 text-lg">
                Premium beef patties with gourmet toppings
              </p>

              <Link href="/menu?category=burgers">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white hover:bg-white/90 px-8 py-3 font-semibold text-primary"
                >
                  Explore Burgers →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}