'use client';

import { useState } from 'react';

import {
  useMutation,
  useQuery,
} from 'convex/react';
import {
  Calendar,
  Clock,
  Download,
  Eye,
  MoreHorizontal,
  Search,
  User,
} from 'lucide-react';

import { useAdminClaims } from '@/components/admin-layout-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useToast } from '@/hooks/use-toast';

export const dynamic = 'force-dynamic';


const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusTransitions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed'],
  completed: [],
  cancelled: [],
};

export default function OrdersManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { toast } = useToast();
  const claims = useAdminClaims();

  const orders = useQuery(api.queries.getOrders, {
    claims: claims ? {
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
    },
    limit: 100
  });
  const users = useQuery(api.queries.getUsers, {
    claims: claims ? {
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
    },
    limit: 1000
  });

  const updateOrderStatus = useMutation(api.mutations.updateOrderStatus);
  const cancelOrder = useMutation(api.mutations.cancelOrder);
  const processRefund = useMutation(api.mutations.processRefund);

  // Filter orders based on search and status
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getUserName = (userId: string) => {
    const user = users?.find(u => u._id === userId);
    return user ? user.name || user.email : 'Unknown User';
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!claims) {
      toast({
        title: "Error",
        description: "Authentication required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateOrderStatus({ 
        orderId: orderId as Id<'orders'>, 
        status: newStatus as "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled",
        claims: {
          sub: claims.sub || '',
          email: claims.email || undefined,
          name: claims.name || undefined,
          roles: claims.roles || [],
          picture: claims.picture || undefined,
        }
      });
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!claims) {
      toast({
        title: "Error",
        description: "Authentication required",
        variant: "destructive",
      });
      return;
    }

    try {
      await cancelOrder({ 
        orderId: orderId as Id<'orders'>, 
        claims: {
          sub: claims.sub || '',
          email: claims.email || undefined,
          name: claims.name || undefined,
          roles: claims.roles || [],
          picture: claims.picture || undefined,
        }
      });
      toast({
        title: "Success",
        description: "Order cancelled successfully",
      });
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
    }
  };

  const handleProcessRefund = async (orderId: string, orderTotal: number) => {
    if (!claims) {
      toast({
        title: "Error",
        description: "Authentication required",
        variant: "destructive",
      });
      return;
    }

    const amount = prompt(`Enter refund amount (max: R${orderTotal}):`, orderTotal.toString());
    const reason = prompt('Enter refund reason:');

    if (!amount || !reason) return;

    const refundAmount = parseFloat(amount);
    if (Number.isNaN(refundAmount) || refundAmount <= 0 || refundAmount > orderTotal) {
      toast({
        title: "Error",
        description: "Invalid refund amount",
        variant: "destructive",
      });
      return;
    }

    try {
      await processRefund({
        orderId: orderId as Id<'orders'>,
        amount: refundAmount,
        reason,
        claims: {
          sub: claims.sub || '',
          email: claims.email || undefined,
          name: claims.name || undefined,
          roles: claims.roles || [],
          picture: claims.picture || undefined,
        }
      });
      toast({
        title: "Success",
        description: "Refund processed successfully",
      });
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to process refund",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    if (!orders) return;

    const csvData = orders.map(order => ({
      'Order ID': order._id,
      'Customer': getUserName(order.userId),
      'Items Count': order.items.length,
      'Total': order.total,
      'Status': order.status,
      'Payment Status': order.paymentStatus,
      'Pickup Time': new Date(order.pickupTime).toLocaleString(),
      'Created At': new Date(order.createdAt).toLocaleString(),
      'Special Instructions': order.specialInstructions || '',
    }));

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val =>
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!orders || !users) {
    return (
      <div className="mx-auto px-4 py-8 container">
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl">Orders Management</h1>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="mb-2 font-bold text-3xl">Orders Management</h1>
          <p className="text-muted-foreground">View and manage customer orders</p>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="font-bold text-2xl">{orders.length}</div>
            <p className="text-muted-foreground text-xs">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="font-bold text-yellow-600 text-2xl">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <p className="text-muted-foreground text-xs">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="font-bold text-blue-600 text-2xl">
              {orders.filter(o => o.status === 'preparing').length}
            </div>
            <p className="text-muted-foreground text-xs">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="font-bold text-green-600 text-2xl">
              {orders.filter(o => o.status === 'completed').length}
            </div>
            <p className="text-muted-foreground text-xs">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex sm:flex-row flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="top-3 left-3 absolute w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders by ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>
            Manage order statuses and view order details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Pickup Time</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-mono text-sm">
                    #{order._id.slice(-8)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{getUserName(order.userId)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    R{order.total.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Clock className="w-3 h-3" />
                      {new Date(order.pickupTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 w-4 h-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {statusTransitions[order.status as keyof typeof statusTransitions]?.map(newStatus => (
                          <DropdownMenuItem
                            key={newStatus}
                            onClick={() => handleStatusUpdate(order._id, newStatus)}
                          >
                            Mark as {newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
                          </DropdownMenuItem>
                        ))}
                        {order.status !== 'cancelled' && order.status !== 'completed' && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleCancelOrder(order._id)}
                          >
                            Cancel Order
                          </DropdownMenuItem>
                        )}
                        {order.status === 'completed' && order.paymentStatus === 'paid' && (
                          <DropdownMenuItem
                            onClick={() => handleProcessRefund(order._id, order.total)}
                          >
                            Process Refund
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No orders found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}