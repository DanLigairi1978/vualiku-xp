// Windcave (PxPay) Provider — Vualiku XP
// Implements the PaymentProvider interface for Windcave PxPay 2.0

import {
    PaymentProvider,
    CreateSessionInput,
    CreateSessionResult,
    WebhookEvent,
    RefundInput,
    RefundResult
} from '@danligairi1978/shared';

export class WindcaveProvider implements PaymentProvider {
    name = 'windcave';

    private userId = process.env.WINDCAVE_USERNAME;
    private apiKey = process.env.WINDCAVE_API_KEY;
    private apiUrl = process.env.WINDCAVE_API_URL || 'https://sec.windcave.com/pxaccess/pxpay.aspx';

    /**
     * Creates a Windcave PxPay session by sending a GenerateRequest XML.
     */
    async createCheckoutSession(input: CreateSessionInput): Promise<CreateSessionResult> {
        const totalAmount = input.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) / 100;

        // PxPay 2.0 GenerateRequest XML
        const xml = `
<GenerateRequest>
    <PxPayUserId>${this.userId}</PxPayUserId>
    <PxPayKey>${this.apiKey}</PxPayKey>
    <AmountInput>${totalAmount.toFixed(2)}</AmountInput>
    <CurrencyInput>${input.items[0]?.currency || 'FJD'}</CurrencyInput>
    <MerchantReference>${input.bookingId}</MerchantReference>
    <UrlSuccess>${input.successUrl}</UrlSuccess>
    <UrlFail>${input.cancelUrl}</UrlFail>
    <TxnType>Purchase</TxnType>
    <TxnData1>${input.bookingId}</TxnData1>
    <TxnData2>${input.customerEmail}</TxnData2>
    <TxnData3>${input.customerName || ''}</TxnData3>
</GenerateRequest>`.trim();

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            body: xml,
            headers: { 'Content-Type': 'application/xml' }
        });

        const responseText = await response.text();

        // Basic XML extraction (avoiding heavy XML parsers for simple response)
        const valid = responseText.match(/<Request valid="(\d)">/)?.[1] === '1';
        const redirectUrl = responseText.match(/<URI>([^<]+)<\/URI>/)?.[1];

        if (!valid || !redirectUrl) {
            console.error('[Windcave] Session Creation Failed:', responseText);
            throw new Error('Failed to create Windcave checkout session');
        }

        return {
            sessionId: input.bookingId, // Windcave doesn't give a "session id" in the response, we use MerchantReference
            checkoutUrl: redirectUrl.replace(/&amp;/g, '&'),
            provider: 'windcave'
        };
    }

    /**
     * Parses the response from Windcave after the user is redirected back.
     * Note: PxPay 1.0/2.0 uses a ProcessResponse request to decrypt the 'result' parameter.
     */
    async parseWebhookEvent(body: string, headers: Headers): Promise<WebhookEvent> {
        // In Windcave's case, the "body" passed here will be the 'result' encrypted string from the URL query
        const xml = `
<ProcessResponse>
    <PxPayUserId>${this.userId}</PxPayUserId>
    <PxPayKey>${this.apiKey}</PxPayKey>
    <Response>${body}</Response>
</ProcessResponse>`.trim();

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            body: xml,
            headers: { 'Content-Type': 'application/xml' }
        });

        const responseText = await response.text();

        const success = responseText.match(/<Success>(\d)<\/Success>/)?.[1] === '1';
        const bookingId = responseText.match(/<MerchantReference>([^<]+)<\/MerchantReference>/)?.[1] || '';
        const amount = parseFloat(responseText.match(/<AmountSettlement>([^<]+)<\/AmountSettlement>/)?.[1] || '0');
        const currency = responseText.match(/<CurrencySetter>([^<]+)<\/CurrencySetter>/)?.[1] || 'FJD';
        const txnId = responseText.match(/<TxnId>([^<]+)<\/TxnId>/)?.[1] || '';

        return {
            type: success ? 'payment.completed' : 'payment.failed',
            sessionId: txnId,
            bookingId,
            amountPaid: Math.round(amount * 100),
            currency,
            provider: 'windcave',
            raw: responseText
        };
    }

    /**
     * Refunds are typically handled via the PxPost API, not PxPay.
     * Placeholder for future implementation.
     */
    async refund(input: RefundInput): Promise<RefundResult> {
        console.warn('[Windcave] Refund called - PxPost integration required');
        return {
            refundId: 'pending_pxpost',
            status: 'pending',
            amount: input.amount || 0,
            currency: 'FJD'
        };
    }
}
