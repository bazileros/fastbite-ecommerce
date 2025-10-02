'use client';

import { useState } from 'react';

import {
  Clock,
  Flame,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useCart } from '@/lib/cart-context';
import type {
  Beverage,
  CartItem,
  Meal,
  Side,
  Topping,
} from '@/lib/types';
import { Image } from '@imagekit/next';

interface MealCustomizationDialogProps {
  meal: Meal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MealCustomizationDialog({ meal, open, onOpenChange }: MealCustomizationDialogProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [selectedSides, setSelectedSides] = useState<Side[]>([]);
  const [selectedBeverages, setSelectedBeverages] = useState<Beverage[]>([]);

  // ImageKit URL is stored directly in meal.image
  const mealImageUrl = meal?.image;

  if (!meal) return null;

  const toggleTopping = (topping: Topping) => {
    setSelectedToppings(prev => {
      const exists = prev.find(t => t._id === topping._id);
      if (exists) {
        return prev.filter(t => t._id !== topping._id);
      }
      return [...prev, topping];
    });
  };

  const toggleSide = (side: Side) => {
    setSelectedSides(prev => {
      const exists = prev.find(s => s._id === side._id);
      if (exists) {
        return prev.filter(s => s._id !== side._id);
      }
      return [...prev, side];
    });
  };

  const toggleBeverage = (beverage: Beverage) => {
    setSelectedBeverages(prev => {
      const exists = prev.find(b => b._id === beverage._id);
      if (exists) {
        return prev.filter(b => b._id !== beverage._id);
      }
      return [...prev, beverage];
    });
  };

  const calculateTotal = () => {
    const basePrice = meal.price;
    const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    const sidesPrice = selectedSides.reduce((sum, s) => sum + s.price, 0);
    const beveragesPrice = selectedBeverages.reduce((sum, b) => sum + b.price, 0);
    return (basePrice + toppingsPrice + sidesPrice + beveragesPrice) * quantity;
  };

  const handleAddToCart = () => {
    try {
      const cartItem: CartItem = {
        id: `${meal._id}-${Date.now()}`,
        meal,
        quantity,
        toppings: selectedToppings,
        sides: selectedSides,
        beverages: selectedBeverages,
        totalPrice: calculateTotal(),
      };

      addItem(cartItem);
      toast.success(`Added ${meal.name} to cart!`);

      // Reset form
      setQuantity(1);
      setSelectedToppings([]);
      setSelectedSides([]);
      setSelectedBeverages([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
    }
  };

  const toppingsByCategory = meal.availableToppings?.reduce((acc, topping) => {
    if (!acc[topping.category]) {
      acc[topping.category] = [];
    }
    acc[topping.category].push(topping);
    return acc;
  }, {} as Record<string, Topping[]>) || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card-light dark:bg-card-dark rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 font-display text-text-light dark:text-text-dark">
            <span>Customize Your Order</span>
            {meal.popular && (
              <Badge variant="secondary" className="bg-orange-100 px-2 py-1 rounded-full text-primary">
                <Star className="mr-1 w-3 h-3" />
                Popular
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-text-secondary-light dark:text-text-secondary-dark">
            Build your perfect meal with our premium ingredients and add-ons
          </DialogDescription>
        </DialogHeader>

        <div className="gap-6 grid lg:grid-cols-2">
          {/* Meal Info */}
          <div className="space-y-4">
            <div className="relative rounded-xl h-64 overflow-hidden">
              {mealImageUrl ? (
                <Image
                  src={mealImageUrl}
                  alt={meal.name}
                  width={500}
                  height={256}
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="flex justify-center items-center bg-gray-100 dark:bg-gray-800 w-full h-full">
                  <span className="text-gray-500 dark:text-gray-400">No image available</span>
                </div>
              )}
              {meal.spiceLevel === 'hot' && (
                <Badge className="top-3 right-3 absolute bg-red-500 px-2 py-1 rounded-full text-white">
                  <Flame className="mr-1 w-3 h-3" />
                  Spicy
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-bold text-text-light dark:text-text-dark text-2xl">{meal.name}</h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">{meal.description}</p>

              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="fill-current w-4 h-4 text-yellow-500" />
                  <span className="text-text-light dark:text-text-dark">{meal.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">{meal.prepTime} min</span>
                </div>
                <span className="text-text-secondary-light dark:text-text-secondary-dark">{meal.calories} cal</span>
              </div>

              <div className="font-bold text-primary text-2xl">
                R{meal.price.toFixed(2)}
              </div>
            </div>

            {/* Quantity */}
            <Card className="bg-background-light dark:bg-background-dark p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-text-light dark:text-text-dark">Quantity</span>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="min-w-[2ch] font-bold text-text-light dark:text-text-dark text-xl text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Customization Options */}
          <div className="space-y-4">
            <Tabs defaultValue="toppings" className="w-full">
              <TabsList className="grid grid-cols-3 bg-background-light dark:bg-background-dark w-full">
                <TabsTrigger value="toppings" className="font-semibold">Toppings</TabsTrigger>
                <TabsTrigger value="sides" className="font-semibold">Sides</TabsTrigger>
                <TabsTrigger value="beverages" className="font-semibold">Drinks</TabsTrigger>
              </TabsList>

              <TabsContent value="toppings" className="space-y-4">
                {Object.entries(toppingsByCategory).map(([category, toppings]) => (
                  <div key={category}>
                    <h4 className="mb-3 font-display font-medium text-text-secondary-light dark:text-text-secondary-dark text-sm uppercase tracking-wide">
                      {category}
                    </h4>
                    <div className="gap-2 grid">
                      {toppings.map((topping) => {
                        const isSelected = selectedToppings.some(t => t._id === topping._id);
                        return (
                          <Card
                            key={topping._id}
                            className={`p-3 cursor-pointer transition-colors rounded-lg ${
                              isSelected
                                ? 'bg-primary/10 border-primary'
                                : 'bg-background-light dark:bg-background-dark hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => toggleTopping(topping)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-text-light dark:text-text-dark">{topping.name}</span>
                              <span className="font-medium text-primary">
                                +R{topping.price.toFixed(2)}
                              </span>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="sides" className="space-y-2">
                {meal.availableSides?.map((side) => {
                  const isSelected = selectedSides.some(s => s._id === side._id);
                  return (
                    <Card
                      key={side._id}
                      className={`p-3 cursor-pointer transition-colors rounded-lg ${
                        isSelected
                          ? 'bg-primary/10 border-primary'
                          : 'bg-background-light dark:bg-background-dark hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => toggleSide(side)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-text-light dark:text-text-dark">{side.name}</span>
                        <span className="font-medium text-primary">
                          +R{side.price.toFixed(2)}
                        </span>
                      </div>
                    </Card>
                  );
                })}
                {(!meal.availableSides || meal.availableSides.length === 0) && (
                  <p className="py-4 text-text-secondary-light dark:text-text-secondary-dark text-center">
                    No sides available for this item
                  </p>
                )}
              </TabsContent>

              <TabsContent value="beverages" className="space-y-2">
                {meal.availableBeverages?.map((beverage) => {
                  const isSelected = selectedBeverages.some(b => b._id === beverage._id);
                  return (
                    <Card
                      key={beverage._id}
                      className={`p-3 cursor-pointer transition-colors rounded-lg ${
                        isSelected
                          ? 'bg-primary/10 border-primary'
                          : 'bg-background-light dark:bg-background-dark hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => toggleBeverage(beverage)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-text-light dark:text-text-dark">{beverage.name}</span>
                        <span className="font-medium text-primary">
                          +R{beverage.price.toFixed(2)}
                        </span>
                      </div>
                    </Card>
                  );
                })}
                {(!meal.availableBeverages || meal.availableBeverages.length === 0) && (
                  <p className="py-4 text-text-secondary-light dark:text-text-secondary-dark text-center">
                    No beverages available for this item
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">Subtotal (excl. VAT)</span>
              <span className="text-text-light dark:text-text-dark">R{calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">VAT (15%)</span>
              <span className="text-text-light dark:text-text-dark">R{(calculateTotal() * 0.15).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-text-light dark:text-text-dark text-lg">Total (incl. VAT)</span>
              <span className="font-bold text-primary text-2xl">
                R{(calculateTotal() * 1.15).toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            size="lg"
            className="bg-primary hover:bg-opacity-90 px-6 py-3 rounded-lg w-full font-semibold text-white transition"
          >
            <ShoppingCart className="mr-2 w-4 h-4" />
            Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}