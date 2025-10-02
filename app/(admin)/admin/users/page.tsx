'use client';

import {
  useId,
  useState,
} from 'react';

import {
  useMutation,
  useQuery,
} from 'convex/react';
import {
  Download,
  Mail,
  MoreHorizontal,
  Search,
  Shield,
  UserCheck,
  UserX,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const roleColors = {
  customer: 'bg-blue-100 text-blue-800',
  staff: 'bg-green-100 text-green-800',
  manager: 'bg-purple-100 text-purple-800',
  admin: 'bg-red-100 text-red-800',
};

const roleHierarchy = ['customer', 'staff', 'manager', 'admin'];

export default function UsersManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('customer');

  const emailId = useId();
  const nameId = useId();

  const { toast } = useToast();
  const claims = useAdminClaims();

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
  const inviteUser = useMutation(api.mutations.inviteUser);
  const updateUserRole = useMutation(api.mutations.updateUserRole);
  const toggleUserBlock = useMutation(api.mutations.toggleUserBlock);

  // Filter users based on search and role
  const filteredUsers = users?.filter(user => {
    const matchesSearch = (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const getRoleBadge = (role?: string) => {
    const roleValue = role || 'customer';
    return (
      <Badge className={roleColors[roleValue as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
        {roleValue.charAt(0).toUpperCase() + roleValue.slice(1)}
      </Badge>
    );
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim() || !inviteName.trim()) {
      toast({
        title: "Error",
        description: "Please enter both email and name",
        variant: "destructive",
      });
      return;
    }

    if (!claims) {
      toast({
        title: "Error",
        description: "Authentication required",
        variant: "destructive",
      });
      return;
    }

    try {
      await inviteUser({ 
        email: inviteEmail, 
        name: inviteName, 
        role: inviteRole as "customer" | "staff" | "manager" | "admin",
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
        description: `Invitation sent to ${inviteEmail}`,
      });
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('customer');
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!claims) {
      toast({
        title: "Error",
        description: "Authentication required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateUserRole({
        userId: userId as Id<'users'>,
        newRole: newRole as "customer" | "staff" | "manager" | "admin",
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
        description: "User role updated successfully",
      });
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleToggleUserBlock = async (userId: string, blocked: boolean) => {
    if (!claims) {
      toast({
        title: "Error",
        description: "Authentication required",
        variant: "destructive",
      });
      return;
    }

    try {
      await toggleUserBlock({
        userId: userId as Id<'users'>,
        blocked,
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
        description: `User ${blocked ? 'blocked' : 'unblocked'} successfully`,
      });
    } catch (_error) {
      toast({
        title: "Error",
        description: `Failed to ${blocked ? 'block' : 'unblock'} user`,
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    if (!users) return;

    const csvData = users.map(user => ({
      'Name': user.name || '',
      'Email': user.email,
      'Role': user.role,
      'Status': user.isBlocked ? 'Blocked' : 'Active',
      'Created At': user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown',
      'Last Login': user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never',
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
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!users) {
    return (
      <div className="mx-auto px-4 py-8 container">
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl">Users Management</h1>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="mb-2 font-bold text-3xl">Users Management</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 w-4 h-4" />
            Export CSV
          </Button>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Mail className="mr-2 w-4 h-4" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Send an invitation to join the platform with specified role.
                </DialogDescription>
              </DialogHeader>
              <div className="gap-4 grid grid-cols-1 py-4">
                <div className="space-y-2">
                  <Label htmlFor={nameId}>Full Name</Label>
                  <Input
                    id={nameId}
                    placeholder="John Doe"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={emailId}>Email Address</Label>
                  <Input
                    id={emailId}
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteUser}>Send Invitation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="font-bold text-2xl">{users.length}</div>
            <p className="text-muted-foreground text-xs">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="font-bold text-blue-600 text-2xl">
              {users.filter(u => u.role === 'customer').length}
            </div>
            <p className="text-muted-foreground text-xs">Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="font-bold text-green-600 text-2xl">
              {users.filter(u => u.role === 'staff' || u.role === 'manager').length}
            </div>
            <p className="text-muted-foreground text-xs">Staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="font-bold text-red-600 text-2xl">
              {users.filter(u => u.isBlocked).length}
            </div>
            <p className="text-muted-foreground text-xs">Blocked</p>
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
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">
                    {user.name || 'No name'}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isBlocked ? 'destructive' : 'default'}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
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
                          <Shield className="mr-2 w-4 h-4" />
                          Change Role
                          <div className="ml-auto">
                            <Select
                              value={user.role}
                              onValueChange={(newRole) => handleUpdateRole(user._id, newRole)}
                            >
                              <SelectTrigger className="w-[100px] h-6">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {roleHierarchy.map(role => (
                                  <SelectItem key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.isBlocked ? (
                          <DropdownMenuItem
                            onClick={() => handleToggleUserBlock(user._id, false)}
                          >
                            <UserCheck className="mr-2 w-4 h-4" />
                            Unblock User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleToggleUserBlock(user._id, true)}
                          >
                            <UserX className="mr-2 w-4 h-4" />
                            Block User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No users found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}