// lib/env/client.ts
import { clientEnvSchema } from "./validation";

const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsed.success) {
  console.error("Invalid client env:", parsed.error.flatten().fieldErrors);
  throw new Error("Client ENV invalid. Cek .env.local");
}

export const CLIENT_ENV = parsed.data;
