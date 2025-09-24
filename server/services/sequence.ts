// server/services/sequence.ts
import { supabase } from "@/server/db/client";

function pad4(n: number) {
  return String(n).padStart(4, "0");
}

/** Membuat candidate_code unik: RMH-YYYYMM-XXXX */
export async function generateCandidateCode(): Promise<string> {
  const now = new Date();
  const prefix = `RMH-${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-`;

  // seed awal random 1..9999 agar tidak mulai dari 0001 tiap bulan (MVP)
  let counter = Math.floor(Math.random() * 9999) + 1;

  // coba maksimal 20x (sangat kecil kemungkinan butuh banyak)
  for (let i = 0; i < 20; i++) {
    const candidate = `${prefix}${pad4(counter)}`;

    const { data, error } = await supabase
      .from("cvs")
      .select("id")
      .eq("candidate_code", candidate)
      .limit(1);

    if (error) {
      // Pada MVP, jika error koneksi, tetap lempar agar caller bisa handle
      throw error;
    }
    if (!data || data.length === 0) {
      return candidate; // unik ✅
    }
    counter++;
  }

  throw new Error(
    "Gagal membuat candidate_code unik setelah beberapa percobaan."
  );
}
