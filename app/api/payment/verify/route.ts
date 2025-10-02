import { type NextRequest, NextResponse } from 'next/server';

import { verifyPayment } from '@/lib/paystack';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const paymentData = await verifyPayment(reference);

    return NextResponse.json({
      success: paymentData.status === 'success',
      data: {
        reference: paymentData.reference,
        amount: paymentData.amount / 100, // Convert from kobo to naira
        status: paymentData.status,
        paidAt: paymentData.paid_at,
        channel: paymentData.channel,
        orderId: paymentData.metadata?.orderId,
      },
    });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to verify payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
