"use client";

import { useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { Download, Edit, Plus, Search, Trash2 } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAdminClaims } from "@/components/admin-layout-client";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";

interface Side {
	_id: string;
	name: string;
	description?: string;
	price: number;
	category: string;
	image?: string;
	isActive: boolean;
	isVegetarian?: boolean;
	isVegan?: boolean;
	allergens?: string[];
	calories?: number;
	sortOrder: number;
	createdAt: number;
	updatedAt: number;
}

export default function SidesPage() {
	const claims = useAdminClaims();
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingSide, setEditingSide] = useState<Side | null>(null);

	const nameId = useId();
	const descriptionId = useId();
	const priceId = useId();
	const categoryId = useId();
	const sortOrderId = useId();
	const caloriesId = useId();
	const allergensId = useId();
	const isVegetarianId = useId();
	const isVeganId = useId();
	const searchId = useId();
	const editNameId = useId();
	const editDescriptionId = useId();
	const editPriceId = useId();
	const editCategoryId = useId();
	const editSortOrderId = useId();
	const editCaloriesId = useId();
	const editAllergensId = useId();
	const editIsActiveId = useId();
	const editIsVegetarianId = useId();
	const editIsVeganId = useId();

	// Fetch sides
	const sidesQuery = useQuery(api.queries.getSides, { includeInactive: true });
	const sides = useMemo(() => sidesQuery || [], [sidesQuery]);
	const categories = useQuery(api.queries.getCategories, { includeInactive: true }) || [];

	// Mutations
	const createSide = useMutation(api.mutations.createSide);
	const updateSide = useMutation(api.mutations.updateSide);
	const deleteSide = useMutation(api.mutations.deleteSide);

	// Filter sides
	const filteredSides = useMemo(() => {
		return sides.filter((side) => {
			const matchesSearch =
				side.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				side.description?.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesCategory =
				categoryFilter === "all" || side.category === categoryFilter;
			const matchesStatus =
				statusFilter === "all" ||
				(statusFilter === "active" && side.isActive) ||
				(statusFilter === "inactive" && !side.isActive);

			return matchesSearch && matchesCategory && matchesStatus;
		});
	}, [sides, searchTerm, categoryFilter, statusFilter]);

	// Stats
	const stats = useMemo(() => {
		const total = sides.length;
		const active = sides.filter((s) => s.isActive).length;
		const vegetarian = sides.filter((s) => s.isVegetarian).length;
		const vegan = sides.filter((s) => s.isVegan).length;

		return { total, active, vegetarian, vegan };
	}, [sides]);

	const handleCreateSide = async (formData: FormData) => {
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
				isVegetarian: formData.get("isVegetarian") === "on",
				isVegan: formData.get("isVegan") === "on",
				allergens:
					(formData.get("allergens") as string)
						?.split(",")
						.map((a) => a.trim())
						.filter(Boolean) || [],
				calories: formData.get("calories")
					? parseInt(formData.get("calories") as string)
					: undefined,
				sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
				claims: {
					sub: claims.sub || "",
					email: claims.email || undefined,
					name: claims.name || undefined,
					roles: claims.roles || [],
					picture: claims.picture || undefined,
				},
			};

			await createSide(data);
			toast.success("Side created successfully");
			setIsCreateDialogOpen(false);
		} catch (error) {
			toast.error("Failed to create side: " + (error as Error).message);
		}
	};

	const handleUpdateSide = async (formData: FormData) => {
		if (!claims || !editingSide) return;

		try {
			const data = {
				sideId: editingSide._id as Id<'sides'>,
				name: formData.get("name") as string,
				description: formData.get("description") as string,
				price: parseFloat(formData.get("price") as string),
				category: formData.get("category") as string,
				image: undefined, // TODO: Implement image upload
				isActive: formData.get("isActive") === "on",
				isVegetarian: formData.get("isVegetarian") === "on",
				isVegan: formData.get("isVegan") === "on",
				allergens:
					(formData.get("allergens") as string)
						?.split(",")
						.map((a) => a.trim())
						.filter(Boolean) || [],
				calories: formData.get("calories")
					? parseInt(formData.get("calories") as string)
					: undefined,
				sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
				claims: {
					sub: claims.sub || "",
					email: claims.email || undefined,
					name: claims.name || undefined,
					roles: claims.roles || [],
					picture: claims.picture || undefined,
				},
			};

			await updateSide(data);
			toast.success("Side updated successfully");
			setEditingSide(null);
		} catch (error) {
			toast.error("Failed to update side: " + (error as Error).message);
		}
	};

	const handleDeleteSide = async (sideId: string) => {
		if (!claims) return;

		try {
			await deleteSide({
				sideId: sideId as Id<'sides'>,
				claims: {
					sub: claims.sub || "",
					email: claims.email || undefined,
					name: claims.name || undefined,
					roles: claims.roles || [],
					picture: claims.picture || undefined,
				},
			});
			toast.success("Side deleted successfully");
		} catch (error) {
			toast.error("Failed to delete side: " + (error as Error).message);
		}
	};

	const handleExport = () => {
		const csvContent = [
			[
				"Name",
				"Description",
				"Price",
				"Category",
				"Active",
				"Vegetarian",
				"Vegan",
				"Allergens",
				"Calories",
			],
			...filteredSides.map((side) => [
				side.name,
				side.description || "",
				side.price.toString(),
				side.category,
				side.isActive ? "Yes" : "No",
				side.isVegetarian ? "Yes" : "No",
				side.isVegan ? "Yes" : "No",
				(side.allergens || []).join("; "),
				side.calories?.toString() || "",
			]),
		]
			.map((row) => row.map((cell) => `"${cell}"`).join(","))
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "sides.csv";
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="font-bold text-3xl">Sides Management</h1>
					<p className="text-muted-foreground">
						Manage side dishes and add-ons for your menu
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={handleExport}>
						<Download className="mr-2 w-4 h-4" />
						Export
					</Button>
					<Dialog
						open={isCreateDialogOpen}
						onOpenChange={setIsCreateDialogOpen}
					>
						<DialogTrigger asChild>
							<Button>
								<Plus className="mr-2 w-4 h-4" />
								Add Side
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Create New Side</DialogTitle>
								<DialogDescription>
									Add a new side dish to your menu
								</DialogDescription>
							</DialogHeader>
							<form action={handleCreateSide} className="space-y-4">
								<div className="gap-4 grid grid-cols-2">
									<div>
										<Label htmlFor={nameId}>Name *</Label>
										<Input id={nameId} name="name" required />
									</div>
									<div>
										<Label htmlFor={priceId}>Price *</Label>
										<Input
											id={priceId}
											name="price"
											type="number"
											step="0.01"
											required
										/>
									</div>
								</div>
								<div>
									<Label htmlFor={descriptionId}>Description</Label>
									<Textarea id={descriptionId} name="description" />
								</div>
								<div className="gap-4 grid grid-cols-2">
									<div>
										<Label htmlFor={categoryId}>Category *</Label>
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
										<Label htmlFor={sortOrderId}>Sort Order</Label>
										<Input
											id={sortOrderId}
											name="sortOrder"
											type="number"
											defaultValue="0"
										/>
									</div>
								</div>
								<div className="gap-4 grid grid-cols-2">
									<div>
										<Label htmlFor={caloriesId}>Calories</Label>
										<Input id={caloriesId} name="calories" type="number" />
									</div>
									<div>
										<Label htmlFor={allergensId}>
											Allergens (comma-separated)
										</Label>
										<Input
											id={allergensId}
											name="allergens"
											placeholder="nuts, dairy, gluten"
										/>
									</div>
								</div>
								<div className="flex gap-4">
									<div className="flex items-center space-x-2">
										<Switch id={isVegetarianId} name="isVegetarian" />
										<Label htmlFor={isVegetarianId}>Vegetarian</Label>
									</div>
									<div className="flex items-center space-x-2">
										<Switch id={isVeganId} name="isVegan" />
										<Label htmlFor={isVeganId}>Vegan</Label>
									</div>
								</div>
								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsCreateDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button type="submit">Create Side</Button>
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
						<CardTitle className="font-medium text-sm">Total Sides</CardTitle>
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
						<CardTitle className="font-medium text-sm">Vegetarian</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{stats.vegetarian}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Vegan</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{stats.vegan}</div>
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
							<Label htmlFor="search">Search</Label>
							<div className="relative">
								<Search className="top-2.5 left-2 absolute w-4 h-4 text-muted-foreground" />
								<Input
									id={searchId}
									placeholder="Search sides..."
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

			{/* Sides Table */}
			<Card>
				<CardHeader>
					<CardTitle>Sides ({filteredSides.length})</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Category</TableHead>
								<TableHead>Price</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Dietary</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredSides.map((side) => (
								<TableRow key={side._id}>
									<TableCell>
										<div>
											<div className="font-medium">{side.name}</div>
											{side.description && (
												<div className="text-muted-foreground text-sm">
													{side.description}
												</div>
											)}
										</div>
									</TableCell>
									<TableCell>{side.category}</TableCell>
									<TableCell>${side.price.toFixed(2)}</TableCell>
									<TableCell>
										<Badge variant={side.isActive ? "default" : "secondary"}>
											{side.isActive ? "Active" : "Inactive"}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex gap-1">
											{side.isVegetarian && (
												<Badge variant="outline">Veg</Badge>
											)}
											{side.isVegan && <Badge variant="outline">Vegan</Badge>}
										</div>
									</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => setEditingSide(side)}
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
														<AlertDialogTitle>Delete Side</AlertDialogTitle>
														<AlertDialogDescription>
														Are you sure you want to delete &quot;{side.name}&quot;?
															This action cannot be undone.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => handleDeleteSide(side._id)}
														>
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
					{filteredSides.length === 0 && (
						<div className="py-8 text-muted-foreground text-center">
							No sides found matching your criteria.
						</div>
					)}
				</CardContent>
			</Card>

			{/* Edit Dialog */}
			{editingSide && (
				<Dialog open={!!editingSide} onOpenChange={() => setEditingSide(null)}>
					<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Edit Side</DialogTitle>
							<DialogDescription>
								Update side dish information
							</DialogDescription>
						</DialogHeader>
						<form action={handleUpdateSide} className="space-y-4">
							<div className="gap-4 grid grid-cols-2">
								<div>
									<Label htmlFor={editNameId}>Name *</Label>
									<Input
										id={editNameId}
										name="name"
										defaultValue={editingSide.name}
										required
									/>
								</div>
								<div>
									<Label htmlFor={editPriceId}>Price *</Label>
									<Input
										id={editPriceId}
										name="price"
										type="number"
										step="0.01"
										defaultValue={editingSide.price}
										required
									/>
								</div>
							</div>
							<div>
								<Label htmlFor={editDescriptionId}>Description</Label>
								<Textarea
									id={editDescriptionId}
									name="description"
									defaultValue={editingSide.description || ""}
								/>
							</div>
							<div className="gap-4 grid grid-cols-2">
								<div>
									<Label htmlFor={editCategoryId}>Category *</Label>
									<Select
										name="category"
										defaultValue={editingSide.category}
										required
									>
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
									<Label htmlFor={editSortOrderId}>Sort Order</Label>
									<Input
										id={editSortOrderId}
										name="sortOrder"
										type="number"
										defaultValue={editingSide.sortOrder}
									/>
								</div>
							</div>
							<div className="gap-4 grid grid-cols-2">
								<div>
									<Label htmlFor={editCaloriesId}>Calories</Label>
									<Input
										id={editCaloriesId}
										name="calories"
										type="number"
										defaultValue={editingSide.calories || ""}
									/>
								</div>
								<div>
									<Label htmlFor={editAllergensId}>
										Allergens (comma-separated)
									</Label>
									<Input
										id={editAllergensId}
										name="allergens"
										defaultValue={(editingSide.allergens || []).join(", ")}
										placeholder="nuts, dairy, gluten"
									/>
								</div>
							</div>
							<div className="flex gap-4">
								<div className="flex items-center space-x-2">
									<Switch
										id={editIsActiveId}
										name="isActive"
										defaultChecked={editingSide.isActive}
									/>
									<Label htmlFor={editIsActiveId}>Active</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Switch
										id={editIsVegetarianId}
										name="isVegetarian"
										defaultChecked={!!editingSide.isVegetarian}
									/>
									<Label htmlFor={editIsVegetarianId}>Vegetarian</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Switch
										id={editIsVeganId}
										name="isVegan"
										defaultChecked={!!editingSide.isVegan}
									/>
									<Label htmlFor={editIsVeganId}>Vegan</Label>
								</div>
							</div>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setEditingSide(null)}
								>
									Cancel
								</Button>
								<Button type="submit">Update Side</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
