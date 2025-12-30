export default function BillingPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Billing Policy</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Payment Methods</h2>
          <p>
            NovaFans accepts payments via credit/debit cards and cryptocurrency. All payments are processed through secure third-party payment processors.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Subscription Billing</h2>
          <p>
            Subscriptions are billed automatically on a recurring basis (monthly or as specified). You will be charged at the beginning of each billing cycle.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Platform Fees</h2>
          <p>
            NovaFans charges platform fees on transactions. Creators receive a percentage of earnings after platform fees are deducted. Current platform fee: 20% of transaction amount.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Refunds</h2>
          <p>
            Refunds are handled on a case-by-case basis. Generally:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Subscription cancellations take effect at the end of the current billing period</li>
            <li>Paid content purchases are typically non-refundable</li>
            <li>Refunds may be issued for technical issues or service failures</li>
            <li>Chargebacks may result in account suspension</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Creator Payouts</h2>
          <p>
            Creators can request payouts of available balance. Payouts are processed according to the payout method selected. Processing times vary by method.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Currency</h2>
          <p>
            All prices are displayed in USD unless otherwise specified. Cryptocurrency payments are converted at the time of transaction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Taxes</h2>
          <p>
            You are responsible for any taxes applicable to your transactions. NovaFans may collect and remit taxes as required by law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Disputes</h2>
          <p>
            For billing disputes, please contact our support team. We will investigate and resolve disputes in accordance with our policies.
          </p>
        </section>
      </div>
    </div>
  );
}


