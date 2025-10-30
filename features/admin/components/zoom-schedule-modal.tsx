"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Video, Clock, Link as LinkIcon } from "lucide-react";
import { toast } from "@/lib/toast";

interface ZoomScheduleModalProps {
  open: boolean;
  onClose: () => void;
  taarufId: string | number;
  stage: "Zoom 1" | "Zoom 2";
  onScheduled: () => void;
}

export function ZoomScheduleModal({ open, onClose, taarufId, stage, onScheduled }: ZoomScheduleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    meeting_date: "",
    meeting_time: "",
    zoom_link: "",
    meeting_notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.meeting_date || !formData.meeting_time || !formData.zoom_link) {
      toast.error("Mohon lengkapi semua field yang wajib");
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time
      const meetingDateTime = `${formData.meeting_date}T${formData.meeting_time}:00`;

      const response = await fetch(`/api/admin/taaruf/${taarufId}/schedule-zoom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stage,
          meeting_datetime: meetingDateTime,
          zoom_link: formData.zoom_link,
          notes: formData.meeting_notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("API Error:", result);
        throw new Error(result.error || "Gagal menjadwalkan pertemuan");
      }

      // Format date untuk toast message
      const dateObj = new Date(`${formData.meeting_date}T${formData.meeting_time}`);
      const formattedDate = dateObj.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      const formattedTime = dateObj.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      toast.success(
        `✅ ${stage} berhasil dijadwalkan!\n📅 ${formattedDate}\n🕒 ${formattedTime} WIB`,
        6000 // Show for 6 seconds
      );
      
      onScheduled();
      onClose();
      
      // Reset form
      setFormData({
        meeting_date: "",
        meeting_time: "",
        zoom_link: "",
        meeting_notes: "",
      });
    } catch (error) {
      console.error("Schedule zoom error:", error);
      const errorMessage = error instanceof Error ? error.message : "Gagal menjadwalkan pertemuan";
      toast.error(`❌ ${errorMessage}. Silakan coba lagi.`, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Jadwalkan {stage}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-1">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="meeting_date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tanggal Pertemuan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="meeting_date"
              type="date"
              value={formData.meeting_date}
              onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="meeting_time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Waktu Pertemuan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="meeting_time"
              type="time"
              value={formData.meeting_time}
              onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })}
              required
            />
          </div>

          {/* Zoom Link */}
          <div className="space-y-2">
            <Label htmlFor="zoom_link" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Link Zoom Meeting <span className="text-destructive">*</span>
            </Label>
            <Input
              id="zoom_link"
              type="url"
              placeholder="https://zoom.us/j/..."
              value={formData.zoom_link}
              onChange={(e) => setFormData({ ...formData, zoom_link: e.target.value })}
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="meeting_notes" className="flex items-center gap-2">
              Catatan (Opsional)
            </Label>
            <Textarea
              id="meeting_notes"
              placeholder="Catatan tambahan untuk peserta..."
              value={formData.meeting_notes}
              onChange={(e) => setFormData({ ...formData, meeting_notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menjadwalkan..." : "Jadwalkan Pertemuan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
