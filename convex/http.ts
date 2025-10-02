import { httpRouter } from 'convex/server';
import { Webhook } from 'svix';

import { api } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { httpAction } from './_generated/server';

const http = httpRouter();

// NOTE: Image serving is now handled by ImageKit CDN
// Images are stored on ImageKit and URLs are stored in the database as strings
// This eliminates the need for a getImage endpoint

// Webhook verification helper
async function validateWebhook(
	req: Request,
): Promise<{
	type?: string;
	event?: string;
	data?: unknown;
} | null> {
	const payloadString = await req.text();

	const svixId = req.headers.get("svix-id");
	const svixTimestamp = req.headers.get("svix-timestamp");
	const svixSignature = req.headers.get("svix-signature");

	if (!svixId || !svixTimestamp || !svixSignature) {
		console.error("Missing required Svix headers");
		return null;
	}

	const svixHeaders = {
		"svix-id": svixId,
		"svix-timestamp": svixTimestamp,
		"svix-signature": svixSignature,
	};

	const webhookSecret = process.env.CONVEX_WEBHOOK_SIGNING_SECRET;
	if (!webhookSecret) {
		console.error("CONVEX_WEBHOOK_SIGNING_SECRET environment variable not set");
		return null;
	}

	const wh = new Webhook(webhookSecret);
	try {
		return wh.verify(payloadString, svixHeaders) as {
			type?: string;
			event?: string;
			data?: unknown;
		};
	} catch (error) {
		console.error("Error verifying webhook event", error);
		return null;
	}
}

// Logto webhook for user synchronization
http.route({
	path: "/webhooks/logto",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		console.log("Received Logto webhook request");

		const event = await validateWebhook(request);

		if (!event) {
			console.error("Webhook verification failed");
			return new Response("Webhook verification failed", { status: 400 });
		}

		console.log(
			"Processing Logto webhook event:",
			event.type,
			"for user:",
			(event.data as { id?: string })?.id,
		);

		// Handle the webhook event
		try {
			switch (event.type) {
				case "user.created":
				case "user.updated":
					// Update or create user in Convex
					await ctx.runMutation(api.mutations.ensureUser);
					break;

				case "user.deleted":
					// Handle user deletion if needed
					console.log("User deleted:", (event.data as { id?: string })?.id);
					break;

				default:
					console.log(`Unhandled webhook event type: ${event.type}`);
			}

			console.log("Successfully processed Logto webhook event:", event.type);
			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error("Error processing Logto webhook:", error);
			return new Response("Webhook processing failed", { status: 500 });
		}
	}),
});

// Paystack webhook for payment processing
http.route({
	path: "/webhooks/paystack",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		console.log("Received Paystack webhook request");

		const event = await validateWebhook(request);

		if (!event) {
			console.error("Webhook verification failed");
			return new Response("Webhook verification failed", { status: 400 });
		}

		console.log("Processing Paystack webhook event:", event.event);

		try {
			switch (event.event) {
				case "charge.success": {
					// Handle successful payment
					const reference = (event.data as { reference?: string })?.reference;
					if (reference) {
						await ctx.runMutation(api.mutations.updateOrderPaymentStatus, {
							orderId: reference as Id<"orders">,
							status: "paid",
							transactionId: (event.data as { id?: string })?.id,
						});
					}
					break;
				}

				case "charge.failed": {
					// Handle failed payment
					const failedReference = (event.data as { reference?: string })?.reference;
					if (failedReference) {
						await ctx.runMutation(api.mutations.updateOrderPaymentStatus, {
							orderId: failedReference as Id<"orders">,
							status: "failed",
							transactionId: (event.data as { id?: string })?.id,
						});
					}
					break;
				}

				default:
					console.log(`Unhandled Paystack event type: ${event.event}`);
			}

			console.log("Successfully processed Paystack webhook event:", event.event);
			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error("Error processing Paystack webhook:", error);
			return new Response("Webhook processing failed", { status: 500 });
		}
	}),
});

export default http;
