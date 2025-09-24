// /lib/admin-auth.ts
import { cookies } from "next/headers";

export function assertAdmin() {
  const c = cookies();
  const isAuth = c.get("rmh_auth")?.value === "1";
  const isAdmin = c.get("rmh_admin")?.value === "1";
  if (!isAuth || !isAdmin) {
    const err = new Error("Unauthorized");
    (err as any).status = 401;
    throw err;
  }
}
