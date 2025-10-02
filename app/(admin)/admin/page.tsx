'use client';

import { useQuery } from 'convex/react';
import {
  Activity,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { useAdminClaims } from '@/components/admin-layout-client';
import { ErrorBoundary } from '@/components/error-boundary';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/convex/_generated/api';

const metricCards = [
  {
    key: 'totalRevenue',
    label: 'Total Revenue',
    icon: DollarSign,
    formatter: (value: number) => `R${value.toLocaleString()}`,
  },
  {
    key: 'totalOrders',
    label: 'Total Orders',
    icon: ShoppingCart,
    formatter: (value: number) => value.toLocaleString(),
  },
  {
    key: 'activeMeals',
    label: 'Active Meals',
    icon: Package,
    formatter: (value: number) => value.toLocaleString(),
  },
  {
    key: 'totalUsers',
    label: 'Total Users',
    icon: Users,
    formatter: (value: number) => value.toLocaleString(),
  },
] as const;

type MetricKey = (typeof metricCards)[number]['key'];

export default function AdminPage() {
  const claims = useAdminClaims();

  const sharedClaims = claims ? {
    sub: claims.sub || '',
    email: claims.email || undefined,
    name: claims.name || undefined,
    roles: claims.roles || [],
    picture: claims.picture || undefined,
  } : {
    sub: '',
    email: undefined,
    name: undefined,
    roles: [],
    picture: undefined,
  };

  const analytics = useQuery(api.queries.getAnalytics, {
    claims: sharedClaims,
  });

  const orders = useQuery(api.queries.getOrders, {
    claims: sharedClaims,
    limit: 10,
  });

  const users = useQuery(api.queries.getUsers, {
    claims: sharedClaims,
    limit: 10,
  });

  const isLoading = analytics === undefined || orders === undefined || users === undefined;
  const hasError = analytics === null || orders === null || users === null;

  const metricDescriptions: Record<MetricKey, (data: NonNullable<typeof analytics>) => string> = {
    totalRevenue: (data) => {
      const value = data.averageOrderValue || 0;
      return data.totalOrders > 0
        ? `Average order value R${value.toFixed(2)}`
        : 'No orders recorded yet';
    },
    totalOrders: (data) => {
      const completionRate = data.totalOrders > 0
        ? Math.round((data.completedOrders / data.totalOrders) * 100)
        : 0;
      return data.totalOrders > 0
        ? `${completionRate}% completed orders`
        : 'Waiting on your first order';
    },
    activeMeals: (data) => `${data.activeMeals} menu items live`,
    totalUsers: (data) => `${data.totalUsers} customer profiles`,
  };

  if (hasError) {
    return (
      <section className="space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="font-display font-semibold text-3xl tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your admin dashboard</p>
        </header>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              Access denied
            </CardTitle>
            <CardDescription>
              Your account doesn&apos;t have permission to view this dashboard or there was an error loading the data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">Try the following steps:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Confirm you&apos;re signed in with an admin account</li>
              <li>Verify your role assignment in the users panel</li>
              <li>Refresh the page to retry the request</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <header className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-display font-semibold text-3xl tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Monitor performance, track orders, and manage your storefront in one place.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-muted-foreground text-sm">
          <Badge variant="outline" className="border-dashed rounded-full">
            Last sync {new Date(analytics?.period?.end ?? Date.now()).toLocaleTimeString()}
          </Badge>
        </div>
      </header>

      <ErrorBoundary fallback={<div className="bg-muted/30 p-8 border rounded-lg text-muted-foreground text-center">Dashboard temporarily unavailable</div>}>
        {isLoading ? (
          <div className="space-y-8">
            <div className="gap-4 grid sm:grid-cols-2 xl:grid-cols-4">
              {metricCards.map((card) => (
                <Card key={card.key} className="shadow-none">
                  <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="rounded-full w-5 h-5" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="w-20 h-7" />
                    <Skeleton className="mt-2 w-24 h-3" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="gap-4 grid lg:grid-cols-2">
              {[0, 1].map((key) => (
                <Card key={key} className="shadow-none">
                  <CardHeader>
                    <Skeleton className="w-40 h-5" />
                    <Skeleton className="w-52 h-4" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[0, 1, 2].map((row) => (
                      <Skeleton key={row} className="w-full h-12" />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="gap-4 grid sm:grid-cols-2 xl:grid-cols-4">
              {metricCards.map((card) => {
                const metricValue = Number(analytics?.[card.key] ?? 0);
                const Icon = card.icon;

                return (
                  <Card key={card.key} className="shadow-none border-border/70">
                    <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-2">
                      <div>
                        <CardDescription className="text-muted-foreground/80 text-xs uppercase tracking-wide">
                          {card.label}
                        </CardDescription>
                        <CardTitle className="mt-2 font-semibold text-2xl">
                          {card.formatter(metricValue)}
                        </CardTitle>
                      </div>
                      <span className="bg-muted p-2 rounded-full text-muted-foreground">
                        <Icon className="w-4 h-4" />
                      </span>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-xs">
                        {analytics ? metricDescriptions[card.key](analytics) : 'Updating metrics…'}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="gap-4 grid xl:grid-cols-5">
              <Card className="xl:col-span-3 shadow-none border-border/70">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5" />
                    Order status overview
                  </CardTitle>
                  <CardDescription>
                    Distribution of orders across the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.statusBreakdown && Object.keys(analytics.statusBreakdown).length > 0 ? (
                      Object.entries(analytics.statusBreakdown).map(([status, count]) => (
                        <div key={status} className="flex justify-between items-center bg-muted/50 p-3 border border-border/70 rounded-md">
                          <div className="flex items-center gap-3">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                status === 'completed' ? 'bg-emerald-500' :
                                status === 'pending' ? 'bg-amber-500' :
                                status === 'preparing' ? 'bg-sky-500' :
                                status === 'ready' ? 'bg-violet-500' :
                                'bg-rose-500'
                              }`}
                            />
                            <span className="font-medium text-sm capitalize">{status}</span>
                          </div>
                          <span className="font-semibold text-sm">{count}</span>
                        </div>
                      ))
                    ) : (
                      <p className="py-6 border border-border/50 border-dashed rounded-md text-muted-foreground text-sm text-center">
                        No orders yet. When orders arrive, their progress will appear here automatically.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="xl:col-span-2 shadow-none border-border/70">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShoppingCart className="w-5 h-5" />
                    Recent orders
                  </CardTitle>
                  <CardDescription>
                    Five most recent orders across every channel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orders && orders.length > 0 ? (
                    orders.slice(0, 5).map((order) => (
                      <div key={order._id} className="flex justify-between items-center bg-muted/40 px-3 py-2 rounded-md">
                        <div>
                          <p className="font-semibold text-sm">Order #{order._id.slice(-8)}</p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(order.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">R{order.total}</p>
                          <p
                            className={`text-xs font-medium capitalize ${
                              order.status === 'completed'
                                ? 'text-emerald-600'
                                : order.status === 'pending'
                                  ? 'text-amber-600'
                                  : order.status === 'cancelled'
                                    ? 'text-rose-600'
                                    : 'text-sky-600'
                            }`}
                          >
                            {order.status}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-6 border border-border/50 border-dashed rounded-md text-muted-foreground text-sm text-center">
                      No orders yet. Once customers start ordering, they will show up here instantly.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-none border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5" />
                  Quick actions
                </CardTitle>
                <CardDescription>
                  Jump back into the workflows you manage most often
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3">
                  {[{
                    title: 'Add new meal',
                    description: 'Create or update menu items with descriptions, pricing, and imagery.',
                    href: '/admin/menu',
                  }, {
                    title: 'Manage orders',
                    description: 'Track progress, update statuses, and handle customer requests.',
                    href: '/admin/orders',
                  }, {
                    title: 'View analytics',
                    description: 'Review how your store is performing over time.',
                    href: '/admin/analytics',
                  }].map((action) => (
                    <Link
                      key={action.title}
                      href={action.href}
                      className="group hover:bg-primary/5 bg-gradient-to-br from-background via-background to-background/90 p-5 border hover:border-primary/50 border-border/70 rounded-xl transition-colors"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-base leading-none tracking-tight">
                            {action.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {action.description}
                          </p>
                        </div>
                        <span className="inline-flex justify-center items-center group-hover:bg-primary mt-1 border border-primary/40 border-dashed rounded-full w-8 h-8 text-primary group-hover:text-primary-foreground">
                          →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </ErrorBoundary>
    </section>
  );
}