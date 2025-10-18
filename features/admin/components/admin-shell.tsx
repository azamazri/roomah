"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  FileCheck,
  Users,
  Heart,
  Coins,
  Share2,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AdminUser } from "../types";

interface AdminShellProps {
  children: React.ReactNode;
  user: AdminUser;
}

const menuItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    scopes: ["dashboard"],
  },
  {
    href: "/admin/verifikasi-cv",
    label: "Verifikasi CV",
    icon: FileCheck,
    scopes: ["cv_verification"],
  },
  {
    href: "/admin/manajemen-akun",
    label: "Manajemen Akun",
    icon: Users,
    scopes: ["account_management"],
  },
  {
    href: "/admin/proses-taaruf",
    label: "Proses Ta'aruf",
    icon: Heart,
    scopes: ["taaruf_management"],
  },
  {
    href: "/admin/koin-transaksi",
    label: "Koin & Transaksi",
    icon: Coins,
    scopes: ["finance"],
  },
  {
    href: "/admin/posting-media",
    label: "Posting Media",
    icon: Share2,
    scopes: ["posting_management"],
  },
  {
    href: "/admin/pengaturan",
    label: "Pengaturan",
    icon: Settings,
    scopes: ["settings"],
  },
];

// Admin access control - MVP: all admins have full access
const adminScopes = [
  "dashboard",
  "cv_verification",
  "account_management",
  "taaruf_management",
  "finance",
  "posting_management",
  "settings",
];

export function AdminShell({ children, user }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // MVP: All admins have full access
  const userScopes = user.isAdmin ? adminScopes : [];
  const allowedMenuItems = menuItems.filter((item) =>
    item.scopes.some((scope) => userScopes.includes(scope))
  );

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if signOut fails
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <h1 className="text-lg font-semibold">Admin Roomah</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-border">
              <h1 className="text-xl font-bold text-primary">Admin Roomah</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Admin • {user.email}
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {allowedMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-0">
          <div className="container-x py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
