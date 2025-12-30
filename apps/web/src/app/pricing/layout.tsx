import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - NovaFans | Revenue Share & Payment Methods",
  description: "Competitive revenue share. No hidden fees. Get paid on your schedule. Transparent pricing for creators and fans.",
  openGraph: {
    title: "Pricing - NovaFans",
    description: "Simple, transparent pricing. Competitive revenue share for creators.",
    type: "website",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


