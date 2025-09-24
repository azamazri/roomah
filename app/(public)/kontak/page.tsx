"use client";

import { useState } from "react";
import { Metadata } from "next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Note: Can't use export const metadata in client component, so this would need to be moved to a layout or parent server component
// For now, we'll handle it at the layout level

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function KontakPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission (replace with actual implementation)
    setTimeout(() => {
      alert("Pesan Anda telah terkirim! Kami akan menghubungi Anda segera.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="section-y">
      <div className="container-x">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Hubungi Kami
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Kami siap membantu Anda dalam perjalanan pencarian jodoh. Jangan
            ragu untuk menghubungi tim support kami.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informasi Kontak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary">📧</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Email</h3>
                    <p className="text-sm text-muted-foreground">
                      support@roomah.id
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary">📱</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">
                      WhatsApp
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      +62 812-3456-7890
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary">📍</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Alamat</h3>
                    <p className="text-sm text-muted-foreground">
                      Jl. Gejayan No. 123
                      <br />
                      Yogyakarta, Indonesia 55281
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary">⏰</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">
                      Jam Operasional
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Senin - Jumat: 08:00 - 17:00 WIB
                      <br />
                      Sabtu: 08:00 - 15:00 WIB
                      <br />
                      Minggu: Tutup
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">FAQ Singkat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Bagaimana cara mendaftar?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Klik &quot;Daftar Gratis&quot; dan lengkapi profil Anda. Tim
                    kami akan memverifikasi dalam 1-2 hari kerja.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Apakah platform ini gratis?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Pendaftaran gratis, namun ada paket premium untuk fitur
                    tambahan seperti melihat profil lebih detail.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Bagaimana keamanan data?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Data Anda dienkripsi dan hanya dibagikan setelah persetujuan
                    kedua belah pihak.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Kirim Pesan</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Nama Lengkap *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Masukkan nama lengkap Anda"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Email *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Subjek *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Subjek pesan Anda"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Pesan *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tulis pesan Anda di sini..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>* Wajib diisi</p>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    loading={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
