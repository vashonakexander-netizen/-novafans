export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-10">Last updated: June 2026</p>
        <div className="space-y-6 text-muted-foreground text-sm">
          <section><h2 className="text-foreground font-semibold text-base mb-2">Information We Collect</h2><p>We collect information you provide when creating an account (name, email, username), payment information processed through Stripe, content you upload, and usage data including pages visited and features used.</p></section>
          <section><h2 className="text-foreground font-semibold text-base mb-2">How We Use Your Information</h2><p>We use your information to provide and improve the platform, process payments, send important account notifications, and comply with legal obligations. We do not sell your personal information to third parties.</p></section>
          <section><h2 className="text-foreground font-semibold text-base mb-2">Data Storage and Security</h2><p>Your data is stored on secure servers. We use encryption in transit (HTTPS) and at rest. Payment data is handled entirely by Stripe and never stored on our servers.</p></section>
          <section><h2 className="text-foreground font-semibold text-base mb-2">Cookies</h2><p>We use essential cookies for authentication and session management. We may use analytics cookies to understand how the platform is used. You can control cookie settings in your browser.</p></section>
          <section><h2 className="text-foreground font-semibold text-base mb-2">Your Rights</h2><p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <a href="mailto:privacy@novafans.app" className="text-primary hover:underline">privacy@novafans.app</a>. We will respond within 30 days.</p></section>
          <section><h2 className="text-foreground font-semibold text-base mb-2">Third-Party Services</h2><p>We use Stripe for payments, Anthropic Claude for AI features, and may use analytics services. These services have their own privacy policies.</p></section>
          <section><h2 className="text-foreground font-semibold text-base mb-2">Changes to This Policy</h2><p>We may update this policy periodically. We will notify you of significant changes via email or platform notification.</p></section>
        </div>
      </div>
    </div>
  );
}
