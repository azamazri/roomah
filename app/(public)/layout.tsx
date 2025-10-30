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
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
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
