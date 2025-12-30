import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Creators - NovaFans | Monetize Your Content",
  description: "Earn from subscriptions, tips, paid DMs, and live sessions. AI autopilot helps you engage with fans 24/7. Competitive revenue share and flexible payouts.",
  openGraph: {
    title: "For Creators - NovaFans",
    description: "Monetize your content with subscriptions, tips, and paid posts. AI autopilot helps you engage with fans 24/7.",
    type: "website",
  },
};

export default function ForCreatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


