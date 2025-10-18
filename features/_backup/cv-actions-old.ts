"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { AppError, ERROR_CODES, handleDatabaseError, validateInput } from "@/lib/api/error";
import { z } from "zod";

/**
 * Validation schemas
 */
const createCvItemSchema = z.object({
  category: z.enum(["education", "work", "skills", "certification", "language", "project"], {
    errorMap: () => ({ message: "Kategori CV tidak valid" }),
  }),
  title: z.string().min(1, "Judul tidak boleh kosong").max(200),
  description: z.string().min(1, "Deskripsi tidak boleh kosong").max(1000),
  data: z.record(z.unknown()),
  displayOrder: z.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
});

const updateCvItemSchema = createCvItemSchema.partial();

const reorderCvItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      displayOrder: z.number().int().min(0),
    })
  ),
});

/**
 * Get all CV data for a user
 */
export async function getCvData(userId: string) {
  try {
    const supabase = createServiceClient();

    const { data: cvData, error } = await supabase
      .from("cv_data")
      .select("*")
      .eq("profile_id", userId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      throw handleDatabaseError(error, "getCvData");
    }

    // Group by category
    const grouped = (cvData || []).reduce(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push({
          id: item.id,
          category: item.category,
          title: item.title,
          description: item.description,
          data: item.data,
          displayOrder: item.display_order,
          isVisible: item.is_visible,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        });
        return acc;
      },
      {} as Record<string, unknown[]>
    );

    return {
      success: true,
      data: grouped,
    };
  } catch (error) {
    console.error("Get CV data error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil data CV",
      500
    );
  }
}

/**
 * Get single CV item
 */
export async function getCvItem(userId: string, itemId: string) {
  try {
    const supabase = createServiceClient();

    const { data: cvItem, error } = await supabase
      .from("cv_data")
      .select("*")
      .eq("id", itemId)
      .eq("profile_id", userId)
      .single();

    if (error || !cvItem) {
      throw new AppError(
        ERROR_CODES.CV_NOT_FOUND,
        "Item CV tidak ditemukan",
        404
      );
    }

    return {
      success: true,
      data: {
        id: cvItem.id,
        category: cvItem.category,
        title: cvItem.title,
        description: cvItem.description,
        data: cvItem.data,
        displayOrder: cvItem.display_order,
        isVisible: cvItem.is_visible,
        createdAt: cvItem.created_at,
        updatedAt: cvItem.updated_at,
      },
    };
  } catch (error) {
    console.error("Get CV item error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil item CV",
      500
    );
  }
}

/**
 * Create new CV item
 */
export async function createCvItem(userId: string, input: unknown) {
  try {
    const data = validateInput(createCvItemSchema, input, "createCvItem");
    const supabase = createServiceClient();

    // Check max items per category (10 items per category)
    const { data: existingItems, error: checkError } = await supabase
      .from("cv_data")
      .select("id")
      .eq("profile_id", userId)
      .eq("category", data.category);

    if (checkError) {
      throw handleDatabaseError(checkError, "createCvItem - check");
    }

    if ((existingItems?.length || 0) >= 10) {
      throw new AppError(
        ERROR_CODES.CV_MAX_ITEMS_EXCEEDED,
        `Maksimal 10 item per kategori (${data.category})`,
        400
      );
    }

    // Get next display order
    const maxOrder = Math.max(...(existingItems || []).map(() => 0), 0);
    const displayOrder = data.displayOrder ?? maxOrder + 1;

    const { data: newItem, error } = await supabase
      .from("cv_data")
      .insert({
        profile_id: userId,
        category: data.category,
        title: data.title,
        description: data.description,
        data: data.data,
        display_order: displayOrder,
        is_visible: data.isVisible ?? true,
      })
      .select()
      .single();

    if (error) {
      throw handleDatabaseError(error, "createCvItem");
    }

    return {
      success: true,
      data: {
        id: newItem.id,
        category: newItem.category,
        title: newItem.title,
        description: newItem.description,
        data: newItem.data,
        displayOrder: newItem.display_order,
        isVisible: newItem.is_visible,
        createdAt: newItem.created_at,
        updatedAt: newItem.updated_at,
      },
      message: "Item CV berhasil dibuat",
    };
  } catch (error) {
    console.error("Create CV item error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat membuat item CV",
      500
    );
  }
}

/**
 * Update CV item
 */
