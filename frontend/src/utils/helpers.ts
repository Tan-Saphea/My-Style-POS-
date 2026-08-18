// ============================================================
// Helper Utilities
// ============================================================

/**
 * Map status strings to Ant Design Tag colors.
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    // General
    active: 'green',
    inactive: 'default',

    // Stock
    in_stock: 'green',
    low_stock: 'orange',
    out_of_stock: 'red',

    // Purchase
    draft: 'default',
    ordered: 'blue',
    received: 'green',
    cancelled: 'red',

    // Sale
    completed: 'green',
    refunded: 'orange',

    // Payment
    paid: 'green',
    partial: 'orange',
    unpaid: 'red',
    pending: 'blue',
    failed: 'red',
  };

  return colorMap[status] || 'default';
}

/**
 * Format status string for display.
 * "low_stock" → "Low Stock"
 */
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Create a debounced function.
 * Returns a function that delays invoking `fn` until after `delay` ms
 * have elapsed since the last invocation.
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generate a simple unique key for temporary client-side use.
 * NOT for security or database IDs.
 */
export function generateTempKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Payment method display labels.
 */
export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'Cash',
    aba_khqr: 'ABA KHQR',
    acleda: 'ACLEDA',
    wing: 'Wing',
    card: 'Card',
    bank_transfer: 'Bank Transfer',
  };
  return labels[method] || method;
}
