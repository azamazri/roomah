"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  onboardingCvSchema,
  type OnboardingCvData,
} from "@/features/auth/schemas/onboarding-cv";
import { setOnboardingFlag } from "@/features/auth/lib/mock-session";

const provinsiOptions = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Kepulauan Riau",
  "Jambi",
  "Sumatera Selatan",
  "Bangka Belitung",
  "Bengkulu",
  "Lampung",
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Banten",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Sulawesi Tengah",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Gorontalo",
  "Sulawesi Barat",
  "Maluku",
  "Maluku Utara",
  "Papua Barat",
  "Papua",
];

const pendidikanOptions = ["SMA/SMK", "Diploma", "S1", "S2", "S3"];
const statusOptions = ["Single", "Janda", "Duda"];
const penghasilanOptions = ["0-2 juta", "2-5 juta", "5-10 juta", "10+ juta"];

export function CvOnboardingForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showDiseases, setShowDiseases] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<OnboardingCvData>({
    resolver: zodResolver(onboardingCvSchema),
    defaultValues: {
      diseases: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "diseases",
  });

  async function onSubmit(data: OnboardingCvData) {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setOnboardingFlag("rmh_cv", "1");
    router.push("/onboarding/selesai");
  }

  async function handleSkip() {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setOnboardingFlag("rmh_cv", "0");
    router.push("/onboarding/selesai");
  }

  function addDisease() {
    if (fields.length < 3) {
      append({ name: "" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tanggal Lahir */}
        <div>
          <label
            htmlFor="birthDate"
            className="block text-sm font-medium text-card-foreground mb-2"
          >
            Tanggal Lahir *
          </label>
          <input
            id="birthDate"
            type="date"
            {...register("birthDate")}
            className="w-full"
            disabled={isLoading}
          />
          {errors.birthDate && (
            <p
              className="text-sm text-destructive mt-1"
              role="alert"
              aria-live="polite"
            >
              {errors.birthDate.message}
            </p>
          )}
        </div>

        {/* Status Pernikahan */}
        <div>
          <label
            htmlFor="maritalStatus"
            className="block text-sm font-medium text-card-foreground mb-2"
          >
            Status Pernikahan *
          </label>
          <select
            id="maritalStatus"
            {...register("maritalStatus")}
            className="w-full"
            disabled={isLoading}
          >
            <option value="">Pilih Status</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.maritalStatus && (
            <p
              className="text-sm text-destructive mt-1"
              role="alert"
              aria-live="polite"
            >
              {errors.maritalStatus.message}
            </p>
          )}
        </div>

        {/* Domisili Provinsi */}
        <div>
          <label
            htmlFor="province"
            className="block text-sm font-medium text-card-foreground mb-2"
          >
            Domisili Provinsi *
          </label>
          <select
            id="province"
            {...register("province")}
            className="w-full"
            disabled={isLoading}
          >
            <option value="">Pilih Provinsi</option>
            {provinsiOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.province && (
            <p
              className="text-sm text-destructive mt-1"
              role="alert"
              aria-live="polite"
            >
              {errors.province.message}
            </p>
          )}
        </div>

        {/* Pendidikan */}
        <div>
          <label
            htmlFor="education"
            className="block text-sm font-medium text-card-foreground mb-2"
          >
            Pendidikan *
          </label>
          <select
            id="education"
            {...register("education")}
            className="w-full"
            disabled={isLoading}
          >
            <option value="">Pilih Pendidikan</option>
            {pendidikanOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.education && (
            <p
              className="text-sm text-destructive mt-1"
              role="alert"
              aria-live="polite"
            >
              {errors.education.message}
            </p>
          )}
        </div>

        {/* Pekerjaan */}
        <div>
          <label
            htmlFor="job"
            className="block text-sm font-medium text-card-foreground mb-2"
          >
            Pekerjaan *
          </label>
          <input
            id="job"
            type="text"
            {...register("job")}
            className="w-full"
            placeholder="Contoh: Software Engineer"
            disabled={isLoading}
          />
          {errors.job && (
            <p
              className="text-sm text-destructive mt-1"
              role="alert"
              aria-live="polite"
            >
              {errors.job.message}
            </p>
          )}
        </div>

        {/* Penghasilan */}
        <div>
          <label
            htmlFor="income"
            className="block text-sm font-medium text-card-foreground mb-2"
          >
            Penghasilan (Saat Ta&apos;aruf) *
          </label>
          <select
            id="income"
            {...register("income")}
            className="w-full"
            disabled={isLoading}
          >
            <option value="">Pilih Range</option>
            {penghasilanOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.income && (
            <p
              className="text-sm text-destructive mt-1"
              role="alert"
              aria-live="polite"
            >
              {errors.income.message}
            </p>
          )}
        </div>

        {/* Tinggi Badan */}
        <div>
          <label
            htmlFor="height"
            className="block text-sm font-medium text-card-foreground mb-2"
          >
            Tinggi Badan (cm) *
          </label>
          <input
            id="height"
            type="number"
            {...register("height", { valueAsNumber: true })}
            className="w-full"
            placeholder="170"
            min="120"
            max="220"
            disabled={isLoading}
          />
          {errors.height && (
            <p
              className="text-sm text-destructive mt-1"
              role="alert"
              aria-live="polite"
            >
              {errors.height.message}
            </p>
          )}
        </div>

        {/* Berat Badan */}
        <div>
          <label
            htmlFor="weight"
            className="block text-sm font-medium text-card-foreground mb-2"
          >
            Berat Badan (kg) *
          </label>
          <input
            id="weight"
            type="number"
            {...register("weight", { valueAsNumber: true })}
            className="w-full"
            placeholder="65"
            min="30"
            max="200"
            disabled={isLoading}
          />
          {errors.weight && (
            <p
              className="text-sm text-destructive mt-1"
              role="alert"
              aria-live="polite"
            >
              {errors.weight.message}
            </p>
          )}
        </div>
      </div>

      {/* Riwayat Penyakit */}
      <div>
        <button
          type="button"
          onClick={() => setShowDiseases(!showDiseases)}
          className="flex items-center justify-between w-full p-4 bg-muted rounded-lg text-left hover:bg-muted/80"
          disabled={isLoading}
        >
          <span className="font-medium text-card-foreground">
            Riwayat Penyakit (Opsional)
          </span>
          <span
            className={`transform transition-transform ${
              showDiseases ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>

        {showDiseases && (
          <div className="mt-4 space-y-4 p-4 border border-input rounded-lg">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <input
                  {...register(`diseases.${index}.name` as const)}
                  className="flex-1"
                  placeholder="Nama penyakit"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-destructive hover:text-destructive/80 px-2 py-1"
                  disabled={isLoading}
                >
                  Hapus
                </button>
              </div>
            ))}

            {fields.length < 3 && (
              <button
                type="button"
                onClick={addDisease}
                className="text-sm text-primary hover:text-primary/80"
                disabled={isLoading}
              >
                + Tambah Penyakit
              </button>
            )}

            {errors.diseases && (
              <p
                className="text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {errors.diseases.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={handleSkip}
          disabled={isLoading}
          className="px-6 py-2 text-muted-foreground hover:text-card-foreground border border-input rounded-md disabled:opacity-50"
        >
          Lewati
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-primary-foreground rounded-md px-6 py-2 font-medium hover:bg-primary/90 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? "Menyimpan..." : "Simpan & Lanjutkan"}
        </button>
      </div>
    </form>
  );
}
