import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Only run on Edge Runtime for Middleware
export const config = {
    matcher: '/api/:path*',
};

// Initialize Redis
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Configure different limiters
const limiters: Record<string, Ratelimit> = {
    'bookings/create': new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "60 s"),
    }),
    'ai/chat': new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "60 s"),
    }),
    'whatsapp/send': new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "60 s"),
    }),
    'default': new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "60 s"),
    }),
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only rate limit POST/PUT/DELETE for public APIs
    if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

        // Determine which limiter to use
        let limiterKey = 'default';
        if (pathname.includes('/bookings/create')) limiterKey = 'bookings/create';
        else if (pathname.includes('/ai/chat')) limiterKey = 'ai/chat';
        else if (pathname.includes('/whatsapp/send')) limiterKey = 'whatsapp/send';

        const limiter = limiters[limiterKey];
        const { success, limit, reset, remaining } = await limiter.limit(ip);

        if (!success) {
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded',
                    retryAfter: Math.floor((reset - Date.now()) / 1000)
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': remaining.toString(),
                        'X-RateLimit-Reset': reset.toString(),
                    }
                }
            );
        }
    }

    return NextResponse.next();
}
