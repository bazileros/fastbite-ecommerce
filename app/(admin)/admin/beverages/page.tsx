"use client";

import { useState, useMemo, useId } from "react";
import { useQuery, useMutation } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useAdminClaims } from '@/components/admin-layout-client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Download } from "lucide-react";

interface Beverage {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  isActive: boolean;
  isAlcoholic?: boolean;
  isCaffeinated?: boolean;
  allergens?: string[];
  calories?: number;
  volume?: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export default function BeveragesPage() {
  const claims = useAdminClaims();
  const id = useId();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBeverage, setEditingBeverage] = useState<Beverage | null>(null);

  // Fetch beverages
  const beveragesQuery = useQuery(api.queries.getBeverages, { includeInactive: true });
  const beverages = useMemo(() => beveragesQuery || [], [beveragesQuery]);
  const categories = useQuery(api.queries.getCategories, { includeInactive: true }) || [];

  // Mutations
  const createBeverage = useMutation(api.mutations.createBeverage);
  const updateBeverage = useMutation(api.mutations.updateBeverage);
  const deleteBeverage = useMutation(api.mutations.deleteBeverage);

  // Filter beverages
  const filteredBeverages = useMemo(() => {
    return beverages.filter((beverage) => {
      const matchesSearch = beverage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          beverage.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || beverage.category === categoryFilter;
      const matchesStatus = statusFilter === "all" ||
                          (statusFilter === "active" && beverage.isActive) ||
                          (statusFilter === "inactive" && !beverage.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [beverages, searchTerm, categoryFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = beverages.length;
    const active = beverages.filter(b => b.isActive).length;
    const alcoholic = beverages.filter(b => b.isAlcoholic).length;
    const nonAlcoholic = total - alcoholic;

    return { total, active, alcoholic, nonAlcoholic };
  }, [beverages]);

  const handleCreateBeverage = async (formData: FormData) => {
    if (!claims) {
      toast.error("Authentication required");
      return;
    }

    try {
      const data = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        category: formData.get("category") as string,
        image: undefined, // TODO: Implement image upload
        isAlcoholic: formData.get("isAlcoholic") === "on" || false,
        allergens: (formData.get("allergens") as string)?.split(",").map(a => a.trim()).filter(Boolean) || [],
        calories: formData.get("calories") ? parseInt(formData.get("calories") as string) : undefined,
        volume: formData.get("volume") as string || undefined,
        sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
        claims: {
          sub: claims.sub || '',
          email: claims.email || undefined,
          name: claims.name || undefined,
          roles: claims.roles || [],
          picture: claims.picture || undefined,
        },
      };

      await createBeverage(data);
      toast.success("Beverage created successfully");
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error("Failed to create beverage: " + (error as Error).message);
    }
  };

  const handleUpdateBeverage = async (formData: FormData) => {
    if (!claims || !editingBeverage) return;

    try {
      const data = {
        beverageId: editingBeverage._id as Id<'beverages'>,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        category: formData.get("category") as string,
        image: undefined, // TODO: Implement image upload
        isActive: formData.get("isActive") === "on",
        isAlcoholic: formData.get("isAlcoholic") === "on" || false,
        allergens: (formData.get("allergens") as string)?.split(",").map(a => a.trim()).filter(Boolean) || [],
        calories: formData.get("calories") ? parseInt(formData.get("calories") as string) : undefined,
        volume: formData.get("volume") as string || undefined,
        sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
        claims: {
          sub: claims.sub || '',
          email: claims.email || undefined,
          name: claims.name || undefined,
          roles: claims.roles || [],
          picture: claims.picture || undefined,
        },
      };

      await updateBeverage(data);
      toast.success("Beverage updated successfully");
      setEditingBeverage(null);
    } catch (error) {
      toast.error("Failed to update beverage: " + (error as Error).message);
    }
  };

  const handleDeleteBeverage = async (beverageId: string) => {
    if (!claims) return;

    try {
      await deleteBeverage({ 
        beverageId: beverageId as Id<'beverages'>, 
        claims: {
          sub: claims.sub || '',
          email: claims.email || undefined,
          name: claims.name || undefined,
          roles: claims.roles || [],
          picture: claims.picture || undefined,
        }
      });
      toast.success("Beverage deleted successfully");
    } catch (error) {
      toast.error("Failed to delete beverage: " + (error as Error).message);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Name", "Description", "Price", "Category", "Volume", "Active", "Alcoholic", "Caffeinated", "Allergens", "Calories"],
      ...filteredBeverages.map(beverage => [
        beverage.name,
        beverage.description || "",
        beverage.price.toString(),
        beverage.category,
        beverage.volume || "",
        beverage.isActive ? "Yes" : "No",
        beverage.isAlcoholic ? "Yes" : "No",
        beverage.isCaffeinated ? "Yes" : "No",
        (beverage.allergens || []).join("; "),
        beverage.calories?.toString() || "",
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "beverages.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-3xl">Beverages Management</h1>
          <p className="text-muted-foreground">Manage drinks and beverages for your menu</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 w-4 h-4" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 w-4 h-4" />
                Add Beverage
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Beverage</DialogTitle>
                <DialogDescription>Add a new drink to your menu</DialogDescription>
              </DialogHeader>
              <form action={handleCreateBeverage} className="space-y-4">
                <div className="gap-4 grid grid-cols-2">
                  <div>
                    <Label htmlFor={`${id}-name`}>Name *</Label>
                    <Input id={`${id}-name`} name="name" required />
                  </div>
                  <div>
                    <Label htmlFor={`${id}-price`}>Price *</Label>
                    <Input id={`${id}-price`} name="price" type="number" step="0.01" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`${id}-description`}>Description</Label>
                  <Textarea id={`${id}-description`} name="description" />
                </div>
                <div className="gap-4 grid grid-cols-2">
                  <div>
                    <Label htmlFor={`${id}-category`}>Category *</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`${id}-volume`}>Volume (e.g., 330ml, 500ml)</Label>
                    <Input id={`${id}-volume`} name="volume" placeholder="330ml" />
                  </div>
                </div>
                <div className="gap-4 grid grid-cols-2">
                  <div>
                    <Label htmlFor={`${id}-calories`}>Calories</Label>
                    <Input id={`${id}-calories`} name="calories" type="number" />
                  </div>
                  <div>
                    <Label htmlFor={`${id}-sortOrder`}>Sort Order</Label>
                    <Input id={`${id}-sortOrder`} name="sortOrder" type="number" defaultValue="0" />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`${id}-allergens`}>Allergens (comma-separated)</Label>
                  <Input id={`${id}-allergens`} name="allergens" placeholder="nuts, dairy, gluten" />
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id={`${id}-isAlcoholic`} name="isAlcoholic" />
                    <Label htmlFor={`${id}-isAlcoholic`}>Alcoholic</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Beverage</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Beverages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Alcoholic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.alcoholic}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Non-Alcoholic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.nonAlcoholic}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex md:flex-row flex-col gap-4">
            <div className="flex-1">
              <Label htmlFor={`${id}-search`}>Search</Label>
              <div className="relative">
                <Search className="top-2.5 left-2 absolute w-4 h-4 text-muted-foreground" />
                <Input
                  id={`${id}-search`}
                  placeholder="Search beverages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category-filter">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Beverages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Beverages ({filteredBeverages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBeverages.map((beverage) => (
                <TableRow key={beverage._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{beverage.name}</div>
                      {beverage.description && (
                        <div className="text-muted-foreground text-sm">{beverage.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{beverage.category}</TableCell>
                  <TableCell>${beverage.price.toFixed(2)}</TableCell>
                  <TableCell>{beverage.volume || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={beverage.isActive ? "default" : "secondary"}>
                      {beverage.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant={beverage.isAlcoholic ? "destructive" : "outline"}>
                        {beverage.isAlcoholic ? "Alcoholic" : "Non-Alcoholic"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingBeverage(beverage)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Beverage</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;{beverage.name}&quot;? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteBeverage(beverage._id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredBeverages.length === 0 && (
            <div className="py-8 text-muted-foreground text-center">
              No beverages found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingBeverage && (
        <Dialog open={!!editingBeverage} onOpenChange={() => setEditingBeverage(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Beverage</DialogTitle>
              <DialogDescription>Update beverage information</DialogDescription>
            </DialogHeader>
            <form action={handleUpdateBeverage} className="space-y-4">
              <div className="gap-4 grid grid-cols-2">
                <div>
                  <Label htmlFor={`${id}-edit-name`}>Name *</Label>
                  <Input id={`${id}-edit-name`} name="name" defaultValue={editingBeverage.name} required />
                </div>
                <div>
                  <Label htmlFor={`${id}-edit-price`}>Price *</Label>
                  <Input id={`${id}-edit-price`} name="price" type="number" step="0.01" defaultValue={editingBeverage.price} required />
                </div>
              </div>
              <div>
                <Label htmlFor={`${id}-edit-description`}>Description</Label>
                <Textarea id={`${id}-edit-description`} name="description" defaultValue={editingBeverage.description || ""} />
              </div>
              <div className="gap-4 grid grid-cols-2">
                <div>
                  <Label htmlFor={`${id}-edit-category`}>Category *</Label>
                  <Select name="category" defaultValue={editingBeverage.category} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`${id}-edit-volume`}>Volume</Label>
                  <Input id={`${id}-edit-volume`} name="volume" defaultValue={editingBeverage.volume || ""} placeholder="330ml" />
                </div>
              </div>
              <div className="gap-4 grid grid-cols-2">
                <div>
                  <Label htmlFor={`${id}-edit-calories`}>Calories</Label>
                  <Input id={`${id}-edit-calories`} name="calories" type="number" defaultValue={editingBeverage.calories || ""} />
                </div>
                <div>
                  <Label htmlFor={`${id}-edit-sortOrder`}>Sort Order</Label>
                  <Input id={`${id}-edit-sortOrder`} name="sortOrder" type="number" defaultValue={editingBeverage.sortOrder} />
                </div>
              </div>
              <div>
                <Label htmlFor={`${id}-edit-allergens`}>Allergens (comma-separated)</Label>
                <Input id={`${id}-edit-allergens`} name="allergens" defaultValue={(editingBeverage.allergens || []).join(", ")} placeholder="nuts, dairy, gluten" />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id={`${id}-edit-isActive`} name="isActive" defaultChecked={editingBeverage.isActive} />
                  <Label htmlFor={`${id}-edit-isActive`}>Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id={`${id}-edit-isAlcoholic`} name="isAlcoholic" defaultChecked={!!editingBeverage.isAlcoholic} />
                  <Label htmlFor={`${id}-edit-isAlcoholic`}>Alcoholic</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingBeverage(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update Beverage</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}