"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Youtube, Plus, Zap, Eye, Clock, DollarSign, Sparkles, TrendingUp,
  Video, Pause, AlertCircle, ArrowRight, X, ChevronRight, RefreshCw,
} from "lucide-react";
import api from "@/lib/api";

interface Channel {
  id: string;
  youtubeChannelUrl: string;
  channelName?: string;
  channelThumbnail?: string;
  status: "INDEXING" | "ACTIVE" | "PAUSED" | "ERROR";
  totalVideosIndexed: number;
}

interface Clip {
  id: string;
  clipTitle?: string;
  sourceVideoTitle?: string;
  viralScore: number;
  clipDurationSeconds?: number;
  thumbnailUrl?: string;
  status: "PROCESSING" | "READY" | "POSTED" | "FAILED";
  posts?: Array<{ platform: string; postStatus: string }>;
  channel?: { channelName?: string };
}

interface Stats {
  totalClips: number;
  totalChannels: number;
  totalViews: number;
  watchHours: number;
  estimatedEarnings: number;
  readyClips: number;
  postedClips: number;
}

interface SocialAccount {
  id: string;
  platform: "TIKTOK" | "INSTAGRAM" | "YOUTUBE_SHORTS";
  accountUsername?: string;
}

const PLATFORM_META: Record<string, { label: string; color: string; icon: string }> = {
  TIKTOK: { label: "TikTok", color: "#000", icon: "🎵" },
  INSTAGRAM: { label: "Instagram", color: "#E1306C", icon: "📷" },
  YOUTUBE_SHORTS: { label: "YouTube Shorts", color: "#FF0000", icon: "▶️" },
};

