// Currency Utilities — Vualiku XP
// FJD formatting and conversion helpers

/**
 * Format a number as FJD currency
 */
export function formatFJD(amount: number): string {
    return new Intl.NumberFormat('en-FJ', {
        style: 'currency',
        currency: 'FJD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format price with compact notation for large numbers
 */
export function formatFJDCompact(amount: number): string {
    if (amount >= 1000) {
        return new Intl.NumberFormat('en-FJ', {
            style: 'currency',
            currency: 'FJD',
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(amount);
    }
    return formatFJD(amount);
}

/**
 * Format cents to FJD (for payment provider amounts stored in cents)
 */
export function centsToFJD(cents: number): string {
    return formatFJD(cents / 100);
}

/**
 * Get a simple price display with currency symbol
 * Returns "$120" format for inline use
 */
export function priceDisplay(amount: number, pricingType: 'per_head' | 'per_night' = 'per_head'): string {
    const formatted = formatFJD(amount);
    const suffix = pricingType === 'per_head' ? '/person' : '/night';
    return `${formatted} ${suffix}`;
}
