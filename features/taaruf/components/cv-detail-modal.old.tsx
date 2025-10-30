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

  const isSectionOpen = (section: string) => openSections.includes(section);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
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
          <div className="space-y-4">
            {/* Header - Candidate Info */}
            <Card className="p-4 bg-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{cvData.profile?.full_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Kode: {cvData.cv?.candidate_code}
                  </p>
                </div>
                <Badge variant="success">
                  {cvData.profile?.gender === "IKHWAN" ? "Ikhwan" : "Akhwat"}
                </Badge>
              </div>
            </Card>

            {/* Section: Biodata */}
            <Card>
              <button
                onClick={() => toggleSection("biodata")}
                className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Biodata</h3>
                </div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    isSectionOpen("biodata") ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isSectionOpen("biodata") && (
                <div className="p-4 pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> Tanggal Lahir
                      </span>
                      <p className="font-medium">
                        {cvData.biodata?.tanggalLahir
                          ? new Date(cvData.biodata.tanggalLahir).toLocaleDateString("id-ID")
                          : "-"}
                        {cvData.biodata?.tanggalLahir &&
                          ` (${calculateAge(cvData.biodata.tanggalLahir)} tahun)`}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> Domisili
                      </span>
                      <p className="font-medium">{cvData.biodata?.domisili || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Ruler className="h-4 w-4" /> Tinggi Badan
                      </span>
                      <p className="font-medium">
                        {cvData.biodata?.tinggiBadan ? `${cvData.biodata.tinggiBadan} cm` : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Weight className="h-4 w-4" /> Berat Badan
                      </span>
                      <p className="font-medium">
                        {cvData.biodata?.beratBadan ? `${cvData.biodata.beratBadan} kg` : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <User className="h-4 w-4" /> Status Pernikahan
                      </span>
                      <p className="font-medium">{cvData.biodata?.statusPernikahan || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ciri Fisik</span>
                      <p className="font-medium">{cvData.biodata?.ciriFisik || "-"}</p>
                    </div>
                  </div>
                  {cvData.biodata?.riwayatPenyakit && cvData.biodata.riwayatPenyakit.length > 0 && (
                    <div className="pt-2 border-t">
                      <span className="text-muted-foreground text-sm">Riwayat Penyakit</span>
                      <p className="text-sm mt-1">{cvData.biodata.riwayatPenyakit.join(", ")}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Section: Pendidikan & Pekerjaan */}
            <Card>
              <button
                onClick={() => toggleSection("education")}
                className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Pendidikan & Pekerjaan</h3>
                </div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    isSectionOpen("education") ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isSectionOpen("education") && (
                <div className="p-4 pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" /> Pendidikan
                      </span>
                      <p className="font-medium">{cvData.cv?.education || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Briefcase className="h-4 w-4" /> Pekerjaan
                      </span>
                      <p className="font-medium">{cvData.cv?.occupation || "-"}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-4 w-4" /> Penghasilan
                      </span>
                      <p className="font-medium">{cvData.cv?.income_range || "-"}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Section: Keluarga */}
            <Card>
              <button
                onClick={() => toggleSection("family")}
                className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Keluarga</h3>
                </div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    isSectionOpen("family") ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isSectionOpen("family") && (
                <div className="p-4 pt-0 space-y-3">
                  <div>
                    <span className="text-muted-foreground text-sm">
                      Anak Ke / Jumlah Saudara
                    </span>
                    <p className="font-medium">
                      {cvData.cv?.child_number || "-"} / {cvData.cv?.sibling_count || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Status Ayah</span>
                    <p className="font-medium">{cvData.cv?.father_status || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Pekerjaan Ayah</span>
                    <p className="font-medium">{cvData.cv?.father_occupation || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Status Ibu</span>
                    <p className="font-medium">{cvData.cv?.mother_status || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Pekerjaan Ibu</span>
                    <p className="font-medium">{cvData.cv?.mother_occupation || "-"}</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Section: Tentang Diri */}
            {cvData.details && (
              <>
                <Card>
                  <button
                    onClick={() => toggleSection("personal")}
                    className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Tentang Diri</h3>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        isSectionOpen("personal") ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isSectionOpen("personal") && (
                    <div className="p-4 pt-0 space-y-3">
                      <div>
                        <span className="text-muted-foreground text-sm">Kelebihan</span>
                        <p className="text-sm mt-1 whitespace-pre-wrap">
                          {cvData.details.kelebihan || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Kekurangan</span>
                        <p className="text-sm mt-1 whitespace-pre-wrap">
                          {cvData.details.kekurangan || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Hobi</span>
                        <p className="text-sm mt-1">{cvData.details.hobi || "-"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">
                          Riwayat Penyakit
                        </span>
                        <p className="text-sm mt-1">
                          {cvData.details.riwayat_penyakit?.join(", ") || "-"}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Section: Pernikahan */}
                <Card>
                  <button
                    onClick={() => toggleSection("marriage")}
                    className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Pernikahan</h3>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        isSectionOpen("marriage") ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isSectionOpen("marriage") && (
                    <div className="p-4 pt-0 space-y-3">
                      <div>
                        <span className="text-muted-foreground text-sm">
                          Kriteria Pasangan
                        </span>
                        <p className="text-sm mt-1 whitespace-pre-wrap">
                          {cvData.details.kriteria_pasangan || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">
                          Rencana Setelah Menikah
                        </span>
                        <p className="text-sm mt-1 whitespace-pre-wrap">
                          {cvData.details.rencana_setelah_menikah || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">
                          Kriteria Lainnya
                        </span>
                        <p className="text-sm mt-1">
                          {cvData.details.kriteria_lainnya?.join(", ") || "-"}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Section: Keagamaan */}
                <Card>
                  <button
                    onClick={() => toggleSection("religion")}
                    className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Church className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Keagamaan</h3>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        isSectionOpen("religion") ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isSectionOpen("religion") && (
                    <div className="p-4 pt-0 space-y-3">
                      <div>
                        <span className="text-muted-foreground text-sm">
                          Kualitas Ibadah Shalat
                        </span>
                        <p className="text-sm mt-1">
                          {cvData.details.kualitas_ibadah_shalat || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">
                          Kemampuan Baca Al-Qur'an
                        </span>
                        <p className="text-sm mt-1">
                          {cvData.details.kemampuan_baca_quran || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">
                          Hafalan Al-Qur'an
                        </span>
                        <p className="text-sm mt-1">
                          {cvData.details.hafalan_quran || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">
                          Pengalaman Organisasi Islam
                        </span>
                        <p className="text-sm mt-1 whitespace-pre-wrap">
                          {cvData.details.pengalaman_organisasi_islam || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">
                          Ustadz/Kajian yang Diikuti
                        </span>
                        <p className="text-sm mt-1 whitespace-pre-wrap">
                          {cvData.details.ustadz_yang_diikuti || "-"}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
