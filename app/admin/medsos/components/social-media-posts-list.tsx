"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  adminGetPendingSocialMediaPosts,
  adminApproveSocialMediaPost,
  adminRejectSocialMediaPost,
} from "@/server/actions/social-media";
import { loadCvDataByUserId } from "@/server/actions/cv-details";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface Post {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    gender: string;
  } | null;
  cv_data: {
    kode_kandidat: string;
    status: string;
  } | null;
}

interface CVDetailModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userInfo: {
    name: string;
    email: string;
    gender: string;
    kodeKandidat: string;
  };
}

function CVDetailModal({ open, onClose, userId, userInfo }: CVDetailModalProps) {
  const [cvData, setCvData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && userId) {
      loadCV();
    }
  }, [open, userId]);

  const loadCV = async () => {
    try {
      setLoading(true);
      const data = await loadCvDataByUserId(userId);
      setCvData(data);
    } catch (error) {
      console.error("Error loading CV:", error);
      toast.error("Failed to load CV data");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label: string, value: any) => {
    if (!value || value === "" || value === "0" || (Array.isArray(value) && value.length === 0)) {
      return null;
    }
    return (
      <div className="mb-3">
        <span className="text-muted-foreground text-sm">{label}:</span>
        <p className="font-medium">
          {Array.isArray(value) ? value.join(", ") : String(value)}
        </p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl">Detail CV - {userInfo.name}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-muted-foreground mt-4">Memuat CV...</p>
          </div>
        ) : cvData ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("Kode Kandidat", userInfo.kodeKandidat)}
                {renderField("Email", userInfo.email)}
              </div>
            </Card>

            {/* Biodata Section */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-primary">
                <User className="h-5 w-5" />
                Biodata Diri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {renderField("Nama Lengkap", cvData.biodata?.namaLengkap)}
                {renderField("Tanggal Lahir", cvData.biodata?.tanggalLahir)}
                {renderField("Jenis Kelamin", cvData.biodata?.jenisKelamin === "IKHWAN" ? "Ikhwan" : "Akhwat")}
                {renderField("Status Pernikahan", cvData.biodata?.statusPernikahan)}
                {renderField("Domisili", cvData.biodata?.domisili)}
                {renderField("Alamat Lengkap", cvData.biodata?.alamatLengkap)}
                {renderField("Pendidikan", cvData.biodata?.pendidikan)}
                {renderField("Pekerjaan", cvData.biodata?.pekerjaan)}
                {renderField("Penghasilan", cvData.biodata?.penghasilan)}
                {renderField("Tinggi Badan", cvData.biodata?.tinggiBadan ? `${cvData.biodata.tinggiBadan} cm` : null)}
                {renderField("Berat Badan", cvData.biodata?.beratBadan ? `${cvData.biodata.beratBadan} kg` : null)}
                {renderField("Ciri Fisik", cvData.biodata?.ciriFisik)}
                {renderField("Riwayat Penyakit", cvData.biodata?.riwayatPenyakit)}
                {renderField("Keberadaan Orang Tua", cvData.biodata?.keberadaanOrangTua)}
                {renderField("Pekerjaan Orang Tua", cvData.biodata?.pekerjaanOrangTua)}
                {renderField("Anak Ke", cvData.biodata?.anakKe)}
                {renderField("Jumlah Saudara Kandung", cvData.biodata?.saudaraKandung)}
              </div>
            </Card>

            {/* Kondisi Ibadah */}
            {cvData.kondisiIbadah && Object.keys(cvData.kondisiIbadah).length > 0 && (
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 text-primary">Kondisi Ibadah</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  {renderField("Shalat Fardu", cvData.kondisiIbadah?.shalatFardu)}
                  {renderField("Bacaan Quran", cvData.kondisiIbadah?.bacaanQuran)}
                  {renderField("Shalat Sunnah", cvData.kondisiIbadah?.shalatSunnah)}
                  {renderField("Hafalan Quran", cvData.kondisiIbadah?.hafalanQuran)}
                  {renderField("Puasa", cvData.kondisiIbadah?.puasa)}
                  {renderField("Kajian", cvData.kondisiIbadah?.kajian)}
                  {renderField("Kebiasaan Ibadah Lainnya", cvData.kondisiIbadah?.kebiasaanIbadah)}
                </div>
              </Card>
            )}

            {/* Kriteria Pasangan */}
            {cvData.kriteriaPasangan && Object.keys(cvData.kriteriaPasangan).length > 0 && (
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 text-primary">Kriteria Pasangan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  {renderField("Kriteria Usia", cvData.kriteriaPasangan?.usia || cvData.kriteriaPasangan?.usiaCriteria)}
                  {renderField("Kriteria Pendidikan", cvData.kriteriaPasangan?.pendidikan || cvData.kriteriaPasangan?.pendidikanCriteria)}
                  {renderField("Kriteria Penghasilan", cvData.kriteriaPasangan?.penghasilan || cvData.kriteriaPasangan?.penghasilanCriteria)}
                  {renderField("Kriteria Ciri Fisik", cvData.kriteriaPasangan?.ciriFisik)}
                  {renderField("Kriteria Khusus", cvData.kriteriaPasangan?.kriteriaKhusus)}
                </div>
              </Card>
            )}

            {/* Rencana Pernikahan */}
            {cvData.rencanaPernikahan && Object.keys(cvData.rencanaPernikahan).length > 0 && (
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 text-primary">Rencana Pernikahan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  {renderField("Tahun Nikah", cvData.rencanaPernikahan?.tahunNikah)}
                  {renderField("Tempat Tinggal Setelah Menikah", cvData.rencanaPernikahan?.tempatTinggal || cvData.rencanaPernikahan?.lokasiTinggal)}
                  {renderField("Visi Pernikahan", cvData.rencanaPernikahan?.visi || cvData.rencanaPernikahan?.visiPernikahan)}
                  {renderField("Misi Pernikahan", cvData.rencanaPernikahan?.misi)}
                </div>
              </Card>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>CV data tidak ditemukan</p>
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SocialMediaPostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCVModal, setShowCVModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [postToReject, setPostToReject] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const result = await adminGetPendingSocialMediaPosts();
      if (result.success) {
        setPosts(result.posts as Post[]);
      } else {
        toast.error(result.error || "Failed to load posts");
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId: string) => {
    try {
      setActionLoading(postId);
      const result = await adminApproveSocialMediaPost(postId);
      if (result.success) {
        toast.success("Post approved successfully!");
        loadPosts(); // Reload list
      } else {
        toast.error(result.error || "Failed to approve post");
      }
    } catch (error) {
      toast.error("Failed to approve post");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (postId: string) => {
    setPostToReject(postId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!postToReject) return;

    try {
      setActionLoading(postToReject);
      const result = await adminRejectSocialMediaPost(postToReject);
      if (result.success) {
        toast.success(result.message || "Postingan ditolak dan koin dikembalikan");
        loadPosts(); // Reload list
      } else {
        toast.error(result.error || "Gagal menolak postingan");
      }
    } catch (error) {
      toast.error("Gagal menolak postingan");
    } finally {
      setActionLoading(null);
      setShowRejectModal(false);
      setPostToReject(null);
    }
  };

  const handleViewCV = (post: Post) => {
    setSelectedPost(post);
    setShowCVModal(true);
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground mt-4">Loading posts...</p>
        </div>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Tidak Ada Pengajuan</h3>
          <p className="text-sm text-muted-foreground">
            Belum ada pengajuan posting media sosial yang menunggu persetujuan.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Antrian Postingan</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {posts.length} pengajuan menunggu persetujuan
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={loadPosts}>
              Refresh
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kandidat</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Waktu Pengajuan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {post.profiles?.full_name || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {post.cv_data?.kode_kandidat || "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {post.profiles?.gender === "IKHWAN" || post.profiles?.gender === "M" ? "Ikhwan" : "Akhwat"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{post.profiles?.email || "-"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                        locale: idLocale,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCV(post)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Lihat CV
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(post.id)}
                          disabled={actionLoading === post.id}
                          className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Setujui
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(post.id)}
                          disabled={actionLoading === post.id}
                          className="gap-1 bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                          Tolak
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      {selectedPost && (
        <CVDetailModal
          open={showCVModal}
          onClose={() => {
            setShowCVModal(false);
            setSelectedPost(null);
          }}
          userId={selectedPost.user_id}
          userInfo={{
            name: selectedPost.profiles?.full_name || "Unknown",
            email: selectedPost.profiles?.email || "-",
            gender: selectedPost.profiles?.gender || "M",
            kodeKandidat: selectedPost.cv_data?.kode_kandidat || "-",
          }}
        />
      )}

      {/* Reject Confirmation Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Penolakan</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menolak postingan ini?
            </p>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900 font-medium">
                ℹ️ 5 koin akan dikembalikan ke user
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setPostToReject(null);
              }}
              disabled={actionLoading !== null}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={actionLoading !== null}
            >
              {actionLoading === postToReject ? "Memproses..." : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
