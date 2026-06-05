import Link from "next/link";
import { Camera, DollarSign, BarChart2, Shield, ArrowRight, CheckCircle } from "lucide-react";

export default function ForCreatorsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium mb-5">
            <Camera className="w-3 h-3" />For Creators
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Your content. Your rules.<br />Your revenue.</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Join NovaFans as a creator and let our agency tools handle the hard parts — you focus on creating.</p>
          <div className="flex gap-3 justify-center mt-8">
            <Link href="/register?role=MODEL" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">Get Started Free <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/login" className="inline-flex items-center px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors">Sign In</Link>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {[
            { icon: DollarSign, title: "Keep up to 80% of earnings", desc: "Industry-leading payout splits. Earn from subscriptions, content sales, tips, and PPV messages." },
            { icon: Camera, title: "Simple upload interface", desc: "Drag and drop your photos and videos. Your agency handles the rest — scheduling, approvals, and posting." },
            { icon: BarChart2, title: "Real-time analytics", desc: "See your earnings, fan growth, and top performing content at a glance." },
            { icon: Shield, title: "Professional agency support", desc: "Your agency manages fan messaging with AI assistance, so you never have to reply to hundreds of DMs." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6">
              <f.icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to start?</h2>
          <p className="text-muted-foreground mb-6">Create your creator account and get discovered.</p>
          <Link href="/register?role=MODEL" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">Join as Creator <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </div>
  );
}
