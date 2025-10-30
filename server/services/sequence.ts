/**
 * Sequence Generation Service
 * Generate unique sequential codes for:
 * - Candidate Code: IKHWAN1, AKHWAT1, etc
 * - Taaruf Code: TAARUF1, TAARUF2, etc
 */

import { createClient, createAdminClient } from "@/server/db/client";
import { GenderEnum } from "@/types/database.types";

/**
 * Generate next candidate code based on gender
 * Format: IKHWAN{sequence} or AKHWAT{sequence}
 * Sequence starts from 1
 */
export async function generateCandidateCode(gender: GenderEnum): Promise<string | null> {
  try {
    console.log("[generateCandidateCode] Input gender:", gender);
    // Use admin client to bypass RLS policies
    const supabase = createAdminClient();
    
    // Get prefix based on gender
    const prefix = gender === "IKHWAN" ? "IKHWAN" : "AKHWAT";
    console.log("[generateCandidateCode] Using prefix:", prefix);
    
    // Query for ALL existing codes with this prefix (not just top 1)
    // We need all codes to find the numeric maximum, not alphabetical
    const { data: existingCodes, error } = await supabase
      .from("cv_data")
      .select("candidate_code")
      .like("candidate_code", `${prefix}%`)
      .not("candidate_code", "is", null);
    
    if (error) {
      console.error("[generateCandidateCode] Error fetching existing codes:", error);
      return null;
    }
    
    console.log("[generateCandidateCode] Existing codes count:", existingCodes?.length || 0);
    
    let nextSequence = 1;
    
    if (existingCodes && existingCodes.length > 0) {
      // Extract all numeric sequences and find the maximum
      const sequences = existingCodes
        .map(row => {
          const match = row.candidate_code?.match(/\d+$/);
          return match ? parseInt(match[0], 10) : 0;
        })
        .filter(num => !isNaN(num));
      
      if (sequences.length > 0) {
        const maxSequence = Math.max(...sequences);
        nextSequence = maxSequence + 1;
        console.log("[generateCandidateCode] Max sequence found:", maxSequence, "-> Next:", nextSequence);
      }
    }
    
    const newCode = `${prefix}${nextSequence}`;
    console.log("[generateCandidateCode] Generated new code:", newCode);
    return newCode;
    
  } catch (error) {
    console.error("[generateCandidateCode] Error generating candidate code:", error);
    return null;
  }
}

/**
 * Generate next taaruf session code
 * Format: TAARUF{sequence}
 * Sequence starts from 1
 */
export async function generateTaarufCode(): Promise<string | null> {
  try {
    const supabase = await createClient();
    
    const prefix = "TAARUF";
    
    // Query for the highest sequence number
    const { data: existingCodes, error } = await supabase
      .from("taaruf_sessions")
      .select("taaruf_code")
      .like("taaruf_code", `${prefix}%`)
      .not("taaruf_code", "is", null)
      .order("taaruf_code", { ascending: false })
      .limit(1);
    
    if (error) {
      console.error("Error fetching existing taaruf codes:", error);
      return null;
    }
    
    let nextSequence = 1;
    
    if (existingCodes && existingCodes.length > 0) {
      const lastCode = existingCodes[0].taaruf_code;
      if (lastCode) {
        // Extract number from code (e.g., "TAARUF123" -> 123)
        const match = lastCode.match(/\d+$/);
        if (match) {
          const lastSequence = parseInt(match[0], 10);
          nextSequence = lastSequence + 1;
        }
      }
    }
    
    const newCode = `${prefix}${nextSequence}`;
    return newCode;
    
  } catch (error) {
    console.error("Error generating taaruf code:", error);
    return null;
  }
}

/**
 * Verify candidate code is unique
 */
export async function isCandidateCodeUnique(code: string): Promise<boolean> {
  try {
    // Use admin client to bypass RLS policies
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from("cv_data")
      .select("candidate_code")
      .eq("candidate_code", code)
      .maybeSingle();
    
    if (error) {
      console.error("Error checking code uniqueness:", error);
      return false;
    }
    
    return data === null; // Unique if no existing data
    
  } catch (error) {
    console.error("Error verifying candidate code:", error);
    return false;
  }
}

/**
 * Verify taaruf code is unique
 */
export async function isTaarufCodeUnique(code: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("taaruf_sessions")
      .select("taaruf_code")
      .eq("taaruf_code", code)
      .maybeSingle();
    
    if (error) {
      console.error("Error checking taaruf code uniqueness:", error);
      return false;
    }
    
    return data === null; // Unique if no existing data
    
  } catch (error) {
    console.error("Error verifying taaruf code:", error);
    return false;
  }
}

/**
 * Safe code generation with retry on collision
 * Retries up to 3 times if code collision detected
 */
export async function generateCandidateCodeSafe(gender: GenderEnum): Promise<string | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = await generateCandidateCode(gender);
    
    if (!code) {
      continue;
    }
    
    const isUnique = await isCandidateCodeUnique(code);
    
    if (isUnique) {
      return code;
    }
    
    // Code collision detected, retry
    console.warn(`Candidate code collision detected: ${code}, retrying...`);
  }
  
  console.error("Failed to generate unique candidate code after 3 attempts");
  return null;
}

/**
 * Safe taaruf code generation with retry on collision
 */
export async function generateTaarufCodeSafe(): Promise<string | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = await generateTaarufCode();
    
    if (!code) {
      continue;
    }
    
    const isUnique = await isTaarufCodeUnique(code);
    
    if (isUnique) {
      return code;
    }
    
    // Code collision detected, retry
    console.warn(`Taaruf code collision detected: ${code}, retrying...`);
  }
  
  console.error("Failed to generate unique taaruf code after 3 attempts");
  return null;
}
