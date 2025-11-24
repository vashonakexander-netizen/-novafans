import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageViewTracker } from "@/components/page-view-tracker";

export const metadata: Metadata = {
  title: "NovaFans - Creator Subscription Platform | Get Paid by Fans",
  description: "Monetize your content with subscriptions, tips, and paid posts. Support your favorite creators and unlock exclusive content. Secure crypto and card payments.",
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

