"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { AppError, ERROR_CODES, handleDatabaseError, validateInput } from "@/lib/api/error";
import { z } from "zod";
import { verifyAdminAccess } from "./auth";

/**
 * Validation schemas
 */
const updatePlatformSettingsSchema = z.object({
  setting_key: z.string().min(1, "Setting key tidak boleh kosong"),
  setting_value: z.record(z.unknown()).optional(),
  description: z.string().optional(),
});

const updateFeatureFlagSchema = z.object({
  flag_name: z.string().min(1, "Flag name tidak boleh kosong"),
  enabled: z.boolean(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  targetAudience: z.string().optional(),
});

const getSystemLogsSchema = z.object({
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
  action: z.string().optional(),
  actorId: z.string().optional(),
});

/**
 * Get all platform settings
 */
export async function getPlatformSettings(adminId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    const { data: settings, error } = await supabase
      .from("admin_platform_settings")
      .select("*");

    if (error) {
      if (error.code === "42P01") {
        return {
          success: true,
          data: {},
        };
      }
      throw handleDatabaseError(error, "getPlatformSettings");
    }

    // Convert array to object
    const settingsObj: Record<string, unknown> = {};
    (settings || []).forEach((s: any) => {
      settingsObj[s.setting_key] = s.setting_value;
    });

    return {
      success: true,
      data: settingsObj,
    };
  } catch (error) {
    console.error("Get platform settings error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil pengaturan platform",
      500
    );
  }
}

/**
 * Update platform setting
 */
