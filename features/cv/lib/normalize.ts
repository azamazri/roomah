/**
 * Converts text to Title Case (Capitalize Each Word)
 * @param text - The text to normalize
 * @returns Normalized text in title case
 */
export function toTitleCase(text: string): string {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ")
    .trim();
}

/**
 * Normalizes CV data by applying title case to text fields
 * @param data - The CV data to normalize
 * @returns Normalized CV data
 */
export function normalizeCvData(data: unknown): unknown {
  const normalized = { ...data };

  // Normalize biodata text fields
  if (normalized.biodata) {
    normalized.biodata = {
      ...normalized.biodata,
      namaLengkap: toTitleCase(normalized.biodata.namaLengkap || ""),
      alamatLengkap: toTitleCase(normalized.biodata.alamatLengkap || ""),
      domisili: toTitleCase(normalized.biodata.domisili || ""),
      pendidikan: toTitleCase(normalized.biodata.pendidikan || ""),
      pekerjaan: toTitleCase(normalized.biodata.pekerjaan || ""),
      ciriFisik: toTitleCase(normalized.biodata.ciriFisik || ""),
      pekerjaanOrangTua: toTitleCase(
        normalized.biodata.pekerjaanOrangTua || ""
      ),
      riwayatPenyakit: (normalized.biodata.riwayatPenyakit || []).map(
        (item: string) => toTitleCase(item)
      ),
    };
  }

  // Normalize kondisi ibadah text fields
  if (normalized.kondisiIbadah) {
    normalized.kondisiIbadah = {
      ...normalized.kondisiIbadah,
      shalatSunnah: toTitleCase(normalized.kondisiIbadah.shalatSunnah || ""),
      hafalanQuran: toTitleCase(normalized.kondisiIbadah.hafalanQuran || ""),
      puasa: toTitleCase(normalized.kondisiIbadah.puasa || ""),
      kajian: toTitleCase(normalized.kondisiIbadah.kajian || ""),
    };
  }

  // Normalize kriteria pasangan text fields
  if (normalized.kriteriaPasangan) {
    normalized.kriteriaPasangan = {
      ...normalized.kriteriaPasangan,
      pendidikan: toTitleCase(normalized.kriteriaPasangan.pendidikan || ""),
      ciriFisik: toTitleCase(normalized.kriteriaPasangan.ciriFisik || ""),
      kriteriaKhusus: (normalized.kriteriaPasangan.kriteriaKhusus || []).map(
        (item: string) => toTitleCase(item)
      ),
    };
  }

  // Normalize rencana pernikahan text fields
  if (normalized.rencanaPernikahan) {
    normalized.rencanaPernikahan = {
      ...normalized.rencanaPernikahan,
      tempatTinggal: toTitleCase(
        normalized.rencanaPernikahan.tempatTinggal || ""
      ),
      visi: toTitleCase(normalized.rencanaPernikahan.visi || ""),
      misi: toTitleCase(normalized.rencanaPernikahan.misi || ""),
    };
  }

  return normalized;
}
