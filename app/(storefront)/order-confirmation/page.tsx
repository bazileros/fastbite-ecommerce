'use client';

import {
  Calendar,
  CheckCircle,
  Clock,
  Home,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Star,
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

export default function OrderConfirmationPage() {
  const [orderStatus, setOrderStatus] = useState('confirmed');
  const [progress, setProgress] = useState(25);
  const [estimatedTime, setEstimatedTime] = useState(18);

  // Simulate order progress
  useEffect(() => {
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
  }, [estimatedTime]);

  const orderNumber = 'FB' + Math.random().toString(36).substr(2, 6).toUpperCase();
  const orderTime = new Date().toLocaleString();

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
              {/* Mock order items */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">The Ultimate Beast Burger</h4>
                    <p className="text-sm text-muted-foreground">
                      Extra Bacon, Avocado, Jalapeños + Truffle Fries + Craft Cola
                    </p>
                    <p className="text-sm text-muted-foreground">Qty: 1</p>
                  </div>
                  <span className="font-medium">{formatPrice(22.47)}</span>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">Spicy Buffalo Chicken</h4>
                    <p className="text-sm text-muted-foreground">
                      Extra Buffalo Sauce + Loaded Fries
                    </p>
                    <p className="text-sm text-muted-foreground">Qty: 1</p>
                  </div>
                  <span className="font-medium">{formatPrice(18.48)}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal (excl. VAT)</span>
                  <span>{formatPrice(40.95)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VAT (15%)</span>
                  <span>{formatPrice(calculateVATAmount(40.95))}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total (incl. VAT)</span>
                  <span className="text-primary">{formatPrice(40.95 + calculateVATAmount(40.95))}</span>
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