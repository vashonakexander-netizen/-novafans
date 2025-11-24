"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function LivePage() {
  const [sessions, setSessions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const res = await api.get("/live-sessions");
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Live Shows</h1>

      {/* Currently Live */}
      {sessions?.live && sessions.live.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">🔴 Live Now</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {sessions.live.map((session: any) => (
              <Link
                key={session.id}
                href={`/live/${session.id}`}
                className="border rounded-lg p-6 hover:shadow-lg transition"
              >
                <div className="aspect-video bg-red-100 rounded mb-4 flex items-center justify-center">
                  <span className="text-red-600 font-bold">🔴 LIVE</span>
                </div>
                <h3 className="font-semibold mb-2">{session.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {session.creator?.displayName || session.creator?.username}
                </p>
                <p className="text-xs text-gray-500">
                  {session.accessType === "FREE"
                    ? "Free"
                    : session.accessType === "SUBSCRIBERS_ONLY"
                    ? "Subscribers Only"
                    : `$${session.ticketPrice} ticket`}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {sessions?.upcoming && sessions.upcoming.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">⏰ Upcoming</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {sessions.upcoming.map((session: any) => (
              <Link
                key={session.id}
                href={`/live/${session.id}`}
                className="border rounded-lg p-6 hover:shadow-lg transition"
              >
                <div className="aspect-video bg-gray-200 rounded mb-4 flex items-center justify-center">
                  <span className="text-gray-600">⏰ Scheduled</span>
                </div>
                <h3 className="font-semibold mb-2">{session.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {session.creator?.displayName || session.creator?.username}
                </p>
                {session.scheduledStartAt && (
                  <p className="text-xs text-gray-500">
                    {new Date(session.scheduledStartAt).toLocaleString()}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {(!sessions?.live || sessions.live.length === 0) &&
        (!sessions?.upcoming || sessions.upcoming.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-600">No live shows at the moment</p>
          </div>
        )}
    </div>
  );
}

