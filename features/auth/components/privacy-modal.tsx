"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyModal({ open, onOpenChange }: PrivacyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-primary">
            Kebijakan Privasi
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Perlindungan Data & Privasi Pengguna
          </p>
        </DialogHeader>
        <ScrollArea className="h-[65vh]">
          <div className="space-y-5 text-sm px-6 py-6">
            <div className="bg-muted/30 p-4 rounded-lg border border-muted">
              <p className="text-xs text-muted-foreground">
                📅 Terakhir diperbarui:{" "}
                {new Date().toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </span>
                Pendahuluan
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Roomah menghormati privasi Anda dan berkomitmen untuk melindungi
                data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana
                kami mengumpulkan, menggunakan, menyimpan, dan melindungi
                informasi pribadi Anda.
              </p>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </span>
                Informasi yang Kami Kumpulkan
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Kami mengumpulkan berbagai jenis informasi untuk menyediakan
                layanan yang lebih baik:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    <strong>Informasi Akun:</strong> Email, password
                    (terenkripsi), nama lengkap
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    <strong>CV Taaruf:</strong> Data biodata, latar belakang
                    keluarga, kondisi ibadah, kriteria pasangan, dan rencana
                    pernikahan
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    <strong>Informasi Profil:</strong> Foto profil, tanggal
                    lahir, domisili, pendidikan, pekerjaan
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    <strong>Data Transaksi:</strong> Riwayat pembelian koin,
                    penggunaan koin
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    <strong>Komunikasi:</strong> Pesan dalam platform, riwayat
                    taaaruf
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    <strong>Data Teknis:</strong> Alamat IP, jenis browser,
                    perangkat yang digunakan, log aktivitas
                  </span>
                </li>
              </ul>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </span>
                Cara Kami Menggunakan Informasi
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Informasi yang kami kumpulkan digunakan untuk:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    Menyediakan, mengoperasikan, dan memelihara layanan Roomah
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Memfasilitasi proses taaruf antara pengguna</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Memproses verifikasi CV Taaruf</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Memproses transaksi pembayaran koin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    Mengirimkan notifikasi terkait layanan (permintaan taaruf,
                    status CV, dll)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    Meningkatkan keamanan platform dan mencegah penyalahgunaan
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    Menganalisis penggunaan platform untuk perbaikan layanan
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Mematuhi kewajiban hukum yang berlaku</span>
                </li>
              </ul>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </span>
                Berbagi Informasi
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Kami tidak menjual data pribadi Anda. Kami hanya berbagi
                informasi dalam kondisi berikut:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    <strong>Dengan Pengguna Lain:</strong> CV Taaruf Anda akan
                    ditampilkan kepada pengguna lain yang sesuai dengan kriteria
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    <strong>Penyedia Layanan:</strong> Kami dapat berbagi data
                    dengan pihak ketiga yang membantu kami mengoperasikan
                    platform (hosting, pembayaran, dll) dengan perjanjian
                    kerahasiaan
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    <strong>Kewajiban Hukum:</strong> Jika diwajibkan oleh hukum
                    atau untuk melindungi hak-hak kami
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    <strong>Posting Media Sosial:</strong> Dengan persetujuan
                    Anda, CV dapat diposting ke media sosial Roomah
                  </span>
                </li>
              </ul>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  5
                </span>
                Keamanan Data
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Kami menggunakan langkah-langkah keamanan teknis dan organisasi
                untuk melindungi data Anda, termasuk:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    Enkripsi data sensitif (password, informasi pembayaran)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    Akses terbatas ke data pribadi hanya untuk staf yang
                    memerlukan
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Monitoring keamanan dan audit rutin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Backup data secara berkala</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Namun, tidak ada sistem yang 100% aman. Kami mendorong Anda
                untuk menjaga kerahasiaan password Anda.
              </p>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  6
                </span>
                Penyimpanan Data
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Kami menyimpan data pribadi Anda selama akun Anda aktif dan
                untuk jangka waktu yang diperlukan untuk memenuhi tujuan yang
                dijelaskan dalam kebijakan ini, kecuali jika periode penyimpanan
                yang lebih lama diperlukan atau diizinkan oleh hukum.
              </p>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  7
                </span>
                Hak Pengguna
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Anda memiliki hak untuk:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Mengakses dan melihat data pribadi Anda</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    Memperbarui atau mengoreksi informasi yang tidak akurat
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    Menghapus akun dan data Anda (dengan beberapa pengecualian
                    hukum)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Membatasi atau menolak pemrosesan data tertentu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Mengunduh data Anda (portabilitas data)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Menarik persetujuan yang telah diberikan</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Untuk menggunakan hak-hak ini, silakan hubungi kami di
                privacy@roomah.id
              </p>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  8
                </span>
                Cookies dan Teknologi Pelacakan
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Kami menggunakan cookies dan teknologi serupa untuk meningkatkan
                pengalaman pengguna, menganalisis penggunaan platform, dan
                menyediakan fitur-fitur tertentu. Anda dapat mengatur preferensi
                cookies melalui pengaturan browser Anda.
              </p>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  9
                </span>
                Privasi Anak-anak
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Layanan kami tidak ditujukan untuk individu di bawah usia 18
                tahun. Kami tidak secara sengaja mengumpulkan informasi pribadi
                dari anak-anak. Jika Anda mengetahui bahwa anak Anda memberikan
                informasi pribadi kepada kami, silakan hubungi kami.
              </p>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  10
                </span>
                Perubahan Kebijakan Privasi
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke
                waktu. Kami akan memberitahu Anda tentang perubahan signifikan
                melalui email atau notifikasi di platform. Tanggal "Terakhir
                diperbarui" di bagian atas menunjukkan kapan kebijakan ini
                terakhir diubah.
              </p>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  11
                </span>
                Kontak
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan
                terkait Kebijakan Privasi ini atau praktik data kami, silakan
                hubungi kami di:
              </p>
              <div className="bg-primary/5 p-3 rounded-md space-y-1">
                <p className="text-sm font-medium">
                  📧 Email Privacy: privacy@roomah.id
                </p>
                <p className="text-sm font-medium">
                  📧 Email Support: support@roomah.id
                </p>
              </div>
            </section>

            <section className="bg-gradient-to-br from-primary/10 to-primary/5 p-5 rounded-lg border-2 border-primary/20 shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary">
                💚 Komitmen Kami
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Roomah berkomitmen untuk melindungi privasi Anda sesuai dengan
                nilai-nilai Islam yang menjunjung tinggi kehormatan, amanah, dan
                kepercayaan. Kami akan terus berupaya untuk menjaga data Anda
                dengan standar keamanan tertinggi.
              </p>
            </section>
          </div>
        </ScrollArea>
        <DialogFooter className="px-6 py-4 border-t bg-muted/10">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Saya Mengerti
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
