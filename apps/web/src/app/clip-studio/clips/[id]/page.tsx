"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Sparkles, TrendingUp, Clock, DollarSign, Eye, Heart,
  Check, Trash2, ExternalLink, Send, Video, AlertCircle, Zap,
} from "lucide-react";
import api from "@/lib/api";

interface Clip {
  id: string;
  clipTitle?: string;
  sourceVideoTitle?: string;
  sourceVideoUrl: string;
  clipStartSeconds?: number;
  clipEndSeconds?: number;
  clipDurationSeconds?: number;
  viralScore: number;
  reason?: string;
  publicUrl?: string;
  thumbnailUrl?: string;
  status: "PROCESSING" | "READY" | "POSTED" | "FAILED";
  posts: Array<{
    id: string;
    platform: string;
    postStatus: string;
    views: number;
    likes: number;
    externalUrl?: string;
    postedAt?: string;
  }>;
  channel?: { channelName?: string };
}

const PLATFORMS = [
  { key: "tiktok", value: "TIKTOK", label: "TikTok", icon: "🎵" },
  { key: "instagram", value: "INSTAGRAM", label: "Instagram Reels", icon: "📷" },
  { key: "youtube_shorts", value: "YOUTUBE_SHORTS", label: "YouTube Shorts", icon: "▶️" },
];

