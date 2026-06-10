import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clip Studio — AI-Powered Clipping",
  description: "Connect your YouTube channel. AI finds the viral moments, auto-edits clips, and auto-posts to TikTok, Instagram Reels, and YouTube Shorts.",
};

export default function ClipStudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white clipstudio-root">
      <style>{`
        .clipstudio-root {
          --cs-bg: #0a0a0a;
          --cs-card: #111;
          --cs-border: #1f1f1f;
          --cs-text: #ffffff;
          --cs-muted: #888;
          --cs-green: #00ff88;
          --cs-green-glow: rgba(0, 255, 136, 0.35);
        }
        .clipstudio-root .cs-glow {
          box-shadow: 0 0 32px var(--cs-green-glow);
        }
        .clipstudio-root .cs-mesh {
          background:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0, 255, 136, 0.12), transparent),
            radial-gradient(ellipse 60% 40% at 80% 50%, rgba(0, 255, 136, 0.06), transparent),
            #0a0a0a;
        }
        .clipstudio-root .cs-noise {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.04' /%3E%3C/svg%3E");
        }
      `}</style>
      {children}
    </div>
  );
}
