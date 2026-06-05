export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-10">Last updated: June 2026</p>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
          <section><h2 className="text-foreground font-semibold text-base mb-2">1. Acceptance of Terms</h2><p>By accessing or using NovaFans, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the platform.</p></section>
          <section><h2 className="text-foreground font-semibold text-base mb-2">2. Eligibility</h2><p>You must be at least 18 years of age to use NovaFans. By creating an account, you confirm that you are 18 or older. We reserve the right to terminate accounts of users who misrepresent their age.</p></section>
          <section><h2 className="text-foreground font-semibold text-base mb-2">3. Account Responsibilities</h2><p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorised use of your account. You are responsible for all activity that occurs under your account.</p></section>
          <section><h2 className="text-foreground font-semibold text-base mb-2">4. Content Standards</h2><p>All content uploaded to NovaFans must comply with our Acceptable Use Policy. You must have all necessary rights to any content you upload. You grant NovaFans a non-exclusive licence to host, display, and distribute your content on the platform.</p></section>
          <section><h2 className="text-foreground font-semibold text-base mb-2">5. Payments and Refunds</h2><p>All transactions are processed through Stripe. Subscription fees are charged in advance on a monthly or annual basis. We do not offer refunds for subscription payments unless required by law. Product purchases are non-refundable unless the content is unavailable.</p></section>
          <section><h2 className="text-foreground font-semibold text-base mb-2">6. Prohibited Conduct</h2><p>You may not use NovaFans to distribute illegal content, harass other users, attempt to circumvent our payment systems, scrape or copy our platform, or violate any applicable law or regulation.</p></section>
          <section><h2 className="text-foreground font-semibold text-base mb-2">7. Termination</h2><p>We reserve the right to suspend or terminate your account at any time for violation of these terms, without prior notice.</p></section>
          <section><h2 className="text-foreground font-semibold text-base mb-2">8. Limitation of Liability</h2><p>NovaFans is provided &ldquo;as is&rdquo;. We make no warranties regarding uptime, content, or fitness for a particular purpose. Our liability is limited to the amount you paid us in the 12 months preceding any claim.</p></section>
          <section><h2 className="text-foreground font-semibold text-base mb-2">9. Changes to Terms</h2><p>We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p></section>
          <section><h2 className="text-foreground font-semibold text-base mb-2">10. Contact</h2><p>Questions about these terms? Email us at <a href="mailto:legal@novafans.app" className="text-primary hover:underline">legal@novafans.app</a></p></section>
        </div>
      </div>
    </div>
  );
}
