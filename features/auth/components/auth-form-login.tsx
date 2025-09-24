"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginData } from "@/features/auth/schemas/login";
import { signIn } from "@/features/auth/server/actions";

export function AuthFormLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginData) {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn(data);

      if (result.success) {
        router.push("/cari-jodoh");
      } else {
        setError("Email atau password tidak valid");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleSignIn() {
    alert(
      "Google OAuth akan diintegrasikan pada fase selanjutnya. Untuk demo, gunakan login manual."
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
          <p
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-card-foreground mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full"
            placeholder="nama@email.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p
              className="text-sm text-destructive mt-1"
              role="alert"
              aria-live="polite"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-card-foreground mb-2"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full"
            placeholder="Password Anda"
            disabled={isLoading}
          />
          {errors.password && (
            <p
              className="text-sm text-destructive mt-1"
              role="alert"
              aria-live="polite"
            >
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground rounded-md px-4 py-3 font-medium hover:bg-primary/90 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? "Memproses..." : "Masuk"}
        </button>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-muted text-muted-foreground border border-input rounded-md px-4 py-3 font-medium hover:bg-muted/80 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none"
        >
          Masuk dengan Google
        </button>
      </div>
    </form>
  );
}
