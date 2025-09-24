import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  // Clear authentication cookies using the same system as onboarding
  const cookieStore = await cookies();

  // Remove rmh_auth cookie
  cookieStore.set("rmh_auth", "", {
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // Remove rmh_5q cookie
  cookieStore.set("rmh_5q", "", {
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // Remove rmh_cv cookie
  cookieStore.set("rmh_cv", "", {
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // Redirect to home page
  redirect("/");
}

export async function POST(request: NextRequest) {
  // Same logic for POST requests
  return GET(request);
}
