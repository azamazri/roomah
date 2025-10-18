"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

type State = { ok: boolean; message?: string };

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function adminLogin(prevState: State, formData: FormData): Promise<State> {
  const email = formData.get("email");
  const password = formData.get("password");

  const validated = loginSchema.safeParse({ email, password });

  if (!validated.success) {
    return {
      ok: false,
      message: validated.error.issues[0]?.message || "Validasi gagal",
    };
  }

  // TODO: Implement actual admin authentication
  // For now, just a placeholder
  // const result = await authenticateAdmin(validated.data);

  // Placeholder: Check if credentials match (replace with real auth)
  if (
    validated.data.email === "admin@roomah.com" &&
    validated.data.password === "admin123"
  ) {
    redirect("/admin/dashboard");
  }

  return {
    ok: false,
    message: "Email atau password salah",
  };
}

// Alternative export name for backward compatibility
export const loginAdminAction = adminLogin;
