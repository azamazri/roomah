// app/robots.ts
export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: ["/"], disallow: ["/app/", "/admin/", "/api/"] },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
