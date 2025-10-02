'use server';

// =============================================================================
// PAYSTACK PAYMENT SERVER ACTIONS
// =============================================================================

// Initialize Paystack payment
export async function initializePaystackPayment(data: {
  amount: number;
  orderId: string;
  email: string;
  metadata?: Record<string, unknown>;
}) {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    throw new Error("Paystack secret key not configured");
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: data.amount * 100, // Convert to kobo
      email: data.email,
      reference: `order_${data.orderId}_${Date.now()}`,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
      metadata: data.metadata,
    }),
  });

  return response.json();
}

// Verify Paystack payment
export async function verifyPaystackPayment(data: {
  reference: string;
}) {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    throw new Error("Paystack secret key not configured");
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${data.reference}`, {
    headers: {
      Authorization: `Bearer ${paystackSecret}`,
    },
  });

  return response.json();
}

// Process Paystack refund
export async function processPaystackRefund(data: {
  transactionId: string;
  amount: number;
}) {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    throw new Error("Paystack secret key not configured");
  }

  const response = await fetch("https://api.paystack.co/refund", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transaction: data.transactionId,
      amount: data.amount * 100, // Convert to kobo
    }),
  });

  return response.json();
}