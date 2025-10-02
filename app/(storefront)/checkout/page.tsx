/* eslint-disable @next/next/no-img-element */

"use client";

import {
  useId,
  useState,
} from 'react';

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/lib/cart-context';
import {
  type CheckoutForm,
  CheckoutFormSchema,
} from '@/lib/schemas';
import {
  calculateVATAmount,
  formatPrice,
} from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';

export default function CheckoutPage() {
	const nameId = useId();
	const phoneId = useId();
	const emailId = useId();
	const instructionsId = useId();
	const asapId = useId();
	const cardId = useId();
	const cashId = useId();
	const { items, total, clearCart } = useCart();
	const [isProcessing, setIsProcessing] = useState(false);

	const checkoutForm = useForm<CheckoutForm>({
		resolver: zodResolver(CheckoutFormSchema),
		defaultValues: {
			customerInfo: {
				name: "",
				email: "",
				phone: "",
				specialInstructions: "",
			},
			paymentMethod: "card",
			pickupTime: "asap",
		},
	});

	const subtotal = total;
	const tax = calculateVATAmount(subtotal);
	const finalTotal = subtotal + tax;

	// Generate pickup time options
	const generatePickupTimes = () => {
		const times = [];
		const now = new Date();
		const currentHour = now.getHours();
		const currentMinute = now.getMinutes();

		// Start from next 15-minute interval
		let startMinute = Math.ceil(currentMinute / 15) * 15;
		let startHour = currentHour;

		if (startMinute >= 60) {
			startMinute = 0;
			startHour += 1;
		}

		// Add 15 minutes for preparation
		startMinute += 15;
		if (startMinute >= 60) {
			startMinute = 0;
			startHour += 1;
		}

		for (let i = 0; i < 8; i++) {
			const hour = (startHour + Math.floor((startMinute + i * 15) / 60)) % 24;
			const minute = (startMinute + i * 15) % 60;
			const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
			const displayTime = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
				hour,
				minute,
			).toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
			});

			times.push({ value: timeString, label: displayTime });
		}

		return times;
	};

	const pickupTimes = generatePickupTimes();

	const handlePayment = async (data: CheckoutForm) => {
		setIsProcessing(true);

		try {
			// Prepare order items
			const orderItems = items.map((item) => ({
				mealId: item.meal._id,
				mealName: item.meal.name,
				quantity: item.quantity,
				price: item.totalPrice,
				toppings: item.toppings.map((t) => t.name),
				sides: item.sides.map((s) => s.name),
				beverages: item.beverages.map((b) => b.name),
			}));

			// Initialize payment
			const response = await fetch("/api/payment/initialize", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount: finalTotal,
					email: data.customerInfo.email,
					customerInfo: {
						name: data.customerInfo.name,
						email: data.customerInfo.email,
						phone: data.customerInfo.phone,
						specialInstructions: data.customerInfo.specialInstructions,
					},
					items: orderItems,
					pickupTime: data.pickupTime,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to initialize payment");
			}

			const result = await response.json();

			if (result.success && result.authorization_url) {
				// Clear cart before redirect
				clearCart();
				// Redirect to Paystack payment page
				window.location.href = result.authorization_url;
			} else {
				throw new Error("Invalid payment response");
			}
		} catch (error) {
			console.error("Payment initialization failed:", error);
			toast.error("Failed to initialize payment. Please try again.");
			setIsProcessing(false);
		}
	};

	if (items.length === 0) {
		return (
			<div className="flex justify-center items-center bg-background p-4 min-h-screen">
				<Card className="w-full max-w-md text-center">
					<CardContent className="pt-6">
						<AlertCircle className="mx-auto mb-4 w-16 h-16 text-muted-foreground" />
						<h2 className="mb-2 font-semibold text-xl">Your cart is empty</h2>
						<p className="mb-4 text-muted-foreground">
							Add some delicious meals to your cart before checking out.
						</p>
						<Link href="/">
							<Button>Browse Menu</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 min-h-screen">
			<div className="mx-auto px-4 py-8 container">
				{/* Header */}
				<div className="flex items-center space-x-4 mb-8">
					<Link href="/">
						<Button variant="ghost" size="sm">
							<ArrowLeft className="mr-2 w-4 h-4" />
							Back to menu
						</Button>
					</Link>
					<div>
						<h1 className="font-bold text-2xl">Checkout</h1>
						<p className="text-muted-foreground">Complete your order</p>
					</div>
				</div>

				<div className="gap-8 grid lg:grid-cols-3">
					{/* Order Form */}
					<div className="space-y-6 lg:col-span-2">
						{/* Customer Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<User className="w-5 h-5" />
									<span>Customer Information</span>
								</CardTitle>
								<CardDescription>
									We&apos;ll use this information for your order and pickup
									notification
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="gap-4 grid grid-cols-1 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor={nameId}>Full Name *</Label>
										<Input
											id={nameId}
											placeholder="Enter your full name"
											{...checkoutForm.register("customerInfo.name")}
											required
										/>
										{checkoutForm.formState.errors.customerInfo?.name && (
											<p className="text-destructive text-sm">
												{
													checkoutForm.formState.errors.customerInfo.name
														.message
												}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor={phoneId}>Phone Number *</Label>
										<Input
											id={phoneId}
											placeholder="(555) 123-4567"
											{...checkoutForm.register("customerInfo.phone")}
											required
										/>
										{checkoutForm.formState.errors.customerInfo?.phone && (
											<p className="text-destructive text-sm">
												{
													checkoutForm.formState.errors.customerInfo.phone
														.message
												}
											</p>
										)}
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor={emailId}>Email Address *</Label>
									<Input
										id={emailId}
										type="email"
										placeholder="your.email@example.com"
										{...checkoutForm.register("customerInfo.email")}
										required
									/>
									{checkoutForm.formState.errors.customerInfo?.email && (
										<p className="text-destructive text-sm">
											{checkoutForm.formState.errors.customerInfo.email.message}
										</p>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor={instructionsId}>
										Special Instructions (Optional)
									</Label>
									<Textarea
										id={instructionsId}
										placeholder="Any special requests or dietary notes..."
										{...checkoutForm.register(
											"customerInfo.specialInstructions",
										)}
										rows={3}
									/>
									{checkoutForm.formState.errors.customerInfo
										?.specialInstructions && (
										<p className="text-destructive text-sm">
											{
												checkoutForm.formState.errors.customerInfo
													.specialInstructions.message
											}
										</p>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Pickup Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<Clock className="w-5 h-5" />
									<span>Pickup Time</span>
								</CardTitle>
								<CardDescription>
									Choose when you&apos;d like to pick up your order
								</CardDescription>
							</CardHeader>
							<CardContent>
								<RadioGroup
									value={checkoutForm.watch("pickupTime")}
									onValueChange={(value) =>
										checkoutForm.setValue("pickupTime", value)
									}
								>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="asap" id={asapId} />
										<Label
											htmlFor={asapId}
											className="flex items-center space-x-2"
										>
											<span>ASAP</span>
											<Badge variant="secondary">15-20 min</Badge>
										</Label>
									</div>
									{pickupTimes.map((time) => (
										<div
											key={time.value}
											className="flex items-center space-x-2"
										>
											<RadioGroupItem value={time.value} id={time.value} />
											<Label htmlFor={time.value}>{time.label}</Label>
										</div>
									))}
								</RadioGroup>

								<div className="bg-muted/50 mt-4 p-4 rounded-lg">
									<div className="flex items-start space-x-2">
										<MapPin className="mt-0.5 w-4 h-4 text-primary" />
										<div className="text-sm">
											<p className="font-medium">Pickup Location</p>
											<p className="text-muted-foreground">
												123 Fast Food Ave, City, State 12345
											</p>
											<p className="text-muted-foreground">
												Phone: (555) 123-4567
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Payment Method */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<CreditCard className="w-5 h-5" />
									<span>Payment Method</span>
								</CardTitle>
								<CardDescription>
									Choose how you&apos;d like to pay for your order
								</CardDescription>
							</CardHeader>
							<CardContent>
								<RadioGroup
									value={checkoutForm.watch("paymentMethod")}
									onValueChange={(value: "card" | "cash") =>
										checkoutForm.setValue("paymentMethod", value)
									}
								>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="card" id={cardId} />
										<Label
											htmlFor={cardId}
											className="flex items-center space-x-2"
										>
											<CreditCard className="w-4 h-4" />
											<span>Credit/Debit Card</span>
											<Badge variant="secondary">Secure</Badge>
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="cash" id={cashId} />
										<Label
											htmlFor={cashId}
											className="flex items-center space-x-2"
										>
											<span>💵</span>
											<span>Pay at Pickup</span>
										</Label>
									</div>
								</RadioGroup>

								{checkoutForm.watch("paymentMethod") === "card" && (
									<div className="bg-primary/5 mt-4 p-4 rounded-lg">
										<p className="text-muted-foreground text-sm">
											You&apos;ll be redirected to our secure payment processor
											(Paystack) to complete your payment.
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Order Summary */}
					<div className="space-y-6">
						<Card className="top-4 sticky">
							<CardHeader>
								<CardTitle>Order Summary</CardTitle>
								<CardDescription>
									{items.length} item{items.length !== 1 ? "s" : ""} in your
									order
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Order Items */}
								<div className="space-y-3">
									{items.map((item) => (
										<div key={item.id} className="flex space-x-3">
											<img
												src={item.meal.image}
												alt={item.meal.name}
												className="rounded-lg w-12 h-12 object-cover"
											/>
											<div className="flex-1 space-y-1">
												<h4 className="font-medium text-sm">
													{item.meal.name}
												</h4>
												<div className="text-muted-foreground text-xs">
													Qty: {item.quantity}
												</div>
												{item.toppings.length > 0 && (
													<div className="text-muted-foreground text-xs">
														+{item.toppings.map((t) => t.name).join(", ")}
													</div>
												)}
												<div className="font-medium text-primary text-sm">
													{formatPrice(item.totalPrice)}
												</div>
											</div>
										</div>
									))}
								</div>

								<Separator />

								{/* Pricing Breakdown */}
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>Subtotal (excl. VAT)</span>
										<span>{formatPrice(subtotal)}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span>VAT (15%)</span>
										<span>{formatPrice(tax)}</span>
									</div>
									<Separator />
									<div className="flex justify-between font-bold">
										<span>Total (incl. VAT)</span>
										<span className="text-primary">
											{formatPrice(finalTotal)}
										</span>
									</div>
								</div>

								<Button
									onClick={checkoutForm.handleSubmit(handlePayment)}
									size="lg"
									className="w-full"
									disabled={isProcessing || checkoutForm.formState.isSubmitting}
								>
									{isProcessing ? (
										<>
											<div className="mr-2 border-white border-b-2 rounded-full w-4 h-4 animate-spin" />
											Processing...
										</>
									) : (
										<>
											<CheckCircle className="mr-2 w-4 h-4" />
											Complete Order
										</>
									)}
								</Button>

								<div className="text-muted-foreground text-xs text-center">
									By completing your order, you agree to our Terms of Service
									and Privacy Policy.
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
