// app/(admin-auth)/layout.tsx
import "server-only";
import type { ReactNode } from "react";

export const dynamic = "force-static";
export const revalidate = 0;
export const runtime = "nodejs";

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
