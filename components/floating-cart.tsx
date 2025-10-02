'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowUp } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { CartSheet } from '@/components/cart-sheet';
import { useState, useEffect } from 'react';

export function FloatingCart() {
  const { items, total } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (totalItems === 0 && !isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
      {/* Scroll to top button */}
      {isVisible && (
        <Button
          onClick={scrollToTop}
          size="sm"
          variant="secondary"
          className="rounded-full h-12 w-12 shadow-lg hover-lift"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
      
      {/* Cart button */}
      {totalItems > 0 && (
        <CartSheet>
          <Button
            size="lg"
            className="rounded-full px-6 shadow-lg hover-lift"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span className="font-medium">${total.toFixed(2)}</span>
            <Badge className="ml-2 bg-white text-primary hover:bg-white">
              {totalItems}
            </Badge>
          </Button>
        </CartSheet>
      )}
    </div>
  );
}