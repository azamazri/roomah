import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan - Roomah",
  description:
    "Syarat dan ketentuan penggunaan platform Roomah untuk Ta'aruf Islami yang aman dan sesuai syariat.",
};

export default function TermsPage() {
  return (
    <div className="section-y">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Syarat & Ketentuan
          </h1>
          <p className="text-xl text-muted-foreground">
            Pedoman penggunaan platform Roomah untuk Taaruf yang berkah
          </p>
        </div>

        <div className="prose prose-gray max-w-none">
          <div className="bg-surface-1 rounded-lg p-6 mb-8">
            <p className="text-sm text-muted-foreground mb-2">
              Terakhir diperbarui: 22 September 2025
            </p>
            <p className="text-muted-foreground">
              Dengan menggunakan platform Roomah, Anda menyetujui syarat dan
              ketentuan berikut ini. Silakan baca dengan seksama sebelum
              mendaftar.
            </p>
          </div>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. Definisi dan Ruang Lingkup
            </h2>

            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>Roomah</strong> adalah platform digital yang
                memfasilitasi proses Taaruf (perkenalan) antara Muslim dan
                Muslimah yang memiliki niat serius untuk menikah.
              </p>

              <p>
                <strong>Pengguna</strong> adalah individu yang mendaftar dan
                menggunakan layanan Roomah.
              </p>

              <p>
                <strong>Taaruf</strong> adalah proses perkenalan sesuai syariat
                Islam dengan tujuan pernikahan.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. Persyaratan Pengguna
            </h2>

            <div className="bg-surface-1 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-foreground mb-4">
                Syarat Umum:
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Minimal berusia 18 tahun</li>
                <li>• Beragama Islam dan menjalankan ajaran dengan baik</li>
                <li>• Belum menikah atau sudah bercerai/menjanda</li>
                <li>• Memiliki niat serius untuk menikah</li>
                <li>• Dapat memberikan dokumen identitas yang valid</li>
              </ul>
            </div>

            <div className="bg-surface-1 rounded-lg p-6">
              <h3 className="text-lg font-medium text-foreground mb-4">
                Persyaratan Khusus:
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Profil yang lengkap dan akurat</li>
                <li>• Foto profil yang sesuai dengan norma kesopanan Islam</li>
                <li>• Kesediaan untuk diverifikasi oleh tim Roomah</li>
                <li>• Mematuhi adab dan etika Islam dalam berkomunikasi</li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. Kewajiban Pengguna
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">
                  Kewajiban Umum:
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Memberikan informasi yang benar dan akurat</li>
                  <li>• Menjaga kerahasiaan password dan akun</li>
                  <li>• Menghormati privasi pengguna lain</li>
                  <li>• Melaporkan perilaku yang melanggar ketentuan</li>
                  <li>• Menggunakan platform sesuai tujuan yang dimaksud</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">
                  Etika Komunikasi:
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Berkomunikasi dengan sopan dan hormat</li>
                  <li>• Menghindari percakapan yang tidak pantas</li>
                  <li>• Melibatkan wali atau keluarga sesuai syariat</li>
                  <li>• Menjaga batasan-batasan Islam</li>
                  <li>• Tidak memaksa atau mendesak pihak lain</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. Larangan dan Sanksi
            </h2>

            <div className="space-y-6">
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
                <h3 className="text-lg font-medium text-destructive mb-4">
                  Tindakan yang Dilarang:
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Membuat profil palsu atau menyesatkan</li>
                  <li>
                    • Meminta atau memberikan kontak pribadi tanpa persetujuan
                  </li>
                  <li>• Mengirim konten tidak pantas atau melanggar syariat</li>
                  <li>• Melakukan pelecehan atau intimidasi</li>
                  <li>
                    • Meminta atau menawarkan hal-hal yang bertentangan dengan
                    Islam
                  </li>
                  <li>
                    • Menggunakan platform untuk tujuan komersial tanpa izin
                  </li>
                  <li>• Menyebarkan informasi pribadi pengguna lain</li>
                </ul>
              </div>

              <div className="bg-warning/5 border border-warning/20 rounded-lg p-6">
                <h3 className="text-lg font-medium text-warning mb-4">
                  Sanksi Pelanggaran:
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <strong>Peringatan:</strong> Untuk pelanggaran ringan
                    pertama kali
                  </div>
                  <div>
                    <strong>Pembatasan:</strong> Akses terbatas untuk jangka
                    waktu tertentu
                  </div>
                  <div>
                    <strong>Suspensi:</strong> Pembekuan akun sementara (7-30
                    hari)
                  </div>
                  <div>
                    <strong>Penghapusan Permanen:</strong> Pelanggaran berat
                    atau berulang
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              5. Layanan dan Fitur
            </h2>

            <div className="space-y-4 text-muted-foreground">
              <p>
                Roomah menyediakan platform untuk memfasilitasi Taaruf, namun
                tidak menjamin:
              </p>

              <ul className="space-y-2">
                <li>• Hasil atau keberhasilan proses Taaruf</li>
                <li>• Kesesuaian atau kompatibilitas pasangan</li>
                <li>• Kebenaran 100% informasi yang diberikan pengguna lain</li>
                <li>• Kelanjutan hubungan hingga pernikahan</li>
              </ul>

              <p>
                Roomah berkomitmen untuk menyediakan platform yang aman, namun
                keputusan akhir tentang proses Taaruf sepenuhnya berada di
                tangan pengguna dan keluarga masing-masing.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              6. Biaya dan Pembayaran
            </h2>

            <div className="space-y-4 text-muted-foreground">
              <p>
                Roomah menyediakan layanan dasar gratis dan layanan premium
                berbayar:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-1 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">
                    Layanan Gratis:
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Pendaftaran dan pembuatan profil</li>
                    <li>• Pencarian dasar kandidat</li>
                    <li>• Komunikasi terbatas</li>
                    <li>• Verifikasi profil</li>
                  </ul>
                </div>

                <div className="bg-surface-1 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">
                    Layanan Premium:
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Pencarian lanjutan dengan filter detail</li>
                    <li>• Komunikasi tanpa batas</li>
                    <li>• Prioritas dalam rekomendasi</li>
                    <li>• Konsultasi dengan konselor pernikahan</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              7. Tanggung Jawab dan Pembatasan
            </h2>

            <div className="space-y-4 text-muted-foreground">
              <p>Roomah tidak bertanggung jawab atas:</p>

              <ul className="space-y-2">
                <li>
                  • Kerugian finansial, emosional, atau lainnya akibat
                  penggunaan platform
                </li>
                <li>
                  • Tindakan pengguna lain yang melanggar syariat atau hukum
                </li>
                <li>• Kegagalan proses Taaruf atau hubungan</li>
                <li>
                  • Gangguan teknis atau kerusakan sistem yang tidak dapat
                  dihindari
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              8. Perubahan Ketentuan
            </h2>

            <div className="space-y-4 text-muted-foreground">
              <p>
                Roomah berhak mengubah syarat dan ketentuan ini dengan
                pemberitahuan minimal 30 hari sebelumnya. Perubahan akan efektif
                setelah periode pemberitahuan berakhir.
              </p>

              <p>
                Penggunaan platform setelah perubahan ketentuan dianggap sebagai
                persetujuan terhadap syarat dan ketentuan yang baru.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              9. Penyelesaian Sengketa
            </h2>

            <div className="bg-surface-1 rounded-lg p-6">
              <div className="space-y-4 text-muted-foreground">
                <p>Setiap sengketa akan diselesaikan melalui:</p>

                <ol className="space-y-2 list-decimal list-inside">
                  <li>
                    Musyawarah dan mediasi yang mengedepankan nilai-nilai Islam
                  </li>
                  <li>Arbitrase sesuai hukum Islam jika diperlukan</li>
                  <li>Pengadilan yang berwenang di Yogyakarta, Indonesia</li>
                </ol>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              10. Kontak dan Bantuan
            </h2>

            <div className="bg-surface-1 rounded-lg p-6">
              <p className="text-muted-foreground mb-4">
                Untuk pertanyaan tentang Syarat & Ketentuan ini, silakan
                hubungi:
              </p>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>Email:</strong> support@roomah.id
                </p>
                <p>
                  <strong>WhatsApp:</strong> +62 812-3456-7890
                </p>
                <p>
                  <strong>Alamat:</strong> Jl. Gejayan No. 123, Yogyakarta,
                  Indonesia 55281
                </p>
              </div>
            </div>
          </section>

          <div className="text-center mt-12 p-6 bg-primary/5 rounded-lg">
            <p className="text-muted-foreground italic">
              &quot;Dan di antara tanda-tanda kekuasaan-Nya ialah Dia
              menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya
              kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya
              diantaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian
              itu benar-benar terdapat tanda-tanda bagi kaum yang
              berfikir.&quot;
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              - QS. Ar-Rum: 21
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
