"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function CreatorLivePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    accessType: "FREE",
    ticketPrice: "",
    scheduledStartAt: "",
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      // Use either endpoint - both work
      const res = await api.get("/creators/me/live-sessions");
      setSessions(res.data || []);
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
    try {
      await api.post("/live-sessions", {
        ...formData,
        ticketPrice: formData.ticketPrice ? parseFloat(formData.ticketPrice) : undefined,
        scheduledStartAt: formData.scheduledStartAt || undefined,
      });
      alert("Live show created!");
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        accessType: "FREE",
        ticketPrice: "",
        scheduledStartAt: "",
      });
      loadSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create live show");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const upcomingSessions = sessions.filter((s) => s.status === "SCHEDULED");
  const liveSessions = sessions.filter((s) => s.status === "LIVE");
  const pastSessions = sessions.filter((s) => s.status === "ENDED");

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Live Shows</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "Schedule New Show"}
          </button>
          <Link
            href="/dashboard/creator"
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Schedule Live Show</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Access Type</label>
              <select
                value={formData.accessType}
                onChange={(e) => setFormData({ ...formData, accessType: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="FREE">Free</option>
                <option value="SUBSCRIBERS_ONLY">Subscribers Only</option>
                <option value="TICKETED">Ticketed</option>
              </select>
            </div>
            {formData.accessType === "TICKETED" && (
              <div>
                <label className="block mb-2">Ticket Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.ticketPrice}
                  onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
            )}
            <div>
              <label className="block mb-2">Scheduled Start (leave empty for immediate)</label>
              <input
                type="datetime-local"
                value={formData.scheduledStartAt}
                onChange={(e) => setFormData({ ...formData, scheduledStartAt: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Live Show
            </button>
          </form>
        </div>
      )}

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">⏰ Upcoming</h2>
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{session.title}</h3>
                    {session.description && (
                      <p className="text-gray-600 mb-2">{session.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>
                        {session.accessType === "FREE"
                          ? "Free"
                          : session.accessType === "SUBSCRIBERS_ONLY"
                          ? "Subscribers Only"
                          : `$${session.ticketPrice} ticket`}
                      </span>
                      {session.scheduledStartAt && (
                        <span>
                          {new Date(session.scheduledStartAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/live/${session.id}`}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Start
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Sessions */}
      {liveSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">🔴 Live Now</h2>
          <div className="space-y-4">
            {liveSessions.map((session) => (
              <div key={session.id} className="border rounded-lg p-6 bg-red-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{session.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Tips: ${session.totalTips?.toFixed(2) || 0} ({session.tipsCount || 0} tips)
                    </p>
                  </div>
                  <Link
                    href={`/live/${session.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View/Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Past Shows</h2>
          <div className="space-y-4">
            {pastSessions.slice(0, 10).map((session) => (
              <div key={session.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold mb-2">{session.title}</h3>
                    <div className="text-sm text-gray-600">
                      {session.startedAt && (
                        <p>Started: {new Date(session.startedAt).toLocaleString()}</p>
                      )}
                      {session.endedAt && (
                        <p>Ended: {new Date(session.endedAt).toLocaleString()}</p>
                      )}
                      <p>
                        Total Tips: ${session.totalTips?.toFixed(2) || 0} ({session.tipsCount || 0}{" "}
                        tips)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && !showForm && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No live shows yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Schedule Your First Show
          </button>
        </div>
      )}
    </div>
  );
}