export default function ClipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [clip, setClip] = useState<Clip | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set(["tiktok", "instagram", "youtube_shorts"]));
  const [posting, setPosting] = useState(false);

  const load = async () => {
    try {
      const res = await api.get(`/clip-studio/clips/${id}`);
      setClip(res.data);
    } catch {
      setClip(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const togglePlatform = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const postNow = async () => {
    if (selected.size === 0 || !clip) return;
    setPosting(true);
    try {
      await api.post("/clip-studio/post", {
        clip_id: clip.id,
        platforms: Array.from(selected),
      });
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to post.");
    } finally {
      setPosting(false);
    }
  };

  const deleteClip = async () => {
    if (!confirm("Delete this clip? This can't be undone.")) return;
    try {
      await api.delete(`/clip-studio/clips/${id}`);
      router.push("/clip-studio/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete.");
    }
  };

  if (loading) {
    return (
      <div className="cs-mesh min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!clip) {
    return (
      <div className="cs-mesh min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-white/30 mx-auto mb-3" />
          <p className="text-white/60 mb-4">Clip not found.</p>
          <Link href="/clip-studio/dashboard" className="text-[#00ff88] hover:underline text-sm">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const totalViews = clip.posts.reduce((sum, p) => sum + p.views, 0);
  const totalLikes = clip.posts.reduce((sum, p) => sum + p.likes, 0);
  const estimatedEarnings = (totalViews / 1000) * 1.0;

  return (
    <div className="cs-mesh min-h-screen">
      <header className="px-6 md:px-10 py-5 border-b border-[#1f1f1f] flex items-center justify-between sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/clip-studio/dashboard" className="text-white/60 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00ff88] flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" strokeWidth={3} />
            </div>
            <span className="font-bold text-lg tracking-tight">Clip Studio</span>
          </div>
        </div>
        <button
          onClick={deleteClip}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1f1f1f] text-xs text-white/60 hover:text-red-400 hover:border-red-400/30 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </header>

      <main className="px-6 md:px-10 py-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Player */}
          <div className="lg:col-span-2">
            <div className="aspect-[9/16] rounded-2xl bg-[#111] border border-[#1f1f1f] overflow-hidden relative max-w-sm mx-auto">
              {clip.publicUrl ? (
                <video
                  src={clip.publicUrl}
                  controls
                  poster={clip.thumbnailUrl}
                  className="w-full h-full object-cover"
                />
              ) : clip.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={clip.thumbnailUrl} alt={clip.clipTitle || ""} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-12 h-12 text-white/20" />
                </div>
              )}

              {clip.status === "PROCESSING" && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm font-bold mb-1">Processing</p>
                    <p className="text-xs text-white/60">AI is editing your clip</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-3">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-3 leading-tight">
              {clip.clipTitle || "Untitled clip"}
            </h1>

            {clip.sourceVideoTitle && (
              <p className="text-sm text-white/40 mb-5">
                From: <span className="text-white/70">{clip.sourceVideoTitle}</span>
              </p>
            )}

            {/* Viral score meter */}
            <div className="mb-6 rounded-2xl border border-[#1f1f1f] bg-[#111] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00ff88]" />
                  <span className="text-sm font-bold">Viral Score</span>
                </div>
                <span className="text-3xl font-black text-[#00ff88]">{clip.viralScore}</span>
              </div>
              <div className="h-2 rounded-full bg-[#1a1a1a] overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-[#00ff88] to-[#00cc66] rounded-full transition-all"
                  style={{ width: `${clip.viralScore}%` }}
                />
              </div>
              {clip.reason && (
                <p className="text-xs text-white/50 leading-relaxed">
                  <span className="text-white/80 font-medium">Why this clip:</span> {clip.reason}
                </p>
              )}
            </div>

            {/* Stats */}
            {clip.posts.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="rounded-xl border border-[#1f1f1f] bg-[#111] p-4">
                  <Eye className="w-3.5 h-3.5 text-white/40 mb-1" />
                  <p className="text-xl font-black">{totalViews.toLocaleString()}</p>
                  <p className="text-[11px] text-white/50">Views</p>
                </div>
                <div className="rounded-xl border border-[#1f1f1f] bg-[#111] p-4">
                  <Heart className="w-3.5 h-3.5 text-white/40 mb-1" />
                  <p className="text-xl font-black">{totalLikes.toLocaleString()}</p>
                  <p className="text-[11px] text-white/50">Likes</p>
                </div>
                <div className="rounded-xl border border-[#00ff88]/30 bg-[#00ff88]/5 p-4">
                  <DollarSign className="w-3.5 h-3.5 text-[#00ff88] mb-1" />
                  <p className="text-xl font-black text-[#00ff88]">${estimatedEarnings.toFixed(2)}</p>
                  <p className="text-[11px] text-white/50">Earnings</p>
                </div>
              </div>
            )}

            {/* Source clip info */}
            <div className="mb-6 flex items-center gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {clip.clipDurationSeconds ?? 0}s
              </span>
              {clip.clipStartSeconds !== undefined && (
                <span>{formatTime(clip.clipStartSeconds)} – {formatTime(clip.clipEndSeconds || 0)}</span>
              )}
              <a href={clip.sourceVideoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                Source <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Post to platforms */}
            <div className="rounded-2xl border border-[#1f1f1f] bg-[#111] p-5">
              <p className="font-bold text-sm mb-4">Post to platforms</p>
              <div className="space-y-2 mb-5">
                {PLATFORMS.map((p) => {
                  const isSelected = selected.has(p.key);
                  const existingPost = clip.posts.find((post) => post.platform === p.value);
                  return (
                    <label
                      key={p.key}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                        isSelected ? "border-[#00ff88]/40 bg-[#00ff88]/5" : "border-[#1f1f1f] hover:border-[#2a2a2a]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePlatform(p.key)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isSelected ? "border-[#00ff88] bg-[#00ff88]" : "border-white/20"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-black" strokeWidth={4} />}
                      </div>
                      <span className="text-lg">{p.icon}</span>
                      <span className="flex-1 text-sm font-medium">{p.label}</span>
                      {existingPost && (
                        <PostStatusPill status={existingPost.postStatus} url={existingPost.externalUrl} />
                      )}
                    </label>
                  );
                })}
              </div>

              <button
                onClick={postNow}
                disabled={posting || selected.size === 0 || clip.status === "PROCESSING"}
                className="w-full py-3 rounded-xl bg-[#00ff88] text-black font-bold hover:bg-[#00ff88]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {posting ? "Queueing..." : clip.status === "PROCESSING" ? "Still processing..." : `Post to ${selected.size} platform${selected.size === 1 ? "" : "s"}`}
              </button>

              <p className="text-[11px] text-white/40 mt-3 leading-relaxed">
                Posts queue immediately. If you don&apos;t have a platform account connected, the post will queue locally until you connect it.
              </p>
            </div>
          </div>
        </div>

        {/* Per-platform earnings breakdown */}
        {clip.posts.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold mb-4">Per-Platform Performance</h2>
            <div className="rounded-2xl border border-[#1f1f1f] bg-[#111] divide-y divide-[#1f1f1f]">
              {clip.posts.map((post) => (
                <div key={post.id} className="flex items-center gap-4 p-4">
                  <div className="text-xl">
                    {PLATFORMS.find((p) => p.value === post.platform)?.icon || "🔗"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">
                      {PLATFORMS.find((p) => p.value === post.platform)?.label || post.platform}
                    </p>
                    <p className="text-[11px] text-white/40">
                      {post.postedAt ? `Posted ${new Date(post.postedAt).toLocaleString()}` : "Not posted yet"}
                    </p>
                  </div>
                  <div className="flex items-center gap-5 text-sm">
                    <span className="flex items-center gap-1.5 text-white/60">
                      <Eye className="w-3 h-3" />
                      {post.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1.5 text-white/60">
                      <Heart className="w-3 h-3" />
                      {post.likes.toLocaleString()}
                    </span>
                    <span className="font-bold text-[#00ff88]">${((post.views / 1000) * 1).toFixed(2)}</span>
                  </div>
                  {post.externalUrl && (
                    <a href={post.externalUrl} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function PostStatusPill({ status, url }: { status: string; url?: string }) {
  const map: Record<string, { color: string; label: string }> = {
    QUEUED: { color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", label: "Queued" },
    POSTED: { color: "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30", label: "Posted" },
    FAILED: { color: "bg-red-500/10 text-red-400 border-red-500/30", label: "Failed" },
  };
  const meta = map[status] || map.QUEUED;
  return (
    <div className={`px-2 py-1 rounded-full border text-[10px] font-bold ${meta.color}`}>
      {meta.label}
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
