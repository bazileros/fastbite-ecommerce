import { ConvexHttpClient } from 'convex/browser';
import { createHmac } from 'crypto';
import {
  type NextRequest,
  NextResponse,
} from 'next/server';

import { api } from '@/convex/_generated/api';

export async function POST(request: NextRequest) {
	const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
	if (!convexUrl) {
		throw new Error('NEXT_PUBLIC_CONVEX_URL is required');
	}

	const convex = new ConvexHttpClient(convexUrl);
	try {
		const signature = request.headers.get("x-paystack-signature");
		const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

		if (!signature || !paystackSecret) {
			console.error("Missing Paystack signature or secret");
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.text();

		// Verify Paystack signature
		const expectedSignature = createHmac("sha512", paystackSecret)
			.update(body)
			.digest("hex");

		if (signature !== expectedSignature) {
			console.error("Invalid Paystack signature");
			return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
		}

		const event = JSON.parse(body);
		console.log("Received Paystack webhook:", event.event);

		switch (event.event) {
			case "charge.success": {
				// Handle successful payment
				const reference = event.data.reference;
				const orderId = event.data.metadata?.orderId;

				if (orderId && reference) {
					console.log(`Processing successful payment for order ${orderId}`);

					// Update order payment status
					await convex.mutation(api.mutations.updateOrderPaymentStatus, {
						orderId,
						status: "paid",
						transactionId: reference,
					});

					// Update order status to confirmed
					await convex.mutation(api.mutations.updateOrderStatus, {
						orderId,
						status: "confirmed",
					});

					console.log(`Successfully processed payment for order ${orderId}`);
				} else {
					console.warn("Missing orderId or reference in successful charge event");
				}
				break;
			}

			case "charge.failed": {
				// Handle failed payment
				const failedOrderId = event.data.metadata?.orderId;
				if (failedOrderId) {
					console.log(`Processing failed payment for order ${failedOrderId}`);

					await convex.mutation(api.mutations.updateOrderPaymentStatus, {
						orderId: failedOrderId,
						status: "failed",
					});

					console.log(`Marked order ${failedOrderId} as payment failed`);
				} else {
					console.warn("Missing orderId in failed charge event");
				}
				break;
			}

			default:
				console.log("Unhandled Paystack event:", event.event);
		}

		return NextResponse.json({ status: "ok" });
	} catch (error) {
		console.error("Paystack webhook error:", error);
		return NextResponse.json(
			{ error: "Webhook processing failed" },
			{ status: 500 }
		);
	}
}