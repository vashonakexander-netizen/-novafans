import Link from "next/link";
import { Heart, MessageCircle, Star, Lock, ArrowRight } from "lucide-react";

export default function ForFansPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-400/30 bg-pink-400/5 text-pink-400 text-xs font-medium mb-5">
            <Heart className="w-3 h-3" />For Fans
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get closer to<br />the creators you love</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Subscribe for exclusive content, message your favourite creators directly, and unlock premium experiences.</p>
          <div className="flex gap-3 justify-center mt-8">
            <Link href="/register?role=FAN" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">Join Free <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/creators" className="inline-flex items-center px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors">Browse Creators</Link>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {[
            { icon: Heart, title: "Subscription tiers", desc: "Choose Free, Premium, or VIP. Unlock exclusive photos, videos, and direct messaging." },
            { icon: MessageCircle, title: "Direct messaging", desc: "Message your favourite creators directly. Premium and VIP subscribers get priority responses." },
            { icon: Lock, title: "Exclusive content", desc: "PPV photos, custom videos, and subscriber-only live streams. Content you can't find anywhere else." },
            { icon: Star, title: "Support your creators", desc: "Tips, purchases, and subscriptions go directly to the creators you support." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6">
              <f.icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Start for free</h2>
          <p className="text-muted-foreground mb-6">Create your fan account and start supporting creators today.</p>
          <Link href="/register?role=FAN" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">Sign Up Free <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </div>
  );
}
