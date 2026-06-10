"use client";

import Link from "next/link";
import { ArrowRight, Youtube, Zap, Share2, DollarSign, Check, X, Clock, Eye, Users, Edit3, Sparkles } from "lucide-react";

const STEPS = [
  { n: "01", icon: Youtube, title: "Connect Channel", desc: "Paste your YouTube channel URL. We index your latest videos automatically." },
  { n: "02", icon: Zap, title: "AI Finds Clips", desc: "Claude AI analyses your transcripts and pulls the 3 most viral moments from each video." },
  { n: "03", icon: Share2, title: "Auto-Post", desc: "One click pushes to TikTok, Instagram Reels, and YouTube Shorts. Captions burned in." },
  { n: "04", icon: DollarSign, title: "Earn", desc: "Get paid $0.50 to $5 per 1,000 views via platform creator funds and your own monetization." },
];

const OLD_WAY = [
  "Watch 60 min videos hunting for clips",
  "Scrub timelines, set in/out points",
  "Edit, crop to 9:16, add captions manually",
  "Upload to 3 platforms separately",
  "Track views across 3 dashboards",
];

const NEW_WAY = [
  "Paste channel URL once — done",
  "AI finds viral moments in seconds",
  "Auto-edited, cropped, captioned",
  "One-click multi-platform post",
  "Unified dashboard, real earnings",
];

const STATS = [
  { value: "50K+", label: "Views per clip", sub: "average top performer" },
  { value: "234.7", label: "Watch hours", sub: "delivered automatically" },
  { value: "9", label: "New subscribers", sub: "per viral clip" },
  { value: "0 hrs", label: "Editing time", sub: "from you" },
];

export default function ClipStudioPromo() {
  return (
    <div className="cs-mesh min-h-screen relative overflow-hidden">
      {/* Top nav */}
      <nav className="relative z-20 px-6 md:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00ff88] flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" strokeWidth={3} />
          </div>
          <span className="font-bold text-lg tracking-tight">Clip Studio</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-md bg-[#00ff88]/20 text-[#00ff88] text-[10px] font-bold uppercase tracking-wider">Beta</span>
        </div>
        <Link href="/agency" className="text-sm text-white/60 hover:text-white transition-colors">
          ← Back to NovaFans
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 md:px-10 pt-12 md:pt-24 pb-24 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00ff88]/30 bg-[#00ff88]/5 text-[#00ff88] text-xs font-medium mb-6">
          <Sparkles className="w-3 h-3" />
          New: AI Clip Studio inside NovaFans
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[0.95]">
          Clipping that<br />
          <span className="text-[#00ff88]">actually pays.</span>
        </h1>

        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          Connect your YouTube channel. AI finds the viral moments. Auto-edited clips posted to TikTok, Reels, and Shorts. <span className="text-white/90 font-medium">You earn $0.50 – $5 per 1,000 views</span> — without lifting a finger.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/clip-studio/dashboard"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#00ff88] text-black text-base font-bold hover:bg-[#00ff88]/90 transition-all hover:scale-105 cs-glow"
          >
            Start Clipping
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white text-base font-medium hover:bg-white/5 transition-colors"
          >
            See how it works
          </a>
        </div>

        {/* Earnings callout */}
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl border border-[#00ff88]/30 bg-[#00ff88]/5">
          <DollarSign className="w-5 h-5 text-[#00ff88]" />
          <span className="text-sm">
            <span className="text-[#00ff88] font-bold">$0.50 – $5</span>
            <span className="text-white/60"> per 1,000 views across TikTok, Reels & Shorts</span>
          </span>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 px-6 md:px-10 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-[#00ff88] font-bold mb-3">How it works</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Four steps. Zero editing.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-[#1f1f1f] bg-[#111] p-6 hover:border-[#00ff88]/40 transition-colors">
              <div className="text-[#00ff88]/30 text-4xl font-black tracking-tight mb-3">{s.n}</div>
              <s.icon className="w-6 h-6 text-[#00ff88] mb-3" />
              <h3 className="text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Old way vs New way */}
      <section className="relative z-10 px-6 md:px-10 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Stop wasting hours.</h2>
          <p className="text-white/60 mt-4 max-w-xl mx-auto">The math is brutal once you see it side by side.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Old way */}
          <div className="rounded-2xl border border-[#1f1f1f] bg-[#111] p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white/80">The old way</h3>
              <span className="ml-auto text-xs text-red-400/60 font-mono">~6 hrs/week</span>
            </div>
            <ul className="space-y-3">
              {OLD_WAY.map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm text-white/50">
                  <X className="w-4 h-4 mt-0.5 text-red-400/60 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* New way */}
          <div className="rounded-2xl border border-[#00ff88]/30 bg-gradient-to-b from-[#00ff88]/5 to-transparent p-8 cs-glow">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#00ff88]" />
              </div>
              <h3 className="text-xl font-bold">The Clip Studio way</h3>
              <span className="ml-auto text-xs text-[#00ff88] font-mono">~3 min/week</span>
            </div>
            <ul className="space-y-3">
              {NEW_WAY.map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm">
                  <Check className="w-4 h-4 mt-0.5 text-[#00ff88] shrink-0" strokeWidth={3} />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Case study */}
      <section className="relative z-10 px-6 md:px-10 py-24 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-[#1f1f1f] bg-[#0d0d0d] p-8 md:p-12">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-[#00ff88] font-bold mb-3">Real result</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">50K Views, Zero Hours of Work</h2>
            <p className="text-white/60 mt-4">One clip. Posted automatically. No editing required.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-xl bg-[#1a1a1a] border border-[#1f1f1f] p-5">
                <p className="text-3xl md:text-4xl font-black text-[#00ff88] mb-1 tracking-tight">{s.value}</p>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="relative z-10 px-6 md:px-10 py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Eye, title: "AI moment detection", desc: "Claude-powered viral hook identification with confidence scores." },
            { icon: Edit3, title: "Auto-cropped & captioned", desc: "9:16 vertical, captions burned in, ready to post." },
            { icon: Users, title: "3-platform distribution", desc: "TikTok, Instagram Reels, YouTube Shorts — one click each." },
          ].map((b) => (
            <div key={b.title} className="rounded-2xl border border-[#1f1f1f] bg-[#111] p-6">
              <b.icon className="w-5 h-5 text-[#00ff88] mb-4" />
              <h3 className="text-base font-bold mb-2">{b.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 px-6 md:px-10 py-24 max-w-3xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
          Your studio<br />
          <span className="text-[#00ff88]">awaits.</span>
        </h2>
        <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
          Connect a YouTube channel. Get your first 3 AI clips in under a minute.
        </p>
        <Link
          href="/clip-studio/dashboard"
          className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-full bg-[#00ff88] text-black text-lg font-bold hover:scale-105 transition-transform cs-glow"
        >
          Open Studio
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 md:px-10 py-10 border-t border-[#1f1f1f] text-center text-xs text-white/30">
        <p>Clip Studio · part of NovaFans · <Link href="/agency" className="hover:text-white">← Back to dashboard</Link></p>
      </footer>
    </div>
  );
}
