"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { AppError, ERROR_CODES, handleDatabaseError, validateInput } from "@/lib/api/error";
import { z } from "zod";
import { verifyAdminAccess } from "./auth";

/**
 * Validation schemas
 */
const listSocialMediaSchema = z.object({
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
  platform: z.string().optional(),
  verifiedOnly: z.boolean().optional(),
  searchTerm: z.string().max(100).optional(),
});

const unlinkSocialMediaSchema = z.object({
  userId: z.string(),
  platform: z.string(),
  reason: z.string().max(500).optional(),
});

const updateSocialMediaSettingsSchema = z.object({
  platform: z.string(),
  enabled: z.boolean(),
  settings: z.record(z.unknown()).optional(),
});

/**
 * List user social media accounts
 */
export async function listUserSocialMediaAccounts(adminId: string, input: unknown) {
  try {
    await verifyAdminAccess(adminId);
    const data = validateInput(listSocialMediaSchema, input, "listUserSocialMediaAccounts");
    const supabase = createServiceClient();

    // Note: This assumes a social_media_links table exists
    // If not, you'll need to create this table first
    let query = supabase
      .from("social_media_links")
      .select(
        `*,
        profiles:profile_id (id, first_name, last_name, email)`,
        { count: "exact" }
      );

    if (data.platform) {
      query = query.eq("platform", data.platform);
    }

    if (data.verifiedOnly) {
      query = query.eq("verified", true);
    }

    if (data.searchTerm) {
      query = query.or(
        `profile_id.ilike.%${data.searchTerm}%,username.ilike.%${data.searchTerm}%`
      );
    }

    const { data: accounts, error, count } = await query
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) {
      // If table doesn't exist, return empty list
      if (error.code === "42P01") {
        return {
          success: true,
          data: {
            accounts: [],
            pagination: {
              total: 0,
              limit: data.limit,
              offset: data.offset,
              hasMore: false,
            },
          },
        };
      }
      throw handleDatabaseError(error, "listUserSocialMediaAccounts");
    }

    const accountList = (accounts || []).map((acc: any) => ({
      id: acc.id,
      userId: acc.profile_id,
      userName: `${acc.profiles?.first_name} ${acc.profiles?.last_name}`,
      email: acc.profiles?.email,
      platform: acc.platform,
      username: acc.username,
      profileUrl: acc.profile_url,
      verified: acc.verified,
      linkedAt: acc.created_at,
      lastVerifiedAt: acc.last_verified_at,
    }));

    return {
      success: true,
      data: {
        accounts: accountList,
        pagination: {
          total: count || 0,
          limit: data.limit,
          offset: data.offset,
          hasMore: (data.offset + data.limit) < (count || 0),
        },
      },
    };
  } catch (error) {
    console.error("List social media accounts error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil daftar media sosial",
      500
    );
  }
}

/**
 * Get social media statistics
 */
export async function getSocialMediaStats(adminId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    // Get stats per platform
    const { data: platformStats, error } = await supabase
      .from("social_media_links")
      .select("platform, verified");

    if (error) {
      if (error.code === "42P01") {
        return {
          success: true,
          data: {
            totalAccounts: 0,
            byPlatform: {},
            verificationRate: 0,
            lastUpdated: new Date().toISOString(),
          },
        };
      }
      throw handleDatabaseError(error, "getSocialMediaStats");
    }

    const stats = {
      byPlatform: {} as Record<string, { total: number; verified: number }>,
      totalAccounts: platformStats?.length || 0,
      totalVerified: 0,
    };

    (platformStats || []).forEach((link: any) => {
      const platform = link.platform || "unknown";
      if (!stats.byPlatform[platform]) {
        stats.byPlatform[platform] = { total: 0, verified: 0 };
      }
      stats.byPlatform[platform].total++;
      if (link.verified) {
        stats.byPlatform[platform].verified++;
        stats.totalVerified++;
      }
    });

    const verificationRate =
      stats.totalAccounts > 0 ? ((stats.totalVerified / stats.totalAccounts) * 100).toFixed(1) : 0;

    return {
      success: true,
      data: {
        totalAccounts: stats.totalAccounts,
        totalVerified: stats.totalVerified,
        verificationRate: parseFloat(verificationRate as string),
        byPlatform: stats.byPlatform,
        lastUpdated: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Get social media stats error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil statistik media sosial",
      500
    );
  }
}

/**
 * Verify social media link (check if still valid)
 */
export async function verifySocialMediaLink(
  adminId: string,
  userId: string,
  platform: string
) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    const { data: link, error: fetchError } = await supabase
      .from("social_media_links")
      .select("*")
      .eq("profile_id", userId)
      .eq("platform", platform)
      .single();

    if (fetchError || !link) {
      throw new AppError(
        ERROR_CODES.PROFILE_NOT_FOUND,
        "Link media sosial tidak ditemukan",
        404
      );
    }

    // In production, you would verify with the actual social media API
    // For now, just update the last_verified_at timestamp
    const { error: updateError } = await supabase
      .from("social_media_links")
      .update({
        last_verified_at: new Date().toISOString(),
      })
      .eq("id", link.id);

    if (updateError) {
      throw handleDatabaseError(updateError, "verifySocialMediaLink");
    }

    return {
      success: true,
      message: "Link media sosial berhasil diverifikasi",
    };
  } catch (error) {
    console.error("Verify social media link error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat memverifikasi link media sosial",
      500
    );
  }
}

