"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface SearchFiltersProps {
  showGender?: boolean;
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
  { value: "ikhwan", label: "Ikhwan" },
  { value: "akhwat", label: "Akhwat" },
];

export function SearchFilters({ showGender = true }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    gender: searchParams.get("gender") || "",
    ageMin: searchParams.get("ageMin") || "",
    ageMax: searchParams.get("ageMax") || "",
    education: searchParams.get("education") || "",
    province: searchParams.get("province") || "",
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    const queryString = params.toString();
    router.push(
      `${window.location.pathname}${queryString ? `?${queryString}` : ""}`
    );
  };

  const handleReset = () => {
    setFilters({
      gender: "",
      ageMin: "",
      ageMax: "",
      education: "",
      province: "",
    });
    router.push(window.location.pathname);
  };

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {showGender && (
          <div>
            <label htmlFor="gender" className="block text-sm font-medium mb-2">
              Gender
            </label>
            <select
              id="gender"
              value={filters.gender}
              onChange={(e) => handleFilterChange("gender", e.target.value)}
              className="w-full"
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
            className="w-full"
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
            className="w-full"
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
            className="w-full"
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
            className="w-full"
          >
            {provinceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={handleReset} size="sm">
          Reset Filter
        </Button>
      </div>
    </Card>
  );
}
