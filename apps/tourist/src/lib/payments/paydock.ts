// Paydock Payment Provider — Vualiku XP
// Pacific Region payment gateway with FJD payout support
// Docs: https://docs.paydock.com

import type {
    PaymentProvider,
    CreateSessionInput,
    CreateSessionResult,
    WebhookEvent,
    RefundInput,
    RefundResult,
} from './types';

const PAYDOCK_API_URL = process.env.PAYDOCK_API_URL || 'https://api.paydock.com/v1';
const PAYDOCK_SECRET_KEY = process.env.PAYDOCK_SECRET_KEY || '';
const PAYDOCK_PUBLIC_KEY = process.env.PAYDOCK_PUBLIC_KEY || '';

export class PaydockProvider implements PaymentProvider {
    name = 'paydock';

    async createCheckoutSession(input: CreateSessionInput): Promise<CreateSessionResult> {
        if (!PAYDOCK_SECRET_KEY) {
            throw new Error(
                'PAYDOCK_SECRET_KEY is not configured. ' +
                'Add it to .env.local or switch PAYMENT_PROVIDER to another provider.'
            );
        }

        const totalAmount = input.items.reduce(
            (sum, item) => sum + item.unitPrice * item.quantity,
            0
        );

        const response = await fetch(`${PAYDOCK_API_URL}/charges`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-secret-key': PAYDOCK_SECRET_KEY,
            },
            body: JSON.stringify({
                amount: totalAmount / 100, // Paydock uses decimal, not cents
                currency: input.items[0]?.currency || 'FJD',
                reference: input.bookingId,
                description: `Vualiku XP Booking: ${input.bookingId}`,
                customer: {
                    email: input.customerEmail,
                    first_name: input.customerName?.split(' ')[0] || '',
                    last_name: input.customerName?.split(' ').slice(1).join(' ') || '',
                },
                meta: {
                    ...input.metadata,
                    bookingId: input.bookingId,
                    successUrl: input.successUrl,
                    cancelUrl: input.cancelUrl,
                },
                // Paydock checkout page configuration
                checkout: {
                    redirect_url: input.successUrl,
                    error_redirect_url: input.cancelUrl,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Paydock createCharge failed: ${response.status} — ${error}`);
        }

        const data = await response.json();

        return {
            sessionId: data.resource?.data?._id || data.resource?.data?.charge_id || '',
            checkoutUrl: data.resource?.data?.checkout_link || input.successUrl,
            provider: this.name,
        };
    }

    async parseWebhookEvent(body: string, headers: Headers): Promise<WebhookEvent> {
        // Paydock sends webhook notifications for transaction events
        // Verify webhook signature in production using x-webhook-signature header
        const payload = JSON.parse(body);
        const event = payload.event || payload.data?.event || '';
        const transaction = payload.data || payload;

        let type: WebhookEvent['type'] = 'payment.failed';
        if (event === 'transaction_success' || event === 'transaction.success') {
            type = 'payment.completed';
        } else if (event === 'refund_success' || event === 'refund.success') {
            type = 'payment.refunded';
        }

        return {
            type,
            sessionId: transaction._id || transaction.charge_id || '',
            bookingId: transaction.meta?.bookingId || transaction.reference || '',
            amountPaid: Math.round((transaction.amount || 0) * 100), // Convert to cents
            currency: transaction.currency || 'FJD',
            provider: this.name,
            raw: payload,
        };
    }

    async refund(input: RefundInput): Promise<RefundResult> {
        if (!PAYDOCK_SECRET_KEY) {
            throw new Error('PAYDOCK_SECRET_KEY is not configured.');
        }

        const response = await fetch(`${PAYDOCK_API_URL}/charges/${input.sessionId}/refunds`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-secret-key': PAYDOCK_SECRET_KEY,
            },
            body: JSON.stringify({
                amount: input.amount ? input.amount / 100 : undefined, // Full refund if no amount
                reason: input.reason || 'Customer requested cancellation',
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Paydock refund failed: ${response.status} — ${error}`);
        }

        const data = await response.json();

        return {
            refundId: data.resource?.data?._id || '',
            status: 'succeeded',
            amount: input.amount || 0,
            currency: data.resource?.data?.currency || 'FJD',
        };
    }
}
