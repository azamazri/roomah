"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, Heart, Coins } from "lucide-react";

export function UserBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/cari-jodoh",
      label: "Cari",
      icon: Search,
    },
    {
      href: "/cv-saya",
      label: "CV",
      icon: User,
    },
    {
      href: "/riwayat-taaruf",
      label: "Taaruf",
      icon: Heart,
    },
    {
      href: "/koin-saya",
      label: "Koin",
      icon: Coins,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-input z-50">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

