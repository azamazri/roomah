"use server";

import { createClient } from "@/server/db/client";

/**
 * Get list of all provinces
 */
export async function getProvincesList() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("provinces")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching provinces:", error);
    return [];
  }

  return data || [];
}
