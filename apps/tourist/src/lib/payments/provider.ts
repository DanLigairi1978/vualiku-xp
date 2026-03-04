// Payment Provider Factory — Vualiku XP
// Reads PAYMENT_PROVIDER from env and returns the active provider implementation

import type { PaymentProvider } from '@vualiku/shared';

export function getPaymentProvider(): PaymentProvider {
    const providerName = process.env.PAYMENT_PROVIDER || 'paydock';

    switch (providerName.toLowerCase()) {
        case 'windcave': {
            const { WindcaveProvider } = require('./windcave');
            return new WindcaveProvider();
        }

        case 'paymongo': {
            const { PayMongoProvider } = require('./paymongo');
            return new PayMongoProvider();
        }

        default:
            throw new Error(
                `Unknown PAYMENT_PROVIDER: "${providerName}". ` +
                `Supported values: windcave, paymongo. ` +
                `Set PAYMENT_PROVIDER in .env.local`
            );
    }
}

// Re-export types for convenience
export type { PaymentProvider, CreateSessionInput, CreateSessionResult, WebhookEvent, RefundInput, RefundResult, LineItem } from '@vualiku/shared';
