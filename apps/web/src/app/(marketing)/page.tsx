import type { Metadata } from "next";
import Link from "next/link";
import {
  Zap, Users, Bot, Calendar, BarChart2, ImageIcon,
  CheckCircle, ArrowRight, Star, Shield, DollarSign
} from "lucide-react";

export const metadata: Metadata = {
  title: { absolute: "NovaFans — Creator Agency Management Platform" },
  description: "The all-in-one platform for creator agencies. Manage multiple clients, AI-powered messaging, media vault, content scheduling, and fan monetization.",
};

const features = [
  {
    icon: Users,
    title: "Multi-Client Management",
    description: "Manage your entire creator roster from one dashboard. Color-coded clients, instant switching, zero data bleed between accounts.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Bot,
    title: "AI Messaging Assistant",
    description: "Claude AI generates on-brand draft responses for every fan message. Confidence scores flag messages that need your personal touch.",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
  },
  {
    icon: ImageIcon,
    title: "Media Vault",
    description: "Drag-and-drop uploads, approval workflows, and auto-tagging. From raw upload to scheduled post in seconds.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: Calendar,
    title: "Content Scheduler",
    description: "Drag approved media onto a calendar. Schedule across Instagram, Twitter, Reddit, and OnlyFans in one place.",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    icon: DollarSign,
    title: "Fan Monetization",
    description: "Subscription tiers, digital shop, PPV content, and tips — all with Stripe Checkout built in.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    icon: BarChart2,
    title: "Analytics",
    description: "Revenue charts, fan growth, message volume, AI response rates. Daily, weekly, and monthly views.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
];

const plans = [
  {
    name: "Agency",
    price: "Custom",
    description: "For agencies managing 3+ creators",
    perks: [
      "Unlimited clients",
      "AI inbox assistant",
      "Media vault & scheduler",
      "Fan shop & subscriptions",
      "Full analytics suite",
      "Priority support",
    ],
    cta: "Get Started",
    href: "/register?role=AGENCY",
    highlight: true,
  },
  {
    name: "Creator",
    price: "Free",
    description: "Upload content, track your stats",
    perks: [
      "Upload interface",
      "Basic stats",
      "Agency collaboration",
      "Profile page",
    ],
    cta: "Join as Creator",
    href: "/register?role=MODEL",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Nav */}
      <nav className="border-b border-border sticky top-0 z-40 bg-background/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">NovaFans</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link
              href="/register?role=AGENCY"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-pink-500/5 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-24 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium mb-6">
            <Zap className="w-3 h-3" />
            Built for creator agencies
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Run your entire{" "}
            <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
              creator agency
            </span>
            <br />from one dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            AI-powered messaging, media vault, content scheduler, and fan monetization.
            Everything your agency needs to scale — without the chaos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register?role=AGENCY"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-lg text-base font-semibold hover:bg-primary/90 transition-colors"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-border rounded-lg text-base font-medium hover:bg-accent transition-colors"
            >
              Sign In
            </Link>
          </div>

          {/* Hero visual */}
          <div className="mt-16 relative">
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl max-w-4xl mx-auto">
              {/* Fake dashboard header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                    novafans.app/agency
                  </div>
                </div>
              </div>
              {/* Dashboard preview */}
              <div className="flex h-64">
                {/* Sidebar */}
                <div className="w-48 border-r border-border bg-card p-3 space-y-1">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary">
                    <div className="w-3 h-3 rounded bg-primary-foreground/30" />
                    <div className="h-2 w-16 rounded bg-primary-foreground/70" />
                  </div>
                  {["Clients", "Revenue", "Settings"].map((item) => (
                    <div key={item} className="flex items-center gap-2 px-3 py-2 rounded-md">
                      <div className="w-3 h-3 rounded bg-muted" />
                      <div className="h-2 rounded bg-muted" style={{ width: `${40 + item.length * 4}px` }} />
                    </div>
                  ))}
                  <div className="pt-3 border-t border-border mt-3">
                    <div className="text-[9px] text-muted-foreground px-3 mb-2 uppercase tracking-wider">Clients</div>
                    {[
                      { color: "#8B5CF6", w: 52 },
                      { color: "#EC4899", w: 44 },
                      { color: "#3B82F6", w: 60 },
                    ].map((c, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                        <div className="h-1.5 rounded bg-muted" style={{ width: c.w }} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Main content */}
                <div className="flex-1 p-4">
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {["$12.4k", "8 Clients", "2.1k Fans", "94 Msgs"].map((val, i) => (
                      <div key={i} className="bg-muted/50 rounded-lg p-3">
                        <div className="h-1.5 w-8 rounded bg-muted mb-2" />
                        <div className="text-sm font-bold">{val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { color: "#8B5CF6", name: "Sofia M." },
                      { color: "#EC4899", name: "Luna K." },
                      { color: "#3B82F6", name: "Aria T." },
                    ].map((c) => (
                      <div key={c.name} className="bg-muted/30 rounded-lg p-3 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-md" style={{ backgroundColor: c.color }} />
                          <span className="text-xs font-medium">{c.name}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="h-1.5 rounded bg-muted w-full" />
                          <div className="h-1.5 rounded bg-muted w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-card/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything your agency needs</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              One platform. Six powerful tools. Zero context-switching.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-border p-6 bg-card hover:border-primary/30 transition-colors">
                <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg">Up and running in minutes.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Add your clients", description: "Create client profiles with tone settings, platform links, and payout splits. Color-code each creator for instant recognition." },
              { step: "2", title: "Manage content & messages", description: "Models upload to the vault. You review, approve, and schedule. The AI handles fan messages — you just approve the drafts." },
              { step: "3", title: "Grow & monetize", description: "Fan pages with subscription tiers, digital shop, and tips go live instantly. Watch revenue roll in across all clients from one screen." },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary mb-5">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-12 bg-card/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { stat: "10x", label: "Faster fan response time with AI drafts" },
              { stat: "3hrs", label: "Saved per creator per day on inbox management" },
              { stat: "100%", label: "Client data isolation — zero cross-contamination" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-5xl font-bold text-primary mb-2">{item.stat}</p>
                <p className="text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple pricing</h2>
            <p className="text-muted-foreground text-lg">Start free. Scale as you grow.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border-2 p-8 ${plan.highlight ? "border-primary bg-primary/5" : "border-border bg-card"}`}
              >
                {plan.highlight && (
                  <div className="inline-flex items-center gap-1 text-xs font-medium text-primary mb-3">
                    <Star className="w-3.5 h-3.5 fill-primary" />
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <p className="text-4xl font-bold mb-1">
                  {plan.price}
                  {plan.price !== "Free" && plan.price !== "Custom" && <span className="text-base font-normal text-muted-foreground">/mo</span>}
                </p>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center py-3 rounded-lg font-semibold transition-colors ${plan.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border hover:bg-accent"}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-background to-pink-500/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Shield className="w-10 h-10 text-primary mx-auto mb-5" />
          <h2 className="text-4xl font-bold mb-4">Ready to run a smarter agency?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Join agencies already using NovaFans to manage their creators, automate fan messaging, and scale revenue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register?role=AGENCY"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-lg text-base font-semibold hover:bg-primary/90 transition-colors"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register?role=MODEL"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-border rounded-lg text-base font-medium hover:bg-accent transition-colors"
            >
              Join as Creator
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold">NovaFans</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/help" className="hover:text-foreground transition-colors">Help</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 NovaFans. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
