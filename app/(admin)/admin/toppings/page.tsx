'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';

import {
  useMutation,
  useQuery,
} from 'convex/react';
import {
  Download,
  Edit,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { z } from 'zod';

import { useAdminClaims } from '@/components/admin-layout-client';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
import { uploadImageToImageKit } from '@/lib/imagekit';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface Topping {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string | null;
  isActive: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  allergens?: string[];
  calories?: number;
  sortOrder: number;
  createdAt: number;
  updatedAt?: number;
}

const TOPPING_CATEGORIES = ['protein', 'vegetable', 'sauce', 'cheese', 'spice', 'other'] as const;
const ALLERGENS = ['nuts', 'dairy', 'gluten', 'eggs', 'soy', 'shellfish', 'fish'] as const;

type DietaryFilter = 'all' | 'vegetarian' | 'vegan';
type AllergenFilter = 'all' | 'none' | (typeof ALLERGENS)[number];

const toppingSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  price: z.number().min(0, 'Price must be positive'),
  category: z.string().trim().min(1, 'Category is required'),
  description: z.string().trim().optional(),
  isVegetarian: z.boolean(),
  isVegan: z.boolean(),
  allergens: z.array(z.string()).optional(),
  calories: z.number().min(0).optional(),
  sortOrder: z.number().min(0),
});

type ToppingFormState = {
  name: string;
  description: string;
  price: string;
  category: string;
  isVegetarian: boolean;
  isVegan: boolean;
  allergens: string[];
  calories: string;
  sortOrder: string;
  isActive: boolean;
  imageFile: File | null;
  imageUrl: string | null;
};

const EMPTY_FORM: ToppingFormState = {
  name: '',
  description: '',
  price: '0',
  category: '',
  isVegetarian: false,
  isVegan: false,
  allergens: [],
  calories: '',
  sortOrder: '0',
  isActive: true,
  imageFile: null,
  imageUrl: null,
};

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const SORT_OPTIONS = [
  { label: 'Display order', value: 'sortOrder' as const },
  { label: 'Price (low to high)', value: 'priceAsc' as const },
  { label: 'Price (high to low)', value: 'priceDesc' as const },
  { label: 'Recently updated', value: 'recent' as const },
];

