import { ConvexHttpClient } from 'convex/browser';
import {
  type NextRequest,
  NextResponse,
} from 'next/server';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { initializePayment } from '@/lib/paystack';

interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

interface CartItem {
  mealId: string;
  mealName: string;
  quantity: number;
  price: number;
  toppings?: CustomizationOption[];
  sides?: CustomizationOption[];
  beverages?: CustomizationOption[];
  specialInstructions?: string;
}

export async function POST(request: NextRequest) {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL is required');
    }

    const convex = new ConvexHttpClient(convexUrl);

    // Parse request body
    const body = await request.json();
    const { amount, email, customerInfo, items, pickupTime } = body;

    // Validate required fields
    if (!amount || !email || !customerInfo || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique reference
    const reference = `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Create order in Convex
    const orderId = await convex.mutation(api.mutations.createOrder, {
      items: items.map((item: CartItem) => ({
        mealId: item.mealId as Id<'meals'>,
        quantity: item.quantity,
        selectedToppings: item.toppings?.map((t) => ({
          id: t.id,
          name: t.name,
          price: t.price,
        })) ?? [],
        selectedSides: item.sides?.map((side) => ({
          id: side.id,
          name: side.name,
          price: side.price,
        })) ?? [],
        selectedBeverages: item.beverages?.map((bev) => ({
          id: bev.id,
          name: bev.name,
          price: bev.price,
        })) ?? [],
        totalPrice: item.price,
        specialInstructions: item.specialInstructions,
      })),
      total: amount,
      specialInstructions: customerInfo.specialInstructions || '',
      pickupTime: pickupTime || 'asap',
    });

    // Initialize Paystack payment
    const payment = await initializePayment({
      email,
      amount,
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-confirmation?reference=${reference}`,
      metadata: {
        orderId: orderId as string,
        userId: customerInfo.userId,
        items: items.map((item: CartItem) => ({
          id: item.mealId,
          name: item.mealName,
          quantity: item.quantity,
          price: item.price,
        })),
      },
      customer: {
        email,
        first_name: customerInfo.name.split(' ')[0],
        last_name: customerInfo.name.split(' ').slice(1).join(' ') || customerInfo.name.split(' ')[0],
        phone: customerInfo.phone,
      },
    });

    // Return payment authorization URL
    return NextResponse.json({
      success: true,
      authorization_url: payment.authorization_url,
      reference: payment.reference,
      orderId,
    });
  } catch (error) {
    console.error('Payment initialization failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
