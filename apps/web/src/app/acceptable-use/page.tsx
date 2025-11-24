export default function AcceptableUsePage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Acceptable Use Policy</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Prohibited Content</h2>
          <p className="mb-4">The following content is strictly prohibited:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Minors:</strong> Any content involving or depicting minors</li>
            <li><strong>Non-consensual:</strong> Content without explicit consent of all participants</li>
            <li><strong>Illegal activities:</strong> Content depicting illegal acts</li>
            <li><strong>Violence:</strong> Extreme violence, gore, or harm</li>
            <li><strong>Intellectual property:</strong> Unauthorized use of copyrighted material</li>
            <li><strong>Spam:</strong> Repetitive, unwanted, or misleading content</li>
            <li><strong>Scams:</strong> Fraudulent schemes or deceptive practices</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Prohibited Behavior</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Harassment, bullying, or threats</li>
            <li>Impersonation of other users or entities</li>
            <li>Sharing private information without consent</li>
            <li>Circumventing platform restrictions or bans</li>
            <li>Manipulating payment systems or transactions</li>
            <li>Using automated tools to scrape or access data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Content Guidelines</h2>
          <p className="mb-4">All content must:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Comply with applicable laws in your jurisdiction</li>
            <li>Respect the rights and dignity of all participants</li>
            <li>Be accurately labeled and categorized</li>
            <li>Not mislead or deceive users</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Enforcement</h2>
          <p>
            Violations of this policy may result in:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Content removal</li>
            <li>Account warnings</li>
            <li>Temporary or permanent account suspension</li>
            <li>Legal action when appropriate</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Reporting</h2>
          <p>
            If you encounter content or behavior that violates this policy, please report it through our reporting system. We review all reports promptly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">DMCA</h2>
          <p>
            For copyright infringement claims, please see our <a href="/dmca" className="text-blue-600 hover:underline">DMCA Policy</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

