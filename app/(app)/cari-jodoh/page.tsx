import { Metadata } from "next";
import FilterBar from "@/components/common/filter-bar";
import CandidateTeaser from "@/components/common/candidate-teaser";
import { supabaseServer } from "@/lib/supabase/server";
import { getProvincesList } from "@/server/actions/provinces";

export const metadata: Metadata = {
  title: "Cari Jodoh - Roomah",
  description:
    "Temukan pasangan hidup yang tepat untuk membangun keluarga sakinah",
  robots: "noindex",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Number(pageParam ?? 1);

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let gender: "M" | "F" | undefined = undefined;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("gender")
      .eq("user_id", user.id)
      .maybeSingle();
    
    // Convert IKHWAN/AKHWAT enum to M/F for FilterBar compatibility
    const profileGender = profile?.gender as string | null;
    if (profileGender === "IKHWAN") {
      gender = "M";
    } else if (profileGender === "AKHWAT") {
      gender = "F";
    }
  }

  // Fetch provinces server-side
  const provinces = await getProvincesList();

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Temukan Pasangan Hidup Anda
        </h1>
        <p className="text-muted-foreground">
          Platform Taaruf Islami untuk membangun keluarga sakinah
        </p>
      </div>

      <FilterBar hideGender forceOppositeOfGender={gender} provinces={provinces} />
      <CandidateTeaser
        page={page}
        pageSize={6}
        baseUrl="/cari-jodoh"
        filters={{
          gender: (params.gender as string) ?? "",
          ageRange: (params.ageRange as string) ?? "",
          education: (params.education as string) ?? "",
          province: (params.province as string) ?? "",
        }}
      />
    </div>
  );
}

