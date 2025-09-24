import { Metadata } from "next";
import FilterBar from "@/components/common/filter-bar";
import CandidateTeaser from "@/components/common/candidate-teaser";
import { getUser } from "@/features/auth/lib/session";

export const metadata: Metadata = {
  title: "Cari Jodoh - Roomah",
  description:
    "Temukan pasangan hidup yang tepat untuk membangun keluarga sakinah",
  robots: "noindex",
};

interface PageProps {
  searchParams: {
    page?: string;
  };
}

export default async function Page({ searchParams }: PageProps) {
  const user = await getUser();
  const page = Number(searchParams.page ?? 1);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Temukan Pasangan Hidup Anda
        </h1>
        <p className="text-muted-foreground">
          Platform Ta&apos;aruf Islami untuk membangun keluarga sakinah
        </p>
      </div>

      <FilterBar hideGender forceOppositeOfGender={user.gender} />
      <CandidateTeaser page={page} pageSize={6} baseUrl="/cari-jodoh" />
    </div>
  );
}
