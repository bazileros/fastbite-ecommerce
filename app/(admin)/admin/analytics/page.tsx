'use client';

import {
  BarChart3,
  Calendar,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { useAdminClaims } from '@/components/admin-layout-client';
import { useQuery } from 'convex/react';

export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  const claims = useAdminClaims();

  const getDateRange = useMemo(() => {
    if (timeRange === '30d') {
      return {
        start: Date.now() - 30 * 24 * 60 * 60 * 1000,
        end: Date.now(),
      };
    } else if (timeRange === '7d') {
      return {
        start: Date.now() - 7 * 24 * 60 * 60 * 1000,
        end: Date.now(),
      };
    }
    return undefined;
  }, [timeRange]);

  const analyticsArgs = useMemo(() => {
    if (!claims || !claims.sub) {
      return null;
    }

    return {
      claims: {
        sub: claims.sub,
        email: claims.email || undefined,
        name: claims.name || undefined,
        roles: claims.roles || [],
        picture: claims.picture || undefined,
      },
      ...(getDateRange && { dateRange: getDateRange })
    };
  }, [claims, getDateRange]);

  const analytics = useQuery(api.queries.getAnalytics, analyticsArgs || {});
  const orderStats = useQuery(api.queries.getOrderStats, analyticsArgs || {});

  const handleExportReport = () => {
    if (!analytics || !orderStats) {
      return;
    }

    // Create a simple CSV export of the analytics data
    const csvData = [
      ['Metric', 'Value'],
      ['Total Revenue', `R${analytics.totalRevenue.toLocaleString()}`],
      ['Total Orders', analytics.totalOrders.toString()],
      ['Completed Orders', analytics.completedOrders.toString()],
      ['Active Menu Items', analytics.activeMeals.toString()],
      ['Total Users', analytics.totalUsers.toString()],
      ['Average Order Value', `R${orderStats.averageOrderValue.toFixed(2)}`],
      ['Pending Orders', orderStats.pendingOrders.toString()],
      [],
      ['Order Status Breakdown'],
      ...Object.entries(analytics.statusBreakdown).map(([status, count]) => [
        status.charAt(0).toUpperCase() + status.slice(1),
        count.toString()
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!claims) {
    return (
      <div className="mx-auto px-4 py-8 container">
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl">Analytics</h1>
          <p className="text-muted-foreground">Authentication required to view analytics.</p>
        </div>
      </div>
    );
  }

  if (!analytics || !orderStats) {
    return (
      <div className="mx-auto px-4 py-8 container">
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl">Analytics</h1>
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="mb-2 font-bold text-3xl">Analytics</h1>
          <p className="text-muted-foreground">Track your restaurant performance</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportReport}>
            <Calendar className="mr-2 w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              R{analytics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              Average order: R{orderStats.averageOrderValue.toFixed(0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Orders</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{analytics.totalOrders}</div>
            <p className="text-muted-foreground text-xs">
              {analytics.completedOrders} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Active Menu Items</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{analytics.activeMeals}</div>
            <p className="text-muted-foreground text-xs">
              Available for order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{analytics.totalUsers}</div>
            <p className="text-muted-foreground text-xs">
              Registered customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-2 mb-8">
        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Order Status Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of orders by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.statusBreakdown).map(([status, count]) => {
                const percentage = analytics.totalOrders > 0 ? (count / analytics.totalOrders) * 100 : 0;
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{status}</span>
                      <span>{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="bg-muted rounded-full w-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status === 'completed' ? 'bg-green-500' :
                          status === 'pending' ? 'bg-yellow-500' :
                          status === 'preparing' ? 'bg-blue-500' :
                          status === 'ready' ? 'bg-purple-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Key performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>Order Completion Rate</span>
                  <span>
                    {analytics.totalOrders > 0
                      ? ((analytics.completedOrders / analytics.totalOrders) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="bg-muted rounded-full w-full h-2">
                  <div
                    className="bg-green-500 rounded-full h-2"
                    style={{
                      width: `${analytics.totalOrders > 0 ? (analytics.completedOrders / analytics.totalOrders) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>Pending Orders</span>
                  <span>{orderStats.pendingOrders}</span>
                </div>
                <div className="bg-muted rounded-full w-full h-2">
                  <div
                    className="bg-yellow-500 rounded-full h-2"
                    style={{
                      width: `${analytics.totalOrders > 0 ? (orderStats.pendingOrders / analytics.totalOrders) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="gap-4 grid grid-cols-2 text-center">
                  <div>
                    <div className="font-bold text-green-600 text-2xl">
                      R{orderStats.averageOrderValue.toFixed(0)}
                    </div>
                    <div className="text-muted-foreground text-xs">Avg Order Value</div>
                  </div>
                  <div>
                    <div className="font-bold text-blue-600 text-2xl">
                      {analytics.totalOrders > 0 ? (analytics.totalRevenue / analytics.totalOrders).toFixed(1) : '0'}
                    </div>
                    <div className="text-muted-foreground text-xs">Revenue per Order</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Category performance analysis coming soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Order timing analysis coming soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Customer behavior analysis coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}