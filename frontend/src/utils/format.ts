import dayjs from 'dayjs';

// ============================================================
// Formatting Utilities
// Reusable formatters for currency, dates, and numbers
// ============================================================

/**
 * Format a number as currency.
 * Default: USD with 2 decimal places.
 * Do NOT use formatted strings for internal calculations.
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string.
 * Example: "15 Aug 2026"
 */
export function formatDate(date: string | Date): string {
  return dayjs(date).format('DD MMM YYYY');
}

/**
 * Format a date string with time.
 * Example: "15 Aug 2026, 10:30 PM"
 */
export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('DD MMM YYYY, hh:mm A');
}

/**
 * Format a number with commas.
 * Example: 1234567 → "1,234,567"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format a percentage.
 * Example: 0.156 → "15.6%"
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
