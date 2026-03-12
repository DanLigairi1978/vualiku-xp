// PayMongo Payment Provider — Vualiku XP
// SE Asia / Pacific payment gateway alternative
// Docs: https://developers.paymongo.com

import type {
    PaymentProvider,
    CreateSessionInput,
    CreateSessionResult,
    WebhookEvent,
    RefundInput,
    RefundResult,
} from '@danligairi1978/shared';

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY || '';

export class PayMongoProvider implements PaymentProvider {
    name = 'paymongo';

    private getAuthHeader(): string {
        return `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`;
    }

    async createCheckoutSession(input: CreateSessionInput): Promise<CreateSessionResult> {
        if (!PAYMONGO_SECRET_KEY) {
            throw new Error(
                'PAYMONGO_SECRET_KEY is not configured. ' +
                'Add it to .env.local or switch PAYMENT_PROVIDER to another provider.'
            );
        }

        const lineItems = input.items.map((item) => ({
            name: item.name,
            description: item.description || '',
            amount: item.unitPrice, // PayMongo uses cents
            currency: item.currency,
            quantity: item.quantity,
            images: item.imageUrl ? [item.imageUrl] : [],
        }));

        const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: this.getAuthHeader(),
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        line_items: lineItems,
                        payment_method_types: ['card', 'gcash', 'grab_pay'],
                        success_url: input.successUrl,
                        cancel_url: input.cancelUrl,
                        description: `Vualiku XP Booking: ${input.bookingId}`,
                        reference_number: input.bookingId,
                        metadata: {
                            ...input.metadata,
                            bookingId: input.bookingId,
                        },
                    },
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`PayMongo createCheckoutSession failed: ${response.status} — ${error}`);
        }

        const data = await response.json();
        const session = data.data;

        return {
            sessionId: session.id,
            checkoutUrl: session.attributes.checkout_url,
            provider: this.name,
        };
    }

    async parseWebhookEvent(body: string, _headers: Headers): Promise<WebhookEvent> {
        // PayMongo sends webhook events for payment status changes
        const payload = JSON.parse(body);
        const eventType = payload.data?.attributes?.type || '';
        const resource = payload.data?.attributes?.data || {};

        let type: WebhookEvent['type'] = 'payment.failed';
        if (eventType === 'checkout_session.payment.paid') {
            type = 'payment.completed';
        } else if (eventType === 'payment.refunded') {
            type = 'payment.refunded';
        }

        const attributes = resource.attributes || {};

        return {
            type,
            sessionId: resource.id || '',
            bookingId: attributes.metadata?.bookingId || attributes.reference_number || '',
            amountPaid: attributes.amount || 0,
            currency: attributes.currency || 'USD',
            provider: this.name,
            raw: payload,
        };
    }

    async refund(input: RefundInput): Promise<RefundResult> {
        if (!PAYMONGO_SECRET_KEY) {
            throw new Error('PAYMONGO_SECRET_KEY is not configured.');
        }

        const response = await fetch('https://api.paymongo.com/v1/refunds', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: this.getAuthHeader(),
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        payment_id: input.sessionId,
                        amount: input.amount, // In cents, undefined = full
                        reason: input.reason || 'requested_by_customer',
                    },
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`PayMongo refund failed: ${response.status} — ${error}`);
        }

        const data = await response.json();
        const refund = data.data;

        return {
            refundId: refund.id,
            status: refund.attributes.status === 'succeeded' ? 'succeeded' : 'pending',
            amount: refund.attributes.amount || 0,
            currency: refund.attributes.currency || 'USD',
        };
    }
}
