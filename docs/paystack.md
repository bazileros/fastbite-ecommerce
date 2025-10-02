# Paystack Payment Integration

Paystack provides secure payment processing for FastBite orders.

## Overview

Paystack handles:
- Card payments (Visa, Mastercard, Verve)
- Bank transfers
- Mobile money payments
- Payment verification and webhooks
- Transaction management

## Configuration

### Environment Variables
```env
# Paystack Configuration
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_BASE_URL=https://api.paystack.co
```

### Paystack Client (`lib/paystack.ts`)
```typescript
import Paystack from 'paystack-api';

export const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY!);
```

## Payment Flow

### 1. Initialize Transaction

When user places an order:

```typescript
import { paystack } from '@/lib/paystack';

export async function initializePayment(orderData: OrderData) {
  try {
    const response = await paystack.transaction.initialize({
      amount: orderData.total * 100, // Convert to kobo
      email: orderData.customerEmail,
      reference: `order_${orderData.orderId}`,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-confirmation`,
      metadata: {
        orderId: orderData.orderId,
        customerId: orderData.customerId,
      }
    });

    return {
      authorization_url: response.data.authorization_url,
      reference: response.data.reference,
    };
  } catch (error) {
    console.error('Payment initialization failed:', error);
    throw new Error('Failed to initialize payment');
  }
}
```

### 2. Payment Verification

After successful payment, verify transaction:

```typescript
export async function verifyPayment(reference: string) {
  try {
    const response = await paystack.transaction.verify(reference);

    if (response.data.status === 'success') {
      // Update order status to paid
      await updateOrderPaymentStatus({
        orderId: response.data.metadata.orderId,
        status: 'paid',
        transactionId: reference,
      });

      return { success: true, data: response.data };
    }

    return { success: false, reason: 'Payment not successful' };
  } catch (error) {
    console.error('Payment verification failed:', error);
    return { success: false, reason: 'Verification failed' };
  }
}
```

## Webhook Handling

### Webhook Endpoint (`app/api/payments/webhook/route.ts`)

```typescript
import { NextRequest } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;
      case 'charge.failure':
        await handleFailedPayment(event.data);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return Response.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return Response.json({ error: 'Processing failed' }, { status: 500 });
  }
}
```

## Frontend Integration

### Payment Component

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function PaymentButton({ orderId, amount }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount }),
      });

      const { authorization_url } = await response.json();

      // Redirect to Paystack payment page
      window.location.href = authorization_url;
    } catch (error) {
      console.error('Payment initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="btn-primary"
    >
      {loading ? 'Processing...' : `Pay ₦${amount}`}
    </button>
  );
}
```

## Order Status Management

### Payment Status Updates

```typescript
// Update order payment status
export async function updateOrderPaymentStatus({
  orderId,
  status,
  transactionId,
}: {
  orderId: string;
  status: PaymentStatus;
  transactionId?: string;
}) {
  await convex.mutation(api.mutations.updateOrderPaymentStatus, {
    orderId,
    status,
    transactionId,
  });
}
```

## Security Considerations

### Webhook Security
- Always verify webhook signatures
- Use HTTPS for webhook endpoints
- Validate event data before processing
- Implement idempotency for webhook events

### Payment Data Handling
- Never store sensitive card information
- Use Paystack's hosted payment pages
- Implement proper error handling
- Log payment events for auditing

## Testing

### Test Cards
Paystack provides test cards for development:

```javascript
// Successful payment
Card: 4084084084084081
CVV: 408
Expiry: Any future date

// Failed payment
Card: 4084084084084081
CVV: 408
Expiry: Any future date
// Use amount that triggers failure (e.g., ₦100.00)
```

### Test Webhooks
Use ngrok or similar to expose local webhook endpoints:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Update Paystack webhook URL to ngrok URL
```

## Error Handling

### Common Payment Errors

```typescript
const PAYMENT_ERRORS = {
  'insufficient_funds': 'Insufficient funds in account',
  'card_declined': 'Card was declined by bank',
  'invalid_card': 'Invalid card details provided',
  'expired_card': 'Card has expired',
  'fraud_detected': 'Transaction flagged as fraudulent',
} as const;

export function getPaymentErrorMessage(code: string): string {
  return PAYMENT_ERRORS[code as keyof typeof PAYMENT_ERRORS] ||
         'Payment failed. Please try again.';
}
```

## Production Deployment

### Go Live Checklist
- [ ] Replace test keys with live keys
- [ ] Update webhook URLs to production domain
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and alerts
- [ ] Test with real payment methods
- [ ] Implement proper logging

### Monitoring
Monitor payment metrics:
- Success rate
- Average transaction time
- Failed payment reasons
- Webhook delivery status

## Troubleshooting

### Common Issues

1. **Webhook not firing**: Check webhook URL and ngrok setup
2. **Signature verification fails**: Ensure correct secret key
3. **Payment stuck on pending**: Check webhook delivery
4. **CORS errors**: Configure allowed origins in Paystack dashboard

### Debug Mode
Enable debug logging for development:
```env
PAYSTACK_DEBUG=true
```