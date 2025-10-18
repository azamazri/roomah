/**
 * Text Utilities for Roomah
 * Normalisasi teks sesuai requirements: Capitalize Each Word
 */

/**
 * Capitalize each word in a string
 * Example: "JOHN DOE" -> "John Doe", "john doe" -> "John Doe"
 */
export function capitalizeEachWord(text: string | null | undefined): string {
  if (!text) return "";
  
  return text
    .toLowerCase()
    .split(" ")
    .map(word => {
      if (word.length === 0) return "";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ")
    .trim();
}

/**
 * Normalize CV text input - apply to all CV form inputs
 */
export function normalizeCvText(text: string | null | undefined): string {
  return capitalizeEachWord(text);
}

/**
 * Truncate text to max words
 * Used for: Visi (max 20 words), Misi (max 20 words), Ciri Fisik (max 20 words)
 */
export function truncateWords(text: string, maxWords: number): string {
  if (!text) return "";
  
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  
  return words.slice(0, maxWords).join(" ") + "...";
}

/**
 * Validate and limit array items
 * Used for: Riwayat Penyakit (max 3), Ibadah Lainnya (max 3), Kriteria Lainnya (max 3)
 */
export function limitArrayItems<T>(items: T[], maxItems: number): T[] {
  if (!items || items.length === 0) return [];
  return items.slice(0, maxItems);
}

/**
 * Format height/weight display
 * Format: "170 / 65" (cm / kg)
 */
export function formatHeightWeight(heightCm: number | null, weightKg: number | null): string {
  if (!heightCm && !weightKg) return "N/A";
  return `${heightCm || "N/A"} / ${weightKg || "N/A"}`;
}

/**
 * Format sibling info
 * Format: "1 / Dari 3 Saudara"
 */
export function formatSiblingInfo(order: number | null, total: number | null): string {
  if (!order || !total) return "N/A";
  return `${order} / Dari ${total} Saudara`;
}

/**
 * Safe string join with default
 */
export function safeJoin(items: (string | null | undefined)[], separator: string = ", "): string {
  return items.filter(Boolean).join(separator) || "N/A";
}