export default function ToppingsManagementPage() {
  const { toast } = useToast();
  const claims = useAdminClaims();
  const uniqueId = useId();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | (typeof TOPPING_CATEGORIES)[number]>('all');
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>('all');
  const [allergenFilter, setAllergenFilter] = useState<AllergenFilter>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortOption, setSortOption] = useState<'sortOrder' | 'priceAsc' | 'priceDesc' | 'recent'>('sortOrder');
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [editingTopping, setEditingTopping] = useState<Topping | null>(null);
  const [formState, setFormState] = useState<ToppingFormState>(EMPTY_FORM);

  const toppingsQuery = useQuery(api.queries.getToppings, { includeInactive: true });
  const toppings = useMemo(() => toppingsQuery ?? [], [toppingsQuery]);
  const isLoading = toppingsQuery === undefined;

  const createTopping = useMutation(api.mutations.createTopping);
  const updateTopping = useMutation(api.mutations.updateTopping);
  const deleteTopping = useMutation(api.mutations.deleteTopping);

  const mapClaims = useCallback(() => {
    if (!claims) return undefined;
    return {
      sub: claims.sub ?? '',
      email: claims.email ?? undefined,
      name: claims.name ?? undefined,
      roles: claims.roles ?? [],
      picture: claims.picture ?? undefined,
    };
  }, [claims]);

  const resetForm = useCallback(() => {
    setFormState(EMPTY_FORM);
  }, []);

  const stats = useMemo(() => {
    const total = toppings.length;
    const active = toppings.filter((topping) => topping.isActive).length;
    const vegetarian = toppings.filter((topping) => topping.isVegetarian).length;
    const vegan = toppings.filter((topping) => topping.isVegan).length;

    return { total, active, vegetarian, vegan };
  }, [toppings]);

  const filteredToppings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return toppings.filter((topping) => {
      const matchesSearch =
        term.length === 0 ||
        topping.name.toLowerCase().includes(term) ||
        (topping.description?.toLowerCase().includes(term) ?? false) ||
        topping.category.toLowerCase().includes(term);

      const matchesCategory =
        categoryFilter === 'all' || topping.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && topping.isActive) ||
        (statusFilter === 'inactive' && !topping.isActive);

      const matchesDietary =
        dietaryFilter === 'all' ||
        (dietaryFilter === 'vegetarian' && topping.isVegetarian) ||
        (dietaryFilter === 'vegan' && topping.isVegan);

      const matchesAllergen = (() => {
        if (allergenFilter === 'all') return true;
        if (allergenFilter === 'none') {
          return !topping.allergens || topping.allergens.length === 0;
        }
        return topping.allergens?.includes(allergenFilter) ?? false;
      })();

      return matchesSearch && matchesCategory && matchesStatus && matchesDietary && matchesAllergen;
    });
  }, [toppings, searchTerm, categoryFilter, statusFilter, dietaryFilter, allergenFilter]);

  const sortedToppings = useMemo(() => {
    const list = [...filteredToppings];

    switch (sortOption) {
      case 'priceAsc':
        return list.sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return list.sort((a, b) => b.price - a.price);
      case 'recent':
        return list.sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt));
      case 'sortOrder':
      default:
        return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }
  }, [filteredToppings, sortOption]);

  const totalPages = Math.max(1, Math.ceil(sortedToppings.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, dietaryFilter, allergenFilter, sortOption, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedToppings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedToppings.slice(start, start + pageSize);
  }, [sortedToppings, currentPage, pageSize]);

  const toggleSelection = useCallback((toppingId: string) => {
    setSelectedIds((prev) =>
      prev.includes(toppingId)
        ? prev.filter((id) => id !== toppingId)
        : [...prev, toppingId]
    );
  }, []);

  const toggleSelectAllOnPage = useCallback((checked: boolean) => {
    setSelectedIds((prev) => {
      if (!checked) {
        return prev.filter((id) => !paginatedToppings.some((topping) => topping._id === id));
      }

      const idsToAdd = paginatedToppings
        .map((topping) => topping._id)
        .filter((id) => !prev.includes(id));

      return [...prev, ...idsToAdd];
    });
  }, [paginatedToppings]);

  const selectedOnPage = paginatedToppings.length > 0 && paginatedToppings.every((topping) => selectedIds.includes(topping._id));

  const handleImageChange = useCallback((file: File | null, previewUrl: string | null) => {
    setFormState((prev) => ({
      ...prev,
      imageFile: file,
      imageUrl: previewUrl,
    }));
  }, []);

  const toggleAllergen = useCallback((allergen: string) => {
    setFormState((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter((item) => item !== allergen)
        : [...prev.allergens, allergen],
    }));
  }, []);

  const handleOpenCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (topping: Topping) => {
    setEditingTopping(topping);
    setFormState({
      name: topping.name,
      description: topping.description ?? '',
      price: topping.price.toFixed(2),
      category: topping.category,
      isVegetarian: topping.isVegetarian ?? false,
      isVegan: topping.isVegan ?? false,
      allergens: topping.allergens ?? [],
      calories: topping.calories != null ? String(topping.calories) : '',
      sortOrder: String(topping.sortOrder ?? 0),
      isActive: topping.isActive,
      imageFile: null,
      imageUrl: topping.image ?? null,
    });
    setIsEditDialogOpen(true);
  };

  const parseNumericField = (value: string, fieldName: string) => {
    if (value.trim() === '') return 0;
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed)) {
      throw new Error(`${fieldName} must be a valid number`);
    }
    return parsed;
  };

  const handleCreateTopping = async () => {
    const claimsPayload = mapClaims();
    if (!claimsPayload) {
      toast({
        title: 'Authentication required',
        description: 'You need admin access to manage toppings.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const priceValue = parseNumericField(formState.price, 'Price');
      const caloriesValue = formState.calories.trim() ? parseNumericField(formState.calories, 'Calories') : undefined;
      const sortOrderValue = Number.parseInt(formState.sortOrder, 10) || 0;
      const sanitizedDescription = formState.description.trim();

      const parsed = toppingSchema.safeParse({
        name: formState.name.trim(),
        price: priceValue,
        category: formState.category,
        description: sanitizedDescription ? sanitizedDescription : undefined,
        isVegetarian: formState.isVegetarian,
        isVegan: formState.isVegan,
        allergens: formState.allergens,
        calories: caloriesValue,
        sortOrder: sortOrderValue,
      });

      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? 'Invalid topping details');
      }

      setIsSubmitting(true);

      let imageUrl: string | undefined;
      if (formState.imageFile) {
        imageUrl = await uploadImageToImageKit(formState.imageFile, {
          folder: '/toppings',
          tags: 'admin-upload,topping',
        });
      }

      await createTopping({
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        category: parsed.data.category,
        image: imageUrl,
        isVegetarian: parsed.data.isVegetarian,
        isVegan: parsed.data.isVegan,
        allergens: parsed.data.allergens,
        calories: parsed.data.calories,
        sortOrder: parsed.data.sortOrder,
        claims: claimsPayload,
      });

      toast({
        title: 'Topping created',
        description: `${parsed.data.name} is now available for customization.`,
      });

      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Failed to create topping',
        description: error instanceof Error ? error.message : 'Something went wrong while saving the topping.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTopping = async () => {
    if (!editingTopping) {
      toast({
        title: 'No topping selected',
        description: 'Choose a topping to edit and try again.',
        variant: 'destructive',
      });
      return;
    }

    const claimsPayload = mapClaims();
    if (!claimsPayload) {
      toast({
        title: 'Authentication required',
        description: 'You need admin access to manage toppings.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const priceValue = parseNumericField(formState.price, 'Price');
      const caloriesValue = formState.calories.trim() ? parseNumericField(formState.calories, 'Calories') : undefined;
      const sortOrderValue = Number.parseInt(formState.sortOrder, 10) || 0;
      const sanitizedDescription = formState.description.trim();

      const parsed = toppingSchema.safeParse({
        name: formState.name.trim(),
        price: priceValue,
        category: formState.category,
        description: sanitizedDescription ? sanitizedDescription : undefined,
        isVegetarian: formState.isVegetarian,
        isVegan: formState.isVegan,
        allergens: formState.allergens,
        calories: caloriesValue,
        sortOrder: sortOrderValue,
      });

      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? 'Invalid topping details');
      }

      setIsSubmitting(true);

      let imageUrl: string | undefined = formState.imageUrl ?? undefined;
      if (formState.imageFile) {
        imageUrl = await uploadImageToImageKit(formState.imageFile, {
          folder: '/toppings',
          tags: 'admin-upload,topping',
        });
      }

      await updateTopping({
        toppingId: editingTopping._id as Id<'toppings'>,
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        category: parsed.data.category,
        image: imageUrl,
        isActive: formState.isActive,
        isVegetarian: parsed.data.isVegetarian,
        isVegan: parsed.data.isVegan,
        allergens: parsed.data.allergens,
        calories: parsed.data.calories,
        sortOrder: parsed.data.sortOrder,
        claims: claimsPayload,
      });

      toast({
        title: 'Topping updated',
        description: `${parsed.data.name} has been saved successfully.`,
      });

      setIsEditDialogOpen(false);
      setEditingTopping(null);
      resetForm();
    } catch (error) {
      toast({
        title: 'Failed to update topping',
        description: error instanceof Error ? error.message : 'Something went wrong while saving the topping.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (topping: Topping, nextStatus: boolean) => {
    const claimsPayload = mapClaims();
    if (!claimsPayload) {
      toast({
        title: 'Authentication required',
        description: 'You need admin access to manage toppings.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateTopping({
        toppingId: topping._id as Id<'toppings'>,
        isActive: nextStatus,
        claims: claimsPayload,
      });

      toast({
        title: nextStatus ? 'Topping activated' : 'Topping deactivated',
        description: `${topping.name} is now ${nextStatus ? 'available' : 'hidden'} for customers.`,
      });
    } catch (error) {
      toast({
        title: 'Failed to update status',
        description: error instanceof Error ? error.message : 'Could not update topping status.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (!selectedIds.length) return;

    const claimsPayload = mapClaims();
    if (!claimsPayload) {
      toast({
        title: 'Authentication required',
        description: 'You need admin access to manage toppings.',
        variant: 'destructive',
      });
      return;
    }

    setIsBulkProcessing(true);

    try {
      await Promise.all(
        selectedIds.map((toppingId) =>
          updateTopping({
            toppingId: toppingId as Id<'toppings'>,
            isActive,
            claims: claimsPayload,
          })
        )
      );

      toast({
        title: 'Toppings updated',
        description: `${selectedIds.length} topping${selectedIds.length === 1 ? '' : 's'} ${isActive ? 'activated' : 'deactivated'}.`,
      });

      setSelectedIds([]);
    } catch (error) {
      toast({
        title: 'Bulk update failed',
        description: error instanceof Error ? error.message : 'Could not update toppings.',
        variant: 'destructive',
      });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;

    const claimsPayload = mapClaims();
    if (!claimsPayload) {
      toast({
        title: 'Authentication required',
        description: 'You need admin access to manage toppings.',
        variant: 'destructive',
      });
      return;
    }

    setIsBulkProcessing(true);

    try {
      await Promise.all(
        selectedIds.map((toppingId) =>
          deleteTopping({
            toppingId: toppingId as Id<'toppings'>,
            claims: claimsPayload,
          })
        )
      );

      toast({
        title: 'Toppings deleted',
        description: `${selectedIds.length} topping${selectedIds.length === 1 ? '' : 's'} removed.`,
      });

      setSelectedIds([]);
    } catch (error) {
      toast({
        title: 'Bulk delete failed',
        description: error instanceof Error ? error.message : 'Could not delete toppings.',
        variant: 'destructive',
      });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleDeleteTopping = async (toppingId: string) => {
    const claimsPayload = mapClaims();
    if (!claimsPayload) {
      toast({
        title: 'Authentication required',
        description: 'You need admin access to manage toppings.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteTopping({
        toppingId: toppingId as Id<'toppings'>,
        claims: claimsPayload,
      });

      toast({
        title: 'Topping deleted',
        description: 'The topping has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Failed to delete topping',
        description: error instanceof Error ? error.message : 'Could not delete the topping.',
        variant: 'destructive',
      });
    }
  };

  const exportToCSV = () => {
    if (!filteredToppings.length) {
      toast({
        title: 'Nothing to export',
        description: 'Try adjusting your filters or adding toppings first.',
      });
      return;
    }

    const rows = filteredToppings.map((topping) => ({
      Name: topping.name,
      Description: topping.description ?? '',
      Price: topping.price,
      Category: topping.category,
      Vegetarian: topping.isVegetarian ? 'Yes' : 'No',
      Vegan: topping.isVegan ? 'Yes' : 'No',
      Allergens: topping.allergens?.join('; ') ?? '',
      Calories: topping.calories ?? '',
      Status: topping.isActive ? 'Active' : 'Inactive',
      'Display Order': topping.sortOrder ?? 0,
      'Updated At': topping.updatedAt ? new Date(topping.updatedAt).toLocaleString() : '',
    }));

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const cell = row[header as keyof typeof row] ?? '';
            return typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'toppings.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const searchId = `${uniqueId}-search`;
  const categorySelectId = `${uniqueId}-category-filter`;
  const dietarySelectId = `${uniqueId}-dietary-filter`;
  const statusSelectId = `${uniqueId}-status-filter`;
  const allergenSelectId = `${uniqueId}-allergen-filter`;
  const sortSelectId = `${uniqueId}-sort-select`;
  const pageSizeId = `${uniqueId}-page-size`;

  return (
    <div className="space-y-6 mx-auto px-4 py-8 w-full max-w-6xl">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-3xl">Toppings Management</h1>
          <p className="text-muted-foreground text-sm">
            Configure add-ons and flavours that enhance each meal.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 w-4 h-4" /> Export
          </Button>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 w-4 h-4" /> Add topping
          </Button>
        </div>
      </div>

      <div className="gap-3 grid sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total toppings</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-emerald-600 text-3xl">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vegetarian</CardDescription>
            <CardTitle className="text-lime-600 text-3xl">{stats.vegetarian}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vegan</CardDescription>
            <CardTitle className="text-teal-600 text-3xl">{stats.vegan}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-semibold text-base">
            <Filter className="w-4 h-4" /> Filters
          </CardTitle>
          <CardDescription>Refine the topping list by dietary profile, category, or allergen.</CardDescription>
        </CardHeader>
        <CardContent className="gap-4 grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <div className="md:col-span-2">
            <Label htmlFor={searchId} className="block mb-1 text-muted-foreground text-xs uppercase tracking-wide">
              Search
            </Label>
            <div className="relative">
              <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
              <Input
                id={searchId}
                placeholder="Search by name, description, or category"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <Label htmlFor={categorySelectId} className="block mb-1 text-muted-foreground text-xs uppercase tracking-wide">
              Category
            </Label>
            <Select value={categoryFilter} onValueChange={(value: typeof categoryFilter) => setCategoryFilter(value)}>
              <SelectTrigger id={categorySelectId}>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {TOPPING_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor={statusSelectId} className="block mb-1 text-muted-foreground text-xs uppercase tracking-wide">
              Status
            </Label>
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
              <SelectTrigger id={statusSelectId}>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor={dietarySelectId} className="block mb-1 text-muted-foreground text-xs uppercase tracking-wide">
              Dietary
            </Label>
            <Select value={dietaryFilter} onValueChange={(value: DietaryFilter) => setDietaryFilter(value)}>
              <SelectTrigger id={dietarySelectId}>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor={allergenSelectId} className="block mb-1 text-muted-foreground text-xs uppercase tracking-wide">
              Allergen
            </Label>
            <Select value={allergenFilter} onValueChange={(value: AllergenFilter) => setAllergenFilter(value)}>
              <SelectTrigger id={allergenSelectId}>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="none">No allergens</SelectItem>
                {ALLERGENS.map((allergen) => (
                  <SelectItem key={allergen} value={allergen} className="capitalize">
                    {allergen}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="gap-4 md:gap-3 grid grid-cols-2 md:grid-cols-1">
            <div>
              <Label htmlFor={sortSelectId} className="block mb-1 text-muted-foreground text-xs uppercase tracking-wide">
                Sort by
              </Label>
              <Select value={sortOption} onValueChange={(value: 'sortOrder' | 'priceAsc' | 'priceDesc' | 'recent') => setSortOption(value)}>
                <SelectTrigger id={sortSelectId}>
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={pageSizeId} className="block mb-1 text-muted-foreground text-xs uppercase tracking-wide">
                Page size
              </Label>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger id={pageSizeId}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedIds.length > 0 && (
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2 bg-primary/5 p-4 border border-primary/40 border-dashed rounded-md">
          <p className="text-sm">
            <span className="font-semibold">{selectedIds.length}</span> topping{selectedIds.length === 1 ? '' : 's'} selected
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => handleBulkStatusUpdate(true)} disabled={isBulkProcessing}>
              Mark active
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleBulkStatusUpdate(false)} disabled={isBulkProcessing}>
              Mark inactive
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={isBulkProcessing}>
                  <Trash2 className="mr-2 w-4 h-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete selected toppings?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the selected toppings and they will no longer be offered to customers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete} disabled={isBulkProcessing}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex lg:flex-row flex-col lg:justify-between lg:items-end gap-2">
            <div>
              <CardTitle>Toppings</CardTitle>
              <CardDescription>
                Showing {paginatedToppings.length} of {sortedToppings.length} results
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    aria-label="Select all on this page"
                    checked={selectedOnPage}
                    onCheckedChange={(checked) => toggleSelectAllOnPage(Boolean(checked))}
                  />
                </TableHead>
                <TableHead>Topping</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Dietary</TableHead>
                <TableHead>Allergens</TableHead>
                <TableHead>Calories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Display order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-muted-foreground text-sm text-center">
                    Loading toppings...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && paginatedToppings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-muted-foreground text-sm text-center">
                    No toppings match your filters yet.
                  </TableCell>
                </TableRow>
              )}

              {paginatedToppings.map((topping) => (
                <TableRow key={topping._id} data-state={selectedIds.includes(topping._id) ? 'selected' : undefined}>
                  <TableCell>
                    <Checkbox
                      aria-label={`Select ${topping.name}`}
                      checked={selectedIds.includes(topping._id)}
                      onCheckedChange={() => toggleSelection(topping._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative bg-muted border rounded-md w-12 h-12 overflow-hidden">
                        {topping.image ? (
                          <Image
                            src={topping.image}
                            alt={topping.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        ) : (
                          <div className="flex justify-center items-center bg-muted w-full h-full font-medium text-muted-foreground text-xs uppercase">
                            {topping.name.slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium leading-none">{topping.name}</p>
                        {!topping.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {topping.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">R{topping.price.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {topping.isVegetarian && <Badge variant="secondary">Vegetarian</Badge>}
                      {topping.isVegan && <Badge variant="secondary">Vegan</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {topping.allergens && topping.allergens.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {topping.allergens.slice(0, 3).map((allergen) => (
                          <Badge key={`${topping._id}-${allergen}`} variant="destructive" className="text-xs capitalize">
                            {allergen}
                          </Badge>
                        ))}
                        {topping.allergens.length > 3 && (
                          <Badge variant="destructive" className="text-xs">
                            +{topping.allergens.length - 3}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {topping.calories != null ? `${topping.calories} kcal` : <span className="text-muted-foreground text-sm">—</span>}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={topping.isActive}
                      onCheckedChange={(checked) => handleToggleStatus(topping, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{topping.sortOrder ?? 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleOpenEditDialog(topping)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {topping.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This topping will be removed from all meals immediately.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteTopping(topping._id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(topping)}>
                            <Edit className="mr-2 w-4 h-4" /> Edit details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteTopping(topping._id)}>
                            <Trash2 className="mr-2 w-4 h-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="pb-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentPage((page) => Math.max(1, page - 1));
                  }}
                  className={cn({ 'pointer-events-none opacity-50': currentPage === 1 })}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  Page {currentPage} of {totalPages}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentPage((page) => Math.min(totalPages, page + 1));
                  }}
                  className={cn({ 'pointer-events-none opacity-50': currentPage === totalPages })}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create topping</DialogTitle>
            <DialogDescription>
              Provide pricing, dietary labels, and optional allergen flags.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ImageUploadField
              id={`${uniqueId}-create-image`}
              label="Photo"
              description="Square images work best."
              value={formState.imageUrl}
              onFileChange={handleImageChange}
            />
            <div className="gap-4 grid md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${uniqueId}-create-name`}>Name *</Label>
                <Input
                  id={`${uniqueId}-create-name`}
                  placeholder="e.g. Extra Cheese"
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${uniqueId}-create-price`}>Price *</Label>
                <Input
                  id={`${uniqueId}-create-price`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.price}
                  onChange={(event) => setFormState((prev) => ({ ...prev, price: event.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${uniqueId}-create-description`}>Description</Label>
              <Textarea
                id={`${uniqueId}-create-description`}
                placeholder="Tell customers why they’ll love this add-on."
                value={formState.description}
                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
            <div className="gap-4 grid md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${uniqueId}-create-category`}>Category *</Label>
                <Select value={formState.category} onValueChange={(value) => setFormState((prev) => ({ ...prev, category: value }))}>
                  <SelectTrigger id={`${uniqueId}-create-category`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPPING_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${uniqueId}-create-calories`}>Calories</Label>
                <Input
                  id={`${uniqueId}-create-calories`}
                  type="number"
                  min="0"
                  value={formState.calories}
                  onChange={(event) => setFormState((prev) => ({ ...prev, calories: event.target.value }))}
                />
              </div>
            </div>
            <div className="gap-4 grid md:grid-cols-2">
              <div className="p-3 border rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">Vegetarian</p>
                    <p className="text-muted-foreground text-xs">Contains no meat products.</p>
                  </div>
                  <Switch
                    checked={formState.isVegetarian}
                    onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, isVegetarian: checked }))}
                  />
                </div>
              </div>
              <div className="p-3 border rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">Vegan</p>
                    <p className="text-muted-foreground text-xs">Free from animal-derived ingredients.</p>
                  </div>
                  <Switch
                    checked={formState.isVegan}
                    onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, isVegan: checked }))}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Allergens</Label>
              <div className="gap-2 grid sm:grid-cols-2">
                {ALLERGENS.map((allergen) => (
                  <label key={allergen} className="inline-flex items-center gap-2 p-2 border rounded-md capitalize">
                    <Checkbox
                      checked={formState.allergens.includes(allergen)}
                      onCheckedChange={() => toggleAllergen(allergen)}
                    />
                    {allergen}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${uniqueId}-create-sort-order`}>Display order</Label>
              <Input
                id={`${uniqueId}-create-sort-order`}
                type="number"
                min="0"
                value={formState.sortOrder}
                onChange={(event) => setFormState((prev) => ({ ...prev, sortOrder: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTopping} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Create topping'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit topping</DialogTitle>
            <DialogDescription>
              Adjust price, dietary flags, or imagery for this topping.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ImageUploadField
              id={`${uniqueId}-edit-image`}
              label="Photo"
              description="Replace or remove the existing image."
              value={formState.imageUrl}
              onFileChange={handleImageChange}
            />
            <div className="gap-4 grid md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${uniqueId}-edit-name`}>Name *</Label>
                <Input
                  id={`${uniqueId}-edit-name`}
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${uniqueId}-edit-price`}>Price *</Label>
                <Input
                  id={`${uniqueId}-edit-price`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.price}
                  onChange={(event) => setFormState((prev) => ({ ...prev, price: event.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${uniqueId}-edit-description`}>Description</Label>
              <Textarea
                id={`${uniqueId}-edit-description`}
                value={formState.description}
                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
            <div className="gap-4 grid md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${uniqueId}-edit-category`}>Category *</Label>
                <Select value={formState.category} onValueChange={(value) => setFormState((prev) => ({ ...prev, category: value }))}>
                  <SelectTrigger id={`${uniqueId}-edit-category`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPPING_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${uniqueId}-edit-calories`}>Calories</Label>
                <Input
                  id={`${uniqueId}-edit-calories`}
                  type="number"
                  min="0"
                  value={formState.calories}
                  onChange={(event) => setFormState((prev) => ({ ...prev, calories: event.target.value }))}
                />
              </div>
            </div>
            <div className="gap-4 grid md:grid-cols-2">
              <div className="p-3 border rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">Vegetarian</p>
                    <p className="text-muted-foreground text-xs">Contains no meat products.</p>
                  </div>
                  <Switch
                    checked={formState.isVegetarian}
                    onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, isVegetarian: checked }))}
                  />
                </div>
              </div>
              <div className="p-3 border rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">Vegan</p>
                    <p className="text-muted-foreground text-xs">Free from animal-derived ingredients.</p>
                  </div>
                  <Switch
                    checked={formState.isVegan}
                    onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, isVegan: checked }))}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Allergens</Label>
              <div className="gap-2 grid sm:grid-cols-2">
                {ALLERGENS.map((allergen) => (
                  <label key={allergen} className="inline-flex items-center gap-2 p-2 border rounded-md capitalize">
                    <Checkbox
                      checked={formState.allergens.includes(allergen)}
                      onCheckedChange={() => toggleAllergen(allergen)}
                    />
                    {allergen}
                  </label>
                ))}
              </div>
            </div>
            <div className="gap-4 grid sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${uniqueId}-edit-sort-order`}>Display order</Label>
                <Input
                  id={`${uniqueId}-edit-sort-order`}
                  type="number"
                  min="0"
                  value={formState.sortOrder}
                  onChange={(event) => setFormState((prev) => ({ ...prev, sortOrder: event.target.value }))}
                />
              </div>
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium text-sm">Active status</p>
                  <p className="text-muted-foreground text-xs">Toggle to show or hide this topping.</p>
                </div>
                <Switch
                  checked={formState.isActive}
                  onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTopping} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}