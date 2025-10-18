import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-gradient border-t border-input">
      <div className="container-x py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground text-sm font-bold rounded">
                R
              </div>
              <span className="text-xl font-semibold text-foreground">
                Roomah
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Platform Taaruf Islami yang membantu mempertemukan Muslim
              dan Muslimah untuk membangun keluarga sakinah sesuai dengan
              syariat Islam.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Barakallahu lakuma wa baaraka 'alaikuma</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Navigasi</h3>
            <nav className="space-y-2">
              <Link
                href="/"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Beranda
              </Link>
              <Link
                href="/tentang"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Tentang Kami
              </Link>
              <Link
                href="/kontak"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Kontak
              </Link>
              <Link
                href="/login"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Daftar
              </Link>
            </nav>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <nav className="space-y-2">
              <Link
                href="/privacy"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Kebijakan Privasi
              </Link>
              <Link
                href="/terms"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Syarat & Ketentuan
              </Link>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-input mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Roomah. Hak cipta dilindungi undang-undang.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

