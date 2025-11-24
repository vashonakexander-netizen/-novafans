export default function DMCAPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">DMCA Takedown Policy</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Copyright Infringement Claims</h2>
          <p>
            NovaFans respects intellectual property rights and will respond to valid DMCA takedown notices.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Filing a Takedown Notice</h2>
          <p className="mb-4">To file a DMCA takedown notice, please provide:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your contact information (name, address, phone, email)</li>
            <li>Identification of the copyrighted work claimed to be infringed</li>
            <li>Identification of the allegedly infringing material (URLs)</li>
            <li>Statement of good faith belief that use is not authorized</li>
            <li>Statement that information is accurate and you are authorized to act</li>
            <li>Your physical or electronic signature</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Counter-Notification</h2>
          <p>
            If you believe your content was removed in error, you may file a counter-notification. We will forward it to the original claimant.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Repeat Infringers</h2>
          <p>
            Accounts that repeatedly infringe copyrights may be terminated in accordance with our policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p>
            Send DMCA notices to our designated agent at the contact information provided in our support channels.
          </p>
        </section>
      </div>
    </div>
  );
}

