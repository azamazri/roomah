import { PostgrestError } from "@supabase/supabase-js";

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Error codes for API responses
 */
export const ERROR_CODES = {
  // Auth errors
  AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  AUTH_EMAIL_ALREADY_EXISTS: "AUTH_EMAIL_ALREADY_EXISTS",
  AUTH_PHONE_ALREADY_EXISTS: "AUTH_PHONE_ALREADY_EXISTS",
  AUTH_INVALID_OTP: "AUTH_INVALID_OTP",
  AUTH_OTP_EXPIRED: "AUTH_OTP_EXPIRED",
  AUTH_NOT_AUTHENTICATED: "AUTH_NOT_AUTHENTICATED",
  AUTH_INSUFFICIENT_PERMISSIONS: "AUTH_INSUFFICIENT_PERMISSIONS",

  // Profile errors
  PROFILE_NOT_FOUND: "PROFILE_NOT_FOUND",
  PROFILE_UPDATE_FAILED: "PROFILE_UPDATE_FAILED",
  PROFILE_INCOMPLETE_ONBOARDING: "PROFILE_INCOMPLETE_ONBOARDING",

  // CV errors
  CV_NOT_FOUND: "CV_NOT_FOUND",
  CV_INVALID_CATEGORY: "CV_INVALID_CATEGORY",
  CV_MAX_ITEMS_EXCEEDED: "CV_MAX_ITEMS_EXCEEDED",

  // Taaruf errors
  TAARUF_INELIGIBLE: "TAARUF_INELIGIBLE",
  TAARUF_REQUEST_NOT_FOUND: "TAARUF_REQUEST_NOT_FOUND",
  TAARUF_ALREADY_CONNECTED: "TAARUF_ALREADY_CONNECTED",
  TAARUF_SAME_USER: "TAARUF_SAME_USER",

  // Payment errors
  PAYMENT_INSUFFICIENT_BALANCE: "PAYMENT_INSUFFICIENT_BALANCE",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_VERIFICATION_FAILED: "PAYMENT_VERIFICATION_FAILED",
  MIDTRANS_ERROR: "MIDTRANS_ERROR",

  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",

  // Database errors
  DATABASE_ERROR: "DATABASE_ERROR",
  CONCURRENT_MODIFICATION: "CONCURRENT_MODIFICATION",

  // Rate limiting
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",

  // Not found
  NOT_FOUND: "NOT_FOUND",

  // Server errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

/**
 * Handle Supabase/PostgreSQL errors and convert to AppError
 */
export function handleDatabaseError(error: unknown, context?: string): AppError {
  const pgError = error as PostgrestError;

  console.error(`Database error${context ? ` in ${context}` : ""}:`, error);

  // Handle common PostgreSQL errors
  if (pgError.code === "23505") {
    // Unique constraint violation
    if (pgError.message.includes("email")) {
      return new AppError(
        ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS,
        "Email sudah terdaftar",
        409
      );
    }
    if (pgError.message.includes("phone")) {
      return new AppError(
        ERROR_CODES.AUTH_PHONE_ALREADY_EXISTS,
        "Nomor telepon sudah terdaftar",
        409
      );
    }
    return new AppError(ERROR_CODES.DATABASE_ERROR, "Data sudah ada", 409);
  }

  if (pgError.code === "23503") {
    // Foreign key constraint violation
    return new AppError(
      ERROR_CODES.DATABASE_ERROR,
      "Data tidak valid",
      400
    );
  }

  if (pgError.code === "22001") {
    // String data right truncation
    return new AppError(
      ERROR_CODES.INVALID_INPUT,
      "Data terlalu panjang",
      400
    );
  }

  // Generic database error
  return new AppError(
    ERROR_CODES.DATABASE_ERROR,
    "Terjadi kesalahan pada database",
    500
  );
}

/**
 * Create a standardized API error response
 */
export function createErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      status: error.statusCode,
    };
  }

  if (error instanceof Error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Terjadi kesalahan yang tidak diharapkan",
      },
      status: 500,
    };
  }

  return {
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "Terjadi kesalahan yang tidak diharapkan",
    },
    status: 500,
  };
}

/**
 * Create a standardized successful API response
 */
export function createSuccessResponse<T>(data: T, status: number = 200) {
  return {
    success: true,
    data,
    status,
  };
}

/**
 * Validate input against schema and throw AppError if invalid
 */
export function validateInput<T>(
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: unknown } },
  data: unknown,
  context?: string
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.warn(`Validation error${context ? ` in ${context}` : ""}:`, result.error);
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "Data tidak valid",
      400,
      result.error
    );
  }

  return result.data as T;
}
