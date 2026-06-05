import Link from "next/link";
import { CheckCircle, Zap, ArrowRight } from "lucide-react";

const PLANS = [
  { name: "Fan Free", price: 0, period: "", desc: "Browse and discover creators", perks: ["Browse creator profiles", "Follow creators", "View public content", "Basic messaging"], cta: "Sign Up Free", href: "/register?role=FAN", highlight: false },
  { name: "Fan Premium", price: 9.99, period: "/mo per creator", desc: "Full access to your favourite creators", perks: ["Exclusive photos & videos", "Direct messaging", "Early content access", "Cancel anytime"], cta: "Subscribe Now", href: "/creators", highlight: true },
  { name: "Agency", price: null, period: "", desc: "Full platform for creator agencies", perks: ["Unlimited creator clients", "AI inbox assistant", "Media vault & approval flow", "Content scheduler", "Analytics & revenue tracking", "Fan shop & subscriptions"], cta: "Get Started", href: "/register?role=AGENCY", highlight: false },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold mb-3">Simple, transparent pricing</h1>
          <p className="text-muted-foreground text-lg">Start free. Pay only when you find creators you love.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((p) => (
            <div key={p.name} className={`rounded-2xl border-2 p-7 flex flex-col ${p.highlight ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
              <div className="mb-5">
                {p.highlight && <div className="text-xs text-primary font-semibold mb-2 flex items-center gap-1"><Zap className="w-3 h-3" />Most Popular</div>}
                <h2 className="text-xl font-bold">{p.name}</h2>
                <div className="mt-2 mb-1">
                  {p.price === null ? <span className="text-3xl font-bold">Custom</span> : p.price === 0 ? <span className="text-3xl font-bold">Free</span> : <><span className="text-3xl font-bold">${p.price}</span><span className="text-muted-foreground text-sm">{p.period}</span></>}
                </div>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2.5 text-sm"><CheckCircle className="w-4 h-4 text-primary shrink-0" />{perk}</li>
                ))}
              </ul>
              <Link href={p.href} className={`block text-center py-2.5 rounded-lg font-medium text-sm transition-colors ${p.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border hover:bg-accent"}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All subscriptions are billed through Stripe. Cancel anytime. No hidden fees.</p>
          <p className="mt-2"><Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> · <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link></p>
        </div>
      </div>
    </div>
  );
}
