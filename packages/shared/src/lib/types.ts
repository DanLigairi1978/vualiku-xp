// Payment Provider Types — Vualiku XP
// Provider-abstract checkout layer for swappable payment backends

export interface LineItem {
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number; // in cents
    currency: 'USD' | 'FJD';
    imageUrl?: string;
}

export interface CreateSessionInput {
    items: LineItem[];
    customerEmail: string;
    customerName?: string;
    bookingId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
}

export interface CreateSessionResult {
    sessionId: string;
    checkoutUrl: string;
    provider: string;
}

export interface WebhookEvent {
    type: 'payment.completed' | 'payment.failed' | 'payment.refunded';
    sessionId: string;
    bookingId: string;
    amountPaid: number;
    currency: string;
    provider: string;
    raw: unknown;
}

export interface RefundInput {
    sessionId: string;
    amount?: number; // partial refund in cents, undefined = full refund
    reason?: string;
}

export interface RefundResult {
    refundId: string;
    status: 'succeeded' | 'pending' | 'failed';
    amount: number;
    currency: string;
}

export interface PaymentProvider {
    name: string;
    createCheckoutSession(input: CreateSessionInput): Promise<CreateSessionResult>;
    parseWebhookEvent(body: string, headers: Headers): Promise<WebhookEvent>;
    refund(input: RefundInput): Promise<RefundResult>;
}
