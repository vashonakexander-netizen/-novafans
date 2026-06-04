"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";

export default function ForFansPage() {
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
            Support Your Favorite Creators
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Subscribe to exclusive content, chat directly with creators, and unlock premium experiences. 
            Safe, secure, and easy to use.
          </p>
          <Link
            href="/register?role=FAN"
            onClick={() => {
              trackEvent("for_fans_cta_click", { target: "fan_signup" });
            }}
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors"
          >
            Sign up as a Fan
          </Link>
        </div>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 border rounded-lg text-center">
              <div className="text-4xl mb-4">1️⃣</div>
              <h3 className="text-xl font-semibold mb-2">Discover Creators</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Browse creators and find content you love. Explore profiles, preview posts, and see what each creator offers.
              </p>
            </div>
            <div className="p-6 border rounded-lg text-center">
              <div className="text-4xl mb-4">2️⃣</div>
              <h3 className="text-xl font-semibold mb-2">Subscribe</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Subscribe to creators you want to support. Choose from flexible subscription plans and unlock exclusive content.
              </p>
            </div>
            <div className="p-6 border rounded-lg text-center">
              <div className="text-4xl mb-4">3️⃣</div>
              <h3 className="text-xl font-semibold mb-2">Engage</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Chat with creators, tip during live sessions, unlock paid DMs, and enjoy exclusive subscriber content.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">What You Get</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border rounded-lg">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Exclusive Content</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access subscriber-only posts, photos, videos, and more from your favorite creators.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Direct Messaging</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Chat directly with creators. Some creators offer paid DMs for more personal interactions.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <div className="text-3xl mb-4">📺</div>
              <h3 className="text-xl font-semibold mb-2">Live Sessions</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Join live shows, tip creators in real-time, and interact during live sessions.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <div className="text-3xl mb-4">🎁</div>
              <h3 className="text-xl font-semibold mb-2">Tips & Support</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Show your appreciation with tips. Support creators during live sessions or in DMs.
              </p>
            </div>
          </div>
        </section>

        {/* Safety & Privacy */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Safety & Privacy</h2>
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your privacy and security are our top priorities:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Secure payment processing with industry-standard encryption</li>
              <li>Your personal information is protected and never shared</li>
              <li>Content is delivered securely and privately</li>
              <li>You control your subscription and can cancel anytime</li>
              <li>Report any issues or concerns through our support system</li>
            </ul>
            <div className="mt-6">
              <Link
                href="/privacy"
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Read our Privacy Policy →
              </Link>
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Flexible Payment Methods</h2>
          <div className="p-6 border rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Savage House supports multiple payment methods for your convenience:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">💳 Card Payments</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Traditional credit and debit card payments. Secure and instant.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">₿ Cryptocurrency</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pay with USDT, BTC, ETH, and other supported cryptocurrencies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join Savage House and start supporting your favorite creators today.
          </p>
          <Link
            href="/register?role=FAN"
            onClick={() => {
              trackEvent("for_fans_cta_click", { target: "fan_signup", section: "bottom_cta" });
            }}
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold text-lg transition-colors"
          >
            Sign up as a Fan
          </Link>
        </section>
      </div>
    </div>
  );
}

