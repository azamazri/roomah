"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type FilterBarProps = {
  hideGender?: boolean;
  forceOppositeOfGender?: "M" | "F";
  provinces?: { id: number; name: string }[];
};

interface Filters {
  gender: string;
  ageRange: string;
  education: string;
  province: string;
}

const educationOptions = [
  { value: "", label: "Semua Pendidikan" },
  { value: "SMA_SMK", label: "SMA/SMK" },
  { value: "D3", label: "D3" },
  { value: "S1", label: "S1" },
  { value: "S2", label: "S2" },
  { value: "S3", label: "S3" },
];

// Age ranges: 17-22, 23-28, 29-34, 35-40, 41-46, 47+
const ageRangeOptions = [
  { value: "", label: "Semua Umur" },
  { value: "17-22", label: "17 - 22 tahun" },
  { value: "23-28", label: "23 - 28 tahun" },
  { value: "29-34", label: "29 - 34 tahun" },
  { value: "35-40", label: "35 - 40 tahun" },
  { value: "41-46", label: "41 - 46 tahun" },
  { value: "47+", label: "47+ tahun" },
];

const genderOptions = [
  { value: "", label: "Semua Gender" },
  { value: "IKHWAN", label: "Ikhwan" },
  { value: "AKHWAT", label: "Akhwat" },
];

export default function FilterBar({
  hideGender,
  forceOppositeOfGender,
  provinces = [],
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [provinceOptions, setProvinceOptions] = useState<
    { id: number; name: string }[]
  >(provinces ?? []);
  const [loadingProvinces, setLoadingProvinces] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    gender: searchParams.get("gender") || "",
    ageRange: searchParams.get("ageRange") || "",
    education: searchParams.get("education") || "",
    province: searchParams.get("province") || "",
  });

  useEffect(() => {
    setProvinceOptions(provinces ?? []);
  }, [provinces]);

  useEffect(() => {
    if (provinces && provinces.length > 0) {
      return;
    }
  const isMounted = true;
    setLoadingProvinces(true);

    fetch("/api/provinces")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load provinces");
        const payload = await res.json();
        if (isMounted) {
          setProvinceOptions(payload?.provinces ?? []);
        }
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("[FilterBar] Failed to load provinces:", error);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingProvinces(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [provinces]);

  useEffect(() => {
    setFilters({
      gender: searchParams.get("gender") || "",
      ageRange: searchParams.get("ageRange") || "",
      education: searchParams.get("education") || "",
      province: searchParams.get("province") || "",
    });
  }, [searchParams]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const apply = () => {
    const params = new URLSearchParams();

    // Gender handling - force opposite gender for approved users
    // forceOppositeOfGender: "M" means show IKHWAN, "F" means show AKHWAT
    if (forceOppositeOfGender) {
      const forced = forceOppositeOfGender === "M" ? "IKHWAN" : "AKHWAT";
      params.set("gender", forced);
    } else if (filters.gender && filters.gender !== "") {
      params.set("gender", filters.gender);
    }

    // Apply other filters
    if (filters.ageRange && filters.ageRange !== "") {
      params.set("ageRange", filters.ageRange);
    }
    
    if (filters.education && filters.education !== "") {
      params.set("education", filters.education);
    }
    
    if (filters.province && filters.province !== "") {
      params.set("province", filters.province);
    }

    // Always reset to page 1 when applying filters
    params.set("page", "1");
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const reset = () => {
    setFilters({
      gender: "",
      ageRange: "",
      education: "",
      province: "",
    });

    const params = new URLSearchParams();
    if (forceOppositeOfGender) {
      const forced = forceOppositeOfGender === "M" ? "AKHWAT" : "IKHWAN";
      params.set("gender", forced);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
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
          <label htmlFor="ageRange" className="block text-sm font-medium mb-2">
            Umur
          </label>
          <select
            id="ageRange"
            value={filters.ageRange}
            onChange={(e) => handleFilterChange("ageRange", e.target.value)}
            className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {ageRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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
            disabled={loadingProvinces && provinceOptions.length === 0}
          >
            <option value="">Semua Provinsi</option>
            {provinceOptions.map((prov) => (
              <option key={prov.id} value={prov.id.toString()}>
                {prov.name}
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

