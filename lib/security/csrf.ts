import { NextRequest, NextResponse } from "next/server";

/**
 * CSRF Protection Utility
 * Generates and validates CSRF tokens for form submissions
 * Uses Web Crypto API for Edge Runtime compatibility
 */

const CSRF_TOKEN_COOKIE = "csrf-token";
const CSRF_TOKEN_HEADER = "x-csrf-token";

/**
 * Generate a cryptographically secure CSRF token
 * Uses Web Crypto API (Edge Runtime compatible)
 */
export function generateCsrfToken(): string {
  // Generate 32 random bytes using Web Crypto API
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  
  // Convert to hex string
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Validate CSRF token from request
 */
export function validateCsrfToken(request: NextRequest): boolean {
  // Skip CSRF for safe methods (GET, HEAD, OPTIONS)
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return true;
  }

  // Skip CSRF for webhook endpoints (they use signature verification)
  if (request.nextUrl.pathname.startsWith("/api/webhooks/")) {
    return true;
  }

  // Get token from cookie
  const tokenFromCookie = request.cookies.get(CSRF_TOKEN_COOKIE)?.value;
  
  // Get token from header
  const tokenFromHeader = request.headers.get(CSRF_TOKEN_HEADER);

  // Both must exist and match
  if (!tokenFromCookie || !tokenFromHeader) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks (Edge Runtime compatible)
  // Simple constant-time string comparison
  if (tokenFromCookie.length !== tokenFromHeader.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < tokenFromCookie.length; i++) {
    result |= tokenFromCookie.charCodeAt(i) ^ tokenFromHeader.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Set CSRF token in response cookie
 */
export function setCsrfTokenCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

/**
 * Middleware wrapper for CSRF protection
 */
export function withCsrfProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Validate CSRF token
    const isValid = validateCsrfToken(request);

    if (!isValid) {
      return NextResponse.json(
        { 
          error: "CSRF token validation failed",
          message: "Invalid or missing CSRF token" 
        },
        { status: 403 }
      );
    }

    // Call original handler
    const response = await handler(request);

    // Generate new token for next request (token rotation)
    const newToken = generateCsrfToken();
    setCsrfTokenCookie(response, newToken);

    // Add token to response header for client to read
    response.headers.set(CSRF_TOKEN_HEADER, newToken);

    return response;
  };
}

/**
 * Get CSRF token from cookie for client-side usage
 * Call this from a server component or API route
 */
export function getCsrfToken(request: NextRequest): string {
  let token = request.cookies.get(CSRF_TOKEN_COOKIE)?.value;
  
  if (!token) {
    token = generateCsrfToken();
  }
  
  return token;
}
