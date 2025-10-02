'use client';

import {
  Calendar,
  CheckCircle,
  Clock,
  Home,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Star,
  XCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { calculateVATAmount, formatPrice } from '@/lib/utils';
import {
  useEffect,
  useState,
} from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

interface OrderItem {
  mealName: string;
  quantity: number;
  totalPrice: number;
  selectedToppings?: Array<{ name: string }>;
  selectedSides?: Array<{ name: string }>;
  selectedBeverages?: Array<{ name: string }>;
}

interface OrderDetails {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  items: OrderItem[];
  createdAt: number;
  pickupTime: string;
  specialInstructions?: string;
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [orderStatus, setOrderStatus] = useState('confirmed');
  const [progress, setProgress] = useState(25);
  const [estimatedTime, setEstimatedTime] = useState(18);

  // Verify payment and fetch order details
  useEffect(() => {
    const verifyPaymentAndFetchOrder = async () => {
      if (!reference) {
        setVerificationError('No payment reference found');
        setIsVerifying(false);
        setIsLoading(false);
        return;
      }

      try {
        // Verify payment with Paystack
        const verifyResponse = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        });

        if (!verifyResponse.ok) {
          throw new Error('Failed to verify payment');
        }

        const verificationData = await verifyResponse.json();

        if (!verificationData.success) {
          throw new Error('Payment verification failed');
        }

        // Payment verified successfully
        toast.success('Payment verified successfully!');
        setIsVerifying(false);

        // Fetch actual order details from Convex
        try {
          const orderResponse = await fetch('/api/orders/by-reference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference }),
          });

          if (orderResponse.ok) {
            const order = await orderResponse.json();
            setOrderDetails({
              _id: order._id,
              orderNumber: 'FB' + order._id.substring(0, 6).toUpperCase(),
              status: order.status,
              paymentStatus: order.paymentStatus,
              total: order.total,
              items: order.items.map((item: OrderItem & { meal?: { name: string } }) => ({
                mealName: item.meal?.name || 'Unknown Item',
                quantity: item.quantity,
                totalPrice: item.totalPrice,
                selectedToppings: item.selectedToppings,
                selectedSides: item.selectedSides,
                selectedBeverages: item.selectedBeverages,
              })),
              createdAt: order.createdAt,
              pickupTime: order.pickupTime,
              specialInstructions: order.specialInstructions,
            });
          } else {
            // Fallback if order fetch fails
            console.warn('Failed to fetch order details, using basic info');
            setOrderDetails({
              _id: verificationData.data.orderId || 'unknown',
              orderNumber: 'FB' + reference.substring(0, 6).toUpperCase(),
              status: 'confirmed',
              paymentStatus: 'paid',
              total: verificationData.data.amount,
              items: [],
              createdAt: Date.now(),
              pickupTime: 'asap',
            });
          }
        } catch (orderError) {
          console.warn('Error fetching order details:', orderError);
          // Use fallback data
          setOrderDetails({
            _id: verificationData.data.orderId || 'unknown',
            orderNumber: 'FB' + reference.substring(0, 6).toUpperCase(),
            status: 'confirmed',
            paymentStatus: 'paid',
            total: verificationData.data.amount,
            items: [],
            createdAt: Date.now(),
            pickupTime: 'asap',
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Payment verification error:', error);
        setVerificationError(error instanceof Error ? error.message : 'Unknown error');
        toast.error('Failed to verify payment');
        setIsVerifying(false);
        setIsLoading(false);
      }
    };

    verifyPaymentAndFetchOrder();
  }, [reference]);

  // Simulate order progress
  useEffect(() => {
    if (!orderDetails) return;

    const interval = setInterval(() => {
      setEstimatedTime(prev => Math.max(0, prev - 1));
      
      if (estimatedTime > 12) {
        setOrderStatus('confirmed');
        setProgress(25);
      } else if (estimatedTime > 6) {
        setOrderStatus('preparing');
        setProgress(60);
      } else if (estimatedTime > 0) {
        setOrderStatus('ready');
        setProgress(100);
      } else {
        setOrderStatus('completed');
        setProgress(100);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [estimatedTime, orderDetails]);

  const orderNumber = orderDetails?.orderNumber || 'Loading...';
  const orderTime = orderDetails ? new Date(orderDetails.createdAt).toLocaleString() : '';

  const getStatusInfo = () => {
    switch (orderStatus) {
      case 'confirmed':
        return {
          title: 'Order Confirmed!',
          description: 'We\'ve received your order and started preparing it.',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950'
        };
      case 'preparing':
        return {
          title: 'Preparing Your Order',
          description: 'Our chefs are crafting your meal with care.',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950'
        };
      case 'ready':
        return {
          title: 'Order Ready!',
          description: 'Your order is ready for pickup.',
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950'
        };
      case 'completed':
        return {
          title: 'Order Completed',
          description: 'Thank you for choosing FastBite!',
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950'
        };
      default:
        return {
          title: 'Order Confirmed',
          description: 'Processing your order...',
          color: 'text-primary',
          bgColor: 'bg-primary/5'
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Loading state
  if (isLoading || isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">
              {isVerifying ? 'Verifying Payment...' : 'Loading Order...'}
            </h2>
            <p className="text-muted-foreground">
              Please wait while we confirm your order
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (verificationError || !orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <Card className="w-full max-w-md text-center border-destructive">
          <CardContent className="pt-6">
            <XCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Payment Verification Failed</h2>
            <p className="text-muted-foreground mb-4">
              {verificationError || 'Unable to verify your payment. Please contact support.'}
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/orders">
                <Button variant="outline" className="w-full">View My Orders</Button>
              </Link>
              <Link href="/">
                <Button className="w-full">Back to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Header */}
          <Card className={`border-0 ${statusInfo.bgColor}`}>
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h1 className={`text-2xl font-bold mb-2 ${statusInfo.color}`}>
                {statusInfo.title}
              </h1>
              <p className="text-muted-foreground mb-4">
                {statusInfo.description}
              </p>
              <Badge variant="secondary" className="text-sm">
                Order #{orderNumber}
              </Badge>
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Order Status</span>
              </CardTitle>
              <CardDescription>
                Track your order progress in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className={`space-y-1 ${orderStatus === 'confirmed' ? 'text-primary' : progress >= 25 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`w-2 h-2 rounded-full mx-auto ${progress >= 25 ? 'bg-green-600' : 'bg-muted'}`} />
                  <span>Confirmed</span>
                </div>
                <div className={`space-y-1 ${orderStatus === 'preparing' ? 'text-primary' : progress >= 60 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`w-2 h-2 rounded-full mx-auto ${progress >= 60 ? 'bg-green-600' : 'bg-muted'}`} />
                  <span>Preparing</span>
                </div>
                <div className={`space-y-1 ${orderStatus === 'ready' ? 'text-primary' : progress >= 100 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`w-2 h-2 rounded-full mx-auto ${progress >= 100 ? 'bg-green-600' : 'bg-muted'}`} />
                  <span>Ready</span>
                </div>
                <div className={`space-y-1 ${orderStatus === 'completed' ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`w-2 h-2 rounded-full mx-auto ${orderStatus === 'completed' ? 'bg-green-600' : 'bg-muted'}`} />
                  <span>Completed</span>
                </div>
              </div>

              {estimatedTime > 0 && (
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Estimated pickup time</p>
                  <p className="text-lg font-bold text-primary">{estimatedTime} minutes</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pickup Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Pickup Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      123 Fast Food Ave<br />
                      City, State 12345
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Store Hours</p>
                    <p className="text-sm text-muted-foreground">
                      Mon-Thu: 9:00 AM - 10:00 PM<br />
                      Fri-Sat: 9:00 AM - 11:00 PM<br />
                      Sunday: 10:00 AM - 9:00 PM
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Contact</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>(555) 123-4567</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>hello@fastbite.com</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Order Time</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{orderTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="h-5 w-5" />
                <span>Order Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order items */}
              {orderDetails.items.length > 0 ? (
                <div className="space-y-3">
                  {orderDetails.items.map((item, index) => (
                    <div key={`${item.mealName}-${index}`} className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.mealName}</h4>
                        {(item.selectedToppings && item.selectedToppings.length > 0) && (
                          <p className="text-sm text-muted-foreground">
                            Toppings: {item.selectedToppings.map(t => t.name).join(', ')}
                          </p>
                        )}
                        {(item.selectedSides && item.selectedSides.length > 0) && (
                          <p className="text-sm text-muted-foreground">
                            Sides: {item.selectedSides.map(s => s.name).join(', ')}
                          </p>
                        )}
                        {(item.selectedBeverages && item.selectedBeverages.length > 0) && (
                          <p className="text-sm text-muted-foreground">
                            Drinks: {item.selectedBeverages.map(b => b.name).join(', ')}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium">{formatPrice(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Order details are being processed...
                </p>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal (excl. VAT)</span>
                  <span>{formatPrice(orderDetails.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VAT (15%)</span>
                  <span>{formatPrice(calculateVATAmount(orderDetails.total))}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total (incl. VAT)</span>
                  <span className="text-primary">{formatPrice(orderDetails.total + calculateVATAmount(orderDetails.total))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Back to Menu
              </Button>
            </Link>
            <Button className="flex-1">
              <Star className="h-4 w-4 mr-2" />
              Rate Your Experience
            </Button>
          </div>

          {/* Support */}
          <Card className="border-0 bg-muted/50">
            <CardContent className="pt-6 text-center">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions about your order, don&apos;t hesitate to contact us.
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Store
                </Button>
                <Button variant="ghost" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}