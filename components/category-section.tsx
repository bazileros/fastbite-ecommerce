'use client';

import {
  useId,
  useState,
} from 'react';

import {
  Beef,
  Coffee,
  Drumstick,
  IceCreamBowl,
  Sandwich,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Image } from '@imagekit/next';

const categories = [
  {
    id: 'burgers',
    name: 'Signature Burgers',
    image: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Premium beef patties with gourmet toppings',
    count: 12,
    popular: true,
    icon: Beef,
    features: ['Grass-fed beef', 'Custom toppings', 'Artisan buns'],
    color: 'from-orange-500/20 to-red-500/20',
  },
  {
    id: 'chicken',
    name: 'Crispy Chicken',
    image: 'https://images.pexels.com/photos/2271107/pexels-photo-2271107.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Hand-breaded chicken with secret spices',
    count: 8,
    popular: false,
    icon: Drumstick,
    features: ['Hand-breaded', 'Secret spices', 'Crispy coating'],
    color: 'from-yellow-500/20 to-orange-500/20',
  },
  {
    id: 'sides',
    name: 'Sides & Snacks',
    image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Loaded fries, onion rings, and more',
    count: 15,
    popular: false,
    icon: Sandwich,
    features: ['Loaded fries', 'Onion rings', 'Fresh cut'],
    color: 'from-green-500/20 to-yellow-500/20',
  },
  {
    id: 'beverages',
    name: 'Beverages',
    image: 'https://images.pexels.com/photos/544961/pexels-photo-544961.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Refreshing drinks and shakes',
    count: 10,
    popular: false,
    icon: Coffee,
    features: ['Fresh brewed', 'Craft shakes', 'Iced drinks'],
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 'desserts',
    name: 'Sweet Treats',
    image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Indulgent desserts and ice cream',
    count: 6,
    popular: false,
    icon: IceCreamBowl,
    features: ['House-made', 'Premium ice cream', 'Fresh baked'],
    color: 'from-pink-500/20 to-purple-500/20',
  },
];

interface CategorySectionProps {
  selectedCategory?: string | null;
  onCategorySelect?: (categoryId: string | null) => void;
}
export function CategorySection({ selectedCategory: externalSelectedCategory, onCategorySelect }: CategorySectionProps) {
  const [internalSelectedCategory, setInternalSelectedCategory] = useState<string | null>(null);
  const menuId = useId();

  const selectedCategory = externalSelectedCategory !== undefined ? externalSelectedCategory : internalSelectedCategory;
  const handleCategorySelect = (categoryId: string | null) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    } else {
      setInternalSelectedCategory(categoryId);
    }
  };

  return (
    <section id={menuId} className="bg-background-light dark:bg-background-dark mx-auto px-4 py-20 container">
      <div className="mb-16 text-center animation-slide-up">
        <div className="mb-6">
          <Badge variant="secondary" className="bg-primary/10 mb-4 px-4 py-2 rounded-full font-semibold text-primary text-sm">
            🍔 Our Menu Categories
          </Badge>
        </div>
        <h2 className="mb-6 font-display text-text-light dark:text-text-dark text-5xl md:text-6xl leading-tight">
          Explore Our
          <span className="block text-primary">Delicious Menu</span>
        </h2>
        <p className="mx-auto max-w-3xl text-text-secondary-light dark:text-text-secondary-dark text-xl leading-relaxed">
          Every item is crafted with premium ingredients and can be fully customized to your taste.
          <span className="block mt-2 font-semibold text-primary">Choose your favorite category below!</span>
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => handleCategorySelect(null)}
          className={`font-semibold px-4 py-2 rounded-lg transition ${selectedCategory === null ? 'bg-primary text-white' : 'border-gray-300 dark:border-gray-600 text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          All Categories
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => handleCategorySelect(category.id)}
            className={`font-semibold px-4 py-2 rounded-lg transition ${selectedCategory === category.id ? 'bg-primary text-white' : 'border-gray-300 dark:border-gray-600 text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            {category.name}
            <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 ml-2 text-text-secondary-light dark:text-text-secondary-dark">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      <div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 animation-fade-in">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card
              key={category.id}
              className="group relative bg-card-light dark:bg-card-dark shadow-lg hover:shadow-2xl border-0 rounded-2xl overflow-hidden transition-all hover:-translate-y-2 duration-500 cursor-pointer"
              onClick={() => handleCategorySelect(category.id)}
            >
              {/* Animated background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative h-56 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="group-hover:scale-110 transition-transform duration-700"
                />

                {/* Enhanced overlay with multiple gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 group-hover:from-black/60 via-black/20 to-transparent transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Category icon in top right */}
                <div className="top-4 right-4 absolute flex justify-center items-center bg-white/20 group-hover:bg-white/30 backdrop-blur-sm rounded-full w-12 h-12 transition-all duration-300">
                  <IconComponent className="drop-shadow-lg w-6 h-6 text-white" />
                </div>

                {/* Enhanced popular badge */}
                {category.popular && (
                  <div className="top-4 left-4 absolute">
                    <Badge className="bg-gradient-to-r from-primary to-orange-500 shadow-lg px-3 py-1.5 rounded-full font-semibold text-white text-xs animate-pulse">
                      ⭐ Most Popular
                    </Badge>
                  </div>
                )}

                {/* Content overlay with enhanced typography */}
                <div className="bottom-6 left-6 absolute max-w-[80%] text-white">
                  <h3 className="drop-shadow-lg mb-2 font-display font-bold group-hover:text-primary text-2xl leading-tight transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="opacity-0 group-hover:opacity-100 drop-shadow-md mb-3 text-white/90 text-sm leading-relaxed transition-all translate-y-2 group-hover:translate-y-0 duration-500 transform">
                    {category.description}
                  </p>

                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500 delay-100 transform">
                    {category.features.slice(0, 2).map((feature) => (
                      <span
                        key={feature}
                        className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full font-medium text-white text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced bottom section */}
              <div className="bg-gradient-to-r from-white dark:from-background-dark dark:via-background-dark/95 to-gray-50 dark:to-background-dark/90 p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="flex justify-center items-center bg-primary/10 rounded-full w-8 h-8">
                      <IconComponent className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark text-sm">
                      {category.count} items available
                    </span>
                  </div>

                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-orange-500 hover:shadow-lg px-4 py-2 rounded-lg font-semibold text-white hover:scale-105 transition-all duration-300"
                  >
                    Browse
                    <span className="ml-1 transition-transform group-hover:translate-x-1 duration-300 transform">→</span>
                  </Button>
                </div>

                {/* Progress bar for visual appeal */}
                <div className="bg-gray-200 dark:bg-gray-700 mt-4 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-orange-500 rounded-full group-hover:w-full h-full transition-all duration-1000 delay-300"
                    style={{ width: '60%' }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}