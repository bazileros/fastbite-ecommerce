"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Coffee,
  Crown,
  Gift,
  Heart,
  Star,
  Trophy,
  Utensils,
  Zap,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface LoyaltyProgramProps {
	currentPoints?: number;
	currentTier?: "bronze" | "silver" | "gold" | "platinum";
}

export function LoyaltyProgram({
	currentPoints = 1250,
	currentTier = "silver",
}: LoyaltyProgramProps) {

	const tiers = {
		bronze: {
			name: "Bronze",
			icon: Coffee,
			color: "text-amber-600",
			min: 0,
			max: 500,
		},
		silver: {
			name: "Silver",
			icon: Star,
			color: "text-gray-500",
			min: 500,
			max: 1500,
		},
		gold: {
			name: "Gold",
			icon: Crown,
			color: "text-yellow-500",
			min: 1500,
			max: 3000,
		},
		platinum: {
			name: "Platinum",
			icon: Trophy,
			color: "text-purple-500",
			min: 3000,
			max: Infinity,
		},
	};

	const rewards = [
		{
			id: "1",
			name: "Free Small Fries",
			points: 200,
			description: "Crispy golden fries on us",
			icon: "🍟",
			available: currentPoints >= 200,
		},
		{
			id: "2",
			name: "Free Drink Upgrade",
			points: 150,
			description: "Upgrade any drink to large",
			icon: "🥤",
			available: currentPoints >= 150,
		},
		{
			id: "3",
			name: "10% Off Next Order",
			points: 300,
			description: "Save on your next purchase",
			icon: "💰",
			available: currentPoints >= 300,
		},
		{
			id: "4",
			name: "Free Dessert",
			points: 400,
			description: "Any dessert from our menu",
			icon: "🍰",
			available: currentPoints >= 400,
		},
		{
			id: "5",
			name: "Free Burger",
			points: 800,
			description: "Any burger from our signature collection",
			icon: "🍔",
			available: currentPoints >= 800,
		},
		{
			id: "6",
			name: "VIP Experience",
			points: 1500,
			description: "Skip the line + free meal",
			icon: "👑",
			available: currentPoints >= 1500,
		},
	];

	const currentTierInfo = tiers[currentTier];
	const nextTier =
		currentTier === "bronze"
			? "silver"
			: currentTier === "silver"
				? "gold"
				: currentTier === "gold"
					? "platinum"
					: null;

	const nextTierInfo = nextTier ? tiers[nextTier] : null;
	const progressToNext = nextTierInfo
		? ((currentPoints - currentTierInfo.min) /
				(nextTierInfo.min - currentTierInfo.min)) *
			100
		: 100;
	// clamp progress to a safe 0-100 range for the Progress component
	const denominator = nextTierInfo ? nextTierInfo.min - currentTierInfo.min : 1;
	const safeProgress =
		nextTierInfo && denominator > 0
			? Math.max(0, Math.min(100, progressToNext))
			: 0;

	const handleRedeemReward = (rewardId: string) => {
		// Here you would integrate with your backend to redeem the reward
		// For now, just show a success message
		const reward = rewards.find((r) => r.id === rewardId);
		if (reward) {
			alert(`Redeemed: ${reward.name}!`);
		}
	};

	return (
		<div className="space-y-6">
			{/* Current Status */}
			<Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-0">
				<CardHeader>
					<div className="flex justify-between items-center">
						<div className="flex items-center space-x-3">
							<div
								className={`p-2 rounded-full bg-background ${currentTierInfo.color}`}
							>
								{(() => {
									const TierIcon = currentTierInfo.icon;
									return <TierIcon className="w-6 h-6" />;
								})()}
							</div>
							<div>
								<CardTitle className="flex items-center space-x-2">
									<span>{currentTierInfo.name} Member</span>
									<Badge variant="secondary">{currentPoints} points</Badge>
								</CardTitle>
								<CardDescription>
									{nextTierInfo
										? `${nextTierInfo.min - currentPoints} points to ${nextTierInfo.name}`
										: "You've reached the highest tier!"}
								</CardDescription>
							</div>
						</div>
						<Heart className="w-6 h-6 text-primary" />
					</div>
				</CardHeader>
				<CardContent>
					{nextTierInfo && (
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>{currentTierInfo.name}</span>
								<span>{nextTierInfo.name}</span>
							</div>
							<Progress value={safeProgress} className="h-2" />
							<p className="text-muted-foreground text-xs text-center">
								{Math.round(safeProgress)}% to next tier
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* How to Earn Points */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Zap className="w-5 h-5" />
						<span>Earn Points</span>
					</CardTitle>
					<CardDescription>
						Every purchase gets you closer to amazing rewards
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="gap-4 grid grid-cols-1 md:grid-cols-3">
						<div className="space-y-2 text-center">
							<div className="flex justify-center items-center bg-primary/10 mx-auto rounded-full w-12 h-12">
								<Utensils className="w-6 h-6 text-primary" />
							</div>
							<h4 className="font-display font-medium">Order Food</h4>
							<p className="text-muted-foreground text-sm">
								1 point per $1 spent
							</p>
						</div>
						<div className="space-y-2 text-center">
							<div className="flex justify-center items-center bg-primary/10 mx-auto rounded-full w-12 h-12">
								<Star className="w-6 h-6 text-primary" />
							</div>
							<h4 className="font-display font-medium">Leave Reviews</h4>
							<p className="text-muted-foreground text-sm">
								50 points per review
							</p>
						</div>
						<div className="space-y-2 text-center">
							<div className="flex justify-center items-center bg-primary/10 mx-auto rounded-full w-12 h-12">
								<Gift className="w-6 h-6 text-primary" />
							</div>
							<h4 className="font-display font-medium">Refer Friends</h4>
							<p className="text-muted-foreground text-sm">
								200 points per referral
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Available Rewards */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Gift className="w-5 h-5" />
						<span>Available Rewards</span>
					</CardTitle>
					<CardDescription>
						Redeem your points for delicious rewards
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
						{rewards.map((reward) => (
							<Card
								key={reward.id}
								className={`transition-all duration-200 ${
									reward.available
										? "hover:shadow-md cursor-pointer border-primary/20"
										: "opacity-50 cursor-not-allowed"
								}`}
								onClick={() =>
									reward.available && handleRedeemReward(reward.id)
								}
							>
								<CardContent className="space-y-3 pt-6 text-center">
									<div className="text-3xl">{reward.icon}</div>
									<div>
										<h4 className="font-display font-medium">{reward.name}</h4>
										<p className="text-muted-foreground text-sm">
											{reward.description}
										</p>
									</div>
									<div className="flex justify-between items-center">
										<Badge variant={reward.available ? "default" : "secondary"}>
											{reward.points} points
										</Badge>
										{reward.available && (
											<Button size="sm" variant="outline">
												Redeem
											</Button>
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Tier Benefits */}
			<Card>
				<CardHeader>
					<CardTitle>Tier Benefits</CardTitle>
					<CardDescription>Unlock more perks as you level up</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{Object.entries(tiers).map(([tier, info]) => (
							<div
								key={tier}
								className={`flex items-center justify-between p-4 rounded-lg border ${
									tier === currentTier
										? "border-primary bg-primary/5"
										: "border-muted"
								}`}
							>
								<div className="flex items-center space-x-3">
									{(() => {
										const TierIconItem = info.icon;
										return <TierIconItem className={`h-5 w-5 ${info.color}`} />;
									})()}
									<div>
										<h4 className="font-display font-medium">{info.name}</h4>
										<p className="text-muted-foreground text-sm">
											{info.min === 0
												? "Starting tier"
												: info.max === Infinity
													? `${info.min}+ points`
													: `${info.min} - ${info.max} points`}
										</p>
									</div>
								</div>
								<div className="text-right">
									{tier === currentTier && (
										<Badge variant="default">Current</Badge>
									)}
									{tier === "bronze" && (
										<span className="text-muted-foreground text-sm">
											5% bonus points
										</span>
									)}
									{tier === "silver" && (
										<span className="text-muted-foreground text-sm">
											10% bonus points
										</span>
									)}
									{tier === "gold" && (
										<span className="text-muted-foreground text-sm">
											15% bonus + free delivery
										</span>
									)}
									{tier === "platinum" && (
										<span className="text-muted-foreground text-sm">
											20% bonus + VIP support
										</span>
									)}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
