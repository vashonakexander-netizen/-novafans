import type { Metadata } from "next";
import Link from "next/link";
import { CTAButton } from "@/components/cta-button";

export const metadata: Metadata = {
  title: "NovaFans - Creator Subscription Platform | Get Paid by Fans",
  description: "Monetize your content with subscriptions, tips, and paid posts. Support your favorite creators and unlock exclusive content. Secure crypto and card payments.",
  openGraph: {
    title: "NovaFans - Creator Subscription Platform",
    description: "The ultimate platform for creators and fans. Subscribe to exclusive content, chat with creators, and unlock premium experiences.",
    type: "website",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to NovaFans
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600 dark:text-gray-400">
            The ultimate platform for creators and fans. Subscribe to exclusive content, chat with
            creators, and unlock premium experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton
              href="/register?role=CREATOR"
              variant="primary"
              eventName="landing_cta_creator"
              eventProps={{ page: "/" }}
            >
              Become a Creator
            </CTAButton>
            <CTAButton
              href="/creators"
              variant="secondary"
              eventName="landing_cta_fan"
              eventProps={{ page: "/" }}
            >
              Browse Creators
            </CTAButton>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-8 border rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">For Creators</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Monetize your content with subscriptions, tips, and paid posts. AI autopilot helps
              engage with fans 24/7.
            </p>
            <Link
              href="/for-creators"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Learn more →
            </Link>
          </div>
          <div className="p-8 border rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold mb-2">For Fans</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Support your favorite creators and unlock exclusive content. Chat directly with
              creators.
            </p>
            <Link
              href="/for-fans"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Learn more →
            </Link>
          </div>
          <div className="p-8 border rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Both card and crypto payments supported. Safe, secure, and instant payouts.
            </p>
            <Link
              href="/pricing"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              View pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators and fans on NovaFans today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton
              href="/register?role=CREATOR"
              variant="white"
              eventName="landing_cta_creator"
              eventProps={{ section: "bottom_cta" }}
            >
              Start as a Creator
            </CTAButton>
            <CTAButton
              href="/register?role=FAN"
              variant="secondary"
              eventName="landing_cta_fan"
              eventProps={{ section: "bottom_cta" }}
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600"
            >
              Sign up as a Fan
            </CTAButton>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">How do creators get paid?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Creators earn from subscriptions, tips, paid DMs, and live session tips. Payouts are processed securely with flexible payment methods.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">What payment methods are supported?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We support both traditional card payments and cryptocurrency payments (USDT, BTC, ETH, and more).
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">Is my content safe?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, we use industry-standard security measures to protect your content and personal information.
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/help"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              View all FAQs →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
