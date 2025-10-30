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
  let hideGenderFilter = false;

  if (user) {
    // Check CV status first to determine if user has approved CV
    const { data: cvData } = await supabase
      .from("cv_data")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();

    const cvStatus = cvData?.status;
    const isApproved = cvStatus === "APPROVED";

    // Get user's gender from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("gender")
      .eq("user_id", user.id)
      .maybeSingle();
    
    const profileGender = profile?.gender as string | null;

    // BUSINESS LOGIC:
    // If CV is APPROVED → hide gender filter & force opposite gender
    // If CV is NOT APPROVED → show gender filter & show all candidates
    if (isApproved && profileGender) {
      hideGenderFilter = true;
      // Force opposite gender - IKHWAN sees AKHWAT (F), AKHWAT sees IKHWAN (M)
      if (profileGender === "IKHWAN") {
        gender = "F"; // Show AKHWAT
      } else if (profileGender === "AKHWAT") {
        gender = "M"; // Show IKHWAN
      }
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

      <FilterBar 
        hideGender={hideGenderFilter} 
        forceOppositeOfGender={gender} 
        provinces={provinces} 
      />
      <CandidateTeaser
        page={page}
        pageSize={6}
        baseUrl="/cari-jodoh"
        currentUserId={user?.id}
        filters={{
          gender: gender ? (gender === "M" ? "IKHWAN" : "AKHWAT") : (params.gender as string) ?? "",
          ageRange: (params.ageRange as string) ?? "",
          education: (params.education as string) ?? "",
          province: (params.province as string) ?? "",
        }}
      />
    </div>
  );
}

