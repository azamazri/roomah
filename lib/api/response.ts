import { NextResponse } from "next/server";

export type APIResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    timestamp?: string;
  };
};

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: APIResponse<T>["meta"]
): NextResponse<APIResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse<APIResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

/**
 * Common error responses
 */
export const ApiErrors = {
  badRequest: (message = "Bad Request", details?: unknown) =>
    createErrorResponse("BAD_REQUEST", message, 400, details),

  unauthorized: (message = "Unauthorized") =>
    createErrorResponse("UNAUTHORIZED", message, 401),

  forbidden: (message = "Forbidden") =>
    createErrorResponse("FORBIDDEN", message, 403),

  notFound: (message = "Resource not found") =>
    createErrorResponse("NOT_FOUND", message, 404),

  methodNotAllowed: (message = "Method not allowed") =>
    createErrorResponse("METHOD_NOT_ALLOWED", message, 405),

  conflict: (message = "Resource conflict") =>
    createErrorResponse("CONFLICT", message, 409),

  tooManyRequests: (message = "Too many requests") =>
    createErrorResponse("TOO_MANY_REQUESTS", message, 429),

  internalError: (message = "Internal server error", details?: unknown) =>
    createErrorResponse("INTERNAL_ERROR", message, 500, details),

  serviceUnavailable: (message = "Service temporarily unavailable") =>
    createErrorResponse("SERVICE_UNAVAILABLE", message, 503),
};
