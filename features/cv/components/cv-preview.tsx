"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  User,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  DollarSign,
  Ruler,
  Weight,
  FileText,
  Edit,
  Eye,
  EyeOff,
  Share2,
  Coins,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { CvData } from "../types";
import { loadCvData } from "@/server/actions/cv-details";
import {
  toggleCvVisibility,
  getCvVisibility,
  submitSocialMediaPost,
  getSocialMediaPostStatus,
} from "@/server/actions/social-media";
import { toast } from "sonner";

interface CvPreviewProps {
  onEditClick: () => void;
}

export function CvPreview({ onEditClick }: CvPreviewProps) {
  const [cvData, setCvData] = useState<CvData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [socialMediaStatus, setSocialMediaStatus] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, visibilityData, socialData] = await Promise.all([
          loadCvData(),
          getCvVisibility(),
          getSocialMediaPostStatus(),
        ]);
        
        setCvData(data);
        setIsVisible(visibilityData.isVisible);
        setSocialMediaStatus(socialData.status);
      } catch (error) {
        console.error("Error loading CV data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleVisibility = async (checked: boolean) => {
    setIsTogglingVisibility(true);
    try {
      const result = await toggleCvVisibility(checked);
      if (result.success) {
        setIsVisible(checked);
        toast.success(
          checked
            ? "CV Anda sekarang ditampilkan di Cari Jodoh"
            : "CV Anda sekarang disembunyikan dari Cari Jodoh"
        );
      } else {
        toast.error(result.error || "Gagal mengubah visibilitas");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const handleSubmitSocialMedia = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitSocialMediaPost();
      if (result.success) {
        toast.success(result.message);
        setSocialMediaStatus("PENDING");
        setShowConfirmModal(false);
      } else {
        toast.error(result.error || "Gagal mengajukan posting");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 w-24 bg-muted rounded-full mx-auto"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/3 mx-auto"></div>
          </div>
        </div>
      </Card>
    );
  }

  // CV dianggap kosong bila dua field dasar kosong
  const isEmpty =
    !cvData || (!cvData.biodata.namaLengkap && !cvData.biodata.tanggalLahir);

  if (isEmpty) {
    return (
      <Card className="p-8 text-center">
        <div className="mb-6">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">CV Kosong</h3>
          <p className="text-muted-foreground">
            Silakan mengisi CV di tab Buat/Edit CV untuk melengkapi profil Anda
          </p>
        </div>
        <Button onClick={onEditClick} className="gap-2">
          <Edit className="h-4 w-4" />
          Buat CV
        </Button>
      </Card>
    );
  }

  const formatPenghasilan = (penghasilan: string) => {
    const map: Record<string, string> = {
      // Enum format
      "0_2": "0-2 Juta",
      "2_5": "2-5 Juta",
      "5_10": "5-10 Juta",
      "10_PLUS": "10+ Juta",
      "SAAT_TAARUF": "Saat Taaruf",
      // Display format (fallback)
      "0-2": "0-2 Juta",
      "2-5": "2-5 Juta",
      "5-10": "5-10 Juta",
      "10+": "10+ Juta",
      "Saat Taaruf": "Saat Taaruf",
    };
    return map[penghasilan] || penghasilan;
  };

  // Mapping status yang sesuai dengan server (case-insensitive):
  // - "APPROVED"    -> default (hijau)
  // - "REVISI"      -> destructive (merah)
  // - lainnya/draft -> secondary (abu)
  const statusUpper = cvData?.status?.toUpperCase();
  const statusVariant =
    statusUpper === "APPROVED"
      ? "default"
      : statusUpper === "REVISI"
      ? "destructive"
      : "secondary";

  const statusLabel =
    statusUpper === "APPROVED"
      ? "Approved"
      : statusUpper === "REVISI"
      ? "Needs Revision"
      : "Under Review";

  return (
    <div className="space-y-6">
      {/* Status CV */}
      {cvData?.status && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Status CV</h3>
              <p className="text-sm text-muted-foreground">
                Status verifikasi CV Anda
              </p>
            </div>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>

          {cvData.kodeKandidat && (
            <div className="mt-3 pt-3 border-t border-input">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Kode Kandidat:</span>
                <Badge variant="outline">{cvData.kodeKandidat}</Badge>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* CV Preview */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold">Preview CV</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onEditClick}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="space-y-6">
          {/* Avatar & Basic Info */}
          <div className="text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              {cvData?.biodata.avatar ? (
                <img
                  src={cvData.biodata.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-lg font-semibold">
              {cvData?.biodata.namaLengkap || "Nama Lengkap"}
            </h3>
          </div>

          {/* Biodata Wajib */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cvData?.biodata.tanggalLahir && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="font-medium">Tanggal Lahir:</span>
                  <span className="ml-2">{cvData.biodata.tanggalLahir}</span>
                </div>
              </div>
            )}

            {cvData?.biodata.statusPernikahan && (
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="font-medium">Status:</span>
                  <span className="ml-2">
                    {cvData.biodata.statusPernikahan}
                  </span>
                </div>
              </div>
            )}

            {cvData?.biodata.domisili && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="font-medium">Domisili:</span>
                  <span className="ml-2">{cvData.biodata.domisili}</span>
                </div>
              </div>
            )}

            {cvData?.biodata.pendidikan && (
              <div className="flex items-center gap-3 text-sm">
                <GraduationCap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="font-medium">Pendidikan:</span>
                  <span className="ml-2">{cvData.biodata.pendidikan}</span>
                </div>
              </div>
            )}

            {cvData?.biodata.pekerjaan && (
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="font-medium">Pekerjaan:</span>
                  <span className="ml-2">{cvData.biodata.pekerjaan}</span>
                </div>
              </div>
            )}

            {cvData?.biodata.penghasilan && (
              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="font-medium">Penghasilan:</span>
                  <span className="ml-2">
                    {formatPenghasilan(cvData.biodata.penghasilan)}
                  </span>
                </div>
              </div>
            )}

            {cvData?.biodata.tinggiBadan && (
              <div className="flex items-center gap-3 text-sm">
                <Ruler className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="font-medium">Tinggi/Berat:</span>
                  <span className="ml-2">
                    {cvData.biodata.tinggiBadan} cm /{" "}
                    {cvData.biodata.beratBadan} kg
                  </span>
                </div>
              </div>
            )}
          </div>

          {cvData?.biodata.riwayatPenyakit &&
            cvData.biodata.riwayatPenyakit.length > 0 && (
              <div className="pt-4 border-t border-input">
                <div className="flex items-start gap-3 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Riwayat Penyakit:</span>
                    <div className="ml-2 mt-1 space-y-1">
                      {cvData.biodata.riwayatPenyakit.map((penyakit, index) => (
                        <div key={index} className="text-muted-foreground">
                          • {penyakit}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </Card>

      {/* Toggle Visibility - Only show if CV is APPROVED */}
      {cvData?.status === "APPROVED" && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isVisible ? (
                <Eye className="h-5 w-5 text-primary" />
              ) : (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <h3 className="font-medium">Visibilitas CV</h3>
                <p className="text-sm text-muted-foreground">
                  {isVisible
                    ? "CV Anda ditampilkan di halaman Cari Jodoh"
                    : "CV Anda disembunyikan dari halaman Cari Jodoh"}
                </p>
              </div>
            </div>
            <Switch
              checked={isVisible}
              onCheckedChange={handleToggleVisibility}
              disabled={isTogglingVisibility}
            />
          </div>
        </Card>
      )}

      {/* Posting Media Sosial - Only show if CV is APPROVED */}
      {statusUpper === "APPROVED" && (
        <Card className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Share2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 w-full">
              <h3 className="text-base md:text-lg font-semibold mb-2">
                Posting CV ke Media Sosial Roomah
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tingkatkan peluang Anda untuk mendapatkan pasangan dengan
                memposting CV ke media sosial official Roomah (Instagram,
                Twitter, dll). Biaya: 5 Koin
              </p>

              {/* Status Posting */}
              {socialMediaStatus === "PENDING" && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                  <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">
                      Dalam Proses
                    </h4>
                    <p className="text-xs text-amber-800">
                      Pengajuan Anda sedang diproses oleh Admin Media Sosial.
                      CV Anda akan segera diposting!
                    </p>
                  </div>
                </div>
              )}

              {socialMediaStatus === "POSTED" && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-green-900 mb-1">
                      Berhasil Diposting!
                    </h4>
                    <p className="text-xs text-green-800">
                      CV Anda sudah diposting ke media sosial Roomah. Semoga
                      segera bertemu jodoh!
                    </p>
                  </div>
                </div>
              )}

              {/* Button Ajukan */}
              {!socialMediaStatus && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg mb-3">
                    <Coins className="h-5 w-5 text-warning" />
                    <span className="text-sm font-medium">
                      Biaya pengajuan: <span className="text-primary">5 Koin</span>
                    </span>
                  </div>

                  <Button
                    onClick={() => setShowConfirmModal(true)}
                    className="w-full gap-2 h-11 sm:h-12 text-sm sm:text-base"
                    size="lg"
                  >
                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="truncate">Ajukan Posting ke Media Sosial</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* CV Belum Approved - Show info */}
      {cvData?.status !== "APPROVED" && (
        <Card className="p-6 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900 mb-1">
                Lengkapi CV Anda
              </h4>
              <p className="text-sm text-amber-800">
                Fitur posting ke media sosial akan tersedia setelah CV Anda
                disetujui oleh admin. Pastikan CV Anda lengkap dan sesuai
                dengan panduan.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="space-y-3 px-1">
            <DialogTitle>Konfirmasi Posting Media Sosial</DialogTitle>
            <DialogDescription>
              Pastikan informasi berikut sebelum melanjutkan:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4 px-1">
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <Coins className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold mb-1">Biaya Pengajuan</h4>
                <p className="text-sm text-muted-foreground">
                  Akan dipotong <strong>5 Koin</strong> dari saldo Anda untuk
                  pengajuan posting ini.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Share2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold mb-1">
                  Posting ke Media Sosial
                </h4>
                <p className="text-sm text-muted-foreground">
                  CV Anda akan diposting ke akun Instagram & Twitter official
                  Roomah untuk menjangkau lebih banyak calon pasangan.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <strong>Catatan:</strong> Proses posting akan dilakukan oleh
              admin dalam 1x24 jam. Koin yang sudah dipotong tidak dapat
              dikembalikan.
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 px-1">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitSocialMedia}
              disabled={isSubmitting}
              className="w-full sm:w-auto gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Ajukan Sekarang
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
