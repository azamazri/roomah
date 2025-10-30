import { Metadata } from "next";
import { UserHeader } from "@/components/layout/user-header";
import { UserBottomNav } from "@/components/layout/user-bottom-nav";
import { ToastContainer } from "@/components/ui/toast-container";
import { enforceOnboarding } from "@/server/guards";

export const metadata: Metadata = {
  robots: "noindex",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await enforceOnboarding();

  return (
    <>
      {/* Skip Link for Accessibility */}
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
      >
        Lewati ke Konten
      </a>
      <UserHeader />
      <main
        id="konten"
        className="min-h-screen bg-background container mx-auto px-4 py-8 pb-20 md:pb-8"
      >
        {children}
      </main>
      <UserBottomNav />
      <ToastContainer />
    </>
  );
}

