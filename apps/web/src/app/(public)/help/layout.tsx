import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & FAQ - Savage House | Support & Answers",
  description: "Find answers to common questions about payouts, crypto payments, content policy, and account security on Savage House.",
  openGraph: {
    title: "Help & FAQ - Savage House",
    description: "Get help and find answers to common questions about Savage House.",
    type: "website",
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


