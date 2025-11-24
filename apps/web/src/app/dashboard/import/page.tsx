"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function ImportPage() {
  const [sourceType, setSourceType] = useState<"LOCAL" | "REMOTE">("LOCAL");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleCreateSession = async () => {
    setLoading(true);
    try {
      const res = await api.post("/creator/import/sessions", {
        sourceType,
        sourceUrl: sourceType === "REMOTE" ? remoteUrl : undefined,
      });
      setSessionId(res.data.id);
      alert("Import session created! Now upload files.");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Import Content</h1>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block mb-2">Import Source</label>
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as any)}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="LOCAL">Upload from device</option>
            <option value="REMOTE">Import from URL (MEGA/Drive/ZIP)</option>
          </select>
        </div>

        {sourceType === "REMOTE" && (
          <div>
            <label className="block mb-2">Remote URL</label>
            <input
              type="text"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              placeholder="https://mega.nz/... or https://drive.google.com/... or direct ZIP URL"
              className="w-full px-4 py-2 border rounded"
            />
          </div>
        )}

        {sourceType === "LOCAL" && (
          <div>
            <label className="block mb-2">Upload Files</label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="w-full px-4 py-2 border rounded"
              disabled={!sessionId}
            />
            <p className="text-sm text-gray-600 mt-2">
              {!sessionId
                ? "Create a session first, then upload files"
                : "Files will be added to your import session"}
            </p>
          </div>
        )}

        <button
          onClick={handleCreateSession}
          disabled={loading || (sourceType === "REMOTE" && !remoteUrl)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Import Session"}
        </button>

        {sessionId && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800">
              Session created! ID: {sessionId}
              <br />
              <small>
                Use the preview endpoint to see files, then commit to create posts.
              </small>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

