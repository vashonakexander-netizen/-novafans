"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function CreatorSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    aiPersonaEnabled: false,
    tone: "CUTE" as "FLIRTY" | "CUTE" | "DOMINANT" | "SOFT",
    upsellMode: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    allowExplicitLanguage: false,
    allowKinkTalk: false,
    replyDelaySeconds: 5,
  });

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
        const settings = res.data?.creatorProfile?.aiPersonaSettings || {};
        setFormData({
          aiPersonaEnabled: res.data?.creatorProfile?.aiPersonaEnabled || false,
          tone: settings.tone || "CUTE",
          upsellMode: settings.upsellMode || "MEDIUM",
          allowExplicitLanguage: settings.boundaries?.allowExplicitLanguage || false,
          allowKinkTalk: settings.boundaries?.allowKinkTalk || false,
          replyDelaySeconds: settings.replyDelaySeconds || 5,
        });
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/creators/me/profile", {
        aiPersonaEnabled: formData.aiPersonaEnabled,
        aiPersonaSettings: {
          tone: formData.tone,
          upsellMode: formData.upsellMode,
          boundaries: {
            allowExplicitLanguage: formData.allowExplicitLanguage,
            allowKinkTalk: formData.allowKinkTalk,
            noMeetups: true,
            noOffPlatformLinks: true,
          },
          replyDelaySeconds: formData.replyDelaySeconds,
        },
      });
      alert("Settings saved!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
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
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">AI Autopilot Settings</h1>
        <Link
          href="/dashboard/creator"
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="space-y-6">
        {/* Enable/Disable */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold mb-1">Enable AI Autopilot</h3>
              <p className="text-sm text-gray-600">
                When enabled, AI will automatically reply to fans when you&apos;re offline.
                {typeof window !== "undefined" && process.env.NEXT_PUBLIC_AI_PROVIDER === "fake" && (
                  <span className="block mt-1 text-yellow-600">
                    ⚠️ Running in fallback mode. Set AI_API_KEY in production for LLM-powered replies.
                  </span>
                )}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.aiPersonaEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, aiPersonaEnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {formData.aiPersonaEnabled && (
          <>
            {/* Tone */}
            <div className="border rounded-lg p-6">
              <label className="block font-semibold mb-2">Tone</label>
              <select
                value={formData.tone}
                onChange={(e) =>
                  setFormData({ ...formData, tone: e.target.value as any })
                }
                className="w-full px-4 py-2 border rounded"
              >
                <option value="FLIRTY">Flirty - Playful, teasing replies</option>
                <option value="CUTE">Cute - Sweet, bubbly, adorable</option>
                <option value="DOMINANT">Dominant - Confident, in-control tone</option>
                <option value="SOFT">Soft - Gentle, warm, caring</option>
              </select>
              <p className="text-sm text-gray-600 mt-2">
                The personality style AI will use when replying to fans
              </p>
            </div>

            {/* Upsell Mode */}
            <div className="border rounded-lg p-6">
              <label className="block font-semibold mb-2">Upsell Mode</label>
              <select
                value={formData.upsellMode}
                onChange={(e) =>
                  setFormData({ ...formData, upsellMode: e.target.value as any })
                }
                className="w-full px-4 py-2 border rounded"
              >
                <option value="LOW">Low - Rarely mention paid content</option>
                <option value="MEDIUM">Medium - Occasionally mention paid content</option>
                <option value="HIGH">High - Frequently mention paid content</option>
              </select>
              <p className="text-sm text-gray-600 mt-2">
                How often AI should mention your paid content in replies
              </p>
            </div>

            {/* Boundaries */}
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Content Boundaries</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.allowExplicitLanguage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        allowExplicitLanguage: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span>Allow explicit language</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.allowKinkTalk}
                    onChange={(e) =>
                      setFormData({ ...formData, allowKinkTalk: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span>Allow kink talk</span>
                </label>
                <p className="text-sm text-gray-600">
                  Note: AI will never suggest in-person meetups or off-platform links for safety.
                </p>
              </div>
            </div>

            {/* Reply Delay */}
            <div className="border rounded-lg p-6">
              <label className="block font-semibold mb-2">
                Reply Delay (seconds): {formData.replyDelaySeconds}
              </label>
              <input
                type="range"
                min="0"
                max="300"
                value={formData.replyDelaySeconds}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    replyDelaySeconds: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
              <p className="text-sm text-gray-600 mt-2">
                Simulated delay before AI replies (to make it seem more natural)
              </p>
            </div>
          </>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

