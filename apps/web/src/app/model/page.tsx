"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Upload, DollarSign, ImageIcon, TrendingUp, Video, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";

export default function ModelDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/model/stats").catch(() => ({ data: null })),
      api.get("/model/uploads").catch(() => ({ data: [] })),
    ]).then(([statsRes, uploadsRes]) => {
      setStats(statsRes.data);
      setUploads(uploadsRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Creator Dashboard</h1>
          <p className="text-muted-foreground mt-1">Upload content and track your stats.</p>
        </div>

        {/* Upload CTA */}
        <Link href="/model/upload" className="block mb-4">
          <div className="rounded-2xl border-2 border-dashed border-primary/40 p-10 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
            <Upload className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="text-lg font-semibold text-foreground">Upload New Content</p>
            <p className="text-muted-foreground text-sm mt-1">Drop images or videos for the agency to review</p>
          </div>
        </Link>

        {/* Clip Studio CTA */}
        <Link href="/clip-studio" className="block mb-8">
          <div className="rounded-2xl border-2 border-[#00ff88]/40 bg-gradient-to-br from-[#00ff88]/10 via-transparent to-transparent p-6 hover:border-[#00ff88]/70 transition-colors cursor-pointer flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#00ff88]/20 flex items-center justify-center shrink-0">
              <Video className="w-6 h-6 text-[#00ff88]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-lg font-bold text-foreground">Clip Studio</p>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00ff88] text-black tracking-wider">NEW</span>
              </div>
              <p className="text-muted-foreground text-sm">
                AI-powered YouTube → TikTok/Reels/Shorts. Earn from your content automatically.
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-[#00ff88] shrink-0" />
          </div>
        </Link>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-5">
                <DollarSign className="w-4 h-4 text-green-400 mb-2" />
                <p className="text-xs text-muted-foreground">Earnings</p>
                <p className="text-xl font-bold">{formatCurrency(stats?.totalEarnings ?? 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <ImageIcon className="w-4 h-4 text-blue-400 mb-2" />
                <p className="text-xs text-muted-foreground">Uploads</p>
                <p className="text-xl font-bold">{stats?.totalUploads ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <TrendingUp className="w-4 h-4 text-primary mb-2" />
                <p className="text-xs text-muted-foreground">Fans</p>
                <p className="text-xl font-bold">{stats?.totalFans ?? 0}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Uploads */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Uploads</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : uploads.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">No uploads yet.</div>
            ) : (
              <div className="space-y-2">
                {uploads.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-12 h-12 rounded-lg bg-muted shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {item.thumbnailUrl && <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.caption || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground">{item.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
