import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://novafans.app";
  const lastModified = new Date();
  return [
    { url: `${baseUrl}/`, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/for-creators`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/for-fans`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/creators`, lastModified, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/clip-studio`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/help`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/login`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/register`, lastModified, changeFrequency: "yearly", priority: 0.6 },
  ];
}
