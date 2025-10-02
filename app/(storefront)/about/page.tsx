"use client";

import {
  Award,
  ChefHat,
  Clock,
  Heart,
  Star,
  Users,
} from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-background-light dark:bg-background-dark overflow-hidden">
        <div className="mx-auto px-4 py-20 container">
          <div className="space-y-6 text-center">
            <Badge variant="secondary" className="bg-primary/10 px-4 py-2 rounded-full w-fit font-body text-primary">
              <Heart className="mr-2 w-4 h-4" />
              Our Story
            </Badge>
            <h1 className="font-display text-text-light dark:text-text-dark text-4xl md:text-6xl leading-tight">
              Crafting Perfect
              <span className="block text-primary">Burgers Since 2020</span>
            </h1>
            <p className="mx-auto max-w-2xl text-text-secondary-light dark:text-text-secondary-dark text-xl leading-relaxed">
              Born from a passion for exceptional food and lightning-fast service, FastBite brings you the ultimate burger experience with premium ingredients and endless customization.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="mx-auto px-4 container">
          <div className="items-center gap-12 grid lg:grid-cols-2">
            <div className="space-y-6">
              <h2 className="font-display text-text-light dark:text-text-dark text-3xl md:text-4xl">
                From Food Truck to
                <span className="block text-primary">Local Favorite</span>
              </h2>
              <div className="space-y-4 font-body text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                <p>
                  FastBite started as a dream in a small kitchen, where our founders experimented with the perfect blend of premium beef, fresh toppings, and that signature crunch. What began as late-night burger experiments has become a beloved institution.
                </p>
                <p>
                  Every burger is handcrafted with care, using only the finest ingredients sourced from local suppliers. We believe great food shouldn&apos;t take forever, which is why we&apos;ve perfected our process to deliver restaurant-quality meals in minutes.
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <div className="text-center">
                  <div className="font-display font-bold text-primary text-2xl">50K+</div>
                  <div className="font-body text-text-secondary-light dark:text-text-secondary-dark text-sm">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-primary text-2xl">15 Min</div>
                  <div className="font-body text-text-secondary-light dark:text-text-secondary-dark text-sm">Avg Wait Time</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-primary text-2xl">25+</div>
                  <div className="font-body text-text-secondary-light dark:text-text-secondary-dark text-sm">Signature Items</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-card-light dark:bg-card-dark shadow-xl p-8 rounded-2xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <ChefHat className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-body font-semibold text-text-light dark:text-text-dark">Premium Ingredients</div>
                      <div className="font-body text-text-secondary-light dark:text-text-secondary-dark text-sm">Grass-fed beef, fresh produce</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-body font-semibold text-text-light dark:text-text-dark">Lightning Fast</div>
                      <div className="font-body text-text-secondary-light dark:text-text-secondary-dark text-sm">Ready in 15 minutes or less</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-body font-semibold text-text-light dark:text-text-dark">Made to Order</div>
                      <div className="font-body text-text-secondary-light dark:text-text-secondary-dark text-sm">Customize every detail</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-card-light dark:bg-card-dark py-20">
        <div className="mx-auto px-4 container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-text-light dark:text-text-dark text-3xl md:text-4xl">
              What Makes Us
              <span className="block text-primary">Different</span>
            </h2>
            <p className="mx-auto max-w-2xl font-body text-text-secondary-light dark:text-text-secondary-dark text-lg">
              We&apos;re not just another burger joint. Here&apos;s what sets FastBite apart from the rest.
            </p>
          </div>

          <div className="gap-8 grid md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-background-light dark:bg-background-dark shadow-lg hover:shadow-xl border-0 transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center items-center bg-primary/10 mx-auto mb-6 rounded-full w-16 h-16">
                  <ChefHat className="w-8 h-8 text-primary" />
                </div>
                <h3 className="mb-4 font-display text-text-light dark:text-text-dark text-xl">Artisan Crafted</h3>
                <p className="font-body text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                  Every burger is hand-formed and grilled to perfection by skilled cooks who take pride in their craft.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background-light dark:bg-background-dark shadow-lg hover:shadow-xl border-0 transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center items-center bg-primary/10 mx-auto mb-6 rounded-full w-16 h-16">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="mb-4 font-display text-text-light dark:text-text-dark text-xl">Quality First</h3>
                <p className="font-body text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                  We source only the finest ingredients, from grass-fed beef to farm-fresh vegetables and artisanal cheeses.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background-light dark:bg-background-dark shadow-lg hover:shadow-xl border-0 transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center items-center bg-primary/10 mx-auto mb-6 rounded-full w-16 h-16">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="mb-4 font-display text-text-light dark:text-text-dark text-xl">Speed & Convenience</h3>
                <p className="font-body text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                  Premium fast food means great taste without the wait. Most orders ready in 15 minutes or less.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-20">
        <div className="mx-auto px-4 container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-text-light dark:text-text-dark text-3xl md:text-4xl">
              Recognition That
              <span className="block text-primary">Matters</span>
            </h2>
            <p className="mx-auto max-w-2xl font-body text-text-secondary-light dark:text-text-secondary-dark text-lg">
              We&apos;re proud to be recognized by our community and industry for excellence in food and service.
            </p>
          </div>

          <div className="gap-6 grid md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card-light dark:bg-card-dark shadow-lg hover:shadow-xl border-0 text-center transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-center items-center bg-primary/10 mx-auto mb-4 rounded-full w-12 h-12">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="mb-2 font-body font-semibold text-text-light dark:text-text-dark">Best Burger 2024</h3>
                <p className="font-body text-text-secondary-light dark:text-text-secondary-dark text-sm">City Food Awards</p>
              </CardContent>
            </Card>

            <Card className="bg-card-light dark:bg-card-dark shadow-lg hover:shadow-xl border-0 text-center transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-center items-center bg-primary/10 mx-auto mb-4 rounded-full w-12 h-12">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h3 className="mb-2 font-body font-semibold text-text-light dark:text-text-dark">4.9★ Rating</h3>
                <p className="font-body text-text-secondary-light dark:text-text-secondary-dark text-sm">Google Reviews</p>
              </CardContent>
            </Card>

            <Card className="bg-card-light dark:bg-card-dark shadow-lg hover:shadow-xl border-0 text-center transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-center items-center bg-primary/10 mx-auto mb-4 rounded-full w-12 h-12">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="mb-2 font-body font-semibold text-text-light dark:text-text-dark">Top Rated</h3>
                <p className="font-body text-text-secondary-light dark:text-text-secondary-dark text-sm">Local Choice Awards</p>
              </CardContent>
            </Card>

            <Card className="bg-card-light dark:bg-card-dark shadow-lg hover:shadow-xl border-0 text-center transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-center items-center bg-primary/10 mx-auto mb-4 rounded-full w-12 h-12">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="mb-2 font-body font-semibold text-text-light dark:text-text-dark">Community Favorite</h3>
                <p className="font-body text-text-secondary-light dark:text-text-secondary-dark text-sm">Customer Survey</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-card-light dark:bg-card-dark py-20">
        <div className="mx-auto px-4 container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-text-light dark:text-text-dark text-3xl md:text-4xl">
              Meet the
              <span className="block text-primary">FastBite Team</span>
            </h2>
            <p className="mx-auto max-w-2xl font-body text-text-secondary-light dark:text-text-secondary-dark text-lg">
              The passionate people behind your favorite burgers, dedicated to delivering exceptional food and service.
            </p>
          </div>

          <div className="gap-8 grid md:grid-cols-3">
            <Card className="bg-background-light dark:bg-background-dark shadow-lg hover:shadow-xl border-0 text-center transition-shadow">
              <CardContent className="p-8">
                <div className="flex justify-center items-center bg-gradient-to-br from-primary to-primary/80 mx-auto mb-6 rounded-full w-20 h-20">
                  <ChefHat className="w-10 h-10 text-white" />
                </div>
                <h3 className="mb-2 font-display text-text-light dark:text-text-dark text-xl">Chef Maria</h3>
                <Badge variant="secondary" className="bg-primary/10 mb-4 text-primary">Head Chef</Badge>
                <p className="font-body text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                  15+ years crafting perfect burgers with global inspiration and local ingredients.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background-light dark:bg-background-dark shadow-lg hover:shadow-xl border-0 text-center transition-shadow">
              <CardContent className="p-8">
                <div className="flex justify-center items-center bg-gradient-to-br from-primary to-primary/80 mx-auto mb-6 rounded-full w-20 h-20">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="mb-2 font-display text-text-light dark:text-text-dark text-xl">Alex Johnson</h3>
                <Badge variant="secondary" className="bg-primary/10 mb-4 text-primary">Operations Manager</Badge>
                <p className="font-body text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                  Ensures every customer gets the FastBite experience they deserve, from order to bite.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background-light dark:bg-background-dark shadow-lg hover:shadow-xl border-0 text-center transition-shadow">
              <CardContent className="p-8">
                <div className="flex justify-center items-center bg-gradient-to-br from-primary to-primary/80 mx-auto mb-6 rounded-full w-20 h-20">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h3 className="mb-2 font-display text-text-light dark:text-text-dark text-xl">Sarah Chen</h3>
                <Badge variant="secondary" className="bg-primary/10 mb-4 text-primary">Quality Director</Badge>
                <p className="font-body text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                  Maintains our uncompromising standards for ingredients, preparation, and service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto px-4 container">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 shadow-xl mx-auto border-primary/20 max-w-4xl">
            <CardContent className="p-12 text-center">
              <h2 className="mb-6 font-display text-text-light dark:text-text-dark text-3xl md:text-4xl">
                Ready for the
                <span className="block text-primary">Ultimate Burger Experience?</span>
              </h2>
              <p className="mx-auto mb-8 max-w-2xl font-body text-text-secondary-light dark:text-text-secondary-dark text-lg leading-relaxed">
                Join thousands of burger lovers who choose FastBite for premium ingredients, endless customization, and lightning-fast service.
              </p>
              <div className="flex sm:flex-row flex-col justify-center gap-4">
                <Link href="/menu">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-3 font-body font-semibold">
                    Order Your Burger
                  </Button>
                </Link>
                <Link href="/storefront">
                  <Button variant="outline" size="lg" className="hover:bg-primary px-8 py-3 border-primary font-body font-semibold text-primary hover:text-white">
                    Find Us Near You
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}