import { z } from "zod";

/**
 * API Request Validation Schemas using Zod
 * Used for validating incoming API requests
 */

// ============================================================================
// TAARUF SCHEMAS
// ============================================================================

export const ajukanTaarufSchema = z.object({
  toUserId: z.string().uuid("Invalid user ID format"),
});

export const acceptTaarufSchema = z.object({
  requestId: z.string().uuid("Invalid request ID format"),
});

export const rejectTaarufSchema = z.object({
  requestId: z.string().uuid("Invalid request ID format"),
  rejectReason: z.string().max(500, "Reason too long").optional(),
});

// ============================================================================
// KOIN/PAYMENT SCHEMAS
// ============================================================================

export const createKoinTransactionSchema = z.object({
  packageId: z.enum(["PACKAGE_5", "PACKAGE_10", "PACKAGE_100"], {
    errorMap: () => ({ message: "Invalid package ID" }),
  }),
});

export const confirmPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

// ============================================================================
// CV SCHEMAS
// ============================================================================

export const uploadAvatarSchema = z.object({
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= 1024 * 1024, "File size must be less than 1MB")
    .refine(
      (file) => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type),
      "File must be JPG, PNG, or WebP"
    ),
});

// ============================================================================
// ADMIN SCHEMAS
// ============================================================================

export const approveRejectCvSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  feedback: z.string().max(1000, "Feedback too long").optional(),
});

export const scheduleTaarufZoomSchema = z.object({
  taarufId: z.string().uuid("Invalid taaruf ID format"),
  stage: z.enum(["Zoom 1", "Zoom 2", "Zoom 3"], {
    errorMap: () => ({ message: "Invalid stage" }),
  }),
  meetingDatetime: z.string().datetime("Invalid datetime format"),
  zoomLink: z.string().url("Invalid URL format"),
  notes: z.string().max(500, "Notes too long").optional(),
});

export const updateTaarufStageSchema = z.object({
  taarufId: z.string().uuid("Invalid taaruf ID format"),
  newStage: z.enum(["Zoom 1", "Zoom 2", "Zoom 3", "Khitbah", "Selesai"], {
    errorMap: () => ({ message: "Invalid stage" }),
  }),
});

// ============================================================================
// SOCIAL MEDIA SCHEMAS
// ============================================================================

export const requestSocialMediaPostSchema = z.object({
  // No body needed, uses authenticated user
});

export const approveSocialMediaPostSchema = z.object({
  postId: z.string().uuid("Invalid post ID format"),
});

export const rejectSocialMediaPostSchema = z.object({
  postId: z.string().uuid("Invalid post ID format"),
});

// ============================================================================
// HELPER: Validate and parse request body
// ============================================================================

export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const errorMessage = result.error.errors.map((e) => e.message).join(", ");
      return {
        success: false,
        error: errorMessage,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      error: "Invalid JSON body",
    };
  }
}
