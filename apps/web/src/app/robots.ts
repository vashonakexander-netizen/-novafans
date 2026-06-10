import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://novafans.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/agency/", "/model/", "/fan/", "/admin/", "/dashboard/", "/clip-studio/dashboard", "/clip-studio/clips/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
