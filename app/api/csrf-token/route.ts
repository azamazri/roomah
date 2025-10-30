import { NextRequest, NextResponse } from "next/server";
import { generateCsrfToken, setCsrfTokenCookie } from "@/lib/security/csrf";

/**
 * GET /api/csrf-token
 * Generate and return CSRF token for client-side usage
 */
export async function GET(request: NextRequest) {
  const token = generateCsrfToken();
  
  const response = NextResponse.json({
    token,
  });

  // Set token in cookie
  setCsrfTokenCookie(response, token);

  return response;
}
