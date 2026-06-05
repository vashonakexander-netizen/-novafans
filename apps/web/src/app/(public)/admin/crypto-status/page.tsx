"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CryptoStatus {
  crypto: {
    provider: string;
    mode: string;
    configured: boolean;
    hasApiKey: boolean;
    hasIpnSecret: boolean;
    callbackBaseUrl: string;
    defaultCurrency: string;
    minAmount: number;
  };
  health: {
    api: string;
    webhook: string;
  };
  recentInvoices: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    expiresAt?: string;
    fan: { id: string; username: string; displayName: string };
    creator: { id: string; username: string; displayName: string };
  }>;
  validation: {
    total: number;
    passed: number;
    failed: number;
    overallStatus: string;
  } | null;
  tests: {
    subscriptionFlow: string;
    tipFlow: string;
    webhookMapping: string;
    balanceUpdates: string;
  };
  lastValidated: string | null;
}

export default function CryptoStatusPage() {
  const router = useRouter();
  const [status, setStatus] = useState<CryptoStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated and is admin
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch crypto status
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    fetch(`${apiUrl}/admin/crypto-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return null;
        }
        if (!res.ok) {
          throw new Error(`Failed to fetch status: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setStatus(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading crypto status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const getStatusBadge = (testStatus: string) => {
    const statusClass =
      testStatus === "PASS"
        ? "bg-green-500"
        : testStatus === "FAIL"
        ? "bg-red-500"
        : "bg-yellow-500";
    return (
      <span className={`${statusClass} text-white px-3 py-1 rounded-full text-sm font-bold`}>
        {testStatus}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-purple-700 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-8 text-center">
            <h1 className="text-4xl font-bold mb-2">🚀 NovaFans Crypto Payment System</h1>
            <p className="text-xl opacity-90">Admin Dashboard</p>
            <div className="mt-4 inline-block bg-green-500 px-6 py-2 rounded-full font-bold">
              Status: {status.crypto.configured ? "CONFIGURED" : "NOT CONFIGURED"}
            </div>
          </div>

          <div className="p-8">
            {/* Configuration Section */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-purple-600 mb-4 pb-2 border-b-4 border-purple-600">
                Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-purple-500">
                  <h3 className="font-bold text-lg mb-2">Provider</h3>
                  <p className="text-gray-700">{status.crypto.provider}</p>
                  <p className="text-sm text-gray-500 mt-1">Mode: {status.crypto.mode}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-purple-500">
                  <h3 className="font-bold text-lg mb-2">API Key</h3>
                  <p className={status.crypto.hasApiKey ? "text-green-600" : "text-red-600"}>
                    {status.crypto.hasApiKey ? "✓ Configured" : "✗ Not Configured"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-purple-500">
                  <h3 className="font-bold text-lg mb-2">IPN Secret</h3>
                  <p className={status.crypto.hasIpnSecret ? "text-green-600" : "text-red-600"}>
                    {status.crypto.hasIpnSecret ? "✓ Configured" : "✗ Not Configured"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-purple-500">
                  <h3 className="font-bold text-lg mb-2">Callback URL</h3>
                  <p className="text-gray-700 break-all">{status.crypto.callbackBaseUrl}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-purple-500">
                  <h3 className="font-bold text-lg mb-2">Default Currency</h3>
                  <p className="text-gray-700">{status.crypto.defaultCurrency}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-purple-500">
                  <h3 className="font-bold text-lg mb-2">Minimum Amount</h3>
                  <p className="text-gray-700">{status.crypto.minAmount}</p>
                </div>
              </div>
            </section>

            {/* Test Results Section */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-purple-600 mb-4 pb-2 border-b-4 border-purple-600">
                Test Results
              </h2>
              {status.validation && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold">{status.validation.total}</div>
                    <div className="text-sm opacity-90">Total Tests</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold">{status.validation.passed}</div>
                    <div className="text-sm opacity-90">Passed</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold">{status.validation.failed}</div>
                    <div className="text-sm opacity-90">Failed</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold">{status.validation.overallStatus}</div>
                    <div className="text-sm opacity-90">Overall</div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <h3 className="font-bold text-lg mb-2">Subscription Flow</h3>
                  <div className="mt-2">{getStatusBadge(status.tests.subscriptionFlow)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <h3 className="font-bold text-lg mb-2">Tip Flow</h3>
                  <div className="mt-2">{getStatusBadge(status.tests.tipFlow)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <h3 className="font-bold text-lg mb-2">Webhook Mapping</h3>
                  <div className="mt-2">{getStatusBadge(status.tests.webhookMapping)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <h3 className="font-bold text-lg mb-2">Balance Updates</h3>
                  <div className="mt-2">{getStatusBadge(status.tests.balanceUpdates)}</div>
                </div>
              </div>
              {status.lastValidated && (
                <p className="text-sm text-gray-500 mt-4">
                  Last validated: {new Date(status.lastValidated).toLocaleString()}
                </p>
              )}
            </section>

            {/* Recent Invoices Section */}
            <section>
              <h2 className="text-3xl font-bold text-purple-600 mb-4 pb-2 border-b-4 border-purple-600">
                Recent Invoices (Last 10)
              </h2>
              {status.recentInvoices.length === 0 ? (
                <p className="text-gray-600">No invoices found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-purple-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left">ID</th>
                        <th className="px-4 py-3 text-left">Amount</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Fan</th>
                        <th className="px-4 py-3 text-left">Creator</th>
                        <th className="px-4 py-3 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {status.recentInvoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-sm">{invoice.id.substring(0, 16)}...</td>
                          <td className="px-4 py-3">
                            {invoice.amount} {invoice.currency}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                invoice.status === "PAID"
                                  ? "bg-green-100 text-green-800"
                                  : invoice.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">{invoice.fan.displayName || invoice.fan.username}</td>
                          <td className="px-4 py-3">
                            {invoice.creator.displayName || invoice.creator.username}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}


