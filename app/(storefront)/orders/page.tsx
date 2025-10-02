"use client";

import {
  useEffect,
  useState,
} from 'react';

import { useQuery } from 'convex/react';
import {
  Clock,
  Package,
  Truck,
} from 'lucide-react';
import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { api } from '@/convex/_generated/api';
import type { Doc } from '@/convex/_generated/dataModel';
import { formatPrice } from '@/lib/utils';

// Extended order item type with meal details
type OrderItemWithDetails = {
  mealId: string;
  quantity: number;
  selectedToppings: Array<{ id: string; name: string; price: number; }>;
  selectedSides: Array<{ id: string; name: string; price: number; }>;
  selectedBeverages: Array<{ id: string; name: string; price: number; }>;
  totalPrice: number;
  specialInstructions?: string;
  mealName?: string;
  mealImage?: string;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'preparing':
      return 'bg-yellow-500';
    case 'ready':
      return 'bg-green-500';
    case 'completed':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'preparing':
      return 'Preparing';
    case 'ready':
      return 'Ready for Pickup';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
};

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('current');
  const [claims, setClaims] = useState<{
    sub: string;
    email?: string;
    name?: string;
    roles?: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch claims from the auth context
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch('/api/auth/claims');
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setClaims(data);
          } else {
            // Not authenticated, redirect to sign in
            router.push('/sign-in?redirect=/orders');
          }
        } else {
          router.push('/sign-in?redirect=/orders');
        }
      } catch (error) {
        console.error('Failed to fetch claims:', error);
        router.push('/sign-in?redirect=/orders');
      } finally {
        setIsLoading(false);
      }
    };
    fetchClaims();
  }, [router]);

  // Fetch all user orders with details
  const allUserOrders = useQuery(
    api.queries.getUserOrdersWithDetails,
    claims ? {
      limit: 50,
      claims: {
        sub: claims.sub,
        email: claims.email,
        name: claims.name,
        roles: claims.roles || [],
        picture: undefined,
      }
    } : 'skip'
  ) || [];

  // Separate orders by status
  const currentOrders = allUserOrders.filter(order =>
    ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
  );
  const completedOrders = allUserOrders.filter(order => order.status === 'completed');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'history') {
      setActiveTab('history');
    }
  }, [searchParams]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center bg-background min-h-screen">
        <div className="text-center">
          <div className="mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl">My Orders</h1>
          <p className="text-muted-foreground">
            Track your current orders and view order history
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Current Orders ({currentOrders.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Order History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-6">
            <div className="space-y-4">
              {currentOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col justify-center items-center py-12">
                    <Package className="mb-4 w-12 h-12 text-muted-foreground" />
                    <h3 className="mb-2 font-semibold text-lg">No Current Orders</h3>
                    <p className="text-muted-foreground text-center">
                      You don&apos;t have any active orders at the moment.
                    </p>
                    <Button className="mt-4" onClick={() => { window.location.href = '/menu'; }}>
                      Browse Menu
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                currentOrders.map((order: Doc<"orders">) => (
                  <Card key={order._id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Order #{order._id.slice(-8)}</CardTitle>
                        <Badge
                          className={`${getStatusColor(order.status)} text-white`}
                        >
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Ordered at {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="mb-2 font-medium">Items:</h4>
                          <ul className="space-y-1 text-muted-foreground text-sm">
                            {order.items.map((item, index) => (
                              <li key={`${order._id}-${item.mealId}-${index}`}>
                                • {item.quantity}x {(item as OrderItemWithDetails).mealName || 'Unknown Meal'}
                                {item.selectedToppings && item.selectedToppings.length > 0 && (
                                  <span className="text-xs"> ({item.selectedToppings.map(t => t.name).join(', ')})</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-sm">
                            <Truck className="w-4 h-4" />
                            <span>
                              {order.status === 'ready' ? 'Ready for pickup' :
                               order.status === 'preparing' ? 'Being prepared' :
                               order.status === 'confirmed' ? 'Order confirmed' :
                               'Order received'}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground text-sm">Total</p>
                            <p className="font-semibold text-lg">{formatPrice(order.total)}</p>
                          </div>
                        </div>

                        {order.status === 'ready' && (
                          <Button className="bg-green-600 hover:bg-green-700 w-full">
                            Ready for Pickup
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="space-y-4">
              {completedOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col justify-center items-center py-12">
                    <Clock className="mb-4 w-12 h-12 text-muted-foreground" />
                    <h3 className="mb-2 font-semibold text-lg">No Order History</h3>
                    <p className="text-muted-foreground text-center">
                      You haven&apos;t completed any orders yet.
                    </p>
                    <Button className="mt-4" onClick={() => { window.location.href = '/menu'; }}>
                      Start Ordering
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                completedOrders.map((order: Doc<"orders">) => (
                  <Card key={order._id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Order #{order._id.slice(-8)}</CardTitle>
                        <Badge variant="secondary">
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Ordered: {new Date(order.createdAt).toLocaleString()}
                      </p>
                      {order.completedAt && (
                        <p className="text-muted-foreground text-sm">
                          Completed: {new Date(order.completedAt).toLocaleString()}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="mb-2 font-medium">Items:</h4>
                          <ul className="space-y-1 text-muted-foreground text-sm">
                            {order.items.map((item, index) => (
                              <li key={`${order._id}-history-${item.mealId}-${index}`}>
                                • {item.quantity}x {(item as OrderItemWithDetails).mealName || 'Unknown Meal'}
                                {item.selectedToppings && item.selectedToppings.length > 0 && (
                                  <span className="text-xs"> ({item.selectedToppings.map(t => t.name).join(', ')})</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex justify-between items-center">
                          <Button variant="outline" size="sm">
                            Reorder
                          </Button>
                          <div className="text-right">
                            <p className="text-muted-foreground text-sm">Total</p>
                            <p className="font-semibold text-lg">{formatPrice(order.total)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}