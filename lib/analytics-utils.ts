import {
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

/**
 * Analytics utility functions for calculating trends and formatting
 */

export interface TrendData {
  current: number;
  previous: number;
  percentage: number;
  isIncrease: boolean;
  formattedPercentage: string;
}

export interface AnalyticsTrends {
  totalOrders: TrendData;
  totalRevenue: TrendData;
  activeUsers: TrendData;
  avgOrderValue: TrendData;
}

/**
 * Calculate percentage change between current and previous values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Format percentage with sign and proper rounding
 */
export function formatPercentage(percentage: number): string {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(1)}%`;
}

/**
 * Create trend data object
 */
export function createTrendData(current: number, previous: number): TrendData {
  const percentage = calculatePercentageChange(current, previous);
  const isIncrease = percentage >= 0;

  return {
    current,
    previous,
    percentage,
    isIncrease,
    formattedPercentage: formatPercentage(percentage),
  };
}

/**
 * Calculate analytics trends by comparing current period with previous period
 */
export function calculateAnalyticsTrends(
  currentAnalytics: {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    averageOrderValue: number;
  },
  previousAnalytics?: {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    averageOrderValue: number;
  }
): AnalyticsTrends {
  // Use dummy previous data if not provided (for demo purposes)
  const prev = previousAnalytics || {
    totalOrders: Math.max(0, currentAnalytics.totalOrders - Math.floor(currentAnalytics.totalOrders * 0.12)),
    totalRevenue: Math.max(0, currentAnalytics.totalRevenue - Math.floor(currentAnalytics.totalRevenue * 0.08)),
    totalUsers: Math.max(0, currentAnalytics.totalUsers - Math.floor(currentAnalytics.totalUsers * 0.15)),
    averageOrderValue: Math.max(0, currentAnalytics.averageOrderValue - Math.floor(currentAnalytics.averageOrderValue * 0.03)),
  };

  return {
    totalOrders: createTrendData(currentAnalytics.totalOrders, prev.totalOrders),
    totalRevenue: createTrendData(currentAnalytics.totalRevenue, prev.totalRevenue),
    activeUsers: createTrendData(currentAnalytics.totalUsers, prev.totalUsers),
    avgOrderValue: createTrendData(currentAnalytics.averageOrderValue, prev.averageOrderValue),
  };
}

/**
 * Get trend icon and color based on trend data
 */
export function getTrendIndicator(trend: TrendData) {
  const Icon = trend.isIncrease ? TrendingUp : TrendingDown;
  const colorClass = trend.isIncrease ? 'text-green-600' : 'text-red-600';

  return {
    Icon,
    colorClass,
    text: trend.formattedPercentage,
  };
}

/**
 * Format currency value
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount);
}

/**
 * Format large numbers with K/M suffixes
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}