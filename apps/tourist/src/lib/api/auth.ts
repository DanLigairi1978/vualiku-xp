// API Auth Helper — Vualiku XP
// Validates Firebase ID tokens on API routes to prevent unauthenticated access
// C2 fix: All API routes must call this before processing

import { NextRequest, NextResponse } from 'next/server';

// Admin email list — server-side only (not exposed to client bundle)
const ADMIN_EMAILS = [
    'ligarius22@gmail.com',
    'dbucks3671@gmail.com',
    'navareafarm@gmail.com',
    'bulutani@yahoo.com',
];

export interface AuthResult {
    authenticated: boolean;
    uid?: string;
    email?: string;
    isAdmin?: boolean;
    error?: NextResponse;
}

/**
 * Extracts and validates the Firebase ID token from the Authorization header.
 * For full production use, you should verify the token with Firebase Admin SDK.
 * This lightweight version decodes the JWT payload to extract uid/email.
 */
export function requireAuth(request: NextRequest): AuthResult {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            authenticated: false,
            error: NextResponse.json(
                { error: 'Authentication required. Please sign in.' },
                { status: 401 }
            ),
        };
    }

    try {
        const token = authHeader.split('Bearer ')[1];
        // Decode JWT payload (base64url) — this is a lightweight check.
        // For production, verify with Firebase Admin SDK's verifyIdToken()
        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(
            Buffer.from(payloadBase64, 'base64url').toString('utf-8')
        );

        const uid = payload.user_id || payload.sub;
        const email = payload.email || '';

        if (!uid) {
            return {
                authenticated: false,
                error: NextResponse.json(
                    { error: 'Invalid token: no user ID found' },
                    { status: 401 }
                ),
            };
        }

        return {
            authenticated: true,
            uid,
            email,
            isAdmin: ADMIN_EMAILS.includes(email),
        };
    } catch {
        return {
            authenticated: false,
            error: NextResponse.json(
                { error: 'Invalid or expired authentication token' },
                { status: 401 }
            ),
        };
    }
}

/**
 * Require that the request comes from an admin user.
 */
export function requireAdmin(request: NextRequest): AuthResult {
    const auth = requireAuth(request);
    if (!auth.authenticated) return auth;

    if (!auth.isAdmin) {
        return {
            authenticated: false,
            error: NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            ),
        };
    }

    return auth;
}

/**
 * Rate limiter — simple in-memory store (resets on server restart).
 * For production, use Redis or a persistent rate-limiting service.
 */
const rateLimitStore: Record<string, { count: number; resetAt: number }> = {};

export function rateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const entry = rateLimitStore[key];

    if (!entry || now > entry.resetAt) {
        rateLimitStore[key] = { count: 1, resetAt: now + windowMs };
        return true; // allowed
    }

    if (entry.count >= maxRequests) {
        return false; // rate limited
    }

    entry.count++;
    return true; // allowed
}

export function rateLimitResponse(): NextResponse {
    return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 }
    );
}
