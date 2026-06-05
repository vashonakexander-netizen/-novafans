import type { Metadata } from "next";
import "./globals.css";
import { PageViewTracker } from "@/components/page-view-tracker";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: "NovaFans — Creator Agency Management Platform",
    template: "%s | NovaFans",
  },
  description: "Run your entire creator agency from one dashboard. AI-powered messaging, media vault, content scheduler, and fan monetization.",
  keywords: ["creator agency", "creator management", "fan platform", "AI messaging", "content scheduler"],
  authors: [{ name: "NovaFans" }],
  openGraph: {
    title: "NovaFans — Creator Agency Management Platform",
    description: "Run your entire creator agency from one dashboard.",
    type: "website",
    siteName: "NovaFans",
  },
  twitter: {
    card: "summary_large_image",
    title: "NovaFans — Creator Agency Management",
    description: "Run your entire creator agency from one dashboard.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <PageViewTracker />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
