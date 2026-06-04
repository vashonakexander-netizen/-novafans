import type { Metadata } from "next";
import "./globals.css";
import { PageViewTracker } from "@/components/page-view-tracker";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "NovaFans — Creator Agency Management",
  description: "The all-in-one platform for creator agencies.",
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
