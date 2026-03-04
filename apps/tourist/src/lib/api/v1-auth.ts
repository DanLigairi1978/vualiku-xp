import { NextRequest, NextResponse } from 'next/server';

export interface V1AuthResult {
    authenticated: boolean;
    partnerId?: string;
    error?: NextResponse;
}

/**
 * Validates the API key for external B2B partners accessing the Distribution API (v1).
 * Expects the API key in the `X-API-Key` header or `Authorization: Bearer <token>`.
 */
export function requireApiKey(request: NextRequest): V1AuthResult {
    // 1. Check X-API-Key header
    let apiKey = request.headers.get('X-API-Key');

    // 2. Fallback to Authorization: Bearer <key>
    if (!apiKey) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            apiKey = authHeader.split('Bearer ')[1];
        }
    }

    if (!apiKey) {
        return {
            authenticated: false,
            error: NextResponse.json(
                { error: 'Missing API Key. Please provide an X-API-Key header.' },
                { status: 401 }
            ),
        };
    }

    // Replace this with an actual database lookup or environment variable comma-separated list
    // For now, we use a master environment variable for the prototype.
    const validKeys = (process.env.DISTRIBUTION_API_KEYS || 'test-partner-key-12345').split(',');

    if (!validKeys.includes(apiKey.trim())) {
        return {
            authenticated: false,
            error: NextResponse.json(
                { error: 'Invalid API Key' },
                { status: 403 }
            ),
        };
    }

    return {
        authenticated: true,
        // Since we don't have a DB of partners mapped to keys yet, we'll just mock a partnerId
        partnerId: 'partner_' + apiKey.substring(0, 5),
    };
}