export async function updateCvItem(userId: string, itemId: string, input: unknown) {
  try {
    const data = validateInput(updateCvItemSchema, input, "updateCvItem");
    const supabase = createServiceClient();

    // Verify ownership
    const { data: existingItem, error: checkError } = await supabase
      .from("cv_data")
      .select("*")
      .eq("id", itemId)
      .eq("profile_id", userId)
      .single();

    if (checkError || !existingItem) {
      throw new AppError(
        ERROR_CODES.CV_NOT_FOUND,
        "Item CV tidak ditemukan",
        404
      );
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.data !== undefined) updateData.data = data.data;
    if (data.displayOrder !== undefined) updateData.display_order = data.displayOrder;
    if (data.isVisible !== undefined) updateData.is_visible = data.isVisible;
    if (data.category !== undefined && data.category !== existingItem.category) {
      // Check if category change is allowed
      const { data: categoryItems } = await supabase
        .from("cv_data")
        .select("id")
        .eq("profile_id", userId)
        .eq("category", data.category);

      if ((categoryItems?.length || 0) >= 10) {
        throw new AppError(
          ERROR_CODES.CV_MAX_ITEMS_EXCEEDED,
          `Maksimal 10 item per kategori (${data.category})`,
          400
        );
      }
      updateData.category = data.category;
    }

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("cv_data")
      .update(updateData)
      .eq("id", itemId);

    if (error) {
      throw handleDatabaseError(error, "updateCvItem");
    }

    return {
      success: true,
      message: "Item CV berhasil diperbarui",
    };
  } catch (error) {
    console.error("Update CV item error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat memperbarui item CV",
      500
    );
  }
}

/**
 * Delete CV item
 */
export async function deleteCvItem(userId: string, itemId: string) {
  try {
    const supabase = createServiceClient();

    // Verify ownership
    const { data: existingItem, error: checkError } = await supabase
      .from("cv_data")
      .select("id")
      .eq("id", itemId)
      .eq("profile_id", userId)
      .single();

    if (checkError || !existingItem) {
      throw new AppError(
        ERROR_CODES.CV_NOT_FOUND,
        "Item CV tidak ditemukan",
        404
      );
    }

    const { error } = await supabase.from("cv_data").delete().eq("id", itemId);

    if (error) {
      throw handleDatabaseError(error, "deleteCvItem");
    }

    return {
      success: true,
      message: "Item CV berhasil dihapus",
    };
  } catch (error) {
    console.error("Delete CV item error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat menghapus item CV",
      500
    );
  }
}

/**
 * Reorder CV items within a category
 */
export async function reorderCvItems(userId: string, input: unknown) {
  try {
    const data = validateInput(reorderCvItemsSchema, input, "reorderCvItems");
    const supabase = createServiceClient();

    // Verify all items belong to user
    const { data: items, error: checkError } = await supabase
      .from("cv_data")
      .select("id")
      .eq("profile_id", userId)
      .in(
        "id",
        data.items.map((i) => i.id)
      );

    if (checkError) {
      throw handleDatabaseError(checkError, "reorderCvItems");
    }

    if ((items?.length || 0) !== data.items.length) {
      throw new AppError(
        ERROR_CODES.CV_NOT_FOUND,
        "Beberapa item CV tidak ditemukan",
        404
      );
    }

    // Update all items in parallel
    const updates = data.items.map((item) =>
      supabase
        .from("cv_data")
        .update({ display_order: item.displayOrder })
        .eq("id", item.id)
    );

    const results = await Promise.all(updates);

    // Check for errors
    for (const result of results) {
      if (result.error) {
        throw handleDatabaseError(result.error, "reorderCvItems - update");
      }
    }

    return {
      success: true,
      message: "Urutan CV berhasil diperbarui",
    };
  } catch (error) {
    console.error("Reorder CV items error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengubah urutan CV",
      500
    );
  }
}

/**
 * Toggle visibility of CV item
 */
export async function toggleCvVisibility(userId: string, itemId: string) {
  try {
    const supabase = createServiceClient();

    // Get current item
    const { data: item, error: getError } = await supabase
      .from("cv_data")
      .select("is_visible")
      .eq("id", itemId)
      .eq("profile_id", userId)
      .single();

    if (getError || !item) {
      throw new AppError(
        ERROR_CODES.CV_NOT_FOUND,
        "Item CV tidak ditemukan",
        404
      );
    }

    // Toggle visibility
    const { error } = await supabase
      .from("cv_data")
      .update({ is_visible: !item.is_visible })
      .eq("id", itemId);

    if (error) {
      throw handleDatabaseError(error, "toggleCvVisibility");
    }

    return {
      success: true,
      message: `Item CV berhasil ${!item.is_visible ? "ditampilkan" : "disembunyikan"}",
    };
  } catch (error) {
    console.error("Toggle CV visibility error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengubah visibilitas CV",
      500
    );
  }
}
