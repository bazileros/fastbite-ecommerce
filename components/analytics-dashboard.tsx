"use client";

import {
  Activity,
  BarChart3,
  Calendar,
  DollarSign,
  PieChart,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  useMemo,
  useState,
} from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Sample data for different chart types
const salesData = [
  { month: 'Jan', sales: 4000, orders: 240, customers: 120 },
  { month: 'Feb', sales: 3000, orders: 198, customers: 98 },
  { month: 'Mar', sales: 5000, orders: 380, customers: 180 },
  { month: 'Apr', sales: 4500, orders: 320, customers: 160 },
  { month: 'May', sales: 6000, orders: 450, customers: 220 },
  { month: 'Jun', sales: 5500, orders: 410, customers: 200 },
  { month: 'Jul', sales: 7000, orders: 520, customers: 260 },
  { month: 'Aug', sales: 6500, orders: 480, customers: 240 },
  { month: 'Sep', sales: 8000, orders: 600, customers: 300 },
  { month: 'Oct', sales: 7500, orders: 560, customers: 280 },
  { month: 'Nov', sales: 9000, orders: 680, customers: 340 },
  { month: 'Dec', sales: 8500, orders: 640, customers: 320 },
];

const categoryData = [
  { name: 'Burgers', value: 35, color: '#ff6b6b' },
  { name: 'Chicken', value: 25, color: '#4ecdc4' },
  { name: 'Sides', value: 20, color: '#45b7d1' },
  { name: 'Beverages', value: 15, color: '#f9ca24' },
  { name: 'Desserts', value: 5, color: '#f0932b' },
];

const hourlyData = [
  { hour: '9AM', orders: 12 },
  { hour: '10AM', orders: 19 },
  { hour: '11AM', orders: 25 },
  { hour: '12PM', orders: 45 },
  { hour: '1PM', orders: 52 },
  { hour: '2PM', orders: 48 },
  { hour: '3PM', orders: 35 },
  { hour: '4PM', orders: 28 },
  { hour: '5PM', orders: 22 },
  { hour: '6PM', orders: 18 },
  { hour: '7PM', orders: 15 },
  { hour: '8PM', orders: 8 },
];

const customerData = [
  { age: 18, spending: 25 },
  { age: 22, spending: 35 },
  { age: 25, spending: 45 },
  { age: 28, spending: 55 },
  { age: 30, spending: 65 },
  { age: 32, spending: 75 },
  { age: 35, spending: 85 },
  { age: 38, spending: 95 },
  { age: 40, spending: 105 },
  { age: 45, spending: 125 },
  { age: 50, spending: 145 },
  { age: 55, spending: 165 },
];

const performanceData = [
  { metric: 'Order Accuracy', value: 98.5, target: 95 },
  { metric: 'Customer Satisfaction', value: 4.7, target: 4.5 },
  { metric: 'Average Prep Time', value: 12.3, target: 15 },
  { metric: 'Revenue Growth', value: 23.4, target: 20 },
];

export function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('12months');

  const totalSales = useMemo(() => {
    return salesData.reduce((sum, item) => sum + item.sales, 0);
  }, []);

  const totalOrders = useMemo(() => {
    return salesData.reduce((sum, item) => sum + item.orders, 0);
  }, []);

  const totalCustomers = useMemo(() => {
    return salesData.reduce((sum, item) => sum + item.customers, 0);
  }, []);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your restaurant performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === '7days' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('7days')}
          >
            7 Days
          </Button>
          <Button
            variant={selectedPeriod === '30days' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('30days')}
          >
            30 Days
          </Button>
          <Button
            variant={selectedPeriod === '12months' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('12months')}
          >
            12 Months
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Sales</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">R{totalSales.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">
              <span className="text-green-600">+12.5%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Orders</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{totalOrders.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">
              <span className="text-green-600">+8.2%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Customers</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{totalCustomers.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">
              <span className="text-green-600">+15.3%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Avg Order Value</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">R{(totalSales / totalOrders).toFixed(2)}</div>
            <p className="text-muted-foreground text-xs">
              <span className="text-green-600">+5.1%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
            {/* Sales Trend Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Monthly sales performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R${value}`, 'Sales']} />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#8884d8"
                      strokeWidth={3}
                      dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Sales breakdown by menu category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Orders by Hour Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Orders by Hour</CardTitle>
              <CardDescription>Peak ordering times throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
            {/* Sales vs Orders Area Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sales vs Orders</CardTitle>
                <CardDescription>Correlation between sales and order volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Sales Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Sales</CardTitle>
                <CardDescription>Detailed breakdown of monthly performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R${value}`, 'Sales']} />
                    <Bar dataKey="sales" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
            {/* Customer Spending Scatter Plot */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Spending by Age</CardTitle>
                <CardDescription>Average spending patterns across age groups</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={customerData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" name="Age" />
                    <YAxis dataKey="spending" name="Spending (R)" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Customers" dataKey="spending" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Customer Growth Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New customer acquisition over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="customers"
                      stroke="#ff7300"
                      strokeWidth={3}
                      dot={{ fill: '#ff7300', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators vs targets</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="metric" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Current" />
                  <Bar dataKey="target" fill="#82ca9d" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Growth Insight
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Sales have increased by 23.4% this quarter, with burgers being the top-performing category.
                </p>
                <Badge className="mt-2" variant="secondary">Positive Trend</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Peak Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Highest order volume occurs between 12-2 PM. Consider staffing adjustments during peak hours.
                </p>
                <Badge className="mt-2" variant="outline">Operational</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Customer Behavior
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Customers aged 25-35 show highest spending. Target marketing campaigns to this demographic.
                </p>
                <Badge className="mt-2" variant="secondary">Marketing</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Seasonal Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  November and December show 30% higher sales. Prepare inventory for holiday season demand.
                </p>
                <Badge className="mt-2" variant="outline">Seasonal</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-red-600" />
                  Menu Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Burgers represent 35% of sales but only 25% of menu items. Consider expanding burger options.
                </p>
                <Badge className="mt-2" variant="secondary">Menu</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Order accuracy at 98.5% exceeds target. Customer satisfaction rating of 4.7/5 is excellent.
                </p>
                <Badge className="mt-2" variant="default">Excellent</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}