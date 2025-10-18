import { NextRequest } from "next/server";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

// In-memory store (use Redis in production)
const requestCounts = new Map<
  string,
  { count: number; resetTime: number }
>();

/**
 * Simple in-memory rate limiter
 * For production, use Redis or a dedicated rate limiting service
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  }
): { allowed: boolean; remaining: number; resetTime: number } {
  // Get client identifier (IP address)
  const identifier =
    request.ip ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const record = requestCounts.get(identifier);

  // Clean up old entries periodically
  if (requestCounts.size > 10000) {
    for (const [key, value] of requestCounts.entries()) {
      if (value.resetTime < now) {
        requestCounts.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    // New window
    const resetTime = now + config.windowMs;
    requestCounts.set(identifier, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  if (record.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Increment count
  record.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Rate limiter middleware wrapper
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  config?: RateLimitConfig
) {
  return async (request: NextRequest): Promise<Response> => {
    const { allowed, remaining, resetTime } = checkRateLimit(request, config);

    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: "Too many requests",
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": config?.maxRequests.toString() || "100",
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": resetTime.toString(),
          },
        }
      );
    }

    const response = await handler(request);

    // Add rate limit headers to response
    response.headers.set(
      "X-RateLimit-Limit",
      config?.maxRequests.toString() || "100"
    );
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", resetTime.toString());

    return response;
  };
}
