"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type FilterBarProps = {
  hideGender?: boolean;
  forceOppositeOfGender?: "M" | "F";
};

interface Filters {
  gender: string;
  ageMin: string;
  ageMax: string;
  education: string;
  province: string;
}

const educationOptions = [
  { value: "", label: "Semua Pendidikan" },
  { value: "SMA", label: "SMA/SMK" },
  { value: "D3", label: "D3" },
  { value: "S1", label: "S1" },
  { value: "S2", label: "S2" },
  { value: "S3", label: "S3" },
];

const provinceOptions = [
  { value: "", label: "Semua Provinsi" },
  { value: "DKI Jakarta", label: "DKI Jakarta" },
  { value: "Jawa Barat", label: "Jawa Barat" },
  { value: "Jawa Tengah", label: "Jawa Tengah" },
  { value: "Jawa Timur", label: "Jawa Timur" },
  { value: "DI Yogyakarta", label: "DI Yogyakarta" },
  { value: "Banten", label: "Banten" },
  { value: "Sumatra Utara", label: "Sumatra Utara" },
];

const genderOptions = [
  { value: "", label: "Semua Gender" },
  { value: "M", label: "Laki-laki" },
  { value: "F", label: "Perempuan" },
];

export default function FilterBar({
  hideGender,
  forceOppositeOfGender,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>({
    gender: searchParams.get("gender") || "",
    ageMin: searchParams.get("ageMin") || "",
    ageMax: searchParams.get("ageMax") || "",
    education: searchParams.get("education") || "",
    province: searchParams.get("province") || "",
  });

  useEffect(() => {
    setFilters({
      gender: searchParams.get("gender") || "",
      ageMin: searchParams.get("ageMin") || "",
      ageMax: searchParams.get("ageMax") || "",
      education: searchParams.get("education") || "",
      province: searchParams.get("province") || "",
    });
  }, [searchParams]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Handle regular filters
    Object.entries(filters).forEach(([key, value]) => {
      if (key === "gender") return; // Handle separately
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Gender handling
    if (forceOppositeOfGender) {
      const forced = forceOppositeOfGender === "M" ? "F" : "M";
      params.set("gender", forced);
    } else if (filters.gender) {
      params.set("gender", filters.gender);
    } else {
      params.delete("gender");
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  const reset = () => {
    setFilters({
      gender: "",
      ageMin: "",
      ageMax: "",
      education: "",
      province: "",
    });

    const params = new URLSearchParams();
    if (forceOppositeOfGender) {
      const forced = forceOppositeOfGender === "M" ? "F" : "M";
      params.set("gender", forced);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  return (
    <div className="rounded-lg border border-input bg-card text-card-foreground p-4 lg:p-6 shadow-sm">
      <div className="grid gap-3 md:grid-cols-4">
        {!hideGender && (
          <div>
            <label htmlFor="gender" className="block text-sm font-medium mb-2">
              Gender
            </label>
            <select
              id="gender"
              value={filters.gender}
              onChange={(e) => handleFilterChange("gender", e.target.value)}
              className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {genderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="ageMin" className="block text-sm font-medium mb-2">
            Umur Min
          </label>
          <select
            id="ageMin"
            value={filters.ageMin}
            onChange={(e) => handleFilterChange("ageMin", e.target.value)}
            className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Min</option>
            {Array.from({ length: 19 }, (_, i) => 17 + i).map((age) => (
              <option key={age} value={age.toString()}>
                {age}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ageMax" className="block text-sm font-medium mb-2">
            Umur Max
          </label>
          <select
            id="ageMax"
            value={filters.ageMax}
            onChange={(e) => handleFilterChange("ageMax", e.target.value)}
            className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Max</option>
            {Array.from({ length: 19 }, (_, i) => 17 + i).map((age) => (
              <option key={age} value={age.toString()}>
                {age}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="education" className="block text-sm font-medium mb-2">
            Pendidikan
          </label>
          <select
            id="education"
            value={filters.education}
            onChange={(e) => handleFilterChange("education", e.target.value)}
            className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {educationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="province" className="block text-sm font-medium mb-2">
            Domisili
          </label>
          <select
            id="province"
            value={filters.province}
            onChange={(e) => handleFilterChange("province", e.target.value)}
            className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {provinceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button onClick={apply}>Terapkan Filter</Button>
        <Button variant="outline" onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
