"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function CreatorAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/creators/me/analytics")
      .then((res) => {
        setAnalytics(res.data);
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Link
          href="/dashboard/creator"
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="border rounded-lg p-6 bg-blue-50">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Earnings</h3>
          <p className="text-3xl font-bold">${analytics.totalEarnings?.toFixed(2) || 0}</p>
        </div>
        <div className="border rounded-lg p-6 bg-green-50">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Last 30 Days</h3>
          <p className="text-3xl font-bold">${analytics.monthlyEarnings?.toFixed(2) || 0}</p>
        </div>
        <div className="border rounded-lg p-6 bg-purple-50">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Active Subscribers</h3>
          <p className="text-3xl font-bold">{analytics.activeSubscribersCount || 0}</p>
        </div>
        <div className="border rounded-lg p-6 bg-orange-50">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">New Subs (30d)</h3>
          <p className="text-3xl font-bold">{analytics.newSubscribersLast30d || 0}</p>
        </div>
      </div>

      {/* Earnings by Type */}
      <div className="border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Earnings by Type</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Subscriptions</p>
            <p className="text-2xl font-semibold">
              ${analytics.earningsByType?.SUBSCRIPTION?.toFixed(2) || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Paid Posts</p>
            <p className="text-2xl font-semibold">
              ${analytics.earningsByType?.PAID_POST?.toFixed(2) || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Paid DMs</p>
            <p className="text-2xl font-semibold">
              ${analytics.earningsByType?.PAID_DM?.toFixed(2) || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tips</p>
            <p className="text-2xl font-semibold">
              ${analytics.earningsByType?.TIP?.toFixed(2) || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Top Posts */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Top Earning Posts</h2>
        {analytics.topPosts && analytics.topPosts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Title</th>
                  <th className="text-right py-2">Revenue</th>
                  <th className="text-right py-2">Purchases</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topPosts.map((post: any) => (
                  <tr key={post.postId} className="border-b">
                    <td className="py-3">{post.title}</td>
                    <td className="text-right">${post.revenue?.toFixed(2) || 0}</td>
                    <td className="text-right">{post.purchases || 0}</td>
                    <td className="text-right">
                      <Link
                        href={`/posts/${post.postId}`}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No posts yet</p>
        )}
      </div>
    </div>
  );
}


