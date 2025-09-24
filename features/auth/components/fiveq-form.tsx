"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fiveQSchema, type FiveQData } from "@/features/auth/schemas/fiveq";
import { NegativeGateModal } from "./negative-gate-modal";
import { setOnboardingFlag } from "@/features/auth/lib/mock-session";

const questions = [
  "Apakah Anda sudah siap secara mental dan spiritual untuk menjalani Ta&apos;aruf?",
  "Apakah Anda memiliki tujuan yang jelas untuk menikah dalam waktu dekat (1-2 tahun)?",
  "Apakah Anda memiliki kesiapan finansial untuk berkeluarga?",
  "Apakah Anda sudah mendapat restu dari keluarga untuk mencari pasangan hidup?",
  "Apakah Anda siap berkomitmen penuh dalam proses Ta&apos;aruf yang serius?",
];

export function FiveQForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [negativeCount, setNegativeCount] = useState(0);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FiveQData>({
    resolver: zodResolver(fiveQSchema),
  });

  function countNegativeAnswers(data: FiveQData): number {
    return Object.values(data).filter((value) => value === false).length;
  }

  async function onSubmit(data: FiveQData) {
    setIsLoading(true);

    const negatives = countNegativeAnswers(data);
    setNegativeCount(negatives);

    if (negatives > 0) {
      setShowModal(true);
      setIsLoading(false);
    } else {
      // All answers are positive, proceed directly
      await proceedToNext();
    }
  }

  async function proceedToNext() {
    setOnboardingFlag("rmh_5q", "1");
    router.push("/onboarding/cv");
  }

  function handleModalContinue() {
    setShowModal(false);
    proceedToNext();
  }

  function handleModalCancel() {
    setShowModal(false);
    setIsLoading(false);

    // Redirect to home with failure message
    router.push("/");
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          {questions.map((question, index) => {
            const fieldName = `q${index + 1}` as keyof FiveQData;
            return (
              <div key={index} className="space-y-3">
                <p className="text-sm font-medium text-card-foreground">
                  {index + 1}. {question}
                </p>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      {...register(fieldName)}
                      value="true"
                      className="w-4 h-4 border-input"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-card-foreground">Ya</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      {...register(fieldName)}
                      value="false"
                      className="w-4 h-4 border-input"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-card-foreground">Tidak</span>
                  </label>
                </div>
                {errors[fieldName] && (
                  <p
                    className="text-sm text-destructive"
                    role="alert"
                    aria-live="polite"
                  >
                    {errors[fieldName]?.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Global form error */}
        {errors.root && (
          <p
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {errors.root.message}
          </p>
        )}

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-muted-foreground hover:text-card-foreground disabled:opacity-50"
            disabled={isLoading}
          >
            Kembali
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-primary-foreground rounded-md px-6 py-2 font-medium hover:bg-primary/90 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? "Memproses..." : "Lanjut"}
          </button>
        </div>
      </form>

      <NegativeGateModal
        isOpen={showModal}
        onContinue={handleModalContinue}
        onCancel={handleModalCancel}
        negativeCount={negativeCount}
      />
    </>
  );
}
