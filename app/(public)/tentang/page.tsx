import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Kami - Roomah",
  description:
    "Pelajari lebih lanjut tentang misi Roomah dalam mempertemukan Muslim dan Muslimah untuk membangun keluarga sakinah sesuai syariat Islam.",
};

export default function TentangPage() {
  return (
    <div className="section-y">
      <div className="container-x">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Tentang Roomah
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Platform Ta'aruf Islami yang menghubungkan hati yang tulus
            untuk membangun rumah tangga sakinah, mawadah, dan rahmah.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Visi Kami
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Menjadi platform Ta'aruf terdepan yang membantu umat Islam
                menemukan pasangan hidup yang tepat untuk membangun keluarga
                yang berkah dan menjadi bagian dari peradaban Islam yang mulia.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Misi Kami
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></span>
                  Menyediakan platform Ta'aruf yang aman, terpercaya, dan
                  sesuai dengan nilai-nilai Islam
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></span>
                  Memfasilitasi pertemuan antara Muslim dan Muslimah yang
                  memiliki niat serius untuk menikah
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></span>
                  Memberikan pendampingan dalam proses Ta'aruf sesuai
                  dengan syariat Islam
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></span>
                  Membangun komunitas muslim yang kuat dan saling mendukung
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Mengapa Roomah?
              </h2>
              <div className="space-y-4">
                <div className="bg-surface-1 rounded-lg p-4">
                  <h3 className="font-medium text-foreground mb-2">
                    🔒 Keamanan & Privasi
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Semua data pribadi dilindungi dengan enkripsi tingkat tinggi
                    dan verifikasi identitas yang ketat.
                  </p>
                </div>

                <div className="bg-surface-1 rounded-lg p-4">
                  <h3 className="font-medium text-foreground mb-2">
                    ✅ Profil Terverifikasi
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Setiap profil melewati proses verifikasi manual untuk
                    memastikan keaslian dan keseriusan.
                  </p>
                </div>

                <div className="bg-surface-1 rounded-lg p-4">
                  <h3 className="font-medium text-foreground mb-2">
                    🤝 Pendampingan Syar'i
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Proses Ta'aruf didampingi oleh tim yang memahami fiqh
                    munakahat dan tradisi Islam.
                  </p>
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
                Mengutamakan ridha Allah SWT dalam setiap proses Ta'aruf
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
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Siap Memulai Perjalanan Ta'aruf?
          </h2>
          <p className="text-muted-foreground mb-6">
            Bergabunglah dengan ribuan Muslim dan Muslimah yang telah
            mempercayakan pencarian jodoh mereka kepada Roomah
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-lg text-lg">
              Daftar Sekarang
            </button>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-11 px-8 rounded-lg text-lg">
              Pelajari Lebih Lanjut
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
