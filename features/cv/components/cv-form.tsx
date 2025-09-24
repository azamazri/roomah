"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Save,
  User,
} from "lucide-react";
import { CvData } from "../types";
import { loadCvData, saveCvData } from "../server/actions";
import { toast } from "sonner";

interface FormSection {
  id: string;
  title: string;
  isOpen: boolean;
}

const initialSections: FormSection[] = [
  { id: "biodata", title: "Biodata Lengkap", isOpen: true },
  { id: "ibadah", title: "Kondisi Ibadah", isOpen: false },
  { id: "kriteria", title: "Kriteria Pasangan", isOpen: false },
  { id: "rencana", title: "Rencana Pernikahan", isOpen: false },
];

export function CvForm() {
  const [sections, setSections] = useState<FormSection[]>(initialSections);
  const [cvData, setCvData] = useState<CvData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [riwayatPenyakit, setRiwayatPenyakit] = useState<string[]>([""]);
  const [kriteriaKhusus, setKriteriaKhusus] = useState<string[]>([""]);

  useEffect(() => {
    const fetchCvData = async () => {
      try {
        const data = await loadCvData();
        setCvData(data);

        if (data) {
          setRiwayatPenyakit(
            data.biodata.riwayatPenyakit.length > 0
              ? data.biodata.riwayatPenyakit
              : [""]
          );
          setKriteriaKhusus(
            data.kriteriaPasangan.kriteriaKhusus.length > 0
              ? data.kriteriaPasangan.kriteriaKhusus
              : [""]
          );
        }
      } catch (error) {
        console.error("Error loading CV data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCvData();
  }, []);

  const toggleSection = (id: string) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, isOpen: !section.isOpen } : section
      )
    );
  };

  const addRepeaterItem = (type: "riwayat" | "kriteria") => {
    if (type === "riwayat" && riwayatPenyakit.length < 3) {
      setRiwayatPenyakit([...riwayatPenyakit, ""]);
    } else if (type === "kriteria" && kriteriaKhusus.length < 3) {
      setKriteriaKhusus([...kriteriaKhusus, ""]);
    }
  };

  const removeRepeaterItem = (type: "riwayat" | "kriteria", index: number) => {
    if (type === "riwayat" && riwayatPenyakit.length > 1) {
      setRiwayatPenyakit(riwayatPenyakit.filter((_, i) => i !== index));
    } else if (type === "kriteria" && kriteriaKhusus.length > 1) {
      setKriteriaKhusus(kriteriaKhusus.filter((_, i) => i !== index));
    }
  };

  const updateRepeaterItem = (
    type: "riwayat" | "kriteria",
    index: number,
    value: string
  ) => {
    if (type === "riwayat") {
      const updated = [...riwayatPenyakit];
      updated[index] = value;
      setRiwayatPenyakit(updated);
    } else if (type === "kriteria") {
      const updated = [...kriteriaKhusus];
      updated[index] = value;
      setKriteriaKhusus(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Add repeater data
      formData.set(
        "riwayatPenyakit",
        JSON.stringify(riwayatPenyakit.filter((item) => item.trim()))
      );
      formData.set(
        "kriteriaKhusus",
        JSON.stringify(kriteriaKhusus.filter((item) => item.trim()))
      );

      const result = await saveCvData(formData);

      if (result.success) {
        toast.success(
          "CV berhasil disimpan! Tunggu 1x24 jam untuk verifikasi admin."
        );
        // Refresh data
        const updatedData = await loadCvData();
        setCvData(updatedData);
      } else {
        toast.error(result.error || "Gagal menyimpan CV");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Terjadi kesalahan saat menyimpan CV");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Admin Note */}
      {cvData?.adminNote && cvData.status === "revisi" && (
        <Card className="p-4 border-destructive bg-destructive/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-destructive">
                Catatan Revisi Admin
              </h3>
              <p className="text-sm text-destructive/80 mt-1">
                {cvData.adminNote}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Biodata Lengkap */}
      <Card className="overflow-hidden">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
          onClick={() => toggleSection("biodata")}
        >
          <h2 className="text-lg font-semibold">Biodata Lengkap</h2>
          {sections.find((s) => s.id === "biodata")?.isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>

        {sections.find((s) => s.id === "biodata")?.isOpen && (
          <div className="p-4 border-t border-input space-y-4">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="namaLengkap"
                  className="block text-sm font-medium mb-2"
                >
                  Nama Lengkap *
                </label>
                <Input
                  id="namaLengkap"
                  name="namaLengkap"
                  defaultValue={cvData?.biodata.namaLengkap || ""}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="tanggalLahir"
                  className="block text-sm font-medium mb-2"
                >
                  Tanggal Lahir *
                </label>
                <Input
                  id="tanggalLahir"
                  name="tanggalLahir"
                  type="date"
                  defaultValue={cvData?.biodata.tanggalLahir || ""}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="statusPernikahan"
                  className="block text-sm font-medium mb-2"
                >
                  Status Pernikahan *
                </label>
                <select
                  id="statusPernikahan"
                  name="statusPernikahan"
                  defaultValue={cvData?.biodata.statusPernikahan || ""}
                  required
                  className="w-full"
                >
                  <option value="">Pilih Status</option>
                  <option value="Single">Single</option>
                  <option value="Janda">Janda</option>
                  <option value="Duda">Duda</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="domisili"
                  className="block text-sm font-medium mb-2"
                >
                  Domisili Provinsi *
                </label>
                <select
                  id="domisili"
                  name="domisili"
                  defaultValue={cvData?.biodata.domisili || ""}
                  required
                  className="w-full"
                >
                  <option value="">Pilih Provinsi</option>
                  <option value="DKI Jakarta">DKI Jakarta</option>
                  <option value="Jawa Barat">Jawa Barat</option>
                  <option value="Jawa Tengah">Jawa Tengah</option>
                  <option value="Jawa Timur">Jawa Timur</option>
                  <option value="DI Yogyakarta">DI Yogyakarta</option>
                  <option value="Banten">Banten</option>
                  <option value="Sumatra Utara">Sumatra Utara</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="alamatLengkap"
                className="block text-sm font-medium mb-2"
              >
                Alamat Lengkap *
              </label>
              <Textarea
                id="alamatLengkap"
                name="alamatLengkap"
                defaultValue={cvData?.biodata.alamatLengkap || ""}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="pendidikan"
                  className="block text-sm font-medium mb-2"
                >
                  Pendidikan *
                </label>
                <select
                  id="pendidikan"
                  name="pendidikan"
                  defaultValue={cvData?.biodata.pendidikan || ""}
                  required
                  className="w-full"
                >
                  <option value="">Pilih Pendidikan</option>
                  <option value="SMA/SMK">SMA/SMK</option>
                  <option value="D3">D3</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="pekerjaan"
                  className="block text-sm font-medium mb-2"
                >
                  Pekerjaan *
                </label>
                <Input
                  id="pekerjaan"
                  name="pekerjaan"
                  placeholder="Guru"
                  defaultValue={cvData?.biodata.pekerjaan || ""}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="penghasilan"
                  className="block text-sm font-medium mb-2"
                >
                  Penghasilan *
                </label>
                <select
                  id="penghasilan"
                  name="penghasilan"
                  defaultValue={cvData?.biodata.penghasilan || ""}
                  required
                  className="w-full"
                >
                  <option value="">Pilih Penghasilan</option>
                  <option value="0-2">0-2 Juta</option>
                  <option value="2-5">2-5 Juta</option>
                  <option value="5-10">5-10 Juta</option>
                  <option value="10+">10+ Juta</option>
                  <option value="Saat Taaruf">Saat Taaruf</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="tinggiBadan"
                  className="block text-sm font-medium mb-2"
                >
                  Tinggi Badan (cm) *
                </label>
                <Input
                  id="tinggiBadan"
                  name="tinggiBadan"
                  type="number"
                  min="100"
                  max="250"
                  placeholder="170"
                  defaultValue={cvData?.biodata.tinggiBadan || ""}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="beratBadan"
                  className="block text-sm font-medium mb-2"
                >
                  Berat Badan (kg) *
                </label>
                <Input
                  id="beratBadan"
                  name="beratBadan"
                  type="number"
                  min="30"
                  max="200"
                  placeholder="65"
                  defaultValue={cvData?.biodata.beratBadan || ""}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="anakKe"
                  className="block text-sm font-medium mb-2"
                >
                  Anak Ke-
                </label>
                <Input
                  id="anakKe"
                  name="anakKe"
                  type="number"
                  min="1"
                  max="99"
                  placeholder="2"
                  defaultValue={cvData?.biodata.anakKe || ""}
                />
              </div>

              <div>
                <label
                  htmlFor="saudaraKandung"
                  className="block text-sm font-medium mb-2"
                >
                  Jumlah Saudara Kandung
                </label>
                <Input
                  id="saudaraKandung"
                  name="saudaraKandung"
                  type="number"
                  min="0"
                  max="99"
                  placeholder="3"
                  defaultValue={cvData?.biodata.saudaraKandung || ""}
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="pekerjaanOrangTua"
                  className="block text-sm font-medium mb-2"
                >
                  Pekerjaan Orang Tua *
                </label>
                <Input
                  id="pekerjaanOrangTua"
                  name="pekerjaanOrangTua"
                  placeholder="Guru dan Petani"
                  defaultValue={cvData?.biodata.pekerjaanOrangTua || ""}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="ciriFisik"
                className="block text-sm font-medium mb-2"
              >
                Ciri Fisik (max 200 karakter)
              </label>
              <Textarea
                id="ciriFisik"
                name="ciriFisik"
                placeholder="Berkulit sawo matang, bermata coklat..."
                defaultValue={cvData?.biodata.ciriFisik || ""}
                maxLength={200}
                rows={3}
              />
            </div>

            {/* Riwayat Penyakit Accordion */}
            <div className="border border-input rounded-md">
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                onClick={() => {
                  const elem = document.getElementById("riwayat-content");
                  if (elem) {
                    elem.classList.toggle("hidden");
                  }
                }}
              >
                <span className="font-medium">Riwayat Penyakit</span>
                <ChevronDown className="h-4 w-4" />
              </div>

              <div
                id="riwayat-content"
                className="p-3 border-t border-input space-y-3"
              >
                {riwayatPenyakit.map((penyakit, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={penyakit}
                      onChange={(e) =>
                        updateRepeaterItem("riwayat", index, e.target.value)
                      }
                      placeholder={`Riwayat penyakit ${index + 1}`}
                      className="flex-1"
                    />
                    {riwayatPenyakit.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRepeaterItem("riwayat", index)}
                        className="px-3"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {riwayatPenyakit.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addRepeaterItem("riwayat")}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Baris
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Kondisi Ibadah */}
      <Card className="overflow-hidden">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
          onClick={() => toggleSection("ibadah")}
        >
          <h2 className="text-lg font-semibold">Kondisi Ibadah</h2>
          {sections.find((s) => s.id === "ibadah")?.isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>

        {sections.find((s) => s.id === "ibadah")?.isOpen && (
          <div className="p-4 border-t border-input space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="shalatFardu"
                  className="block text-sm font-medium mb-2"
                >
                  Shalat Fardu
                </label>
                <select
                  id="shalatFardu"
                  name="shalatFardu"
                  defaultValue={cvData?.kondisiIbadah.shalatFardu || ""}
                  className="w-full"
                >
                  <option value="">Pilih Kondisi</option>
                  <option value="terjaga">Terjaga</option>
                  <option value="kadang-kadang">Kadang-kadang</option>
                  <option value="belum istiqomah">Belum Istiqomah</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="bacaanQuran"
                  className="block text-sm font-medium mb-2"
                >
                  Bacaan Quran
                </label>
                <select
                  id="bacaanQuran"
                  name="bacaanQuran"
                  defaultValue={cvData?.kondisiIbadah.bacaanQuran || ""}
                  className="w-full"
                >
                  <option value="">Pilih Kondisi</option>
                  <option value="lancar">Lancar</option>
                  <option value="masih belajar">Masih Belajar</option>
                  <option value="belum bisa">Belum Bisa</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="shalatSunnah"
                  className="block text-sm font-medium mb-2"
                >
                  Shalat Sunnah
                </label>
                <Input
                  id="shalatSunnah"
                  name="shalatSunnah"
                  placeholder="Sholat Dhuha"
                  defaultValue={cvData?.kondisiIbadah.shalatSunnah || ""}
                />
              </div>

              <div>
                <label
                  htmlFor="hafalanQuran"
                  className="block text-sm font-medium mb-2"
                >
                  Hafalan Quran
                </label>
                <Input
                  id="hafalanQuran"
                  name="hafalanQuran"
                  placeholder="Juz 30"
                  defaultValue={cvData?.kondisiIbadah.hafalanQuran || ""}
                />
              </div>

              <div>
                <label
                  htmlFor="puasa"
                  className="block text-sm font-medium mb-2"
                >
                  Puasa
                </label>
                <Input
                  id="puasa"
                  name="puasa"
                  placeholder="Puasa Senin dan Kamis"
                  defaultValue={cvData?.kondisiIbadah.puasa || ""}
                />
              </div>

              <div>
                <label
                  htmlFor="kajian"
                  className="block text-sm font-medium mb-2"
                >
                  Kajian
                </label>
                <Input
                  id="kajian"
                  name="kajian"
                  placeholder="Ustadz Fulan.. Ustadzah Fulanah"
                  defaultValue={cvData?.kondisiIbadah.kajian || ""}
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Kriteria Pasangan */}
      <Card className="overflow-hidden">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
          onClick={() => toggleSection("kriteria")}
        >
          <h2 className="text-lg font-semibold">Kriteria Pasangan</h2>
          {sections.find((s) => s.id === "kriteria")?.isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>

        {sections.find((s) => s.id === "kriteria")?.isOpen && (
          <div className="p-4 border-t border-input space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="kriteriaUsia"
                  className="block text-sm font-medium mb-2"
                >
                  Usia
                </label>
                <Input
                  id="kriteriaUsia"
                  name="kriteriaUsia"
                  type="number"
                  min="17"
                  max="50"
                  placeholder="25"
                  defaultValue={cvData?.kriteriaPasangan.usia || ""}
                />
              </div>

              <div>
                <label
                  htmlFor="kriteriaPendidikan"
                  className="block text-sm font-medium mb-2"
                >
                  Pendidikan *
                </label>
                <select
                  id="kriteriaPendidikan"
                  name="kriteriaPendidikan"
                  defaultValue={cvData?.kriteriaPasangan.pendidikan || ""}
                  required
                  className="w-full"
                >
                  <option value="">Pilih Pendidikan</option>
                  <option value="SMA/SMK">SMA/SMK</option>
                  <option value="D3">D3</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="kriteriaPenghasilan"
                  className="block text-sm font-medium mb-2"
                >
                  Penghasilan *
                </label>
                <select
                  id="kriteriaPenghasilan"
                  name="kriteriaPenghasilan"
                  defaultValue={cvData?.kriteriaPasangan.penghasilan || ""}
                  required
                  className="w-full"
                >
                  <option value="">Pilih Penghasilan</option>
                  <option value="0-2">0-2 Juta</option>
                  <option value="2-5">2-5 Juta</option>
                  <option value="5-10">5-10 Juta</option>
                  <option value="10+">10+ Juta</option>
                  <option value="Saat Taaruf">Saat Taaruf</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="kriteriaCiriFisik"
                className="block text-sm font-medium mb-2"
              >
                Ciri Fisik (max 200 karakter)
              </label>
              <Textarea
                id="kriteriaCiriFisik"
                name="kriteriaCiriFisik"
                placeholder="Sederhana dan sopan..."
                defaultValue={cvData?.kriteriaPasangan.ciriFisik || ""}
                maxLength={200}
                rows={3}
              />
            </div>

            {/* Kriteria Khusus Accordion */}
            <div className="border border-input rounded-md">
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                onClick={() => {
                  const elem = document.getElementById("kriteria-content");
                  if (elem) {
                    elem.classList.toggle("hidden");
                  }
                }}
              >
                <span className="font-medium">Kriteria Khusus</span>
                <ChevronDown className="h-4 w-4" />
              </div>

              <div
                id="kriteria-content"
                className="p-3 border-t border-input space-y-3"
              >
                <p className="text-sm text-muted-foreground mb-3">
                  Jika tidak diisi, default akan menjadi "Tidak Ada Kriteria
                  Khusus"
                </p>

                {kriteriaKhusus.map((kriteria, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={kriteria}
                      onChange={(e) =>
                        updateRepeaterItem("kriteria", index, e.target.value)
                      }
                      placeholder={`Kriteria khusus ${index + 1}`}
                      className="flex-1"
                    />
                    {kriteriaKhusus.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRepeaterItem("kriteria", index)}
                        className="px-3"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {kriteriaKhusus.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addRepeaterItem("kriteria")}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Baris
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Rencana Pernikahan */}
      <Card className="overflow-hidden">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
          onClick={() => toggleSection("rencana")}
        >
          <h2 className="text-lg font-semibold">Rencana Pernikahan</h2>
          {sections.find((s) => s.id === "rencana")?.isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>

        {sections.find((s) => s.id === "rencana")?.isOpen && (
          <div className="p-4 border-t border-input space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="tahunNikah"
                  className="block text-sm font-medium mb-2"
                >
                  Tahun Nikah
                </label>
                <Input
                  id="tahunNikah"
                  name="tahunNikah"
                  type="number"
                  min="2024"
                  max="2050"
                  placeholder="2027"
                  defaultValue={cvData?.rencanaPernikahan.tahunNikah || ""}
                />
              </div>

              <div>
                <label
                  htmlFor="tempatTinggal"
                  className="block text-sm font-medium mb-2"
                >
                  Tempat Tinggal *
                </label>
                <Input
                  id="tempatTinggal"
                  name="tempatTinggal"
                  placeholder="Ikut Suami"
                  defaultValue={cvData?.rencanaPernikahan.tempatTinggal || ""}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="visi" className="block text-sm font-medium mb-2">
                Visi (max 200 karakter) *
              </label>
              <Textarea
                id="visi"
                name="visi"
                placeholder="Membangun keluarga sakinah..."
                defaultValue={cvData?.rencanaPernikahan.visi || ""}
                maxLength={200}
                rows={3}
                required
              />
            </div>

            <div>
              <label htmlFor="misi" className="block text-sm font-medium mb-2">
                Misi (max 200 karakter) *
              </label>
              <Textarea
                id="misi"
                name="misi"
                placeholder="Mendidik anak-anak menjadi generasi Qur'ani..."
                defaultValue={cvData?.rencanaPernikahan.misi || ""}
                maxLength={200}
                rows={3}
                required
              />
            </div>
          </div>
        )}
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="gap-2 px-8">
          <Save className="h-4 w-4" />
          {isSubmitting ? "Menyimpan..." : "Simpan CV"}
        </Button>
      </div>
    </form>
  );
}
