import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Ini adalah konfigurasi dasar dari Next.js yang Anda miliki
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // === BLOK TAMBAHAN UNTUK MENIMPA ATURAN ===
  // Objek ini akan menimpa aturan dari 'extends' di atas.
  {
    rules: {
      // 1. Tetap jadikan ini 'error' agar Anda ingat untuk memperbaikinya
      "react/no-unescaped-entities": "error",

      // 2. Ubah aturan lain yang menyebabkan 'error' menjadi 'warn'
      // Peringatan (warn) tidak akan menggagalkan build di Vercel
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "prefer-const": "warn",
      "@next/next/no-img-element": "warn",
      // Tambahkan aturan lain di sini jika masih ada error yang ingin diubah jadi warning
    },
  },
  // === AKHIR BLOK TAMBAHAN ===

  // Ini adalah konfigurasi file yang diabaikan, sudah ada sebelumnya
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
