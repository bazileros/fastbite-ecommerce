'use client';

import {
  Clock,
  CreditCard,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/lib/cart-context';
import {
  calculateVATAmount,
  formatPrice,
} from '@/lib/utils';
import { Image } from '@imagekit/next';

interface CartSheetProps {
  children: React.ReactNode;
}

export function CartSheet({ children }: CartSheetProps) {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const estimatedTime = Math.max(10, items.reduce((max, item) => {
    const prepTimeMax = parseInt(item.meal.prepTime.split('-')[1] || '10');
    return Math.max(max, prepTimeMax);
  }, 0));

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    try {
      toast.success('Redirecting to checkout...');

      // TODO: Integrate with Paystack payment processing
      // For now, this is a placeholder - in production this would:
      // 1. Create an order in Convex
      // 2. Initialize Paystack payment
      // 3. Redirect to payment page or handle inline payment

      console.log('Checkout initiated with items:', items);

    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error('Failed to start checkout. Please try again.');
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5" />
            <span>Your Order</span>
            {totalItems > 0 && (
              <Badge variant="secondary">{totalItems} items</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Review your items and proceed to checkout
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 py-6 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col justify-center items-center space-y-4 h-64 text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/50" />
              <div className="space-y-2">
                <h3 className="font-display font-medium text-lg">Your cart is empty</h3>
                <p className="text-muted-foreground">
                  Add some delicious meals to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex space-x-3">
                    <Image
                      src={item.meal.image || '/placeholder-image.jpg'}
                      alt={item.meal.name}
                      width={64}
                      height={64}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-display font-medium text-sm">{item.meal.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {item.toppings.length > 0 && (
                        <div className="text-muted-foreground text-xs">
                          <span>Toppings: {item.toppings.map(t => t.name).join(', ')}</span>
                        </div>
                      )}
                      
                      {item.sides.length > 0 && (
                        <div className="text-muted-foreground text-xs">
                          <span>Sides: {item.sides.map(s => s.name).join(', ')}</span>
                        </div>
                      )}
                      
                      {item.beverages.length > 0 && (
                        <div className="text-muted-foreground text-xs">
                          <span>Drinks: {item.beverages.map(b => b.name).join(', ')}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="min-w-[1ch] font-medium text-sm text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <span className="font-semibold text-primary">
                          {formatPrice(item.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-4 pt-6 border-t">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Est. pickup time: {estimatedTime}-{estimatedTime + 3} min</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearCart();
                  toast.success('Cart cleared');
                }}
                className="text-destructive hover:text-destructive"
              >
                Clear all
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Subtotal (excl. VAT)</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>VAT (15%)</span>
                <span>{formatPrice(calculateVATAmount(total))}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total (incl. VAT)</span>
                <span className="text-primary">{formatPrice(total + calculateVATAmount(total))}</span>
              </div>
            </div>
            
            <Button
              onClick={handleCheckout}
              size="lg"
              className="w-full"
            >
              <CreditCard className="mr-2 w-4 h-4" />
              Proceed to Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}