export default function ClipStudioDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [clips, setClips] = useState<Clip[]>([]);
  const [socials, setSocials] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [newChannelUrl, setNewChannelUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [processingVideoUrl, setProcessingVideoUrl] = useState("");
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [statsRes, channelsRes, clipsRes, socialsRes] = await Promise.all([
        api.get("/clip-studio/analytics").catch(() => ({ data: null })),
        api.get("/clip-studio/channels").catch(() => ({ data: [] })),
        api.get("/clip-studio/clips").catch(() => ({ data: [] })),
        api.get("/clip-studio/socials").catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      setChannels(channelsRes.data || []);
      setClips(clipsRes.data || []);
      setSocials(socialsRes.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Auto-refresh every 10s so processing clips flip to READY
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const addChannel = async () => {
    if (!newChannelUrl.trim()) return;
    setAdding(true);
    try {
      await api.post("/clip-studio/channels", { youtube_channel_url: newChannelUrl });
      setNewChannelUrl("");
      setShowAddChannel(false);
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add channel. Make sure the URL is a valid YouTube channel.");
    } finally {
      setAdding(false);
    }
  };

  const processVideo = async () => {
    if (!processingVideoUrl.trim() || channels.length === 0) return;
    setProcessing(true);
    try {
      await api.post("/clip-studio/process", {
        channel_id: channels[0].id,
        video_url: processingVideoUrl,
      });
      setProcessingVideoUrl("");
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to process video.");
    } finally {
      setProcessing(false);
    }
  };

  const isConnected = (platform: string) => socials.some((s) => s.platform === platform);

  return (
    <div className="cs-mesh min-h-screen">
      {/* Top bar */}
      <header className="px-6 md:px-10 py-5 border-b border-[#1f1f1f] flex items-center justify-between sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00ff88] flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" strokeWidth={3} />
          </div>
          <span className="font-bold text-lg tracking-tight">Clip Studio</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-md bg-[#00ff88]/20 text-[#00ff88] text-[10px] font-bold uppercase tracking-wider">Beta</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1f1f1f] text-xs text-white/60 hover:text-white hover:border-white/30 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
          <Link href="/agency" className="text-sm text-white/60 hover:text-white transition-colors">
            ← NovaFans
          </Link>
        </div>
      </header>

      <main className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard icon={Eye} label="Total Views" value={loading ? "—" : (stats?.totalViews ?? 0).toLocaleString()} />
          <StatCard icon={Video} label="Total Clips" value={loading ? "—" : String(stats?.totalClips ?? 0)} />
          <StatCard icon={Clock} label="Watch Hours" value={loading ? "—" : (stats?.watchHours ?? 0).toFixed(1)} />
          <StatCard icon={DollarSign} label="Est. Earnings" value={loading ? "—" : `$${(stats?.estimatedEarnings ?? 0).toFixed(2)}`} accent />
        </div>

        {/* Quick process if user has channels */}
        {channels.length > 0 && (
          <div className="mb-8 rounded-2xl border border-[#00ff88]/20 bg-gradient-to-r from-[#00ff88]/5 via-transparent to-transparent p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#00ff88]" />
              <p className="font-bold text-sm">Generate clips from a video</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={processingVideoUrl}
                onChange={(e) => setProcessingVideoUrl(e.target.value)}
                placeholder="Paste a YouTube video URL..."
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#1f1f1f] text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
              <button
                onClick={processVideo}
                disabled={processing || !processingVideoUrl.trim()}
                className="px-5 py-2.5 rounded-lg bg-[#00ff88] text-black text-sm font-bold hover:bg-[#00ff88]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? "Processing..." : "Find Viral Clips →"}
              </button>
            </div>
            <p className="text-xs text-white/40 mt-2">AI will analyse the transcript and pull the 3 best moments.</p>
          </div>
        )}

        {/* Channels + Socials */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* Channels (2/3) */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Connected Channels</h2>
              <button
                onClick={() => setShowAddChannel(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00ff88] text-black text-xs font-bold hover:bg-[#00ff88]/90 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                Add Channel
              </button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-[#111] animate-pulse" />
                ))}
              </div>
            ) : channels.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#1f1f1f] p-12 text-center">
                <Youtube className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/60 mb-4">No channels yet. Connect a YouTube channel to start.</p>
                <button
                  onClick={() => setShowAddChannel(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#00ff88] text-black text-sm font-bold hover:bg-[#00ff88]/90 transition-colors cs-glow"
                >
                  <Plus className="w-4 h-4" strokeWidth={3} />
                  Connect YouTube
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {channels.map((c) => (
                  <div key={c.id} className="rounded-xl border border-[#1f1f1f] bg-[#111] p-4 flex items-center gap-4 hover:border-[#2a2a2a] transition-colors">
                    <div className="w-12 h-12 rounded-full bg-[#1a1a1a] overflow-hidden shrink-0 flex items-center justify-center">
                      {c.channelThumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.channelThumbnail} alt={c.channelName || ""} className="w-full h-full object-cover" />
                      ) : (
                        <Youtube className="w-5 h-5 text-white/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{c.channelName || "YouTube Channel"}</p>
                      <p className="text-xs text-white/40 truncate">{c.youtubeChannelUrl}</p>
                    </div>
                    <ChannelStatusBadge status={c.status} videos={c.totalVideosIndexed} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Socials (1/3) */}
          <div>
            <h2 className="text-lg font-bold mb-4">Auto-Post Accounts</h2>
            <div className="space-y-2">
              {["TIKTOK", "INSTAGRAM", "YOUTUBE_SHORTS"].map((platform) => {
                const meta = PLATFORM_META[platform];
                const connected = isConnected(platform);
                return (
                  <div key={platform} className="rounded-xl border border-[#1f1f1f] bg-[#111] p-3 flex items-center gap-3">
                    <span className="text-lg">{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{meta.label}</p>
                      <p className="text-[11px] text-white/40">
                        {connected ? "Connected" : "Not connected"}
                      </p>
                    </div>
                    <button
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                        connected
                          ? "border border-[#1f1f1f] text-white/60 hover:text-white"
                          : "bg-[#00ff88] text-black hover:bg-[#00ff88]/90"
                      }`}
                    >
                      {connected ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-white/30 mt-3 leading-relaxed">
              OAuth flows go live as each platform clears review. Connect buttons currently stub the link — your clips queue locally until then.
            </p>
          </div>
        </div>

        {/* Recent clips */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent Clips</h2>
            {clips.length > 0 && (
              <span className="text-xs text-white/40">{clips.length} clip{clips.length === 1 ? "" : "s"}</span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[9/16] rounded-xl bg-[#111] animate-pulse" />
              ))}
            </div>
          ) : clips.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#1f1f1f] p-16 text-center">
              <Video className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/60 mb-2">No clips yet.</p>
              <p className="text-xs text-white/40">
                {channels.length === 0
                  ? "Connect a channel above to start clipping."
                  : "Paste a video URL up top to generate your first 3 clips."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {clips.map((clip) => (
                <ClipCard key={clip.id} clip={clip} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Add channel modal */}
      {showAddChannel && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowAddChannel(false)}>
          <div className="w-full max-w-md rounded-2xl border border-[#1f1f1f] bg-[#111] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Connect YouTube channel</h3>
              <button onClick={() => setShowAddChannel(false)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <label className="block text-xs uppercase tracking-wider text-white/40 font-bold mb-2">YouTube URL</label>
            <input
              autoFocus
              value={newChannelUrl}
              onChange={(e) => setNewChannelUrl(e.target.value)}
              placeholder="https://youtube.com/@yourchannel"
              className="w-full px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#1f1f1f] text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors mb-4"
              onKeyDown={(e) => { if (e.key === "Enter") addChannel(); }}
            />
            <button
              onClick={addChannel}
              disabled={adding || !newChannelUrl.trim()}
              className="w-full py-3 rounded-lg bg-[#00ff88] text-black font-bold hover:bg-[#00ff88]/90 disabled:opacity-50 transition-colors"
            >
              {adding ? "Adding..." : "Connect Channel"}
            </button>
            <p className="text-xs text-white/40 mt-3 leading-relaxed">
              We&apos;ll index your latest videos. You can process any single video into 3 viral clips with AI.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? "border-[#00ff88]/30 bg-[#00ff88]/5" : "border-[#1f1f1f] bg-[#111]"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wider text-white/50 font-bold">{label}</span>
        <Icon className={`w-3.5 h-3.5 ${accent ? "text-[#00ff88]" : "text-white/40"}`} />
      </div>
      <p className={`text-2xl font-black tracking-tight ${accent ? "text-[#00ff88]" : ""}`}>{value}</p>
    </div>
  );
}

function ChannelStatusBadge({ status, videos }: { status: Channel["status"]; videos: number }) {
  if (status === "INDEXING") {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[11px] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
        Indexing...
      </div>
    );
  }
  if (status === "ACTIVE") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-white/40">{videos} videos</span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
          Active
        </div>
      </div>
    );
  }
  if (status === "PAUSED") {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-white/50 text-[11px] font-medium">
        <Pause className="w-2.5 h-2.5" />
        Paused
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-medium">
      <AlertCircle className="w-2.5 h-2.5" />
      Error
    </div>
  );
}

function ClipCard({ clip }: { clip: Clip }) {
  const platforms = clip.posts?.map((p) => p.platform) || [];
  return (
    <Link href={`/clip-studio/clips/${clip.id}`} className="group block">
      <div className="aspect-[9/16] rounded-xl bg-[#111] border border-[#1f1f1f] overflow-hidden relative hover:border-[#00ff88]/40 transition-colors">
        {clip.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={clip.thumbnailUrl} alt={clip.clipTitle || ""} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-8 h-8 text-white/20" />
          </div>
        )}

        {/* Viral score badge */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur text-[11px] font-bold flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-[#00ff88]" />
          <span className="text-[#00ff88]">{clip.viralScore}</span>
        </div>

        {/* Status overlay */}
        {clip.status === "PROCESSING" && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-[11px] text-white/60">Processing</p>
            </div>
          </div>
        )}

        {/* Platform pills */}
        {platforms.length > 0 && (
          <div className="absolute bottom-2 left-2 right-2 flex gap-1">
            {Array.from(new Set(platforms)).map((p) => (
              <div key={p} className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur text-[10px]">
                {PLATFORM_META[p]?.icon}
              </div>
            ))}
          </div>
        )}

        {/* Hover arrow */}
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#00ff88] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="w-3 h-3 text-black" />
        </div>
      </div>

      <div className="mt-2 px-1">
        <p className="text-sm font-semibold line-clamp-2 leading-snug">{clip.clipTitle || "Untitled clip"}</p>
        <p className="text-[11px] text-white/40 mt-0.5">
          {clip.clipDurationSeconds ? `${clip.clipDurationSeconds}s` : ""}
          {clip.channel?.channelName && ` · ${clip.channel.channelName}`}
        </p>
      </div>
    </Link>
  );
}
