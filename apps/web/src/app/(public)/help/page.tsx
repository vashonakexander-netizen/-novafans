import { HelpCircle, MessageCircle, Mail } from "lucide-react";

const FAQ = [
  { q: "How do I become an agency on NovaFans?", a: "Sign up with the Agency role and you'll get instant access to the agency dashboard. Add your first creator client and start managing their content, inbox, and monetization." },
  { q: "How do subscriptions work for fans?", a: "Browse creator profiles and choose a subscription tier (Free, Premium, or VIP). Premium and VIP tiers unlock exclusive content and messaging. You can cancel anytime from your fan dashboard." },
  { q: "How does the AI messaging assistant work?", a: "When a fan sends a message to a creator, the AI generates a draft response using the creator's tone profile and conversation history. Agency staff review the draft and approve, edit, or reject it before it's sent." },
  { q: "What payment methods are accepted?", a: "We use Stripe for all payments — Visa, Mastercard, American Express, and other major cards are accepted." },
  { q: "How do creator payouts work?", a: "Agencies set a payout split per creator (e.g. 80% to creator, 20% to agency). Payouts are processed through the platform on a regular schedule." },
  { q: "Can I use NovaFans as both a creator and an agency?", a: "Yes — you can have separate accounts for different roles. If you manage your own content and other creators, use the Agency role for full platform access." },
  { q: "How do I cancel a subscription?", a: "Go to your fan dashboard, find the subscription you want to cancel, and click Cancel. Your access will continue until the end of the billing period." },
  { q: "Is my data secure?", a: "Yes. All data is encrypted in transit and at rest. We use industry-standard security practices and never share your personal information with third parties." },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <HelpCircle className="w-10 h-10 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Help & FAQ</h1>
          <p className="text-muted-foreground">Common questions about NovaFans.</p>
        </div>
        <div className="space-y-4 mb-12">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold mb-2 text-sm">{item.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
          <h2 className="font-semibold mb-1">Still have questions?</h2>
          <p className="text-sm text-muted-foreground mb-4">We&apos;re here to help. Reach out to our support team.</p>
          <a href="mailto:support@novafans.app" className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Mail className="w-4 h-4" />Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
