import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Fans - NovaFans | Support Your Favorite Creators",
  description: "Subscribe to exclusive content, chat directly with creators, and unlock premium experiences. Safe, secure, and easy to use.",
  openGraph: {
    title: "For Fans - NovaFans",
    description: "Support your favorite creators and unlock exclusive content. Chat directly with creators.",
    type: "website",
  },
};

export default function ForFansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