export async function updatePlatformSetting(adminId: string, input: unknown) {
  try {
    await verifyAdminAccess(adminId);
    const data = validateInput(updatePlatformSettingsSchema, input, "updatePlatformSetting");
    const supabase = createServiceClient();

    const { data: existingSetting, error: fetchError } = await supabase
      .from("admin_platform_settings")
      .select("*")
      .eq("setting_key", data.setting_key)
      .single();

    let settingId;

    if (existingSetting) {
      const { error: updateError } = await supabase
        .from("admin_platform_settings")
        .update({
          setting_value: data.setting_value,
          description: data.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSetting.id);

      if (updateError) {
        throw handleDatabaseError(updateError, "updatePlatformSetting - update");
      }

      settingId = existingSetting.id;
    } else {
      const { data: newSetting, error: insertError } = await supabase
        .from("admin_platform_settings")
        .insert({
          setting_key: data.setting_key,
          setting_value: data.setting_value,
          description: data.description,
        })
        .select()
        .single();

      if (insertError) {
        throw handleDatabaseError(insertError, "updatePlatformSetting - insert");
      }

      settingId = newSetting?.id;
    }

    // Log audit trail
    try {
      await supabase.from("audit_logs").insert({
        actor_id: adminId,
        action: "platform_setting_updated",
        entity_type: "admin_platform_settings",
        entity_id: settingId,
        changes: {
          setting_key: data.setting_key,
          value: data.setting_value,
        },
      });
    } catch (auditError) {
      console.error("Failed to log audit trail:", auditError);
    }

    return {
      success: true,
      message: `Setting ${data.setting_key} berhasil diperbarui`,
    };
  } catch (error) {
    console.error("Update platform setting error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat memperbarui pengaturan",
      500
    );
  }
}

/**
 * Get all feature flags
 */
export async function getFeatureFlags(adminId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    const { data: flags, error } = await supabase
      .from("admin_feature_flags")
      .select("*");

    if (error) {
      if (error.code === "42P01") {
        return {
          success: true,
          data: [],
        };
      }
      throw handleDatabaseError(error, "getFeatureFlags");
    }

    const flagList = (flags || []).map((f: any) => ({
      id: f.id,
      name: f.flag_name,
      enabled: f.enabled,
      rolloutPercentage: f.rollout_percentage,
      targetAudience: f.target_audience,
      description: f.description,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));

    return {
      success: true,
      data: flagList,
    };
  } catch (error) {
    console.error("Get feature flags error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil feature flags",
      500
    );
  }
}

/**
 * Toggle feature flag
 */
export async function toggleFeatureFlag(adminId: string, input: unknown) {
  try {
    await verifyAdminAccess(adminId);
    const data = validateInput(updateFeatureFlagSchema, input, "toggleFeatureFlag");
    const supabase = createServiceClient();

    const { data: existingFlag, error: fetchError } = await supabase
      .from("admin_feature_flags")
      .select("*")
      .eq("flag_name", data.flag_name)
      .single();

    let flagId;

    if (existingFlag) {
      const { error: updateError } = await supabase
        .from("admin_feature_flags")
        .update({
          enabled: data.enabled,
          rollout_percentage: data.rolloutPercentage,
          target_audience: data.targetAudience,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingFlag.id);

      if (updateError) {
        throw handleDatabaseError(updateError, "toggleFeatureFlag - update");
      }

      flagId = existingFlag.id;
    } else {
      const { data: newFlag, error: insertError } = await supabase
        .from("admin_feature_flags")
        .insert({
          flag_name: data.flag_name,
          enabled: data.enabled,
          rollout_percentage: data.rolloutPercentage,
          target_audience: data.targetAudience,
        })
        .select()
        .single();

      if (insertError) {
        throw handleDatabaseError(insertError, "toggleFeatureFlag - insert");
      }

      flagId = newFlag?.id;
    }

    // Log audit trail
    try {
      await supabase.from("audit_logs").insert({
        actor_id: adminId,
        action: `feature_flag_${data.enabled ? "enabled" : "disabled"}`,
        entity_type: "admin_feature_flags",
        entity_id: flagId,
        changes: {
          flag_name: data.flag_name,
          enabled: data.enabled,
        },
      });
    } catch (auditError) {
      console.error("Failed to log audit trail:", auditError);
    }

    return {
      success: true,
      message: `Feature flag ${data.flag_name} berhasil diperbarui`,
    };
  } catch (error) {
    console.error("Toggle feature flag error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengupdate feature flag",
      500
    );
  }
}

/**
 * Get system logs
 */
export async function getSystemLogs(adminId: string, input: unknown) {
  try {
    await verifyAdminAccess(adminId);
    const data = validateInput(getSystemLogsSchema, input, "getSystemLogs");
    const supabase = createServiceClient();

    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" });

    if (data.action) {
      query = query.eq("action", data.action);
    }

    if (data.actorId) {
      query = query.eq("actor_id", data.actorId);
    }

    const { data: logs, error, count } = await query
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) {
      throw handleDatabaseError(error, "getSystemLogs");
    }

    const logList = (logs || []).map((log: any) => ({
      id: log.id,
      actor: log.actor_id,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      changes: log.changes,
      createdAt: log.created_at,
    }));

    return {
      success: true,
      data: {
        logs: logList,
        pagination: {
          total: count || 0,
          limit: data.limit,
          offset: data.offset,
          hasMore: (data.offset + data.limit) < (count || 0),
        },
      },
    };
  } catch (error) {
    console.error("Get system logs error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil system logs",
      500
    );
  }
}

/**
 * Get system health and performance metrics
 */
export async function getPerformanceMetrics(adminId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    // Check database connectivity with a simple ping
    const { data: pingResult, error: pingError } = await supabase
      .rpc("ping");

    const isHealthy = !pingError;

    // Get error count from last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: errorCount } = await supabase
      .from("audit_logs")
      .select("*", { count: "exact", head: true })
      .ilike("action", "%error%")
      .gte("created_at", oneHourAgo);

    // Get transaction count for performance indicator
    const { count: transactionCount } = await supabase
      .from("wallet_transactions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", oneHourAgo);

    return {
      success: true,
      data: {
        database: {
          status: isHealthy ? "healthy" : "unhealthy",
          latencyMs: 0, // Would need actual measurement
          lastCheck: new Date().toISOString(),
        },
        errors: {
          lastHour: errorCount || 0,
          status: (errorCount || 0) < 5 ? "healthy" : "degraded",
        },
        transactions: {
          lastHour: transactionCount || 0,
        },
        overallStatus: isHealthy && (errorCount || 0) < 5 ? "healthy" : "degraded",
      },
    };
  } catch (error) {
    console.error("Get performance metrics error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil performance metrics",
      500
    );
  }
}

/**
 * Export system configuration
 */
export async function exportSystemConfig(adminId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    // Get settings
    const { data: settings } = await supabase
      .from("admin_platform_settings")
      .select("*");

    // Get flags
    const { data: flags } = await supabase
      .from("admin_feature_flags")
      .select("*");

    const config = {
      exportedAt: new Date().toISOString(),
      settings: settings || [],
      flags: flags || [],
    };

    return {
      success: true,
      data: config,
    };
  } catch (error) {
    console.error("Export system config error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat export konfigurasi sistem",
      500
    );
  }
}
