import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi - Roomah",
  description:
    "Pelajari bagaimana Roomah melindungi dan mengelola data pribadi pengguna sesuai dengan standar keamanan tertinggi.",
};

export default function PrivacyPage() {
  return (
    <div className="section-y">
      <div className="container-x max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Kebijakan Privasi
          </h1>
          <p className="text-xl text-muted-foreground">
            Komitmen Roomah dalam melindungi privasi dan keamanan data Anda
          </p>
        </div>

        <div className="prose prose-gray max-w-none">
          <div className="bg-surface-1 rounded-lg p-6 mb-8">
            <p className="text-sm text-muted-foreground mb-2">
              Terakhir diperbarui: 22 September 2025
            </p>
            <p className="text-muted-foreground">
              Kebijakan Privasi ini menjelaskan bagaimana Roomah mengumpulkan,
              menggunakan, dan melindungi informasi pribadi Anda saat
              menggunakan platform kami.
            </p>
          </div>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. Informasi yang Kami Kumpulkan
            </h2>

            <h3 className="text-xl font-medium text-foreground mb-3">
              1.1 Informasi Profil
            </h3>
            <ul className="space-y-2 text-muted-foreground mb-6">
              <li>• Nama lengkap dan informasi identitas</li>
              <li>• Tanggal lahir dan usia</li>
              <li>• Informasi pendidikan dan pekerjaan</li>
              <li>• Lokasi domisili (provinsi dan kota)</li>
              <li>• Foto profil dan dokumen verifikasi</li>
              <li>• Preferensi dan kriteria pasangan</li>
            </ul>

            <h3 className="text-xl font-medium text-foreground mb-3">
              1.2 Informasi Teknis
            </h3>
            <ul className="space-y-2 text-muted-foreground mb-6">
              <li>• Alamat IP dan informasi perangkat</li>
              <li>• Data log aktivitas di platform</li>
              <li>• Cookie dan teknologi pelacakan serupa</li>
              <li>• Informasi lokasi (jika diizinkan)</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. Bagaimana Kami Menggunakan Informasi
            </h2>

            <div className="space-y-4 text-muted-foreground">
              <div className="bg-surface-1 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">
                  🔍 Pencocokan Profil
                </h4>
                <p className="text-sm">
                  Menggunakan informasi profil untuk menampilkan kandidat yang
                  sesuai dengan kriteria Anda.
                </p>
              </div>

              <div className="bg-surface-1 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">
                  ✅ Verifikasi Identitas
                </h4>
                <p className="text-sm">
                  Memverifikasi keaslian profil untuk menjaga kualitas dan
                  keamanan platform.
                </p>
              </div>

              <div className="bg-surface-1 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">
                  📞 Komunikasi
                </h4>
                <p className="text-sm">
                  Mengirim notifikasi penting, update platform, dan dukungan
                  pelanggan.
                </p>
              </div>

              <div className="bg-surface-1 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">
                  📊 Analisis Platform
                </h4>
                <p className="text-sm">
                  Menganalisis penggunaan platform untuk meningkatkan layanan
                  dan pengalaman pengguna.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. Keamanan Data
            </h2>

            <div className="space-y-4 text-muted-foreground">
              <p>
                Kami menerapkan langkah-langkah keamanan tingkat enterprise
                untuk melindungi data Anda:
              </p>

              <ul className="space-y-2">
                <li>• Enkripsi end-to-end untuk data sensitif</li>
                <li>• Sistem autentikasi multi-faktor</li>
                <li>• Pemantauan keamanan 24/7</li>
                <li>• Audit keamanan berkala oleh pihak ketiga</li>
                <li>• Backup data terjadwal dengan enkripsi</li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. Berbagi Informasi
            </h2>

            <div className="space-y-4 text-muted-foreground">
              <p>
                Roomah tidak menjual data pribadi Anda kepada pihak ketiga. Kami
                hanya berbagi informasi dalam kondisi berikut:
              </p>

              <ul className="space-y-2">
                <li>• Dengan persetujuan eksplisit Anda</li>
                <li>
                  • Untuk memfasilitasi proses Ta'aruf yang Anda setujui
                </li>
                <li>
                  • Kepada penyedia layanan tepercaya yang membantu operasional
                  platform
                </li>
                <li>
                  • Jika diwajibkan oleh hukum atau otoritas yang berwenang
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              5. Hak-Hak Anda
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-1 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Akses Data</h4>
                <p className="text-sm text-muted-foreground">
                  Anda dapat meminta salinan lengkap data pribadi yang kami
                  simpan.
                </p>
              </div>

              <div className="bg-surface-1 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">
                  Koreksi Data
                </h4>
                <p className="text-sm text-muted-foreground">
                  Anda dapat memperbarui atau mengoreksi informasi profil kapan
                  saja.
                </p>
              </div>

              <div className="bg-surface-1 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">
                  Penghapusan Data
                </h4>
                <p className="text-sm text-muted-foreground">
                  Anda dapat meminta penghapusan akun dan data pribadi.
                </p>
              </div>

              <div className="bg-surface-1 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">
                  Portabilitas Data
                </h4>
                <p className="text-sm text-muted-foreground">
                  Anda dapat mengunduh data dalam format yang dapat dibaca
                  mesin.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              6. Cookie dan Teknologi Pelacakan
            </h2>

            <div className="space-y-4 text-muted-foreground">
              <p>Kami menggunakan cookie untuk meningkatkan pengalaman Anda:</p>

              <ul className="space-y-2">
                <li>• Cookie esensial untuk fungsi dasar platform</li>
                <li>• Cookie preferensi untuk menyimpan pengaturan Anda</li>
                <li>• Cookie analitik untuk memahami penggunaan platform</li>
                <li>• Cookie keamanan untuk mencegah penipuan</li>
              </ul>

              <p>
                Anda dapat mengatur preferensi cookie melalui pengaturan browser
                Anda.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              7. Retensi Data
            </h2>

            <div className="space-y-4 text-muted-foreground">
              <p>
                Kami menyimpan data Anda selama diperlukan untuk tujuan yang
                dijelaskan dalam kebijakan ini:
              </p>

              <ul className="space-y-2">
                <li>
                  • Data profil: Selama akun aktif + 1 tahun setelah penghapusan
                </li>
                <li>
                  • Data komunikasi: 3 tahun untuk tujuan keamanan dan hukum
                </li>
                <li>• Data log teknis: 12 bulan untuk analisis dan keamanan</li>
                <li>• Data verifikasi: 5 tahun sesuai persyaratan hukum</li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              8. Perubahan Kebijakan
            </h2>

            <div className="space-y-4 text-muted-foreground">
              <p>
                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke
                waktu. Perubahan akan diberitahukan melalui:
              </p>

              <ul className="space-y-2">
                <li>• Email notifikasi untuk perubahan material</li>
                <li>• Banner pengumuman di platform</li>
                <li>
                  • Update tanggal &quot;terakhir diperbarui&quot; di bagian
                  atas
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              9. Hubungi Kami
            </h2>

            <div className="bg-surface-1 rounded-lg p-6">
              <p className="text-muted-foreground mb-4">
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau
                ingin menggunakan hak-hak Anda, hubungi kami:
              </p>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>Email:</strong> privacy@roomah.id
                </p>
                <p>
                  <strong>Alamat:</strong> Jl. Gejayan No. 123, Yogyakarta,
                  Indonesia 55281
                </p>
                <p>
                  <strong>Telepon:</strong> +62 274 123-4567
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
