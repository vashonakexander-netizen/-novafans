import type { Metadata } from "next";
import Link from "next/link";
import { CTAButton } from "@/components/cta-button";

export const metadata: Metadata = {
  title: "NovaFans - Support Your Favorite Creators | Exclusive Content & Live Shows",
  description: "Subscribe to exclusive content, chat directly with creators, and unlock premium experiences. Secure payments, live sessions, and direct messaging.",
  openGraph: {
    title: "NovaFans - Support Your Favorite Creators",
    description: "The ultimate platform for fans. Subscribe to exclusive content, chat with creators, and unlock premium experiences.",
    type: "website",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Focused on Fans */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Support Your Favorite Creators
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-gray-700 dark:text-gray-300 font-medium">
            Get exclusive content, chat directly, and unlock premium experiences
          </p>
          <p className="text-lg md:text-xl mb-10 text-gray-600 dark:text-gray-400">
            Join thousands of fans supporting creators they love. Secure payments, instant access, and real connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton
              href="/register?role=FAN"
              variant="primary"
              eventName="landing_cta_fan"
              eventProps={{ page: "/", section: "hero" }}
              className="px-8 py-4 text-lg"
            >
              Start Supporting Creators
            </CTAButton>
            <CTAButton
              href="/creators"
              variant="secondary"
              eventName="landing_browse_creators"
              eventProps={{ page: "/", section: "hero" }}
              className="px-8 py-4 text-lg"
            >
              Browse Creators
            </CTAButton>
          </div>
        </div>
      </section>

      {/* Why Fans Love NovaFans */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Thousands of Fans Choose NovaFans
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your payments and personal information are protected with industry-leading security. 
                Your privacy matters to us.
              </p>
            </div>
            <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3">Instant Access</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Subscribe and get immediate access to exclusive content. No waiting, no delays - 
                just instant gratification.
              </p>
            </div>
            <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-3">Direct Connection</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Chat directly with creators. Build real relationships and get personalized responses 
                from the creators you support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Fans */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything You Need to Support Creators
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-2xl font-semibold mb-3">Exclusive Content</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Access subscriber-only posts, photos, videos, and behind-the-scenes content that 
                only subscribers get to see.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>Premium photos and videos</li>
                <li>Exclusive posts and updates</li>
                <li>Early access to new content</li>
                <li>Subscriber-only live sessions</li>
              </ul>
            </div>
            <div className="p-8 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
              <div className="text-4xl mb-4">📺</div>
              <h3 className="text-2xl font-semibold mb-3">Live Sessions</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Join live shows, interact in real-time, and tip creators during live sessions 
                to show your support.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>Real-time interaction</li>
                <li>Live tipping and support</li>
                <li>Exclusive live content</li>
                <li>Ticket-based premium shows</li>
              </ul>
            </div>
            <div className="p-8 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-2xl font-semibold mb-3">Direct Messaging</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Chat directly with creators. Some offer paid DMs for more personal, one-on-one 
                conversations.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>Private conversations</li>
                <li>Personalized responses</li>
                <li>AI autopilot when creators are busy</li>
                <li>Unlock premium conversations</li>
              </ul>
            </div>
            <div className="p-8 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-2xl font-semibold mb-3">Flexible Payments</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Pay the way you want. Support creators with cards or cryptocurrency - whatever 
                works best for you.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>Credit & debit cards</li>
                <li>Cryptocurrency (USDT, BTC, ETH)</li>
                <li>Secure payment processing</li>
                <li>Instant transactions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl opacity-90">
              Getting started is simple. Support your favorite creators in just three steps.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Sign Up Free</h3>
              <p className="opacity-90">
                Create your account in seconds. No credit card required to browse and discover creators.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Find Creators</h3>
              <p className="opacity-90">
                Browse thousands of creators. Preview their content and see what they offer before subscribing.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Subscribe & Enjoy</h3>
              <p className="opacity-90">
                Subscribe to unlock exclusive content, chat with creators, and join live sessions.
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <CTAButton
              href="/register?role=FAN"
              variant="white"
              eventName="landing_cta_fan"
              eventProps={{ section: "how_it_works" }}
              className="px-8 py-4 text-lg"
            >
              Get Started Free
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
              <h3 className="font-semibold mb-2">How do I subscribe to a creator?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Browse creators, visit their profile, and click subscribe. Choose your payment method 
                (card or crypto) and get instant access to their exclusive content.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">What payment methods are supported?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We support both traditional card payments and cryptocurrency payments (USDT, BTC, ETH, and more). 
                All payments are secure and encrypted.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! You have full control. Cancel your subscription anytime from your dashboard. 
                You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">Is my information safe?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Absolutely. We use industry-standard security measures to protect your personal information 
                and payment details. Your privacy is our top priority.
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

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Support Your Favorite Creators?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of fans discovering exclusive content and building connections with creators.
          </p>
          <CTAButton
            href="/register?role=FAN"
            variant="white"
            eventName="landing_cta_fan"
            eventProps={{ section: "final_cta" }}
            className="px-8 py-4 text-lg"
          >
            Sign Up Free
          </CTAButton>
        </div>
      </section>

      {/* Creator Signup - Hidden at Bottom */}
      <section className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Are you a creator looking to monetize your content?
          </p>
          <Link
            href="/for-creators"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Learn about becoming a creator →
          </Link>
        </div>
      </section>
    </div>
  );
}
