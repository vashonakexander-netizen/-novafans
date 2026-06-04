"use client";

import { useState } from "react";

export default function ScraperTestPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint: string, method: string = "GET", body?: any) => {
    setLoading(true);
    try {
      const options: any = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`http://localhost:3001${endpoint}`, options);
      const data = await response.json();
      
      setResults({
        endpoint,
        method,
        status: response.status,
        statusText: response.statusText,
        data,
        ok: response.ok,
      });
    } catch (error: any) {
      setResults({
        endpoint,
        method,
        error: error.message,
        ok: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Scraper Diagnostic Tool</h1>

        <div className="space-y-4 mb-8">
          <button
            onClick={() => testEndpoint("/health")}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600"
          >
            Test /health
          </button>

          <button
            onClick={() => testEndpoint("/scraper/test")}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600 ml-4"
          >
            Test /scraper/test
          </button>

          <button
            onClick={() => testEndpoint("/scraper/scrape", "POST", { sourceUrl: "https://example.com" })}
            disabled={loading}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-600 ml-4"
          >
            Test /scraper/scrape
          </button>
        </div>

        {loading && (
          <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 mb-4">
            Testing...
          </div>
        )}

        {results && (
          <div className={`border rounded-lg p-6 ${results.ok ? "bg-green-900/20 border-green-700" : "bg-red-900/20 border-red-700"}`}>
            <h2 className="text-2xl font-bold mb-4">
              {results.ok ? "✅ Success" : "❌ Failed"}
            </h2>
            <div className="space-y-2 font-mono text-sm">
              <div>
                <span className="text-gray-400">Endpoint:</span>{" "}
                <span className="text-white">{results.method} {results.endpoint}</span>
              </div>
              {results.status && (
                <div>
                  <span className="text-gray-400">Status:</span>{" "}
                  <span className="text-white">{results.status} {results.statusText}</span>
                </div>
              )}
              {results.error ? (
                <div className="text-red-400">
                  <span className="text-gray-400">Error:</span> {results.error}
                </div>
              ) : (
                <div>
                  <span className="text-gray-400">Response:</span>
                  <pre className="mt-2 p-4 bg-gray-800 rounded overflow-auto">
                    {JSON.stringify(results.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Troubleshooting</h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• If /health fails: API server is not running</li>
            <li>• If /scraper/test fails: Scraper module not loaded</li>
            <li>• If /scraper/scrape fails: Check the error message above</li>
            <li>• Start API server: <code className="bg-gray-700 px-2 py-1 rounded">cd apps/api && pnpm dev</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
