import {
  type ClassValue,
  clsx,
} from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative url
    return '';
  }
  if (process.env.VERCEL_URL) {
    // SSR should use vercel url
    return `https://${process.env.VERCEL_URL}`;
  }
  // dev SSR should use localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

// VAT rate for South Africa
const VAT_RATE = 0.15;

/**
 * Calculate price including VAT
 * @param priceExclVAT - Price excluding VAT
 * @returns Price including 15% VAT
 */
export function calculatePriceWithVAT(priceExclVAT: number): number {
  return priceExclVAT * (1 + VAT_RATE);
}

/**
 * Calculate VAT amount
 * @param priceExclVAT - Price excluding VAT
 * @returns VAT amount
 */
export function calculateVATAmount(priceExclVAT: number): number {
  return priceExclVAT * VAT_RATE;
}

/**
 * Format price in South African Rand with VAT included
 * @param priceExclVAT - Price excluding VAT
 * @returns Formatted price string (e.g., "R15.99")
 */
export function formatPrice(priceExclVAT: number): string {
  const priceWithVAT = calculatePriceWithVAT(priceExclVAT);
  return `R${priceWithVAT.toFixed(2)}`;
}

/**
 * Format price breakdown showing excl VAT, VAT amount, and total
 * @param priceExclVAT - Price excluding VAT
 * @returns Object with formatted breakdown
 */
export function formatPriceBreakdown(priceExclVAT: number) {
  const vatAmount = calculateVATAmount(priceExclVAT);
  const total = calculatePriceWithVAT(priceExclVAT);

  return {
    exclVAT: `R${priceExclVAT.toFixed(2)}`,
    vatAmount: `R${vatAmount.toFixed(2)}`,
    total: `R${total.toFixed(2)}`,
  };
}
