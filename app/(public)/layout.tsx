import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip Link for Accessibility */}
      <a
        href="#konten"
        className="visually-hidden focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus-ring"
      >
        Lewati ke Konten
      </a>

      <Header />

      <main id="konten" className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}
