"use client";

import { Inter } from "next/font/google";
import OnboardingStepper from "@/features/auth/components/onboarding-stepper";

const inter = Inter({ subsets: ["latin"] });

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.className}>
      <OnboardingStepper />
      <main className="min-h-screen bg-background">
        <div id="content">{children}</div>
      </main>
    </div>
  );
}
