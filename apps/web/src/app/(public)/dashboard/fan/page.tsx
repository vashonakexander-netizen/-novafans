"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function FanDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [suggestedCreators, setSuggestedCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/auth/me"),
      api.get("/subscriptions/me").catch(() => null),
      api.get("/messages/conversations").then((res) => res.data.slice(0, 5)).catch(() => []),
      // TODO: Implement suggested creators endpoint
      Promise.resolve([]),
    ])
      .then(([userRes, subsRes, messagesRes, creatorsRes]) => {
        setUser(userRes.data);
        setSubscriptions(Array.isArray((subsRes as any)?.data) ? (subsRes as any).data : []);
        setRecentMessages(messagesRes || []);
        setSuggestedCreators(creatorsRes || []);
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

  if (!user || user.role !== "FAN") {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Access denied</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-4">Welcome back, {user.displayName || user.username}!</h1>

      {/* Active Subscriptions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Subscriptions</h2>
        {subscriptions.length === 0 ? (
          <div className="border rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">You don&apos;t have any active subscriptions yet.</p>
            <Link
              href="/creators"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Discover Creators
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {subscriptions.map((sub: any) => (
              <Link
                key={sub.id}
                href={`/u/${sub.creator?.username}`}
                className="border rounded-lg p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <h3 className="font-semibold">{sub.creator?.displayName || sub.creator?.username}</h3>
                    <p className="text-sm text-gray-600">@{sub.creator?.username}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>${sub.price}/month</p>
                  {sub.renewsAt && (
                    <p>Renews: {new Date(sub.renewsAt).toLocaleDateString()}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
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
                  href={`/dashboard/fan/messages/${conv.id}`}
                  className="block p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {conv.creator?.displayName || conv.creator?.username}
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

        {/* Discover Creators */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Discover Creators</h2>
          {suggestedCreators.length === 0 ? (
            <div>
              <p className="text-gray-600 mb-4">Discover amazing creators to subscribe to.</p>
              <Link
                href="/creators"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Browse All Creators
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestedCreators.map((creator: any) => (
                <Link
                  key={creator.id}
                  href={`/u/${creator.username}`}
                  className="block p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                      <div>
                        <p className="font-semibold">{creator.displayName || creator.username}</p>
                        <p className="text-sm text-gray-600">@{creator.username}</p>
                      </div>
                    </div>
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


