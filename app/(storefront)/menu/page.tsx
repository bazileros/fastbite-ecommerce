"use client";

import {
  useMemo,
  useState,
} from 'react';

import { useQuery } from 'convex/react';
import {
  Clock,
  Filter,
  Flame,
  Grid3X3,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
} from 'lucide-react';

import {
  MealCustomizationDialog,
} from '@/components/meal-customization-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { api } from '@/convex/_generated/api';
import type { Meal } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Image } from '@imagekit/next';

type SortOption =
	| "name"
	| "price-low"
	| "price-high"
	| "rating"
	| "popular"
	| "newest";
type ViewMode = "grid" | "list";

export default function MenuPage() {
	// Get meals and categories from database
	const mealsQuery = useQuery(api.queries.getMeals, {});
	const meals = useMemo(() => mealsQuery || [], [mealsQuery]);
	
	const categoriesQuery = useQuery(api.queries.getCategories, {});
	const categoriesData = useMemo(() => categoriesQuery || [], [categoriesQuery]);

	// Create a map of category ID to category name
	const categoryMap = useMemo(() => {
		const map: Record<string, string> = {};
		categoriesData.forEach((cat) => {
			map[cat._id] = cat.name;
		});
		return map;
	}, [categoriesData]);

	// ImageKit URLs are stored directly in meal.image
	const mealImageMap: Record<string, string | null> = {};
	meals.forEach((meal) => {
		if (meal.image) {
			mealImageMap[meal._id] = meal.image;
		}
	});

	const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [sortBy, setSortBy] = useState<SortOption>("popular");
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
	const [spiceLevel, setSpiceLevel] = useState<string>("all");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [showFilters, setShowFilters] = useState(false);

	// Get unique categories from meals data
	const mealCategories: string[] = useMemo(() => {
		return Array.from(new Set(meals.map((meal: Meal) => meal.category)));
	}, [meals]);

	// Combine meal categories with custom categories
	const categories: string[] = useMemo(() => {
		return ["all", ...mealCategories];
	}, [mealCategories]);

	// Filter and sort meals
	const filteredAndSortedMeals = useMemo(() => {
		const allMeals = meals;
		const filtered = allMeals.filter((meal: Meal) => {
			const matchesSearch =
				meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				meal.description.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory =
				selectedCategory === "all" || meal.category === selectedCategory;
			const matchesPrice =
				meal.price >= priceRange[0] && meal.price <= priceRange[1];
			const matchesSpice =
				spiceLevel === "all" || meal.spiceLevel === spiceLevel;

			return matchesSearch && matchesCategory && matchesPrice && matchesSpice;
		});

		// Sort meals
		filtered.sort((a: Meal, b: Meal) => {
			switch (sortBy) {
				case "name":
					return a.name.localeCompare(b.name);
				case "price-low":
					return a.price - b.price;
				case "price-high":
					return b.price - a.price;
				case "rating":
					return b.rating - a.rating;
				case "popular":
					return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
				case "newest":
					return b._creationTime - a._creationTime; // Use _creationTime for sorting
				default:
					return 0;
			}
		});

		return filtered;
	}, [searchQuery, selectedCategory, sortBy, priceRange, spiceLevel, meals]);

	const handleMealClick = (meal: Meal) => {
		setSelectedMeal(meal);
	};

	return (
		<div className="bg-background min-h-screen">
			{/* Header */}
			<div className="top-0 z-40 sticky bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur border-b">
				<div className="mx-auto px-4 py-4 container">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="font-bold text-3xl">Our Menu</h1>
							<p className="text-muted-foreground">
								Discover your perfect meal
							</p>
						</div>
						<div className="flex items-center space-x-2">
							<Button
								variant={viewMode === "grid" ? "default" : "outline"}
								size="sm"
								onClick={() => setViewMode("grid")}
							>
								<Grid3X3 className="w-4 h-4" />
							</Button>
							<Button
								variant={viewMode === "list" ? "default" : "outline"}
								size="sm"
								onClick={() => setViewMode("list")}
							>
								<List className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div className="mx-auto px-4 py-8 container">
				<div className="flex lg:flex-row flex-col gap-8">
					{/* Filters Sidebar */}
					<div className="flex-shrink-0 lg:w-64">
						<div className="top-24 sticky space-y-6">
							{/* Search */}
							<Card className="p-4">
								<div className="relative">
									<Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 transform" />
									<Input
										placeholder="Search meals..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10"
									/>
								</div>
							</Card>

							{/* Quick Filters */}
							<Card className="p-4">
								<div className="flex justify-between items-center mb-3">
									<h3 className="flex items-center font-semibold">
										<Filter className="mr-2 w-4 h-4" />
										Categories
									</h3>
								</div>

								<div className="space-y-2">
									<Button
										variant={selectedCategory === "all" ? "default" : "outline"}
										size="sm"
										onClick={() => setSelectedCategory("all")}
										className="justify-start w-full"
									>
										All Categories
									</Button>
									{categories.slice(1).map((category: string) => (
										<Button
											key={category}
											variant={
												selectedCategory === category ? "default" : "outline"
											}
											size="sm"
											onClick={() => setSelectedCategory(category)}
											className="justify-start w-full capitalize"
										>
											{categoryMap[category] || category}
										</Button>
									))}
								</div>
							</Card>

							{/* Advanced Filters */}
							<Sheet open={showFilters} onOpenChange={setShowFilters}>
								<SheetTrigger asChild>
									<Button variant="outline" className="w-full">
										<SlidersHorizontal className="mr-2 w-4 h-4" />
										Advanced Filters
									</Button>
								</SheetTrigger>
								<SheetContent>
									<SheetHeader>
										<SheetTitle>Advanced Filters</SheetTitle>
										<SheetDescription>
											Refine your search with detailed filters
										</SheetDescription>
									</SheetHeader>
									<div className="space-y-6 mt-6">
										{/* Sort By */}
										<div className="space-y-2">
											<Label>Sort By</Label>
											<Select
												value={sortBy}
												onValueChange={(value: SortOption) => setSortBy(value)}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="popular">Most Popular</SelectItem>
													<SelectItem value="rating">Highest Rated</SelectItem>
													<SelectItem value="price-low">
														Price: Low to High
													</SelectItem>
													<SelectItem value="price-high">
														Price: High to Low
													</SelectItem>
													<SelectItem value="name">Name A-Z</SelectItem>
													<SelectItem value="newest">Newest First</SelectItem>
												</SelectContent>
											</Select>
										</div>

										{/* Price Range */}
										<div className="space-y-2">
											<Label>Price Range</Label>
											<div className="flex items-center space-x-2">
												<Input
													type="number"
													placeholder="Min"
													value={priceRange[0]}
													onChange={(e) =>
														setPriceRange([
															Number(e.target.value),
															priceRange[1],
														])
													}
												/>
												<span>-</span>
												<Input
													type="number"
													placeholder="Max"
													value={priceRange[1]}
													onChange={(e) =>
														setPriceRange([
															priceRange[0],
															Number(e.target.value),
														])
													}
												/>
											</div>
										</div>

										{/* Spice Level */}
										<div className="space-y-2">
											<Label>Spice Level</Label>
											<Select value={spiceLevel} onValueChange={(value: string) => setSpiceLevel(value)}>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="all">All Levels</SelectItem>
													<SelectItem value="mild">Mild</SelectItem>
													<SelectItem value="medium">Medium</SelectItem>
													<SelectItem value="hot">Hot</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>

					{/* Menu Items */}
					<div className="flex-1">
						<div className="flex justify-between items-center mb-6">
							<p className="text-muted-foreground">
								{filteredAndSortedMeals.length} item
								{filteredAndSortedMeals.length !== 1 ? "s" : ""} found
							</p>
							<div className="flex items-center space-x-2">
								<Label className="text-sm">Sort:</Label>
								<Select
									value={sortBy}
									onValueChange={(value: SortOption) => setSortBy(value)}
								>
									<SelectTrigger className="w-40">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="popular">Popular</SelectItem>
										<SelectItem value="rating">Rating</SelectItem>
										<SelectItem value="price-low">Price: Low</SelectItem>
										<SelectItem value="price-high">Price: High</SelectItem>
										<SelectItem value="name">Name</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Menu Grid/List */}
						<div
							className={
								viewMode === "grid"
									? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
									: "space-y-4"
							}
						>
							{filteredAndSortedMeals.map((meal: Meal) => (
								<Card
									key={meal._id}
									className={`group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover-lift cursor-pointer ${
										viewMode === "list" ? "flex" : ""
									}`}
									onClick={() => handleMealClick(meal)}
								>
									<div
										className={`relative ${viewMode === "list" ? "w-32 flex-shrink-0" : "h-56"} overflow-hidden`}
									>
										<Image
											src={mealImageMap[meal._id] || '/placeholder-image.jpg'}
											alt={`${meal.name} - ${meal.description}`}
											fill
											style={{ objectFit: "cover" }}
											className={`transition-transform duration-300 group-hover:scale-110 ${
												viewMode === "list" ? "rounded-l-lg" : "rounded-t-lg"
											}`}
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

										{meal.popular && (
											<Badge className="top-3 left-3 absolute bg-primary text-primary-foreground">
												<Star className="mr-1 w-3 h-3" />
												Popular
											</Badge>
										)}

										{meal.spiceLevel === "hot" && (
											<Badge className="top-3 right-3 absolute bg-destructive">
												<Flame className="mr-1 w-3 h-3" />
												Spicy
											</Badge>
										)}

										<div
											className={`absolute ${viewMode === "list" ? "bottom-4 left-4 right-4" : "bottom-4 left-4 right-4"}`}
										>
											<div className="flex justify-between items-center mb-2 text-white">
												<div className="flex items-center space-x-2">
													<div className="flex items-center space-x-1">
														<Star className="fill-current w-4 h-4 text-yellow-400" />
														<span className="font-medium text-sm">
															{meal.rating}
														</span>
													</div>
													<div className="flex items-center space-x-1">
														<Clock className="w-4 h-4" />
														<span className="text-sm">{meal.prepTime} min</span>
													</div>
												</div>
												<span className="font-bold text-lg">
													{formatPrice(meal.price)}
												</span>
											</div>
										</div>
									</div>

									<div className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
										<div className="space-y-3">
											<div>
												<h3 className="font-bold group-hover:text-primary text-xl transition-colors">
													{meal.name}
												</h3>
												<p className="mt-1 text-muted-foreground text-sm line-clamp-2">
													{meal.description}
												</p>
											</div>

											<div className="flex justify-between items-center pt-2">
												<div className="text-muted-foreground text-sm">
													{meal.calories} cal
												</div>
												<Button
													size="sm"
													onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
														e.stopPropagation();
														handleMealClick(meal);
													}}
													className="group/btn hover-lift"
												>
													<Plus className="mr-2 w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
													Customize
												</Button>
											</div>
										</div>
									</div>
								</Card>
							))}
						</div>

						{filteredAndSortedMeals.length === 0 && (
							<div className="py-12 text-center">
								<Search className="mx-auto mb-4 w-16 h-16 text-muted-foreground" />
								<h3 className="mb-2 font-semibold text-xl">No meals found</h3>
								<p className="text-muted-foreground">
									Try adjusting your filters or search terms
								</p>
							</div>
						)}
					</div>
				</div>
			</div>

			<MealCustomizationDialog
				meal={selectedMeal}
				open={!!selectedMeal}
				onOpenChange={(open) => !open && setSelectedMeal(null)}
			/>
		</div>
	);
}
