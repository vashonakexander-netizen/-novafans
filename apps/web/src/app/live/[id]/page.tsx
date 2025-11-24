"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function LiveViewerPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tipAmount, setTipAmount] = useState("");
  const [tipMessage, setTipMessage] = useState("");
  const [sendingTip, setSendingTip] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadSession();
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const res = await api.get(`/live-sessions/${sessionId}`);
      setSession(res.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert("You need to subscribe to view this show");
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const sendTip = async () => {
    if (!tipAmount || parseFloat(tipAmount) <= 0) return;

    setSendingTip(true);
    try {
      await api.post(`/live-sessions/${sessionId}/tips`, {
        amount: parseFloat(tipAmount),
        message: tipMessage || undefined,
      });
      alert("Tip sent!");
      setTipAmount("");
      setTipMessage("");
      loadSession();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to send tip");
    } finally {
      setSendingTip(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Live session not found</div>
      </div>
    );
  }

  const isCreator = user?.id === session.creatorId;
  const isLive = session.status === "LIVE";

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Video Area */}
        <div className="md:col-span-2">
          <div className="border rounded-lg overflow-hidden mb-4">
            {/* Video Player Placeholder */}
            <div className="aspect-video bg-black flex items-center justify-center">
              {isLive ? (
                <div className="text-center text-white">
                  <p className="text-2xl font-bold mb-2">🔴 LIVE</p>
                  <p className="text-sm">Stream URL: {session.streamUrl || "Not available"}</p>
                  <p className="text-xs mt-4 text-gray-400">
                    TODO: Integrate LiveKit/Agora/Mux video player here
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <p className="text-lg">Stream not live</p>
                  {session.scheduledStartAt && (
                    <p className="text-sm mt-2">
                      Starts: {new Date(session.scheduledStartAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Session Info */}
          <div className="border rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-2">{session.title}</h1>
            <p className="text-gray-600 mb-4">{session.description}</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div>
                <p className="font-semibold">
                  {session.creator?.displayName || session.creator?.username}
                </p>
                <Link
                  href={`/u/${session.creator?.username}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Tipping UI */}
          {isLive && user && !isCreator && (
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Send a Tip</h3>
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="Amount"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded"
                />
                <textarea
                  placeholder="Message (optional)"
                  value={tipMessage}
                  onChange={(e) => setTipMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded"
                />
                <button
                  onClick={sendTip}
                  disabled={sendingTip || !tipAmount}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {sendingTip ? "Sending..." : "Send Tip"}
                </button>
              </div>
            </div>
          )}

          {/* Creator Info */}
          {isCreator && (
            <div className="border rounded-lg p-6 bg-yellow-50">
              <h3 className="font-semibold mb-2">Creator Controls</h3>
              <div className="text-sm space-y-2 mb-4">
                <p>
                  <strong>Stream Key:</strong> {session.streamKey}
                </p>
                <p>
                  <strong>Stream URL:</strong> {session.streamUrl}
                </p>
                <p className="text-xs text-gray-600">
                  Use this key in OBS or your streaming software (TODO: real streaming integration)
                </p>
              </div>
              {session.status === "SCHEDULED" && (
                <button
                  onClick={async () => {
                    try {
                      await api.post(`/live-sessions/${sessionId}/start`);
                      loadSession();
                    } catch (err: any) {
                      alert(err.response?.data?.message || "Failed to start");
                    }
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Start Live Show
                </button>
              )}
              {isLive && (
                <button
                  onClick={async () => {
                    if (!confirm("End this live show?")) return;
                    try {
                      await api.post(`/live-sessions/${sessionId}/end`);
                      loadSession();
                    } catch (err: any) {
                      alert(err.response?.data?.message || "Failed to end");
                    }
                  }}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  End Live Show
                </button>
              )}
            </div>
          )}

          {/* Recent Tips */}
          {session.tips && session.tips.length > 0 && (
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Recent Tips</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {session.tips.map((tip: any) => (
                  <div key={tip.id} className="border-b pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">
                          {tip.fan?.displayName || tip.fan?.username}
                        </p>
                        {tip.message && <p className="text-sm text-gray-600">{tip.message}</p>}
                      </div>
                      <span className="font-bold text-green-600">${Number(tip.amount).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