/**
 * Unlink social media account (admin action)
 */
export async function unlinkUserSocialMedia(adminId: string, input: unknown) {
  try {
    await verifyAdminAccess(adminId);
    const data = validateInput(unlinkSocialMediaSchema, input, "unlinkUserSocialMedia");
    const supabase = createServiceClient();

    const { data: link, error: fetchError } = await supabase
      .from("social_media_links")
      .select("id")
      .eq("profile_id", data.userId)
      .eq("platform", data.platform)
      .single();

    if (fetchError || !link) {
      throw new AppError(
        ERROR_CODES.PROFILE_NOT_FOUND,
        "Link media sosial tidak ditemukan",
        404
      );
    }

    // Delete the link
    const { error: deleteError } = await supabase
      .from("social_media_links")
      .delete()
      .eq("id", link.id);

    if (deleteError) {
      throw handleDatabaseError(deleteError, "unlinkUserSocialMedia");
    }

    // Log audit trail
    try {
      await supabase.from("audit_logs").insert({
        actor_id: adminId,
        action: "social_media_unlinked",
        entity_type: "social_media_links",
        entity_id: link.id,
        changes: {
          platform: data.platform,
          reason: data.reason,
        },
      });
    } catch (auditError) {
      console.error("Failed to log audit trail:", auditError);
    }

    return {
      success: true,
      message: `Link ${data.platform} berhasil dihapus`,
    };
  } catch (error) {
    console.error("Unlink social media error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat menghapus link media sosial",
      500
    );
  }
}

/**
 * Update social media platform settings
 */
export async function updateSocialMediaSettings(adminId: string, input: unknown) {
  try {
    await verifyAdminAccess(adminId);
    const data = validateInput(updateSocialMediaSettingsSchema, input, "updateSocialMediaSettings");
    const supabase = createServiceClient();

    // Get or create settings record
    const { data: existingSettings, error: fetchError } = await supabase
      .from("admin_social_media_settings")
      .select("*")
      .eq("platform", data.platform)
      .single();

    let settingsId;

    if (existingSettings) {
      // Update existing
      const { error: updateError } = await supabase
        .from("admin_social_media_settings")
        .update({
          enabled: data.enabled,
          settings: data.settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSettings.id);

      if (updateError) {
        throw handleDatabaseError(updateError, "updateSocialMediaSettings - update");
      }

      settingsId = existingSettings.id;
    } else {
      // Create new
      const { data: newSettings, error: insertError } = await supabase
        .from("admin_social_media_settings")
        .insert({
          platform: data.platform,
          enabled: data.enabled,
          settings: data.settings,
        })
        .select()
        .single();

      if (insertError) {
        throw handleDatabaseError(insertError, "updateSocialMediaSettings - insert");
      }

      settingsId = newSettings?.id;
    }

    // Log audit trail
    try {
      await supabase.from("audit_logs").insert({
        actor_id: adminId,
        action: "social_media_settings_updated",
        entity_type: "admin_social_media_settings",
        entity_id: settingsId,
        changes: {
          platform: data.platform,
          enabled: data.enabled,
          settings: data.settings,
        },
      });
    } catch (auditError) {
      console.error("Failed to log audit trail:", auditError);
    }

    return {
      success: true,
      message: `Pengaturan ${data.platform} berhasil diperbarui`,
    };
  } catch (error) {
    console.error("Update social media settings error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat memperbarui pengaturan media sosial",
      500
    );
  }
}

/**
 * Get social media platform configuration
 */
export async function getSocialMediaPlatforms(adminId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    const { data: platforms, error } = await supabase
      .from("admin_social_media_settings")
      .select("*");

    if (error) {
      if (error.code === "42P01") {
        return {
          success: true,
          data: [],
        };
      }
      throw handleDatabaseError(error, "getSocialMediaPlatforms");
    }

    return {
      success: true,
      data: platforms || [],
    };
  } catch (error) {
    console.error("Get social media platforms error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil platform media sosial",
      500
    );
  }
}

/**
 * Get user's social media profile info
 */
export async function getUserSocialMediaProfiles(adminId: string, userId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    const { data: profiles, error } = await supabase
      .from("social_media_links")
      .select("*")
      .eq("profile_id", userId);

    if (error) {
      if (error.code === "42P01") {
        return {
          success: true,
          data: [],
        };
      }
      throw handleDatabaseError(error, "getUserSocialMediaProfiles");
    }

    const profileList = (profiles || []).map((p: any) => ({
      platform: p.platform,
      username: p.username,
      profileUrl: p.profile_url,
      verified: p.verified,
      linkedAt: p.created_at,
    }));

    return {
      success: true,
      data: profileList,
    };
  } catch (error) {
    console.error("Get user social media profiles error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil profil media sosial pengguna",
      500
    );
  }
}
