import axios from 'axios';

// Paystack configuration
const paystackConfig = {
  secretKey: process.env.PAYSTACK_SECRET_KEY || '',
  publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
  baseUrl: 'https://api.paystack.co',
};

// Create axios instance with Paystack configuration
const paystackClient = axios.create({
  baseURL: paystackConfig.baseUrl,
  headers: {
    Authorization: `Bearer ${paystackConfig.secretKey}`,
    'Content-Type': 'application/json',
  },
});

// Validate Paystack configuration
export function validatePaystackConfig() {
  if (!paystackConfig.secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured');
  }
  if (!paystackConfig.publicKey) {
    throw new Error('PAYSTACK_PUBLIC_KEY is not configured');
  }
}

// Test Paystack connection
export async function testPaystackConnection(): Promise<boolean> {
  try {
    validatePaystackConfig();
    const response = await paystackClient.get('/bank');
    return response.status === 200;
  } catch (error) {
    console.error('Paystack connection test failed:', error);
    return false;
  }
}

// Types for Paystack API
interface PaystackCustomer {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

interface PaystackMetadata {
  orderId: string;
  userId?: string;
  items?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    status: 'success' | 'failed' | 'abandoned';
    paid_at: string;
    created_at: string;
    channel: string;
    customer: PaystackCustomer;
    metadata?: PaystackMetadata;
  };
}

// Initialize payment
export async function initializePayment(options: {
  email: string;
  amount: number; // Amount in Naira
  reference?: string;
  callback_url?: string;
  metadata?: PaystackMetadata;
  customer?: PaystackCustomer;
}): Promise<PaystackInitializeResponse['data']> {
  try {
    validatePaystackConfig();

    const payload = {
      email: options.email,
      amount: Math.round(options.amount * 100), // Convert to cents
      currency: 'ZAR', // South African Rand
      reference: options.reference || generateReference(),
      callback_url: options.callback_url,
      metadata: options.metadata,
      customer: options.customer,
    };

    const response = await paystackClient.post('/transaction/initialize', payload);

    if (!response.data.status) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    console.error('Failed to initialize payment:', error);
    throw new Error('Payment initialization failed');
  }
}

// Verify payment
export async function verifyPayment(reference: string): Promise<PaystackVerifyResponse['data']> {
  try {
    validatePaystackConfig();

    const response = await paystackClient.get(`/transaction/verify/${reference}`);

    if (!response.data.status) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    console.error('Failed to verify payment:', error);
    throw new Error('Payment verification failed');
  }
}

// Create customer
export async function createCustomer(customer: PaystackCustomer): Promise<{ customer_code: string; id: number }> {
  try {
    validatePaystackConfig();

    const response = await paystackClient.post('/customer', customer);
    return response.data.data;
  } catch (error) {
    console.error('Failed to create customer:', error);
    throw new Error('Customer creation failed');
  }
}

// Get customer
export async function getCustomer(emailOrCode: string): Promise<unknown> {
  try {
    validatePaystackConfig();

    const identifier = emailOrCode.includes('@') ? `email=${emailOrCode}` : `customer=${emailOrCode}`;
    const response = await paystackClient.get(`/customer?${identifier}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to get customer:', error);
    throw new Error('Customer retrieval failed');
  }
}

// Create transfer recipient
export async function createTransferRecipient(options: {
  type: 'nuban';
  name: string;
  account_number: string;
  bank_code: string;
  currency?: string;
  description?: string;
}): Promise<{ recipient_code: string; id: number }> {
  try {
    validatePaystackConfig();

    const response = await paystackClient.post('/transferrecipient', {
      ...options,
      currency: options.currency || 'NGN',
    });

    return response.data.data;
  } catch (error) {
    console.error('Failed to create transfer recipient:', error);
    throw new Error('Transfer recipient creation failed');
  }
}

// Initiate transfer
export async function initiateTransfer(options: {
  source: 'balance';
  amount: number; // Amount in kobo
  recipient: string; // recipient_code
  reason?: string;
  reference?: string;
}): Promise<{ transfer_code: string; id: number }> {
  try {
    validatePaystackConfig();

    const response = await paystackClient.post('/transfer', {
      ...options,
      reference: options.reference || generateReference(),
    });

    return response.data.data;
  } catch (error) {
    console.error('Failed to initiate transfer:', error);
    throw new Error('Transfer initiation failed');
  }
}

// Get banks
export async function getBanks(country = 'nigeria'): Promise<Array<{ name: string; slug: string; code: string; longcode: string }>> {
  try {
    validatePaystackConfig();

    const response = await paystackClient.get(`/bank?country=${country}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to get banks:', error);
    throw new Error('Bank list retrieval failed');
  }
}

// Generate unique reference
function generateReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `fastbite-${timestamp}-${random}`;
}

// Webhook verification
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha512', paystackConfig.secretKey)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}

// Refund payment
export async function refundPayment(options: {
  reference: string;
  amount?: number; // Amount to refund in kobo, if not provided, full refund
}): Promise<{ status: boolean; message: string }> {
  try {
    validatePaystackConfig();

    const response = await paystackClient.post('/refund', {
      transaction: options.reference,
      amount: options.amount,
    });

    return {
      status: response.data.status,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Failed to process refund:', error);
    throw new Error('Refund processing failed');
  }
}

// Get transaction details
export async function getTransaction(reference: string): Promise<PaystackVerifyResponse['data']> {
  try {
    validatePaystackConfig();

    const response = await paystackClient.get(`/transaction/${reference}`);

    if (!response.data.status) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    console.error('Failed to get transaction:', error);
    throw new Error('Transaction retrieval failed');
  }
}