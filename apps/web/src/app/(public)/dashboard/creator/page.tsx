"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function CreatorDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/auth/me"),
      api.get("/creators/me/analytics").catch(() => null),
      api.get("/messages/conversations").then((res) => res.data.slice(0, 5)).catch(() => []),
      api.get("/posts/creators/me/posts").catch(() => null),
    ])
      .then(([userRes, analyticsRes, messagesRes, postsRes]) => {
        setUser(userRes.data);
        setAnalytics(analyticsRes?.data || null);
        setRecentMessages(messagesRes || []);
        setRecentPosts((postsRes as any)?.data?.slice(0, 5) || []);
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

  if (!user || user.role !== "CREATOR") {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Access denied</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-4">
        Welcome back, {user.displayName || user.username}!
      </h1>

      {/* Summary Metrics */}
      {analytics && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="border rounded-lg p-6 bg-blue-50">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Earnings This Month</h3>
            <p className="text-3xl font-bold">${analytics.monthlyEarnings?.toFixed(2) || 0}</p>
          </div>
          <div className="border rounded-lg p-6 bg-green-50">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Earnings</h3>
            <p className="text-3xl font-bold">${analytics.totalEarnings?.toFixed(2) || 0}</p>
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
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          href="/dashboard/creator/create-post"
          className="border rounded-lg p-6 hover:shadow-lg transition text-center bg-white"
        >
          <div className="text-2xl mb-2">📝</div>
          <h3 className="font-semibold">Create Post</h3>
        </Link>
        <Link
          href="/dashboard/creator/import"
          className="border rounded-lg p-6 hover:shadow-lg transition text-center bg-white"
        >
          <div className="text-2xl mb-2">📤</div>
          <h3 className="font-semibold">Import Content</h3>
        </Link>
        <Link
          href="/dashboard/creator/messages"
          className="border rounded-lg p-6 hover:shadow-lg transition text-center bg-white"
        >
          <div className="text-2xl mb-2">💬</div>
          <h3 className="font-semibold">Messages</h3>
        </Link>
        <Link
          href="/dashboard/creator/analytics"
          className="border rounded-lg p-6 hover:shadow-lg transition text-center bg-white"
        >
          <div className="text-2xl mb-2">📊</div>
          <h3 className="font-semibold">Analytics</h3>
        </Link>
        <Link
          href="/dashboard/creator/payouts"
          className="border rounded-lg p-6 hover:shadow-lg transition text-center bg-white"
        >
          <div className="text-2xl mb-2">💰</div>
          <h3 className="font-semibold">Payouts</h3>
        </Link>
        <Link
          href="/dashboard/creator/live"
          className="border rounded-lg p-6 hover:shadow-lg transition text-center bg-white"
        >
          <div className="text-2xl mb-2">🔴</div>
          <h3 className="font-semibold">Live Shows</h3>
        </Link>
      </div>

      {/* AI Autopilot Status */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">AI Autopilot</h3>
            <p className="text-sm text-gray-600">
              {user.creatorProfile?.aiPersonaEnabled
                ? "✅ Enabled - Your AI assistant will reply to fans when you're offline"
                : "❌ Disabled - Enable in settings to auto-reply to fans"}
            </p>
          </div>
          <Link
            href="/dashboard/creator/settings"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Settings
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
          {recentMessages.length === 0 ? (
            <p className="text-gray-600">No recent messages</p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((conv: any) => (
                <Link
                  key={conv.id}
                  href={`/dashboard/creator/messages/${conv.id}`}
                  className="block p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {conv.fan?.displayName || conv.fan?.username}
                      </p>
                      {conv.messages?.[0] && (
                        <p className="text-sm text-gray-600 truncate">
                          {conv.messages[0].body}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Posts */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
          {recentPosts.length === 0 ? (
            <p className="text-gray-600">No posts yet</p>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/dashboard/creator/posts/${post.id}`}
                  className="block p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{post.title || "Untitled"}</p>
                      <p className="text-sm text-gray-600">
                        {post.visibility} • {post.status}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

