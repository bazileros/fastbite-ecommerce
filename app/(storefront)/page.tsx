import { Suspense } from 'react';

import {
  Bike,
  CheckCircle2,
  Flame,
  Headset,
  Sparkles,
  Timer,
  UtensilsCrossed,
} from 'lucide-react';
import type { Metadata } from 'next';

import { CategorySection } from '@/components/category-section';
import { ErrorBoundary } from '@/components/error-boundary';
import { FeaturedMeals } from '@/components/featured-meals';
import { FloatingCart } from '@/components/floating-cart';
import { HeroCarousel } from '@/components/hero-carousel';
import { RoleBasedRedirect } from '@/components/RoleBasedRedirect';
import { StructuredData } from '@/components/structured-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { generateSEO } from '@/lib/seo';

export const metadata: Metadata = generateSEO({
	title: "FastBite - Premium Fast Food | Fresh Burgers & Customizable Meals",
	description:
		"Order premium fast food with customizable options for in-store pickup. Fresh ingredients, authentic flavors, and lightning-fast service in Cape Town. Try our signature Ultimate Beast Burger!",
	keywords: [
		"FastBite",
		"fast food Cape Town",
		"burgers South Africa",
		"customizable meals",
		"fresh ingredients",
		"quick service",
		"Ultimate Beast Burger",
		"premium fast food",
		"in-store pickup",
		"food delivery Cape Town",
	],
	image: "/og-home.jpg",
	url: "/",
});

const stats = [
	{
		icon: Timer,
		label: 'Average pickup time',
		value: '12 min',
		subtext: 'from order to collection',
	},
	{
		icon: Flame,
		label: 'Signature recipes',
		value: '45+',
		subtext: 'curated by our chef team',
	},
	{
		icon: CheckCircle2,
		label: 'Customer satisfaction',
		value: '97%',
		subtext: 'based on 3k+ reviews',
	},
];

const highlights = [
	{
		title: 'Build-it-your-way meals',
		description: 'Layer sauces, toppings, and premium sides to create the exact bite you crave.',
		icon: Sparkles,
	},
	{
		title: 'Kitchen-fresh promise',
		description: 'We prep every order on demand using free-range proteins and market produce.',
		icon: UtensilsCrossed,
	},
	{
		title: 'Always-on support',
		description: 'Our crew is one tap away for dietary swaps, delivery questions, and rapid help.',
		icon: Headset,
	},
];

const steps = [
	{
		title: 'Browse & customise',
		description: 'Explore the menu, pick a base, and fine-tune toppings, sauces, and add-ons.',
		icon: Sparkles,
	},
	{
		title: 'Track in real time',
		description: 'Follow prep progress, receive order-ready alerts, and schedule pick-ups that suit you.',
		icon: Timer,
	},
	{
		title: 'Grab & enjoy',
		description: 'Skip the queue—collect at the express counter or have our riders deliver piping hot.',
		icon: Bike,
	},
];

const testimonials = [
	{
		name: 'Thandi Molefe',
		role: 'Food blogger, Cape Town',
		quote: 'FastBite nails consistency. Every burger tastes like it came straight off a gourmet pass—fast, hot, and customisable.',
	},
	{
		name: 'Sipho Jacobs',
		role: 'Startup founder',
		quote: 'We cater our Friday stand-ups with FastBite. Orders stay accurate, and the pickup experience is seamless.',
	},
	{
		name: 'Lara Mostert',
		role: 'Fitness coach',
		quote: 'Being able to tweak macros on every meal keeps my clients on track. The nutrition-first approach is unmatched.',
	},
];

