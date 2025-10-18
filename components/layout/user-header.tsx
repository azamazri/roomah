"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UserHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: "/cari-jodoh", label: "Cari Jodoh" },
    { href: "/cv-saya", label: "CV Saya" },
    { href: "/riwayat-taaruf", label: "Riwayat Taaruf" },
    { href: "/koin-saya", label: "Koin Saya" },
  ];

  return (
    <header className="hidden md:block bg-card border-b border-input sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/cari-jodoh"
            className="text-xl font-bold text-primary hover:text-primary/90"
          >
            Roomah
          </Link>

          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            >
              <Link href="/logout">Logout</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}

