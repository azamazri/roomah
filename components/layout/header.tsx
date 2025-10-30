import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-input bg-background/80 backdrop-blur-sm">
      <div className="container-x flex h-16 items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg"
        >
          <Image
            src="/images/logo_roomah.jpeg"
            alt="Roomah Logo"
            width={40}
            height={40}
            className="rounded object-contain"
            priority
          />
        </Link>

        {/* Main Navigation */}
        <nav
          role="navigation"
          aria-label="Navigasi utama"
          className="hidden md:flex items-center gap-6"
        >
          <Link
            href="/"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors px-2 py-1"
          >
            BERANDA
          </Link>
          <Link
            href="/tentang"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors px-2 py-1"
          >
            TENTANG
          </Link>
          <Link
            href="/kontak"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors px-2 py-1"
          >
            KONTAK
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Masuk
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm" className="rounded-full">
              Daftar Gratis
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
