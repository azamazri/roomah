"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLoginForm({
  action,
  next,
}: {
  action: (formData: FormData) => void;
  next: string;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md elevated">
        <CardHeader>
          <CardTitle className="text-2xl">Login Admin</CardTitle>
          <p className="text-sm text-muted-foreground">
            Akses khusus administrator Roomah
          </p>
        </CardHeader>
        <CardContent>
          <form
            action={async (fd) => {
              setLoading(true);
              try {
                await action(fd);
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-4"
          >
            {/* Field dummy untuk tampilan (DEV DEMO: tidak divalidasi di server) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Admin</label>
              <Input name="email" type="email" placeholder="admin@roomah.id" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input name="password" type="password" placeholder="••••••••" />
            </div>

            <input type="hidden" name="next" value={next} />

            <Button type="submit" className="w-full" loading={loading}>
              {loading ? "Masuk..." : "Masuk sebagai Admin (Demo)"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Mode demo: form ini hanya menyetel cookie <code>rmh_auth</code>{" "}
              dan <code>rmh_admin</code>. Ganti dengan validasi nyata saat
              integrasi ke backend.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
