"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function ScraperPage() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [cookie, setCookie] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState("");

  const handleScrape = async () => {
    if (!sourceUrl) {
      setError("Please enter a source URL");
      return;
    }

    setLoading(true);
    setError("");
    setStatus(null);

    try {
      const response = await api.post("/scraper/scrape", {
        sourceUrl,
        config: cookie
          ? {
              apiHeaders: {
                Cookie: cookie,
              },
            }
          : {},
      });

      setJobId(response.data.importSessionId);
      setStatus(response.data);

      // Start polling for status
      pollStatus(response.data.importSessionId);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          "Failed to create scrape job";
      setError(`Error: ${errorMessage}. ${err.response?.data?.details || ""}`);
      setLoading(false);
      console.error("Scraper error:", err);
    }
  };

  const pollStatus = async (sessionId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/scraper/jobs/${sessionId}`);
        setStatus(response.data);

        if (
          response.data.status === "READY" ||
          response.data.status === "COMMITTED" ||
          response.data.status === "CANCELED"
        ) {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (err) {
        clearInterval(interval);
        setLoading(false);
        setError("Failed to check status");
      }
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Content Scraper</h1>
        <p className="text-gray-400 mb-8">
          Scrape videos and images from external websites. No authentication required.
        </p>

        <div className="bg-gray-800 rounded-lg p-6 space-y-6">
          {/* Source URL */}
          <div>
            <label className="block text-sm font-medium mb-2">Source URL</label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/movie"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Cookie (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Cookie (Optional - for authenticated sites)
            </label>
            <textarea
              value={cookie}
              onChange={(e) => setCookie(e.target.value)}
              placeholder="pip=xxx; si2=xxx; ..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 font-mono text-sm"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-200">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleScrape}
            disabled={loading || !sourceUrl}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? "Scraping..." : "Start Scraping"}
          </button>
        </div>

        {/* Status */}
        {status && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Scrape Status</h2>
            <div className="space-y-2">
              <div>
                <span className="text-gray-400">Status:</span>{" "}
                <span className="font-semibold">{status.status}</span>
              </div>
              {status.totalFiles !== undefined && (
                <div>
                  <span className="text-gray-400">Files Found:</span>{" "}
                  <span className="font-semibold">{status.totalFiles}</span>
                </div>
              )}
              {status.mediaCount !== undefined && (
                <div>
                  <span className="text-gray-400">Media Items:</span>{" "}
                  <span className="font-semibold">{status.mediaCount}</span>
                </div>
              )}
              {status.media && status.media.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Scraped Media:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {status.media.slice(0, 8).map((item: any, i: number) => (
                      <div
                        key={i}
                        className="bg-gray-700 rounded aspect-video flex items-center justify-center"
                      >
                        {item.type === "VIDEO" ? "🎬" : "🖼️"}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Examples */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Quick Examples</h2>
          <div className="space-y-2 text-sm text-gray-400">
            <button
              onClick={() => {
                setSourceUrl("https://toflx.com/movies/one-battle-after-another-2025");
                setCookie(
                  "pip=ap4kt4641myj; si2=1759548421; _vjs_volume=1; show_watched_5be491fa88819d08df6093f8=true; default_list_type_5be491fa88819d08df6093f8=%22infinity%22; pagin_size_5be491fa88819d08df6093f8=%22auto%22; scbw_5be491fa88819d08df6093f9=69555c398e9d448a1eb05263; auid=5be491fa88819d08df6093f8-p; ds8=1; test_cookie=1769478298552; pxid=1769478300"
                );
              }}
              className="block text-blue-400 hover:underline"
            >
              Load toflx.com example →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
