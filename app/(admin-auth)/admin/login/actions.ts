"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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

  try {
    const supabase = await createClient();

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validated.data.email,
      password: validated.data.password,
    });

    if (authError || !authData.user) {
      console.error("Admin auth error:", authError);
      return {
        ok: false,
        message: "Email atau password salah",
      };
    }

    // Verify admin status from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin, full_name")
      .eq("user_id", authData.user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      await supabase.auth.signOut();
      return {
        ok: false,
        message: "Profil admin tidak ditemukan",
      };
    }

    // Check if user is admin
    if (!profile.is_admin) {
      console.error("User is not admin:", authData.user.email);
      await supabase.auth.signOut();
      return {
        ok: false,
        message: "Anda tidak memiliki akses admin. Hanya admin yang dapat login di halaman ini.",
      };
    }

    // Success - redirect to admin dashboard
    redirect("/admin/dashboard");
  } catch (error) {
    // Handle redirect (expected behavior)
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    
    console.error("Admin login error:", error);
    return {
      ok: false,
      message: "Terjadi kesalahan saat login. Silakan coba lagi.",
    };
  }
}

// Alternative export name for backward compatibility
export const loginAdminAction = adminLogin;
