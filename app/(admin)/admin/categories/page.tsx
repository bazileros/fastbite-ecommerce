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

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt?: number;
}

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required'),
  description: z.string().trim().optional(),
  sortOrder: z.number().min(0, 'Display order cannot be negative'),
  isActive: z.boolean(),
});

type CategoryFormState = {
  imageFile: File | null;
  imageUrl: string | null;
  description: string;
} & Omit<z.infer<typeof categorySchema>, 'description'>;

const EMPTY_FORM: CategoryFormState = {
  name: '',
  description: '',
  sortOrder: 0,
  isActive: true,
  imageFile: null,
  imageUrl: null,
};

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const SORT_OPTIONS = [
  { label: 'Display order', value: 'sortOrder' as const },
  { label: 'Name (A-Z)', value: 'name' as const },
  { label: 'Recently updated', value: 'recent' as const },
];

export default function CategoriesManagementPage() {
  const { toast } = useToast();
  const claims = useAdminClaims();
  const uniqueId = useId();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortOption, setSortOption] = useState<'sortOrder' | 'name' | 'recent'>('sortOrder');
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formState, setFormState] = useState<CategoryFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const categoriesQuery = useQuery(api.queries.getCategories, { includeInactive: true });
  const categories = useMemo(() => categoriesQuery ?? [], [categoriesQuery]);
  const isLoading = categoriesQuery === undefined;

  const createCategory = useMutation(api.mutations.createCategory);
  const updateCategory = useMutation(api.mutations.updateCategory);
  const deleteCategory = useMutation(api.mutations.deleteCategory);

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
    const total = categories.length;
    const active = categories.filter((category) => category.isActive).length;
    const withImages = categories.filter((category) => Boolean(category.image)).length;

    return {
      total,
      active,
      inactive: total - active,
      withImages,
    };
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        term.length === 0 ||
        category.name.toLowerCase().includes(term) ||
        (category.description?.toLowerCase().includes(term) ?? false);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && category.isActive) ||
        (statusFilter === 'inactive' && !category.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  const sortedCategories = useMemo(() => {
    const list = [...filteredCategories];

    switch (sortOption) {
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'recent':
        return list.sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt));
      case 'sortOrder':
      default:
        return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }
  }, [filteredCategories, sortOption]);

  const totalPages = Math.max(1, Math.ceil(sortedCategories.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortOption, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCategories.slice(start, start + pageSize);
  }, [sortedCategories, currentPage, pageSize]);

  const toggleSelection = useCallback((categoryId: string) => {
    setSelectedIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const toggleSelectAllOnPage = useCallback((checked: boolean) => {
    setSelectedIds((prev) => {
      if (!checked) {
        return prev.filter((id) => !paginatedCategories.some((category) => category._id === id));
      }

      const idsToAdd = paginatedCategories
        .map((category) => category._id)
        .filter((id) => !prev.includes(id));

      return [...prev, ...idsToAdd];
    });
  }, [paginatedCategories]);

  const selectedOnPage = paginatedCategories.length > 0 && paginatedCategories.every((category) => selectedIds.includes(category._id));

  const handleImageChange = useCallback((file: File | null, previewUrl: string | null) => {
    setFormState((prev) => ({
      ...prev,
      imageFile: file,
      imageUrl: previewUrl,
    }));
  }, []);

  const handleOpenCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormState({
      name: category.name,
      description: category.description ?? '',
      sortOrder: category.sortOrder ?? 0,
      isActive: category.isActive,
      imageFile: null,
      imageUrl: category.image ?? null,
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateCategory = async () => {
    const sanitizedDescription = formState.description.trim();
    const sortOrder = Number.isFinite(formState.sortOrder) ? formState.sortOrder : 0;

    const parsed = categorySchema.safeParse({
      name: formState.name.trim(),
      description: sanitizedDescription.length ? sanitizedDescription : undefined,
      sortOrder,
      isActive: true,
    });

    if (!parsed.success) {
      toast({
        title: 'Please review the form',
        description: parsed.error.issues[0]?.message ?? 'Invalid category details',
        variant: 'destructive',
      });
      return;
    }

    const claimsPayload = mapClaims();
    if (!claimsPayload) {
      toast({
        title: 'Authentication required',
        description: 'You need admin access to manage categories.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;

      if (formState.imageFile) {
        imageUrl = await uploadImageToImageKit(formState.imageFile, {
          folder: '/categories',
          tags: 'admin-upload,category',
        });
      }

      await createCategory({
        name: parsed.data.name,
        description: parsed.data.description,
        sortOrder: parsed.data.sortOrder,
        image: imageUrl ?? undefined,
        claims: claimsPayload,
      });

      toast({
        title: 'Category created',
        description: `${parsed.data.name} is now available to assign meals.`,
      });

      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Failed to create category',
        description: error instanceof Error ? error.message : 'Something went wrong while saving the category.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) {
      toast({
        title: 'No category selected',
        description: 'Select a category to update and try again.',
        variant: 'destructive',
      });
      return;
    }

    const sanitizedDescription = formState.description.trim();
    const sortOrder = Number.isFinite(formState.sortOrder) ? formState.sortOrder : 0;

    const parsed = categorySchema.safeParse({
      name: formState.name.trim(),
      description: sanitizedDescription.length ? sanitizedDescription : undefined,
      sortOrder,
      isActive: formState.isActive,
    });

    if (!parsed.success) {
      toast({
        title: 'Please review the form',
        description: parsed.error.issues[0]?.message ?? 'Invalid category details',
        variant: 'destructive',
      });
      return;
    }

    const claimsPayload = mapClaims();
    if (!claimsPayload) {
      toast({
        title: 'Authentication required',
        description: 'You need admin access to manage categories.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | undefined = formState.imageUrl ?? undefined;

      if (formState.imageFile) {
        imageUrl = await uploadImageToImageKit(formState.imageFile, {
          folder: '/categories',
          tags: 'admin-upload,category',
        });
      }

      await updateCategory({
        categoryId: editingCategory._id as Id<'categories'>,
        name: parsed.data.name,
        description: parsed.data.description,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
        image: imageUrl,
        claims: claimsPayload,
      });

      toast({
        title: 'Category updated',
        description: `${parsed.data.name} has been updated successfully.`,
      });

      setIsEditDialogOpen(false);
      setEditingCategory(null);
      resetForm();
    } catch (error) {
      toast({
        title: 'Failed to update category',
        description: error instanceof Error ? error.message : 'Something went wrong while saving the category.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (category: Category, nextStatus: boolean) => {
    const claimsPayload = mapClaims();
    if (!claimsPayload) {
      toast({
        title: 'Authentication required',
        description: 'You need admin access to manage categories.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateCategory({
        categoryId: category._id as Id<'categories'>,
        isActive: nextStatus,
        claims: claimsPayload,
      });

      toast({
        title: nextStatus ? 'Category activated' : 'Category deactivated',
        description: `${category.name} is now ${nextStatus ? 'visible' : 'hidden'} on the menu.`,
      });
    } catch (error) {
      toast({
        title: 'Failed to update status',
        description: error instanceof Error ? error.message : 'Could not update category status.',
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
        description: 'You need admin access to manage categories.',
        variant: 'destructive',
      });
      return;
    }

    setIsBulkProcessing(true);

    try {
      await Promise.all(
        selectedIds.map((categoryId) =>
          updateCategory({
            categoryId: categoryId as Id<'categories'>,
            isActive,
            claims: claimsPayload,
          })
        )
      );

      toast({
        title: 'Categories updated',
        description: `${selectedIds.length} categor${selectedIds.length === 1 ? 'y' : 'ies'} ${isActive ? 'activated' : 'deactivated'}.`,
      });

      setSelectedIds([]);
    } catch (error) {
      toast({
        title: 'Bulk update failed',
        description: error instanceof Error ? error.message : 'Could not update categories.',
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
        description: 'You need admin access to manage categories.',
        variant: 'destructive',
      });
      return;
    }

    setIsBulkProcessing(true);

    try {
      await Promise.all(
        selectedIds.map((categoryId) =>
          deleteCategory({
            categoryId: categoryId as Id<'categories'>,
            claims: claimsPayload,
          })
        )
      );

      toast({
        title: 'Categories deleted',
        description: `${selectedIds.length} categor${selectedIds.length === 1 ? 'y' : 'ies'} removed from the menu.`,
      });

      setSelectedIds([]);
    } catch (error) {
      toast({
        title: 'Bulk delete failed',
        description: error instanceof Error ? error.message : 'Could not remove categories.',
        variant: 'destructive',
      });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const claimsPayload = mapClaims();
    if (!claimsPayload) {
      toast({
        title: 'Authentication required',
        description: 'You need admin access to manage categories.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteCategory({
        categoryId: categoryId as Id<'categories'>,
        claims: claimsPayload,
      });

      toast({
        title: 'Category deleted',
        description: 'The category has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Failed to delete category',
        description: error instanceof Error ? error.message : 'Could not remove the category.',
        variant: 'destructive',
      });
    }
  };

  const exportToCSV = () => {
    if (!filteredCategories.length) {
      toast({
        title: 'Nothing to export',
        description: 'Apply a different filter or add categories first.',
      });
      return;
    }

    const rows = filteredCategories.map((category) => ({
      Name: category.name,
      Description: category.description ?? '',
      'Display Order': category.sortOrder ?? 0,
      Status: category.isActive ? 'Active' : 'Inactive',
      'Has Image': category.image ? 'Yes' : 'No',
      'Created At': new Date(category.createdAt).toLocaleString(),
      'Updated At': category.updatedAt ? new Date(category.updatedAt).toLocaleString() : '',
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
    link.setAttribute('download', 'categories.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const nameId = `${uniqueId}-name`;
  const descriptionId = `${uniqueId}-description`;
  const sortOrderId = `${uniqueId}-sort-order`;
  const statusFilterId = `${uniqueId}-status-filter`;
  const sortSelectId = `${uniqueId}-sort-select`;
  const pageSizeId = `${uniqueId}-page-size`;

  return (
    <div className="space-y-6 mx-auto px-4 py-8 w-full max-w-6xl">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-3xl">Categories Management</h1>
          <p className="text-muted-foreground text-sm">
            Organize your menu into clear, visually engaging categories.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 w-4 h-4" /> Export
          </Button>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 w-4 h-4" /> Add Category
          </Button>
        </div>
      </div>

      <div className="gap-3 grid sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total categories</CardDescription>
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
            <CardDescription>Inactive</CardDescription>
            <CardTitle className="text-amber-500 text-3xl">{stats.inactive}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>With cover image</CardDescription>
            <CardTitle className="text-blue-600 text-3xl">{stats.withImages}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-semibold text-base">
            <Filter className="w-4 h-4" /> Filters
          </CardTitle>
          <CardDescription>Refine the category list by status or keyword.</CardDescription>
        </CardHeader>
        <CardContent className="gap-4 grid md:grid-cols-2 lg:grid-cols-4">
          <div className="md:col-span-2">
            <Label htmlFor={`${uniqueId}-search`} className="block mb-1 text-muted-foreground text-xs uppercase tracking-wide">
              Search
            </Label>
            <div className="relative">
              <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
              <Input
                id={`${uniqueId}-search`}
                placeholder="Search by name or description"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <Label htmlFor={statusFilterId} className="block mb-1 text-muted-foreground text-xs uppercase tracking-wide">
              Status
            </Label>
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
              <SelectTrigger id={statusFilterId}>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="gap-4 md:gap-3 grid grid-cols-2 md:grid-cols-1">
            <div>
              <Label htmlFor={sortSelectId} className="block mb-1 text-muted-foreground text-xs uppercase tracking-wide">
                Sort by
              </Label>
              <Select value={sortOption} onValueChange={(value: 'sortOrder' | 'name' | 'recent') => setSortOption(value)}>
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
            <span className="font-semibold">{selectedIds.length}</span> categor{selectedIds.length === 1 ? 'y' : 'ies'} selected
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleBulkStatusUpdate(true)}
              disabled={isBulkProcessing}
            >
              Mark active
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleBulkStatusUpdate(false)}
              disabled={isBulkProcessing}
            >
              Mark inactive
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isBulkProcessing}
                >
                  <Trash2 className="mr-2 w-4 h-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete selected categories?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the selected categories. Meals linked to these categories will no longer reference them.
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
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Showing {paginatedCategories.length} of {sortedCategories.length} results
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
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Display order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-muted-foreground text-sm text-center">
                    Loading categories...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && paginatedCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-muted-foreground text-sm text-center">
                    No categories match your filters yet.
                  </TableCell>
                </TableRow>
              )}

              {paginatedCategories.map((category) => (
                <TableRow key={category._id} data-state={selectedIds.includes(category._id) ? 'selected' : undefined}>
                  <TableCell>
                    <Checkbox
                      aria-label={`Select ${category.name}`}
                      checked={selectedIds.includes(category._id)}
                      onCheckedChange={() => toggleSelection(category._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative bg-muted border rounded-md w-12 h-12 overflow-hidden">
                        {category.image ? (
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        ) : (
                          <div className="flex justify-center items-center bg-muted w-full h-full font-medium text-muted-foreground text-xs uppercase">
                            {category.name.slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium leading-none">{category.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={category.isActive ? 'default' : 'secondary'} className="text-xs">
                            {category.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {category.image && (
                            <Badge variant="outline" className="text-muted-foreground text-xs">
                              Image
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-sm text-muted-foreground text-sm">
                    {category.description ? (
                      <span className="line-clamp-2">{category.description}</span>
                    ) : (
                      <span className="text-muted-foreground italic">No description</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{category.sortOrder ?? 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={category.isActive}
                      onCheckedChange={(checked) => handleToggleStatus(category, checked)}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(category.updatedAt ?? category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEditDialog(category)}
                      >
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
                            <AlertDialogTitle>Delete {category.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action removes the category from your menu immediately.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCategory(category._id)}>
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
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(category)}>
                            <Edit className="mr-2 w-4 h-4" /> Edit details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteCategory(category._id)}
                          >
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create category</DialogTitle>
            <DialogDescription>
              Craft a category with a clear description and optional cover image.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ImageUploadField
              id={`${uniqueId}-create-image`}
              label="Cover image"
              description="Recommended minimum size 800x600px."
              value={formState.imageUrl}
              onFileChange={handleImageChange}
            />
            <div className="space-y-2">
              <Label htmlFor={nameId}>Name *</Label>
              <Input
                id={nameId}
                placeholder="e.g. Chef Specials"
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={descriptionId}>Description</Label>
              <Textarea
                id={descriptionId}
                placeholder="Optional copy to help guests understand what lives here."
                value={formState.description}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={sortOrderId}>Display order</Label>
              <Input
                id={sortOrderId}
                type="number"
                value={formState.sortOrder}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    sortOrder: Number(event.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Create category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit category</DialogTitle>
            <DialogDescription>
              Update copy, visibility, or the cover image for this category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ImageUploadField
              id={`${uniqueId}-edit-image`}
              label="Cover image"
              description="Replace or remove the current image."
              value={formState.imageUrl}
              onFileChange={handleImageChange}
            />
            <div className="space-y-2">
              <Label htmlFor={`${uniqueId}-edit-name`}>Name *</Label>
              <Input
                id={`${uniqueId}-edit-name`}
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${uniqueId}-edit-description`}>Description</Label>
              <Textarea
                id={`${uniqueId}-edit-description`}
                value={formState.description}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>
            <div className="gap-4 grid sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${uniqueId}-edit-sort-order`}>Display order</Label>
                <Input
                  id={`${uniqueId}-edit-sort-order`}
                  type="number"
                  value={formState.sortOrder}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      sortOrder: Number(event.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium text-sm">Active status</p>
                  <p className="text-muted-foreground text-xs">
                    Toggle to show or hide this category on the storefront.
                  </p>
                </div>
                <Switch
                  checked={formState.isActive}
                  onCheckedChange={(checked) =>
                    setFormState((prev) => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}