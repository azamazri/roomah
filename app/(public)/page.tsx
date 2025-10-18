// app/(public)/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import FilterBar from "@/components/common/filter-bar";
import CandidateTeaser from "@/components/common/candidate-teaser";
import { getProvincesList } from "@/server/actions/provinces";
import { createMetadata } from "@/lib/config/metadata";

// Revalidate every hour
export const revalidate = 3600;

export const metadata: Metadata = createMetadata({
  title: "Platform Taaruf Islami Terpercaya",
  description:
    "Temukan pasangan shaleh/shalehah untuk membangun keluarga sakinah. Platform Taaruf Islami dengan profil terverifikasi sesuai syariat.",
});

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = await searchParams;
  const page = Number(sp?.page ?? "1") || 1;
  
  // Fetch provinces for filter
  const provinces = await getProvincesList();
  
  // Extract filter params
  const filters = {
    gender: (sp.gender as string) ?? "",
    ageRange: (sp.ageRange as string) ?? "",
    education: (sp.education as string) ?? "",
    province: (sp.province as string) ?? "",
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-[hsl(var(--surface-1))]">
        <div className="container-x text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto leading-tight">
            Mewujudkan Pernikahan
            <br />
            Membangun Peradaban
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Platform Ta'aruf Islami yang membantu Anda menemukan pasangan
            shaleh/shalehah untuk membangun keluarga sakinah.
          </p>
          <Button size="lg" className="rounded-full" asChild>
            <a href="#search-section" className="no-underline">
              Mulai Pencarian
            </a>
          </Button>
        </div>
      </section>

      {/* Banner Section */}
      <section className="py-16">
        <div className="container-x">
          <div className="relative rounded-2xl min-h-[400px] hero-gradient overflow-hidden elevated">
            <Image
              src="/images/hero-banner.webp"
              alt="Pasangan Bahagia dalam Pernikahan Islami - Roomah"
              width={1200}
              height={400}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
            />
            <div className="relative z-10 flex items-center justify-center min-h-[400px] px-8">
              <div className="text-center text-white">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Temukan Jodoh Terbaik Anda
                </h2>
                <p className="text-lg opacity-90 max-w-2xl mx-auto">
                  Bergabunglah dengan ribuan Muslim dan Muslimah yang telah
                  menemukan pasangan hidup melalui Roomah
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section id="search-section" className="py-16 bg-[hsl(var(--surface-2))]">
        <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Temukan Pasangan Hidup Anda
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Telusuri profil calon yang siap untuk melanjutkan ke jenjang
              pernikahan.
            </p>
          </div>

          <div className="mb-12">
            <FilterBar provinces={provinces} />
          </div>

          <CandidateTeaser
            page={page}
            pageSize={6}
            filters={filters}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container-x">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Mengapa Memilih Roomah?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Platform Ta'aruf terpercaya dengan pendekatan Islami yang
              sesuai syariat
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Ta'aruf Sesuai Syariat
              </h3>
              <p className="text-muted-foreground">
                Proses Ta'aruf yang sesuai dengan ajaran Islam dan
                melibatkan keluarga dalam setiap tahapannya.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Privasi Terjamin
              </h3>
              <p className="text-muted-foreground">
                Data pribadi Anda aman dan terlindungi dengan sistem keamanan
                tingkat tinggi.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Profil Terverifikasi
              </h3>
              <p className="text-muted-foreground">
                Semua profil telah melewati proses verifikasi untuk memastikan
                keaslian dan keseriusan niat.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
