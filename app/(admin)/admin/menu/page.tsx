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
  Edit,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';

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
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useToast } from '@/hooks/use-toast';
import type { Meal } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default function MenuManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMeals, setSelectedMeals] = useState<Set<string>>(new Set());
  const [showInactive, setShowInactive] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    prepTime: '',
    calories: 0,
    spiceLevel: 'mild' as 'mild' | 'medium' | 'hot',
    toppingIds: [] as string[],
    sideIds: [] as string[],
    beverageIds: [] as string[],
    image: null as File | null,
  });

  const nameId = useId();
  const descriptionId = useId();
  const priceId = useId();
  const categoryId = useId();
  const prepTimeId = useId();
  const caloriesId = useId();
  const spiceLevelId = useId();
  const checkboxId = useId();
  const { toast } = useToast();
  const claims = useAdminClaims();

  const meals = useQuery(api.queries.getMeals, {
    includeInactive: true,
    claims: claims ? {
      sub: claims.sub || '',
      email: claims.email || undefined,
      name: claims.name || undefined,
      roles: claims.roles || [],
      picture: claims.picture || undefined,
    } : undefined,
  });
  const categories = useQuery(api.queries.getCategories, { includeInactive: true });
  const toppings = useQuery(api.queries.getToppings, { includeInactive: true });
  const sides = useQuery(api.queries.getSides, { includeInactive: true });
  const beverages = useQuery(api.queries.getBeverages, { includeInactive: true });

  const updateMeal = useMutation(api.mutations.updateMeal);
  const deleteMeal = useMutation(api.mutations.deleteMeal);
  const bulkUpdateMealStatus = useMutation(api.mutations.bulkUpdateMealStatus);
  const bulkDeleteMeals = useMutation(api.mutations.bulkDeleteMeals);
  const createMeal = useMutation(api.mutations.createMeal);

  // Filter meals based on search and category
  const filteredMeals = meals?.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meal.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || meal.category === selectedCategory;
    const matchesStatus = showInactive || meal.isActive;
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const getCategoryName = (categoryId: string) => {
    return categories?.find(cat => cat._id === categoryId)?.name || categoryId;
  };

  const getMealImageUrl = (meal: Meal) => {
    // ImageKit URL is stored directly in meal.image
    return meal.image || null;
  };

  const handleSelectMeal = (mealId: string, checked: boolean) => {
    const newSelected = new Set(selectedMeals);
    if (checked) {
      newSelected.add(mealId);
    } else {
      newSelected.delete(mealId);
    }
    setSelectedMeals(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMeals(new Set(filteredMeals.map(meal => meal._id)));
    } else {
      setSelectedMeals(new Set());
    }
  };

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedMeals.size === 0) return;

    if (!claims) {
      toast({
        title: "Error",
        description: "Authentication required",
        variant: "destructive",
      });
      return;
    }

    try {
      await bulkUpdateMealStatus({
        mealIds: Array.from(selectedMeals).map(id => id as Id<'meals'>),
        isActive,
        claims: {
          sub: claims.sub || '',
          email: claims.email || undefined,
          name: claims.name || undefined,
          roles: claims.roles || [],
          picture: claims.picture || undefined,
        },
      });

      toast({
        title: "Success",
        description: `Updated ${selectedMeals.size} meals`,
      });

      setSelectedMeals(new Set());
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to update meals",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMeals.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedMeals.size} meals?`)) {
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
      await bulkDeleteMeals({
        mealIds: Array.from(selectedMeals).map(id => id as Id<'meals'>),
        claims: {
          sub: claims.sub || '',
          email: claims.email || undefined,
          name: claims.name || undefined,
          roles: claims.roles || [],
          picture: claims.picture || undefined,
        },
      });

      toast({
        title: "Success",
        description: `Deleted ${selectedMeals.size} meals`,
      });

      setSelectedMeals(new Set());
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to delete meals",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (mealId: string, currentStatus: boolean) => {
    if (!claims) {
      toast({
        title: "Error",
        description: "Authentication required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateMeal({
        mealId: mealId as Id<'meals'>,
        isActive: !currentStatus,
        claims: {
          sub: claims.sub || '',
          email: claims.email || undefined,
          name: claims.name || undefined,
          roles: claims.roles || [],
          picture: claims.picture || undefined,
        },
      });

      toast({
        title: "Success",
        description: `Meal ${!currentStatus ? 'activated' : 'deactivated'}`,
      });
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to update meal status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMeal = async (mealId: string, mealName: string) => {
    if (!confirm(`Are you sure you want to delete "${mealName}"?`)) {
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
      await deleteMeal({
        mealId: mealId as Id<'meals'>,
        claims: {
          sub: claims.sub || '',
          email: claims.email || undefined,
          name: claims.name || undefined,
          roles: claims.roles || [],
          picture: claims.picture || undefined,
        },
      });

      toast({
        title: "Success",
        description: "Meal deleted successfully",
      });
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to delete meal",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      prepTime: '',
      calories: 0,
      spiceLevel: 'mild',
      toppingIds: [],
      sideIds: [],
      beverageIds: [],
      image: null,
    });
    setImagePreview(null);
    setEditingMeal(null); // Clear editing meal state
  };

  const handleEditMeal = (meal: Meal) => {
    // Close create dialog first to avoid focus conflicts
    setCreateDialogOpen(false);
    
    setEditingMeal(meal);
    setFormData({
      name: meal.name,
      description: meal.description,
      price: meal.price,
      category: meal.category,
      prepTime: meal.prepTime,
      calories: meal.calories,
      spiceLevel: meal.spiceLevel,
      toppingIds: meal.availableToppingIds || [],
      sideIds: meal.availableSideIds || [],
      beverageIds: meal.availableBeverageIds || [],
      image: null, // Reset image for editing - user can upload a new one
    });
    setImagePreview(null); // Reset preview
    
    // Increase delay to 150ms to avoid focus trap conflicts
    setTimeout(() => {
      setEditDialogOpen(true);
    }, 150);
  };

  const handleUpdateMeal = async () => {
    if (!editingMeal) return;

    if (!formData.name.trim() || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (name and category)",
        variant: "destructive",
      });
      return;
    }

    if (formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Price must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (!claims) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to update meals",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      let imageUrl: string | undefined;

      // Upload image if provided
      if (formData.image) {
        setIsUploadingImage(true);
        toast({
          title: "Uploading Image",
          description: "Please wait while we upload your image...",
        });
        
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', formData.image);
          
          const uploadResponse = await fetch('/api/upload-image', {
            method: 'POST',
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error('Upload failed');
          }

          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.url;
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          toast({
            title: "Image Upload Failed",
            description: "Failed to upload image. Continuing without image update.",
            variant: "destructive",
          });
        } finally {
          setIsUploadingImage(false);
        }
      }

      toast({
        title: "Updating Meal",
        description: "Please wait while we update your meal...",
      });

      await updateMeal({
        mealId: editingMeal._id as Id<'meals'>,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        category: formData.category,
        prepTime: formData.prepTime,
        calories: formData.calories,
        spiceLevel: formData.spiceLevel,
        availableToppingIds: formData.toppingIds.map(id => id as Id<'toppings'>),
        availableSideIds: formData.sideIds.map(id => id as Id<'sides'>),
        availableBeverageIds: formData.beverageIds.map(id => id as Id<'beverages'>),
        ...(imageUrl !== undefined && { image: imageUrl }),
        claims: {
          sub: claims.sub || '',
          email: claims.email || undefined,
          name: claims.name || undefined,
          roles: claims.roles || [],
          picture: claims.picture || undefined,
        },
      });

      toast({
        title: "Success! 🎉",
        description: `"${formData.name}" has been updated successfully`,
      });

      setEditDialogOpen(false);
      setEditingMeal(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update meal:', error);
      toast({
        title: "Failed to Update Meal",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setIsUploadingImage(false);
    }
  };

  const handleCreateMeal = async () => {
    if (!formData.name.trim() || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (name and category)",
        variant: "destructive",
      });
      return;
    }

    if (formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Price must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (!claims) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create meals",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      let imageUrl: string | undefined;

      // Upload image if provided
      if (formData.image) {
        setIsUploadingImage(true);
        toast({
          title: "Uploading Image",
          description: "Please wait while we upload your image...",
        });
        
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', formData.image);
          
          const uploadResponse = await fetch('/api/upload-image', {
            method: 'POST',
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error('Upload failed');
          }

          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.url;
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          toast({
            title: "Image Upload Failed",
            description: "Failed to upload image. Continuing without image.",
            variant: "destructive",
          });
        } finally {
          setIsUploadingImage(false);
        }
      }

      toast({
        title: "Creating Meal",
        description: "Please wait while we create your meal...",
      });

      await createMeal({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        category: formData.category,
        prepTime: formData.prepTime,
        calories: formData.calories,
        spiceLevel: formData.spiceLevel,
        availableToppingIds: formData.toppingIds.map(id => id as Id<'toppings'>),
        availableSideIds: formData.sideIds.map(id => id as Id<'sides'>),
        availableBeverageIds: formData.beverageIds.map(id => id as Id<'beverages'>),
        image: imageUrl,
        claims: {
          sub: claims.sub || '',
          email: claims.email || undefined,
          name: claims.name || undefined,
          roles: claims.roles || [],
          picture: claims.picture || undefined,
        },
      });

      toast({
        title: "Success! 🎉",
        description: `"${formData.name}" has been created successfully`,
      });

      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create meal:', error);
      toast({
        title: "Failed to Create Meal",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
      setIsUploadingImage(false);
    }
  };

  const exportToCSV = () => {
    if (!meals) return;

    const csvData = meals.map(meal => ({
      Name: meal.name,
      Description: meal.description,
      Price: meal.price,
      Category: getCategoryName(meal.category),
      Status: meal.isActive ? 'Active' : 'Inactive',
      Rating: meal.rating,
      'Prep Time': meal.prepTime,
      Calories: meal.calories,
      'Spice Level': meal.spiceLevel,
      Popular: meal.popular ? 'Yes' : 'No',
    }));

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meals.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Check if we're in initial loading state (no cached data)
  const isInitialLoading = !meals || !categories;

  if (isInitialLoading) {
    return (
      <div className="mx-auto px-4 py-8 container">
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl">Menu Management</h1>
          <p className="text-muted-foreground">Loading menu items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="mb-2 font-bold text-3xl">Menu Management</h1>
          <p className="text-muted-foreground">Manage your restaurant menu items</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 w-4 h-4" />
            Export CSV
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                // Close edit dialog first to avoid focus conflicts
                setEditDialogOpen(false);
                resetForm();
              }}>
                <Plus className="mr-2 w-4 h-4" />
                Add New Meal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Meal</DialogTitle>
                <DialogDescription>
                  Create a new menu item for your restaurant.
                </DialogDescription>
              </DialogHeader>
              <div className="gap-4 grid grid-cols-1 md:grid-cols-2 py-4">
                <div className="space-y-2">
                  <Label htmlFor={nameId}>Meal Name *</Label>
                  <Input
                    id={nameId}
                    placeholder="e.g., Jollof Rice"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={categoryId}>Category *</Label>
                  <Select
                    modal={false}
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={priceId}>Price (R) *</Label>
                  <Input
                    id={priceId}
                    type="number"
                    placeholder="2500"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={prepTimeId}>Prep Time</Label>
                  <Input
                    id={prepTimeId}
                    placeholder="15 mins"
                    value={formData.prepTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={caloriesId}>Calories</Label>
                  <Input
                    id={caloriesId}
                    type="number"
                    placeholder="450"
                    value={formData.calories}
                    onChange={(e) => setFormData(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={spiceLevelId}>Spice Level</Label>
                  <Select
                    modal={false}
                    value={formData.spiceLevel}
                    onValueChange={(value: 'mild' | 'medium' | 'hot') => setFormData(prev => ({ ...prev, spiceLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={descriptionId}>Description</Label>
                <Textarea
                  id={descriptionId}
                  placeholder="Describe the meal..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Meal Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData(prev => ({ ...prev, image: file }));
                    
                    // Create preview
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const result = e.target?.result as string;
                        if (result && result.trim() !== '' && result.startsWith('data:')) {
                          setImagePreview(result);
                        } else {
                          setImagePreview(null);
                        }
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setImagePreview(null);
                    }
                  }}
                />
                {typeof imagePreview === 'string' && imagePreview.trim() !== '' && imagePreview.startsWith('data:') && (
                  <div className="relative mt-2 border rounded-md w-32 h-32">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover rounded-md"
                      unoptimized
                    />
                  </div>
                )}
                {formData.image && !imagePreview && (
                  <p className="text-muted-foreground text-sm">
                    Selected: {formData.image.name}
                  </p>
                )}
              </div>

              {/* Toppings Selection */}
              <div className="space-y-2">
                <Label>Available Toppings</Label>
                <div className="gap-2 grid grid-cols-2 p-2 border rounded-md max-h-32 overflow-y-auto">
                  {toppings?.filter(t => t.isActive).map((topping) => (
                    <div key={topping._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`create-topping-${topping._id}`}
                        checked={formData.toppingIds.includes(topping._id)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            toppingIds: checked
                              ? [...prev.toppingIds, topping._id]
                              : prev.toppingIds.filter(id => id !== topping._id)
                          }));
                        }}
                      />
                      <Label htmlFor={`create-topping-${topping._id}`} className="text-sm">
                        {topping.name} (+R{topping.price.toFixed(2)})
                      </Label>
                    </div>
                  ))}
                  {(!toppings || toppings.filter(t => t.isActive).length === 0) && (
                    <p className="col-span-2 text-muted-foreground text-sm">No active toppings available</p>
                  )}
                </div>
              </div>

              {/* Sides Selection */}
              <div className="space-y-2">
                <Label>Available Sides</Label>
                <div className="gap-2 grid grid-cols-2 p-2 border rounded-md max-h-32 overflow-y-auto">
                  {sides?.filter(s => s.isActive).map((side) => (
                    <div key={side._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`create-side-${side._id}`}
                        checked={formData.sideIds.includes(side._id)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            sideIds: checked
                              ? [...prev.sideIds, side._id]
                              : prev.sideIds.filter(id => id !== side._id)
                          }));
                        }}
                      />
                      <Label htmlFor={`create-side-${side._id}`} className="text-sm">
                        {side.name} (+R{side.price.toFixed(2)})
                      </Label>
                    </div>
                  ))}
                  {(!sides || sides.filter(s => s.isActive).length === 0) && (
                    <p className="col-span-2 text-muted-foreground text-sm">No active sides available</p>
                  )}
                </div>
              </div>

              {/* Beverages Selection */}
              <div className="space-y-2">
                <Label>Available Beverages</Label>
                <div className="gap-2 grid grid-cols-2 p-2 border rounded-md max-h-32 overflow-y-auto">
                  {beverages?.filter(b => b.isActive).map((beverage) => (
                    <div key={beverage._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`create-beverage-${beverage._id}`}
                        checked={formData.beverageIds.includes(beverage._id)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            beverageIds: checked
                              ? [...prev.beverageIds, beverage._id]
                              : prev.beverageIds.filter(id => id !== beverage._id)
                          }));
                        }}
                      />
                      <Label htmlFor={`create-beverage-${beverage._id}`} className="text-sm">
                        {beverage.name} (+R{beverage.price.toFixed(2)})
                      </Label>
                    </div>
                  ))}
                  {(!beverages || beverages.filter(b => b.isActive).length === 0) && (
                    <p className="col-span-2 text-muted-foreground text-sm">No active beverages available</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isCreating}>
                  Cancel
                </Button>
                <Button onClick={handleCreateMeal} disabled={isCreating || isUploadingImage}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 w-4 h-4" />
                      Create Meal
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Meal Dialog */}
          <Dialog 
            open={editDialogOpen} 
            onOpenChange={(open) => {
              if (!open) {
                // When closing edit dialog, ensure create dialog is also closed
                setCreateDialogOpen(false);
              }
              setEditDialogOpen(open);
            }}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Meal</DialogTitle>
                <DialogDescription>
                  Update the meal information.
                </DialogDescription>
              </DialogHeader>
              <div className="gap-4 grid grid-cols-1 md:grid-cols-2 py-4">
                <div className="space-y-2">
                  <Label htmlFor={nameId}>Meal Name *</Label>
                  <Input
                    id={nameId}
                    placeholder="e.g., Jollof Rice"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={categoryId}>Category *</Label>
                  <Select
                    modal={false}
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={priceId}>Price (R) *</Label>
                  <Input
                    id={priceId}
                    type="number"
                    placeholder="2500"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={prepTimeId}>Prep Time</Label>
                  <Input
                    id={prepTimeId}
                    placeholder="15 mins"
                    value={formData.prepTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={caloriesId}>Calories</Label>
                  <Input
                    id={caloriesId}
                    type="number"
                    placeholder="450"
                    value={formData.calories}
                    onChange={(e) => setFormData(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={spiceLevelId}>Spice Level</Label>
                  <Select
                    modal={false}
                    value={formData.spiceLevel}
                    onValueChange={(value: 'mild' | 'medium' | 'hot') => setFormData(prev => ({ ...prev, spiceLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={descriptionId}>Description</Label>
                <Textarea
                  id={descriptionId}
                  placeholder="Describe the meal..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Meal Image</Label>
                {editingMeal && getMealImageUrl(editingMeal) && !imagePreview && (
                  <div className="mb-2">
                    <p className="mb-1 text-muted-foreground text-sm">Current image:</p>
                    <div className="relative border rounded-md w-32 h-32">
                      <Image
                        src={getMealImageUrl(editingMeal) || ''}
                        alt={editingMeal.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData(prev => ({ ...prev, image: file }));
                    
                    // Create preview
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const result = e.target?.result as string;
                        if (result && result.trim() !== '' && result.startsWith('data:')) {
                          setImagePreview(result);
                        } else {
                          setImagePreview(null);
                        }
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setImagePreview(null);
                    }
                  }}
                />
                {typeof imagePreview === 'string' && imagePreview.trim() !== '' && imagePreview.startsWith('data:') && (
                  <div className="mt-2">
                    <p className="mb-1 text-muted-foreground text-sm">New image preview:</p>
                    <div className="relative border rounded-md w-32 h-32">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover rounded-md"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
                {formData.image && !imagePreview && (
                  <p className="text-muted-foreground text-sm">
                    Selected: {formData.image.name}
                  </p>
                )}
              </div>

              {/* Toppings Selection */}
              <div className="space-y-2">
                <Label>Available Toppings</Label>
                <div className="gap-2 grid grid-cols-2 p-2 border rounded-md max-h-32 overflow-y-auto">
                  {toppings?.filter(t => t.isActive).map((topping) => (
                    <div key={topping._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-topping-${topping._id}`}
                        checked={formData.toppingIds.includes(topping._id)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            toppingIds: checked
                              ? [...prev.toppingIds, topping._id]
                              : prev.toppingIds.filter(id => id !== topping._id)
                          }));
                        }}
                      />
                      <Label htmlFor={`edit-topping-${topping._id}`} className="text-sm">
                        {topping.name} (+R{topping.price.toFixed(2)})
                      </Label>
                    </div>
                  ))}
                  {(!toppings || toppings.filter(t => t.isActive).length === 0) && (
                    <p className="col-span-2 text-muted-foreground text-sm">No active toppings available</p>
                  )}
                </div>
              </div>

              {/* Sides Selection */}
              <div className="space-y-2">
                <Label>Available Sides</Label>
                <div className="gap-2 grid grid-cols-2 p-2 border rounded-md max-h-32 overflow-y-auto">
                  {sides?.filter(s => s.isActive).map((side) => (
                    <div key={side._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-side-${side._id}`}
                        checked={formData.sideIds.includes(side._id)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            sideIds: checked
                              ? [...prev.sideIds, side._id]
                              : prev.sideIds.filter(id => id !== side._id)
                          }));
                        }}
                      />
                      <Label htmlFor={`edit-side-${side._id}`} className="text-sm">
                        {side.name} (+R{side.price.toFixed(2)})
                      </Label>
                    </div>
                  ))}
                  {(!sides || sides.filter(s => s.isActive).length === 0) && (
                    <p className="col-span-2 text-muted-foreground text-sm">No active sides available</p>
                  )}
                </div>
              </div>

              {/* Beverages Selection */}
              <div className="space-y-2">
                <Label>Available Beverages</Label>
                <div className="gap-2 grid grid-cols-2 p-2 border rounded-md max-h-32 overflow-y-auto">
                  {beverages?.filter(b => b.isActive).map((beverage) => (
                    <div key={beverage._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-beverage-${beverage._id}`}
                        checked={formData.beverageIds.includes(beverage._id)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            beverageIds: checked
                              ? [...prev.beverageIds, beverage._id]
                              : prev.beverageIds.filter(id => id !== beverage._id)
                          }));
                        }}
                      />
                      <Label htmlFor={`edit-beverage-${beverage._id}`} className="text-sm">
                        {beverage.name} (+R{beverage.price.toFixed(2)})
                      </Label>
                    </div>
                  ))}
                  {(!beverages || beverages.filter(b => b.isActive).length === 0) && (
                    <p className="col-span-2 text-muted-foreground text-sm">No active beverages available</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isUpdating}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateMeal} disabled={isUpdating || isUploadingImage}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 w-4 h-4" />
                      Update Meal
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {selectedMeals.size > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">
                {selectedMeals.size} meal{selectedMeals.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate(true)}
                >
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate(false)}
                >
                  Deactivate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex sm:flex-row flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="top-3 left-3 absolute w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search meals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-background px-3 py-2 border rounded-md"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <label htmlFor={checkboxId} className="flex items-center gap-2">
              <Checkbox
                id={checkboxId}
                checked={showInactive}
                onCheckedChange={(checked) => setShowInactive(checked === true)}
              />
              <span className="text-sm">Show inactive</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Items ({filteredMeals.length})</CardTitle>
          <CardDescription>
            {filteredMeals.filter(m => m.isActive).length} active, {filteredMeals.filter(m => !m.isActive).length} inactive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedMeals.size === filteredMeals.length && filteredMeals.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeals.map((meal) => (
                <TableRow key={meal._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedMeals.has(meal._id)}
                      onCheckedChange={(checked) => handleSelectMeal(meal._id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    {getMealImageUrl(meal) ? (
                      <div className="relative border rounded-md w-16 h-16">
                        <Image
                          src={getMealImageUrl(meal) || ''}
                          alt={meal.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center items-center bg-muted border rounded-md w-16 h-16">
                        <span className="text-muted-foreground text-xs">No image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{meal.name}</div>
                      <div className="text-muted-foreground text-sm line-clamp-1">
                        {meal.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getCategoryName(meal.category)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    R{meal.price.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={meal.isActive ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => handleToggleStatus(meal._id, meal.isActive)}
                    >
                      {meal.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">⭐</span>
                      <span>{meal.rating.toFixed(1)}</span>
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
                        <DropdownMenuItem onClick={() => handleEditMeal(meal)}>
                          <Edit className="mr-2 w-4 h-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(meal._id, meal.isActive)}
                        >
                          {meal.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteMeal(meal._id, meal.name)}
                        >
                          <Trash2 className="mr-2 w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredMeals.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No meals found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}