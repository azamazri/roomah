"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  User,
  Ruler,
  Users,
  Heart,
  Target,
  Church,
  ChevronDown,
} from "lucide-react";
import { loadCvDataByUserId } from "@/server/actions/cv-details";
import { toast } from "sonner";

interface CvDetailModalProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
}

export function CvDetailModal({
  userId,
  open,
  onClose,
}: CvDetailModalProps) {
  const [cvData, setCvData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openSections, setOpenSections] = useState<string[]>(["biodata"]);

  useEffect(() => {
    if (userId && open) {
      loadCV();
    }
  }, [userId, open]);

  const loadCV = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const data = await loadCvDataByUserId(userId);
      console.log("CV Data loaded:", data);
      console.log("Kode Kandidat:", data?.kodeKandidat);
      setCvData(data);
    } catch (error) {
      console.error("Error loading CV:", error);
      toast.error("Gagal memuat data CV");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const SectionCard = ({
    title,
    icon: IconComponent,
    sectionKey,
    children,
  }: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    sectionKey: string;
    children: React.ReactNode;
  }) => {
    const isOpen = openSections.includes(sectionKey);
    
    if (!IconComponent) {
      console.error(`Icon undefined for section: ${sectionKey}`);
      return null;
    }
    
    return (
      <Card className="overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
            <h3 className="font-semibold text-left text-sm sm:text-base">{title}</h3>
          </div>
          <ChevronDown
            className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isOpen && <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-2">{children}</div>}
      </Card>
    );
  };

  const DataRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-2 sm:py-3 px-1 border-b border-border/50 last:border-0">
      <span className="text-xs sm:text-sm text-muted-foreground">{label}</span>
      <span className="text-xs sm:text-sm font-medium sm:text-right sm:max-w-[60%] break-words">
        {value || "-"}
      </span>
    </div>
  );

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-xl">
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Detail CV Kandidat
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-8">
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        ) : cvData ? (
          <div className="space-y-4 sm:space-y-6 px-0 sm:px-2 pb-6">
            {/* Header Info */}
            <Card className="p-3 sm:p-4 bg-primary/5 border-primary/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Nama Lengkap
                  </label>
                  <div className="text-base sm:text-lg font-semibold mt-1">
                    {cvData.biodata?.namaLengkap || "-"}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Kode Kandidat
                  </label>
                  <div className="mt-1">
                    <Badge variant="success" className="text-xs sm:text-sm">
                      {cvData.kodeKandidat || "Belum ada"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Biodata Section */}
            <SectionCard title="Biodata" icon={User} sectionKey="biodata">
              <div className="grid grid-cols-2 gap-4">
                <DataRow
                  label="Tanggal Lahir"
                  value={cvData.biodata?.tanggalLahir}
                />
                <DataRow
                  label="Jenis Kelamin"
                  value={
                    cvData.biodata?.jenisKelamin === "IKHWAN"
                      ? "Ikhwan"
                      : "Akhwat"
                  }
                />
                <DataRow
                  label="Status Pernikahan"
                  value={cvData.biodata?.statusPernikahan}
                />
                <DataRow label="Domisili" value={cvData.biodata?.domisili} />
                <DataRow
                  label="Pendidikan"
                  value={cvData.biodata?.pendidikan}
                />
                <DataRow label="Pekerjaan" value={cvData.biodata?.pekerjaan} />
                <DataRow
                  label="Penghasilan"
                  value={cvData.biodata?.penghasilan}
                />
                <DataRow
                  label="Alamat Lengkap"
                  value={cvData.biodata?.alamatLengkap}
                />
              </div>
            </SectionCard>

            {/* Kondisi Fisik */}
            <SectionCard title="Kondisi Fisik" icon={Ruler} sectionKey="fisik">
              <DataRow
                label="Tinggi / Berat"
                value={`${cvData.biodata?.tinggiBadan || "-"} cm / ${cvData.biodata?.beratBadan || "-"} kg`}
              />
              <DataRow
                label="Ciri Fisik"
                value={cvData.biodata?.ciriFisik}
              />
              {cvData.biodata?.riwayatPenyakit?.length > 0 && (
                <div className="py-2">
                  <span className="text-sm text-muted-foreground">Riwayat Penyakit:</span>
                  <div className="mt-1 space-y-1">
                    {cvData.biodata.riwayatPenyakit.map((penyakit: string, index: number) => (
                      <div key={index} className="text-sm">• {penyakit}</div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Latar Belakang Keluarga */}
            <SectionCard
              title="Latar Belakang Keluarga"
              icon={Users}
              sectionKey="keluarga"
            >
              <DataRow
                label="Keberadaan Orang Tua"
                value={cvData.biodata?.keberadaanOrangTua}
              />
              <DataRow
                label="Pekerjaan Orang Tua"
                value={cvData.biodata?.pekerjaanOrangTua}
              />
              <DataRow
                label="Anak Ke / Saudara"
                value={`${cvData.biodata?.anakKe || "-"} / Dari ${cvData.biodata?.saudaraKandung || "-"} Saudara`}
              />
            </SectionCard>

            {/* Kondisi Ibadah */}
            <SectionCard
              title="Kondisi Ibadah"
              icon={Church}
              sectionKey="ibadah"
            >
              <DataRow
                label="Shalat Fardu"
                value={cvData.kondisiIbadah?.shalatFardu}
              />
              <DataRow
                label="Bacaan Quran"
                value={cvData.kondisiIbadah?.bacaanQuran}
              />
              <DataRow
                label="Puasa"
                value={cvData.kondisiIbadah?.puasa}
              />
              {cvData.kondisiIbadah?.kajian && (
                <div className="py-2">
                  <span className="text-sm text-muted-foreground">Ibadah Lainnya:</span>
                  <div className="text-sm mt-1">{cvData.kondisiIbadah.kajian}</div>
                </div>
              )}
            </SectionCard>

            {/* Kriteria Pasangan */}
            <SectionCard
              title="Kriteria Pasangan"
              icon={Target}
              sectionKey="kriteria"
            >
              <DataRow
                label="Usia"
                value={cvData.kriteriaPasangan?.usia}
              />
              <DataRow
                label="Pendidikan"
                value={cvData.kriteriaPasangan?.pendidikan}
              />
              <DataRow
                label="Penghasilan"
                value={cvData.kriteriaPasangan?.penghasilan}
              />
              <DataRow
                label="Alamat Asal"
                value={cvData.kriteriaPasangan?.ciriFisik}
              />
              {cvData.kriteriaPasangan?.kriteriaKhusus?.length > 0 && (
                <div className="py-2">
                  <span className="text-sm text-muted-foreground">Kriteria Lainnya:</span>
                  <div className="mt-1 space-y-1">
                    {cvData.kriteriaPasangan.kriteriaKhusus.map((kriteria: string, index: number) => (
                      <div key={index} className="text-sm">• {kriteria}</div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Rencana Pernikahan */}
            <SectionCard
              title="Rencana Pernikahan"
              icon={Heart}
              sectionKey="rencana"
            >
              <DataRow
                label="Tahun Nikah"
                value={cvData.rencanaPernikahan?.tahunNikah}
              />
              <DataRow
                label="Tempat Tinggal"
                value={cvData.rencanaPernikahan?.tempatTinggal}
              />
              <DataRow
                label="Visi"
                value={cvData.rencanaPernikahan?.visi}
              />
              <DataRow
                label="Misi"
                value={cvData.rencanaPernikahan?.misi}
              />
            </SectionCard>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Data CV tidak ditemukan</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
