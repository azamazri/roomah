import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Tentang Kami - Roomah",
  description:
    "Pelajari lebih lanjut tentang misi Roomah dalam mempertemukan Muslim dan Muslimah untuk membangun keluarga sakinah sesuai syariat Islam.",
};

export default function TentangPage() {
  return (
    <div className="section-y">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
            <span className="text-primary text-sm font-medium">
              Platform Ta&apos;aruf Terpercaya
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto leading-tight">
            Membangun Rumah Tangga
            <br />
            <span className="text-primary">Sakinah Mawadah Rahmah</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Platform Ta&apos;aruf Islami yang menghubungkan hati yang tulus
            untuk membangun keluarga yang berkah sesuai syariat.
          </p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Left Column - Visi & Misi */}
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-2xl p-8 elevated">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Visi Kami
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Menjadi platform Ta&apos;aruf terdepan yang membantu umat Islam
                menemukan pasangan hidup yang tepat untuk membangun keluarga
                yang berkah dan menjadi bagian dari peradaban Islam yang mulia.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 elevated">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Misi Kami
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                  </div>
                  <span className="text-muted-foreground leading-relaxed">
                    Menyediakan platform Ta&apos;aruf yang aman, terpercaya, dan
                    sesuai dengan nilai-nilai Islam
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                  </div>
                  <span className="text-muted-foreground leading-relaxed">
                    Memfasilitasi pertemuan antara Muslim dan Muslimah yang
                    memiliki niat serius untuk menikah
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                  </div>
                  <span className="text-muted-foreground leading-relaxed">
                    Memberikan pendampingan dalam proses Ta&apos;aruf sesuai
                    dengan syariat Islam
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                  </div>
                  <span className="text-muted-foreground leading-relaxed">
                    Membangun komunitas muslim yang kuat dan saling mendukung
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Mengapa Roomah */}
          <div>
            <div className="sticky top-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Mengapa Memilih Roomah?
              </h2>
              <div className="space-y-4">
                <div className="group bg-gradient-to-br from-card to-surface-1 border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 elevated">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 text-lg">
                        Keamanan & Privasi Terjamin
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Semua data pribadi dilindungi dengan enkripsi tingkat tinggi
                        dan verifikasi identitas yang ketat untuk menjaga keamanan Anda.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-card to-surface-1 border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 elevated">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 text-lg">
                        Profil Terverifikasi
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Setiap profil melewati proses verifikasi manual untuk
                        memastikan keaslian dan keseriusan niat dalam berumah tangga.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-card to-surface-1 border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 elevated">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl">🤝</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 text-lg">
                        Pendampingan Syar&apos;i
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Proses Ta&apos;aruf didampingi oleh tim yang memahami fiqh
                        munakahat dan tradisi Islam untuk perjalanan yang berkah.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-card to-surface-1 border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 elevated">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl">💚</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 text-lg">
                        Komunitas Islami
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Bergabung dengan komunitas Muslim dan Muslimah yang saling
                        mendukung dalam perjalanan menuju pernikahan yang sakinah.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-surface-1 rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Nilai-Nilai Kami
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Setiap langkah yang kami ambil dilandasi oleh nilai-nilai Islam
              yang mulia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤲</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Tauhid
              </h3>
              <p className="text-sm text-muted-foreground">
                Mengutamakan ridha Allah SWT dalam setiap proses Ta&apos;aruf
                dan pernikahan
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Mawadah wa Rahmah
              </h3>
              <p className="text-sm text-muted-foreground">
                Membangun fondasi cinta dan kasih sayang yang didasarkan pada
                ketakwaan
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🕌</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Iffah
              </h3>
              <p className="text-sm text-muted-foreground">
                Menjaga kehormatan dan kesucian dalam setiap interaksi hingga
                ikatan pernikahan
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative mt-20 overflow-hidden">
          <div className="absolute inset-0 hero-gradient opacity-10 rounded-3xl"></div>
          <div className="relative bg-card border border-border rounded-3xl p-12 text-center elevated">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Siap Memulai Perjalanan Ta&apos;aruf?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Bergabunglah dengan ribuan Muslim dan Muslimah yang telah
                mempercayakan pencarian jodoh mereka kepada Roomah
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-base" asChild>
                  <Link href="/register">
                    Daftar Sekarang
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base" asChild>
                  <Link href="/kontak">
                    Hubungi Kami
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

