import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis for rate limiting
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in environment
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    analytics: true,
    prefix: "@upstash/ratelimit",
});

// Helper for specific routes
export const getRateLimiter = (requests: number, window = "60 s" as any) => {
    return new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(requests, window),
        analytics: true,
        prefix: "@upstash/ratelimit",
    });
};
