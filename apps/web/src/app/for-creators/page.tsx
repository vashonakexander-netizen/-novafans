"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";

export default function ForCreatorsPage() {
  // Page view is tracked automatically by PageViewTracker in layout
  // This useEffect is kept for backward compatibility but does nothing
  useEffect(() => {
    // Page views are handled by PageViewTracker component
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Monetize Your Content on NovaFans
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join creators earning from subscriptions, tips, paid DMs, and live sessions. 
            AI autopilot helps you engage with fans 24/7.
          </p>
          <Link
            href="/register?role=CREATOR"
            onClick={() => {
              trackEvent("for_creators_cta_signup", {});
            }}
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors"
          >
            Start as a Creator
          </Link>
        </div>

        {/* How You Earn */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">How You Earn</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border rounded-lg">
              <div className="text-3xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-2">Subscriptions</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Set your monthly subscription price. Fans subscribe to access your exclusive content, 
                and you earn recurring revenue.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Tips</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Receive tips during live sessions or in DMs. Fans can show appreciation with instant tips.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Paid DMs</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Charge for direct messages. Fans pay to unlock conversations with you.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <div className="text-3xl mb-4">📺</div>
              <h3 className="text-xl font-semibold mb-2">Live Sessions</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Host live shows with ticket sales or free access. Earn from tips during live sessions.
              </p>
            </div>
          </div>
        </section>

        {/* Payouts */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Payouts & Revenue Share</h2>
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              NovaFans offers competitive revenue sharing. Earnings from subscriptions, tips, and paid content 
              are tracked in your creator dashboard.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Earnings move to &quot;pending&quot; status after transactions complete</li>
              <li>Admin review and release funds to your &quot;available&quot; balance</li>
              <li>Request payouts when you&apos;re ready</li>
              <li>Flexible payout methods (details in dashboard)</li>
            </ul>
            <div className="mt-6">
              <Link
                href="/pricing"
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                View detailed pricing →
              </Link>
            </div>
          </div>
        </section>

        {/* AI Autopilot */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">AI Autopilot Assistant</h2>
          <div className="p-6 border rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Don&apos;t have time to respond to every fan message? Enable AI autopilot to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
              <li>Respond to fan messages automatically using your persona and tone</li>
              <li>Handle common questions and engagement</li>
              <li>Maintain your unique voice and style</li>
              <li>Focus on creating content while AI handles conversations</li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure your AI persona in creator settings. You can enable or disable autopilot at any time.
            </p>
          </div>
        </section>

        {/* Migration */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Migrate from Other Platforms</h2>
          <div className="p-6 border rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Coming from OnlyFans, Fanvue, or another platform? We make migration easy:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Bulk import your content (posts, media, captions)</li>
              <li>Preserve your content structure and organization</li>
              <li>Set up drip schedules or publish immediately</li>
              <li>Bring your audience with you</li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Migration tools are available in your creator dashboard after signup.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join NovaFans today and start monetizing your content.
          </p>
          <Link
            href="/register?role=CREATOR"
            onClick={() => {
              trackEvent("for_creators_cta_signup", { section: "bottom_cta" });
            }}
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold text-lg transition-colors"
          >
            Start as a Creator
          </Link>
        </section>
      </div>
    </div>
  );
}

