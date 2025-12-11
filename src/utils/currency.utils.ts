/**
 * Format a number as Vietnamese Dong (VND) with dot separators
 * @param amount - The amount to format
 * @returns Formatted string like "1.000.000 VND" or "FREE" if amount is 0 or null
 */
export function formatVND(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || amount === 0) {
    return 'FREE';
  }

  // Convert to integer and format with dot separators
  const formatted = Math.floor(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${formatted} VND`;
}

/**
 * Format a number as Vietnamese Dong (VND) with dot separators (always show amount, never show FREE)
 * @param amount - The amount to format
 * @returns Formatted string like "1.000.000 VND" or "0 VND" if amount is 0 or null
 */
export function formatVNDAlways(amount: number | null | undefined): string {
  const value = amount ?? 0;
  const formatted = Math.floor(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${formatted} VND`;
}
