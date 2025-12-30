import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageViewTracker } from "@/components/page-view-tracker";

export const metadata: Metadata = {
  title: "NovaFans - Support Your Favorite Creators | Exclusive Content & Live Shows",
  description: "Subscribe to exclusive content, chat directly with creators, and unlock premium experiences. Secure payments, live sessions, and direct messaging.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <PageViewTracker />
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

