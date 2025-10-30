"use client";

import { usePathname } from "next/navigation";

const steps = [
  { name: "Verifikasi 5Q", path: "/onboarding/verifikasi" },
  { name: "CV", path: "/onboarding/cv" },
  { name: "Selesai", path: "/onboarding/selesai" },
];

export default function OnboardingStepper() {
  const pathname = usePathname();

  // Only show stepper on onboarding pages
  if (!pathname.startsWith("/onboarding")) {
    return null;
  }

  const currentStepIndex = steps.findIndex((step) => pathname === step.path);

  return (
    <div className="sticky top-0 z-50 bg-card border-b border-input">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.path} className="flex items-center flex-1">
              <div className="flex items-center min-w-0">
                <div
                  className={`
                    w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0
                    ${
                      index < currentStepIndex
                        ? "bg-success text-success-foreground"
                        : index === currentStepIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {index < currentStepIndex ? "✓" : index + 1}
                </div>
                <span
                  className={`ml-1.5 sm:ml-3 text-xs sm:text-sm font-medium truncate ${
                    index <= currentStepIndex
                      ? "text-card-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.name}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`mx-1 sm:mx-4 h-0.5 w-4 sm:w-12 flex-shrink-0 ${
                    index < currentStepIndex ? "bg-success" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Also export as named export for flexibility
export { OnboardingStepper };
