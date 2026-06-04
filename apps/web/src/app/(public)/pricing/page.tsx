"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";

export default function PricingPage() {
  // Page view is tracked automatically by PageViewTracker in layout
  useEffect(() => {
    // Page views are handled by PageViewTracker component
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Competitive revenue share. No hidden fees. Get paid on your schedule.
          </p>
        </div>

        {/* Revenue Share */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Revenue Share</h2>
          <div className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 border-blue-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                Competitive Rates
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Platform fees are competitive and transparent
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">For Creators</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>✓ Earnings from subscriptions</li>
                  <li>✓ Earnings from tips</li>
                  <li>✓ Earnings from paid DMs</li>
                  <li>✓ Earnings from live sessions</li>
                  <li>✓ Flexible payout schedule</li>
                  <li>✓ Multiple payout methods</li>
                </ul>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Platform Fee</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Transparent fee structure</li>
                  <li>• No hidden charges</li>
                  <li>• Fees deducted at transaction time</li>
                  <li>• See exact amounts in dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How Earnings Work */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">How Earnings Work</h2>
          <div className="space-y-4">
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">1. Earn Revenue</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You earn from subscriptions, tips, paid DMs, and live session tickets. All earnings are tracked in real-time in your creator dashboard.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">2. Funds Move to Pending</h3>
              <p className="text-gray-600 dark:text-gray-400">
                After transactions complete, earnings move to your &quot;pending&quot; balance. This allows for any necessary review periods or hold periods.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">3. Request Payout</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Once funds are available, you can request a payout. Admin reviews and processes payouts according to your selected payout method.
              </p>
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Payment Methods</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">For Fans</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>💳 Credit/Debit Cards</li>
                <li>₿ Cryptocurrency (USDT, BTC, ETH, etc.)</li>
                <li>🔒 Secure payment processing</li>
                <li>⚡ Instant transactions</li>
              </ul>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">For Creators (Payouts)</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>💳 Bank transfers</li>
                <li>₿ Cryptocurrency payouts</li>
                <li>📅 Flexible payout schedule</li>
                <li>✅ Admin-reviewed and secure</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Examples */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Example Earnings</h2>
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Note:</strong> These are illustrative examples. Actual earnings depend on your subscription price, 
              number of subscribers, tips received, and platform fees.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>10 subscribers at $9.99/month</span>
                <span className="font-semibold">~$99.90/month</span>
              </div>
              <div className="flex justify-between">
                <span>50 subscribers at $19.99/month</span>
                <span className="font-semibold">~$999.50/month</span>
              </div>
              <div className="flex justify-between">
                <span>Plus tips, paid DMs, live session revenue</span>
                <span className="font-semibold">Additional income</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Start Earning Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Join Savage House and start monetizing your content with competitive rates.
          </p>
          <Link
            href="/register?role=CREATOR"
            onClick={() => {
              trackEvent("pricing_cta_signup", {});
            }}
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold text-lg transition-colors"
          >
            Start Earning Now
          </Link>
        </section>
      </div>
    </div>
  );
}

