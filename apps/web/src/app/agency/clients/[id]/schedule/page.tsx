"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

const PLATFORMS = ["INSTAGRAM", "REDDIT", "TWITTER", "ONLYFANS"];
const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: "bg-pink-600", REDDIT: "bg-orange-600",
  TWITTER: "bg-blue-600", ONLYFANS: "bg-blue-400",
};
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function SchedulePage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [vaultMedia, setVaultMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [today] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState<Date | null>(null);
  const [newPost, setNewPost] = useState({ platform: "INSTAGRAM", caption: "", mediaId: "", time: "12:00" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + 1;
    Promise.all([
      api.get(`/agency/clients/${id}/schedule?year=${year}&month=${month}`),
      api.get(`/agency/clients/${id}/vault?status=APPROVED`).catch(() => ({ data: [] })),
    ]).then(([schedRes, vaultRes]) => {
      setPosts(schedRes.data || []);
      setVaultMedia(vaultRes.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id, viewDate.getMonth(), viewDate.getFullYear()]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { first, days };
  };

  const getPostsForDay = (day: number) => {
    const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return posts.filter((p) => p.scheduledAt?.startsWith(dateStr));
  };

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const schedulePost = async () => {
    if (!showAddModal) return;
    setSaving(true);
    const dt = new Date(showAddModal);
    const [h, m] = newPost.time.split(":").map(Number);
    dt.setHours(h, m, 0, 0);
    try {
      await api.post(`/agency/clients/${id}/schedule`, {
        platform: newPost.platform,
        caption: newPost.caption,
        mediaId: newPost.mediaId || undefined,
        scheduledAt: dt.toISOString(),
      });
      toast({ title: "Post scheduled", variant: "success" as any });
      setShowAddModal(null);
      load();
    } catch {
      toast({ title: "Failed to schedule", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const { first, days } = getDaysInMonth(viewDate);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Content Scheduler</h1>
          <p className="text-muted-foreground text-sm mt-1">Plan and schedule posts across platforms.</p>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          {loading ? (
            <div className="grid grid-cols-7 gap-1">
              {[...Array(35)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells before first day */}
              {[...Array(first)].map((_, i) => <div key={`empty-${i}`} className="h-24" />)}

              {/* Day cells */}
              {[...Array(days)].map((_, i) => {
                const day = i + 1;
                const dayPosts = getPostsForDay(day);
                const isToday =
                  day === today.getDate() &&
                  viewDate.getMonth() === today.getMonth() &&
                  viewDate.getFullYear() === today.getFullYear();

                return (
                  <div
                    key={day}
                    className={cn(
                      "h-24 rounded-lg border border-border p-1.5 cursor-pointer hover:border-primary/50 transition-colors group relative",
                      isToday && "border-primary/60 bg-primary/5"
                    )}
                    onClick={() => {
                      const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                      setShowAddModal(d);
                    }}
                  >
                    <span className={cn("text-xs font-medium", isToday ? "text-primary" : "text-muted-foreground")}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5 overflow-hidden">
                      {dayPosts.slice(0, 3).map((post) => (
                        <div
                          key={post.id}
                          className={`text-[10px] px-1 py-0.5 rounded text-white truncate ${PLATFORM_COLORS[post.platform] || "bg-muted"}`}
                        >
                          {post.platform.charAt(0) + post.platform.slice(1).toLowerCase()}
                        </div>
                      ))}
                      {dayPosts.length > 3 && (
                        <div className="text-[10px] text-muted-foreground">+{dayPosts.length - 3} more</div>
                      )}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Post Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Schedule Post — {showAddModal.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                </CardTitle>
                <Button size="icon" variant="ghost" onClick={() => setShowAddModal(null)}><X className="w-4 h-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Platform</label>
                  <Select value={newPost.platform} onValueChange={(v) => setNewPost({ ...newPost, platform: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Time</label>
                  <input
                    type="time"
                    value={newPost.time}
                    onChange={(e) => setNewPost({ ...newPost, time: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Media (approved)</label>
                <Select value={newPost.mediaId} onValueChange={(v) => setNewPost({ ...newPost, mediaId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select media..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No media</SelectItem>
                    {vaultMedia.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.caption || m.id.slice(0, 8)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Caption</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={newPost.caption}
                  onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                  placeholder="Post caption..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={schedulePost} disabled={saving} className="flex-1">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {saving ? "Scheduling..." : "Schedule Post"}
                </Button>
                <Button variant="outline" onClick={() => setShowAddModal(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
