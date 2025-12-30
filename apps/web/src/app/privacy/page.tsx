export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly, including:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Account information (email, username, display name)</li>
            <li>Payment information (processed through secure third-party providers)</li>
            <li>Content you upload or create</li>
            <li>Communication data (messages, comments)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p>
            We use collected information to:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Provide and improve our services</li>
            <li>Process payments and transactions</li>
            <li>Send important account notifications</li>
            <li>Enforce our terms and policies</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data, including encryption, secure servers, and access controls.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share data with:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Payment processors (for transaction processing)</li>
            <li>Service providers (hosting, analytics)</li>
            <li>Legal authorities (when required by law)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of certain communications</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Age Verification</h2>
          <p>
            We verify user age to ensure compliance with legal requirements for adult content platforms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
          <p>
            For privacy-related questions or requests, please contact us through our support channels.
          </p>
        </section>
      </div>
    </div>
  );
}


