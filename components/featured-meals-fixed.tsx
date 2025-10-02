/* eslint-disable @next/next/no-img-element, jsx-a11y/no-static-element-interactions */

"use client";

import {
  useId,
  useState,
} from 'react';

import { useQuery } from 'convex/react';
import {
  Clock,
  Flame,
  Plus,
  Star,
} from 'lucide-react';

import {
  MealCustomizationDialog,
} from '@/components/meal-customization-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import type { Doc } from '@/convex/_generated/dataModel';
import type { Meal } from '@/lib/types';
import { Image } from '@imagekit/next';

interface FeaturedMealsProps {
	selectedCategory: string | null;
}

export function FeaturedMeals({ selectedCategory }: FeaturedMealsProps) {
	const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
	const menuId = useId();

	// Fetch meals from Convex database
	const meals = useQuery(api.queries.getMeals, {
		category: selectedCategory || undefined,
		limit: 12
	});

	const filteredMeals = meals || [];

	// Handle loading state
	if (meals === undefined) {
		return (
			<section id={menuId} className="mx-auto px-4 container">
				<div className="mb-12 text-center">
					<h2 className="mb-4 font-bold text-3xl md:text-4xl">
						{selectedCategory
							? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`
							: "Featured Meals"}
					</h2>
					<p className="mx-auto max-w-2xl text-muted-foreground text-lg">
						Handcrafted with love, customized to perfection
					</p>
				</div>
				<div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3, 4, 5, 6].map((num) => (
						<Card key={`skeleton-${num}`} className="shadow-lg border-0 overflow-hidden">
							<div className="bg-muted h-56 animate-pulse" />
							<div className="space-y-3 p-6">
								<div className="bg-muted rounded h-6 animate-pulse" />
								<div className="bg-muted rounded h-4 animate-pulse" />
								<div className="bg-muted rounded h-4 animate-pulse" />
							</div>
						</Card>
					))}
				</div>
			</section>
		);
	}

	// Handle empty state
	if (filteredMeals.length === 0) {
		return (
			<section id={menuId} className="mx-auto px-4 container">
				<div className="mb-12 text-center">
					<h2 className="mb-4 font-bold text-3xl md:text-4xl">
						{selectedCategory
							? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`
							: "Featured Meals"}
					</h2>
					<p className="mx-auto max-w-2xl text-muted-foreground text-lg">
						Handcrafted with love, customized to perfection
					</p>
				</div>
				<div className="flex flex-col justify-center items-center py-16 text-center">
					<div className="mb-4 text-muted-foreground">
						<Star className="mx-auto w-16 h-16" />
					</div>
					<h3 className="mb-2 font-semibold text-xl">No meals available</h3>
					<p className="text-muted-foreground">
						{selectedCategory
							? `No meals found in the ${selectedCategory} category.`
							: "Check back later for our delicious menu items."
						}
					</p>
				</div>
			</section>
		);
	}

	// ImageKit URLs are stored directly in meal.image
	const mealImageMap: Record<string, string | null> = {};
	filteredMeals.forEach((meal) => {
		if (meal.image) {
			mealImageMap[meal._id] = meal.image;
		}
	});

	return (
		<section id={menuId} className="mx-auto px-4 container">
			<div className="mb-12 text-center">
				<h2 className="mb-4 font-bold text-3xl md:text-4xl">
					{selectedCategory
						? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`
						: "Featured Meals"}
				</h2>
				<p className="mx-auto max-w-2xl text-muted-foreground text-lg">
					Handcrafted with love, customized to perfection
				</p>
			</div>

			<div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				{filteredMeals.map((meal: Doc<"meals">) => (
					<Card
						key={meal._id}
						className="group shadow-lg hover:shadow-2xl border-0 overflow-hidden transition-all duration-300 cursor-pointer hover-lift"
						onClick={() => setSelectedMeal(meal)}
					>
						<div className="relative h-56 overflow-hidden">
							<Image
								fill
								src={mealImageMap[meal._id] || '/placeholder-image.jpg'}
								alt={meal.name}
								className="object-cover group-hover:scale-110 transition-transform duration-300"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

							{meal.popular && (
								<Badge className="top-3 left-3 absolute bg-primary text-primary-foreground">
									<Star className="mr-1 w-3 h-3" />
									Popular
								</Badge>
							)}

							{meal.spiceLevel === "hot" && (
								<Badge className="top-3 right-3 absolute bg-destructive text-destructive-foreground">
									<Flame className="mr-1 w-3 h-3" />
									Spicy
								</Badge>
							)}

							<div className="right-4 bottom-4 left-4 absolute">
								<div className="flex justify-between items-center mb-2 text-white">
									<div className="flex items-center space-x-2">
										<div className="flex items-center space-x-1">
											<Star className="fill-current w-4 h-4 text-yellow-400" />
											<span className="font-medium text-sm">{meal.rating}</span>
										</div>
										<div className="flex items-center space-x-1">
											<Clock className="w-4 h-4" />
											<span className="text-sm">{meal.prepTime} min</span>
										</div>
									</div>
									<span className="font-bold text-lg">R{meal.price}</span>
								</div>
							</div>
						</div>

						<div className="p-6">
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
										onClick={(e) => {
											e.stopPropagation();
											setSelectedMeal(meal);
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

			<MealCustomizationDialog
				meal={selectedMeal}
				open={!!selectedMeal}
				onOpenChange={(open) => !open && setSelectedMeal(null)}
			/>
		</section>
	);
}