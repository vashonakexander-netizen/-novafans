import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & FAQ - NovaFans | Support & Answers",
  description: "Find answers to common questions about payouts, crypto payments, content policy, and account security on NovaFans.",
  openGraph: {
    title: "Help & FAQ - NovaFans",
    description: "Get help and find answers to common questions about NovaFans.",
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


