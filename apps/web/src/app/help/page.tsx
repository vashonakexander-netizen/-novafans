"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";

export default function HelpPage() {
  // Page view is tracked automatically by PageViewTracker in layout
  useEffect(() => {
    // Page views are handled by PageViewTracker component
  }, []);

  const faqs = [
    {
      category: "Payouts",
      questions: [
        {
          q: "How do creators get paid?",
          a: "Creators earn from subscriptions, tips, paid DMs, and live sessions. Earnings move to 'pending' status after transactions complete, then to 'available' after admin review. You can request payouts from your available balance.",
        },
        {
          q: "How often can I request payouts?",
          a: "You can request payouts when you have available balance. Payout requests are reviewed by admin and processed according to your selected payout method.",
        },
        {
          q: "What payout methods are available?",
          a: "Payout methods include bank transfers and cryptocurrency. Specific methods may vary by region. Check your creator dashboard for available options.",
        },
      ],
    },
    {
      category: "Crypto Payments",
      questions: [
        {
          q: "What cryptocurrencies are supported?",
          a: "NovaFans supports USDT, BTC, ETH, and other major cryptocurrencies. The exact list may vary by payment provider.",
        },
        {
          q: "How do crypto payments work?",
          a: "When you choose crypto payment, an invoice is created. You'll receive a payment URL to complete the transaction. Once payment is confirmed via webhook, your subscription or tip is activated automatically.",
        },
        {
          q: "Are crypto payments safe?",
          a: "Yes, we use secure payment gateways and verify all transactions. Webhook verification ensures payments are legitimate before activating subscriptions or tips.",
        },
      ],
    },
    {
      category: "Content Policy",
      questions: [
        {
          q: "What content is allowed?",
          a: "NovaFans allows adult content for users 18+. All content must comply with our Terms of Service and Acceptable Use Policy. Prohibited content includes illegal material, non-consensual content, and content violating intellectual property rights.",
        },
        {
          q: "How is content moderated?",
          a: "We have reporting systems in place. Users can report content that violates our policies. Admin reviews reports and takes appropriate action.",
        },
        {
          q: "What happens if my content is reported?",
          a: "If content is reported, admin will review it. If it violates policies, it may be removed and your account may be subject to action per our Terms of Service.",
        },
      ],
    },
    {
      category: "Support",
      questions: [
        {
          q: "How do I contact support?",
          a: "You can contact support through your dashboard or by emailing support@novafans.com. For urgent issues, use the report feature in your account.",
        },
        {
          q: "What should I do if I have a payment issue?",
          a: "If you experience payment issues, first check your transaction history in your dashboard. If the issue persists, contact support with transaction details.",
        },
        {
          q: "How do I report a problem?",
          a: "Use the report feature in your dashboard or contact support directly. For content violations, use the report button on the content in question.",
        },
      ],
    },
    {
      category: "Account & Security",
      questions: [
        {
          q: "How do I change my password?",
          a: "You can change your password in your account settings in the dashboard.",
        },
        {
          q: "What if I forget my password?",
          a: "Use the 'Forgot Password' link on the login page to reset your password via email.",
        },
        {
          q: "How is my data protected?",
          a: "We use industry-standard security measures including encryption, secure payment processing, and regular security audits. See our Privacy Policy for details.",
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Help & FAQ</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Find answers to common questions about NovaFans
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-12">
          {faqs.map((section) => (
            <section key={section.category}>
              <h2 className="text-2xl font-bold mb-6">{section.category}</h2>
              <div className="space-y-4">
                {section.questions.map((faq, idx) => (
                  <div key={idx} className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Still Need Help */}
        <section className="mt-16 p-8 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Can&apos;t find what you&apos;re looking for? Contact our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
            <a
              href="mailto:support@novafans.com"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Email Support
            </a>
          </div>
        </section>

        {/* Related Links */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Related Resources</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/terms"
              className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <h3 className="font-semibold mb-1">Terms of Service</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Read our terms and conditions
              </p>
            </Link>
            <Link
              href="/privacy"
              className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <h3 className="font-semibold mb-1">Privacy Policy</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Learn how we protect your data
              </p>
            </Link>
            <Link
              href="/acceptable-use"
              className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <h3 className="font-semibold mb-1">Acceptable Use Policy</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Content guidelines and policies
              </p>
            </Link>
            <Link
              href="/billing-policy"
              className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <h3 className="font-semibold mb-1">Billing Policy</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Payment and billing information
              </p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

