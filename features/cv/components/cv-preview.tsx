"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { CvData } from "../types";
import { loadCvData } from "@/server/actions/cv-details";

interface CvPreviewProps {
  onEditClick: () => void;
}

export function CvPreview({ onEditClick }: CvPreviewProps) {
  const [cvData, setCvData] = useState<CvData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCvData = async () => {
      try {
        const data = await loadCvData();
        setCvData(data);
      } catch (error) {
        console.error("Error loading CV data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCvData();
  }, []);

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
    const map = {
      "0-2": "0-2 Juta",
      "2-5": "2-5 Juta",
      "5-10": "5-10 Juta",
      "10+": "10+ Juta",
      "Saat Taaruf": "Saat Taaruf",
    };
    return map[penghasilan as keyof typeof map] || penghasilan;
  };

  // Mapping status yang sesuai dengan server:
  // - "approved"    -> default (hijau)
  // - "revisi"      -> destructive (merah)
  // - lainnya/draft -> secondary (abu)
  const statusVariant =
    cvData?.status === "approved"
      ? "default"
      : cvData?.status === "revisi"
      ? "destructive"
      : "secondary";

  const statusLabel =
    cvData?.status === "approved"
      ? "Approved"
      : cvData?.status === "revisi"
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
    </div>
  );
}