export default function HomePage() {
	return (
		<>
			<RoleBasedRedirect />
			<StructuredData type="website" />
			<main className="space-y-24 pt-12 pb-24">
				<HeroCarousel />

				<section className="mx-auto px-4 w-full max-w-6xl">
					<div className="gap-6 grid sm:grid-cols-2 lg:grid-cols-3">
						{stats.map((stat) => (
							<Card key={stat.label} className="bg-gradient-to-br from-background via-background/70 to-background/40 shadow-sm border-border/60">
								<CardContent className="flex flex-col gap-4 p-6">
									<div className="flex items-center gap-3 text-primary">
										<stat.icon className="w-6 h-6" aria-hidden="true" />
										<span className="font-medium text-primary/80 text-xs uppercase tracking-[0.2em]">{stat.label}</span>
									</div>
									<p className="font-semibold text-3xl tracking-tight">{stat.value}</p>
									<p className="text-muted-foreground text-sm leading-relaxed">{stat.subtext}</p>
								</CardContent>
							</Card>
						))}
					</div>

					<div className="gap-6 grid md:grid-cols-2 lg:grid-cols-3 py-12">
						{highlights.map((highlight) => (
							<Card key={highlight.title} className="bg-background shadow-sm hover:shadow-lg border-border/60 transition hover:-translate-y-1 duration-300">
								<CardContent className="flex flex-col gap-4 p-6 h-full">
									<div className="inline-flex justify-center items-center bg-primary/10 rounded-full w-12 h-12 text-primary">
										<highlight.icon className="w-6 h-6" aria-hidden="true" />
									</div>
									<h3 className="font-semibold text-lg tracking-tight">{highlight.title}</h3>
									<p className="text-muted-foreground text-sm leading-relaxed">{highlight.description}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				<section className="isolate relative bg-gradient-to-r from-primary/95 via-primary to-primary/80 py-20 overflow-hidden">
					<div className="top-1/2 -left-16 absolute bg-primary-foreground/10 blur-3xl rounded-full w-48 h-48 -translate-y-1/2" />
					<div className="top-1/2 -right-16 absolute bg-primary-foreground/5 blur-3xl rounded-full w-56 h-56 -translate-y-1/2" />
					<div className="relative flex flex-col gap-12 mx-auto px-4 w-full max-w-6xl text-primary-foreground">
						<div className="space-y-4 text-center">
							<Badge variant="secondary" className="bg-white/10 mx-auto border-white/30 w-fit text-white">
								How FastBite works
							</Badge>
							<h2 className="font-semibold text-3xl sm:text-4xl text-balance tracking-tight">Order today, feast in three simple steps</h2>
							<p className="mx-auto max-w-2xl text-white/80">
								From cravings to collection, we crafted the journey to stay effortless. No call centres, no guesswork—just food the way you want it.
							</p>
						</div>
						<div className="gap-6 grid md:grid-cols-3">
							{steps.map((step, index) => (
								<Card key={step.title} className="bg-white/5 backdrop-blur-sm border-white/20">
									<CardContent className="flex flex-col gap-4 p-6 h-full">
										<div className="flex justify-center items-center bg-white/20 rounded-full w-12 h-12 text-white">
											<span className="font-semibold text-lg">{index + 1}</span>
										</div>
										<div className="space-y-3">
											<div className="inline-flex justify-center items-center bg-white/15 rounded-full w-10 h-10">
												<step.icon className="w-5 h-5" aria-hidden="true" />
											</div>
											<h3 className="font-semibold text-lg tracking-tight">{step.title}</h3>
											<p className="text-white/80 text-sm leading-relaxed">{step.description}</p>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>

				<section className="mx-auto px-4 w-full max-w-6xl">
					<div className="space-y-6 text-center">
						<Badge variant="outline" className="mx-auto border-primary/30 w-fit text-primary">
							Trusted by local foodies
						</Badge>
						<h2 className="font-semibold text-3xl sm:text-4xl text-balance tracking-tight">What our community is saying</h2>
						<p className="mx-auto max-w-2xl text-muted-foreground leading-relaxed">
							We listen to every review to keep raising the bar. Here&apos;s what diners around Cape Town love most about FastBite.
						</p>
					</div>
					<div className="gap-6 grid md:grid-cols-2 lg:grid-cols-3 py-12">
						{testimonials.map((testimonial) => (
							<Card key={testimonial.name} className="bg-background shadow-sm border-border/60">
								<CardContent className="flex flex-col gap-4 p-6 h-full">
									<p className="text-muted-foreground text-sm leading-relaxed">“{testimonial.quote}”</p>
									<div className="space-y-1">
										<p className="font-semibold text-sm">{testimonial.name}</p>
										<p className="text-muted-foreground text-xs">{testimonial.role}</p>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				<section className="space-y-16 pt-4">
					<div className="space-y-16">
						<ErrorBoundary fallback={<div className="flex justify-center items-center bg-muted rounded-xl h-64 text-muted-foreground">Categories temporarily unavailable</div>}>
							<Suspense fallback={<div className="bg-muted rounded-xl h-64 animate-pulse" />}>
								<CategorySection />
							</Suspense>
						</ErrorBoundary>
						<ErrorBoundary fallback={<div className="flex justify-center items-center bg-muted rounded-xl h-96 text-muted-foreground">Featured meals temporarily unavailable</div>}>
							<Suspense fallback={<div className="bg-muted rounded-xl h-96 animate-pulse" />}>
								<FeaturedMeals selectedCategory={null} />
							</Suspense>
						</ErrorBoundary>
					</div>

					<div className="flex flex-col items-center gap-6 bg-gradient-to-br from-background to-background/80 shadow-sm mx-auto p-10 border border-border/60 rounded-3xl w-full max-w-5xl text-center">
						<h2 className="font-semibold text-3xl sm:text-4xl text-balance tracking-tight">Ready when you are</h2>
						<p className="max-w-2xl text-muted-foreground leading-relaxed">
							Plan tonight&apos;s feast or schedule a pickup for later in the week. Your customised FastBite order stays fresh, flavourful, and on time.
						</p>
						<div className="flex flex-wrap justify-center gap-3">
							<Button size="lg" className="px-8" asChild>
								<a href="/menu">Start an order</a>
							</Button>
							<Button size="lg" variant="outline" className="px-8" asChild>
								<a href="/contact">Talk to catering</a>
							</Button>
						</div>
					</div>
				</section>
			</main>
			<FloatingCart />
		</>
	);
}
