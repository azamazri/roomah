import { Metadata } from "next";
import { UserHeader } from "@/components/layout/user-header";
import { UserBottomNav } from "@/components/layout/user-bottom-nav";
import { ToastContainer } from "@/components/ui/toast-container";

export const metadata: Metadata = {
  robots: "noindex",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md"
      >
        Skip to content
      </a>
      <UserHeader />
      <main
        id="content"
        className="min-h-screen bg-background container mx-auto px-4 py-8 pb-20 md:pb-8"
      >
        {children}
      </main>
      <UserBottomNav />
      <ToastContainer />
    </>
  );
}
