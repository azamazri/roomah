// app/(admin-auth)/admin/login/ui.tsx
"use client";

import { useActionState } from "react";
import { loginAdminAction } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type State = { ok: boolean; message?: string };

export default function AdminLoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    loginAdminAction,
    { ok: false }
  );

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
          <form action={formAction} className="space-y-4">
            {state?.message && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="text-sm text-destructive">{state.message}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Admin</label>
              <Input
                name="email"
                type="email"
                placeholder="admin@roomah.id"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                disabled={isPending}
              />
            </div>

            <input type="hidden" name="next" value={next} />

            <Button type="submit" className="w-full" loading={isPending}>
              {isPending ? "Masuk..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
