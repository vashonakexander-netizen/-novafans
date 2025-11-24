"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function CreatorPayoutsPage() {
  const router = useRouter();
  const [payouts, setPayouts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    payoutMethod: "USDT",
    payoutDetails: "",
  });

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      const res = await api.get("/payouts/me");
      setPayouts(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let details = {};
      try {
        details = JSON.parse(formData.payoutDetails);
      } catch {
        // If not valid JSON, treat as plain text
        details = { address: formData.payoutDetails };
      }

      await api.post("/payouts/request", {
        amount: parseFloat(formData.amount),
        payoutMethod: formData.payoutMethod,
        payoutDetails: details,
      });

      alert("Payout request submitted!");
      setFormData({ amount: "", payoutMethod: "USDT", payoutDetails: "" });
      loadPayouts();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit payout request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!payouts) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Failed to load payouts</div>
      </div>
    );
  }

  const availableBalance = payouts.balance?.available || 0;

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Payouts</h1>
        <Link
          href="/dashboard/creator"
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-lg p-6 bg-green-50">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Available Balance</h3>
          <p className="text-3xl font-bold">${availableBalance.toFixed(2)}</p>
          <p className="text-sm text-gray-600 mt-2">Ready for payout</p>
        </div>
        <div className="border rounded-lg p-6 bg-yellow-50">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Pending Balance</h3>
          <p className="text-3xl font-bold">${(payouts.balance?.pending || 0).toFixed(2)}</p>
          <p className="text-sm text-gray-600 mt-2">On hold (will become available)</p>
        </div>
      </div>

      {/* Request Payout Form */}
      <div className="border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Request Payout</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Amount (max: ${availableBalance.toFixed(2)})</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={availableBalance}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Payout Method</label>
            <select
              value={formData.payoutMethod}
              onChange={(e) => setFormData({ ...formData, payoutMethod: e.target.value })}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
              <option value="BTC">Bitcoin</option>
              <option value="ETH">Ethereum</option>
              <option value="BANK">Bank Transfer</option>
              <option value="PAXUM">Paxum</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">
              Payout Details (wallet address, account number, etc.)
            </label>
            <textarea
              value={formData.payoutDetails}
              onChange={(e) => setFormData({ ...formData, payoutDetails: e.target.value })}
              placeholder='{"address": "0x..."} or just paste wallet address'
              className="w-full px-4 py-2 border rounded"
              rows={3}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting || availableBalance <= 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Request Payout"}
          </button>
        </form>
      </div>

      {/* Payout History */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Payout History</h2>
        {payouts.requests && payouts.requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Method</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {payouts.requests.map((request: any) => (
                  <tr key={request.id} className="border-b">
                    <td className="py-3">${Number(request.amount).toFixed(2)}</td>
                    <td>{request.payoutMethod}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          request.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : request.status === "PROCESSING"
                            ? "bg-yellow-100 text-yellow-800"
                            : request.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="text-sm">{new Date(request.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No payout requests yet</p>
        )}
      </div>
    </div>
  );
}

