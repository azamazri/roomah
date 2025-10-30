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

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsModal({ open, onOpenChange }: TermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-primary">
            Syarat dan Ketentuan
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Platform Taaruf Islami Roomah
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
                Penerimaan Syarat
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Dengan mendaftar dan menggunakan layanan Roomah, Anda menyetujui
                untuk terikat dengan Syarat dan Ketentuan ini. Jika Anda tidak
                menyetujui syarat ini, mohon untuk tidak menggunakan layanan
                kami.
              </p>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </span>
                Definisi Layanan
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Roomah adalah platform Taaruf Islami yang memfasilitasi
                perkenalan dengan tujuan pernikahan yang sesuai dengan syariat
                Islam. Kami menyediakan fitur untuk membuat CV Taaruf, mencari
                jodoh, dan berkomunikasi dalam lingkungan yang Islami.
              </p>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </span>
                Persyaratan Pengguna
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Untuk menggunakan Roomah, Anda harus:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">✓</span>
                  <span>Berusia minimal 18 tahun</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">✓</span>
                  <span>Beragama Islam</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">✓</span>
                  <span>Memiliki niat serius untuk menikah</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">✓</span>
                  <span>
                    Memberikan informasi yang akurat dan jujur dalam CV Taaruf
                    Anda
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">✓</span>
                  <span>Tidak sedang terikat pernikahan dengan orang lain</span>
                </li>
              </ul>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </span>
                Kewajiban Pengguna
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Sebagai pengguna Roomah, Anda wajib:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    Menjaga kesopanan dan adab Islami dalam berkomunikasi
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    Tidak menyebarkan konten yang melanggar syariat Islam
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    Tidak melakukan penipuan atau memberikan informasi palsu
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>Menghormati privasi pengguna lain</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    Tidak menggunakan platform untuk tujuan selain pernikahan
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span>
                    Melibatkan wali dan keluarga dalam proses taaruf yang serius
                  </span>
                </li>
              </ul>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  5
                </span>
                Sistem Koin
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Roomah menggunakan sistem koin untuk beberapa fitur premium.
                Koin dapat dibeli melalui metode pembayaran yang tersedia. Koin
                yang sudah dibeli tidak dapat dikembalikan kecuali dalam kondisi
                tertentu yang diatur oleh kebijakan pengembalian dana kami.
              </p>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  6
                </span>
                Verifikasi CV
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Semua CV Taaruf akan melalui proses verifikasi oleh tim admin
                Roomah. Kami berhak untuk menolak atau meminta revisi CV yang
                tidak memenuhi standar atau mengandung informasi yang tidak
                pantas.
              </p>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  7
                </span>
                Posting Media Sosial
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Fitur posting ke media sosial memerlukan persetujuan admin. Kami
                berhak menolak permintaan posting yang tidak sesuai dengan
                nilai-nilai Islami atau kebijakan kami. Biaya yang sudah
                dibayarkan akan dikembalikan jika permintaan ditolak.
              </p>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  8
                </span>
                Privasi dan Keamanan Data
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Kami berkomitmen untuk melindungi data pribadi Anda. Silakan
                baca Kebijakan Privasi kami untuk informasi lebih detail tentang
                bagaimana kami mengumpulkan, menggunakan, dan melindungi data
                Anda.
              </p>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  9
                </span>
                Penangguhan dan Penghapusan Akun
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Kami berhak untuk menangguhkan atau menghapus akun pengguna yang
                melanggar Syarat dan Ketentuan ini, termasuk namun tidak
                terbatas pada perilaku yang tidak pantas, penipuan, atau
                penyalahgunaan platform.
              </p>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  10
                </span>
                Batasan Tanggung Jawab
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Roomah adalah platform fasilitator. Kami tidak bertanggung jawab
                atas hasil dari proses taaruf, termasuk keputusan untuk
                melanjutkan atau tidak melanjutkan hubungan. Pengguna
                bertanggung jawab penuh atas keputusan dan tindakan mereka.
              </p>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  11
                </span>
                Perubahan Syarat dan Ketentuan
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Kami berhak untuk mengubah Syarat dan Ketentuan ini
                sewaktu-waktu. Perubahan akan diberitahukan kepada pengguna
                melalui email atau notifikasi di platform. Penggunaan platform
                setelah perubahan dianggap sebagai penerimaan terhadap syarat
                yang baru.
              </p>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  12
                </span>
                Hukum yang Berlaku
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Syarat dan Ketentuan ini diatur oleh hukum yang berlaku di
                Republik Indonesia dan prinsip-prinsip syariat Islam.
              </p>
            </section>

            <section className="bg-card p-5 rounded-lg border shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  13
                </span>
                Kontak
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini,
                silakan hubungi kami di:
              </p>
              <div className="bg-primary/5 p-3 rounded-md">
                <p className="text-sm font-medium">
                  📧 Email: support@roomah.id
                </p>
              </div>
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
