import { ConvexHttpClient } from 'convex/browser';
import {
  type NextRequest,
  NextResponse,
} from 'next/server';

import { api } from '@/convex/_generated/api';

export async function POST(request: NextRequest) {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL is required');
    }

    const convex = new ConvexHttpClient(convexUrl);

    // Parse request body
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Fetch order from Convex by payment reference
    const order = await convex.query(api.queries.getOrderByPaymentReference, {
      reference,
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
