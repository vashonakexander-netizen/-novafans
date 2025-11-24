export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Age Requirement</h2>
          <p>
            You must be at least 18 years old to use NovaFans. By using this platform, you confirm that you are of legal age in your jurisdiction to view and participate in adult content.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Account Responsibility</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Content Guidelines</h2>
          <p>
            All content must comply with our Acceptable Use Policy. Prohibited content includes but is not limited to:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Content involving minors</li>
            <li>Non-consensual content</li>
            <li>Illegal activities</li>
            <li>Content that violates intellectual property rights</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Payment Terms</h2>
          <p>
            All payments are final unless otherwise stated. Refunds are handled on a case-by-case basis in accordance with our Billing Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Platform Fees</h2>
          <p>
            NovaFans charges platform fees on transactions. Creators receive a percentage of earnings after platform fees are deducted.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms or engage in prohibited activities.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p>
            NovaFans is provided &quot;as is&quot; without warranties. We are not liable for any damages arising from use of the platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use of the platform constitutes acceptance of updated terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p>
            For questions about these terms, please contact us through our support channels.
          </p>
        </section>
      </div>
    </div>
  );
}

