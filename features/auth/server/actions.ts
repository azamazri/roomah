"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginData } from "@/features/auth/schemas/login";
import { RegisterData } from "@/features/auth/schemas/register";
import { OnboardingCvData } from "@/features/auth/schemas/onboarding-cv";

// Mock user database
const mockUsers = new Map<
  string,
  { email: string; password: string; id: string }
>();

export async function signIn(data: LoginData) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    // Mock authentication - in real app, verify against database
    const user = mockUsers.get(data.email);

    if (!user || user.password !== data.password) {
      return {
        success: false,
        message: "Email atau password tidak valid",
      };
    }

    // Set auth cookie
    cookies().set("rmh_auth", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: "Terjadi kesalahan server",
    };
  }
}

export async function signUp(data: RegisterData) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    // Check if user already exists
    if (mockUsers.has(data.email)) {
      return {
        success: false,
        message: "Email sudah terdaftar",
      };
    }

    // Add user to mock database
    mockUsers.set(data.email, {
      email: data.email,
      password: data.password,
      id: `user_${Date.now()}`,
    });

    // Set auth cookie
    cookies().set("rmh_auth", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: "Terjadi kesalahan server",
    };
  }
}

export async function completeOnboarding(data: OnboardingCvData) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    // In real app, save CV data to database
    console.log("CV Data saved:", data);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: "Terjadi kesalahan saat menyimpan data",
    };
  }
}

export async function signOut() {
  // Clear all auth-related cookies
  cookies().delete("rmh_auth");
  cookies().delete("rmh_5q");
  cookies().delete("rmh_cv");

  redirect("/");
}
