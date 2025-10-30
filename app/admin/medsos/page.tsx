// app/admin/medsos/page.tsx
import { SocialMediaPostsList } from "./components/social-media-posts-list";

export default async function AdminMedsosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manajemen Media Sosial</h1>
        <p className="text-muted-foreground">
          Kelola postingan kandidat ke media sosial (Instagram, Facebook, dll)
        </p>
      </div>

      <SocialMediaPostsList />
    </div>
  );
}
