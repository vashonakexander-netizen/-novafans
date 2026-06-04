"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Upload, CheckCircle, Clock, Eye, Image as ImageIcon, Video, X, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeTime } from "@/lib/utils";
import api from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  UPLOADED: "secondary",
  REVIEWED: "warning",
  APPROVED: "success",
  SCHEDULED: "default",
};

const STATUS_FLOW = ["UPLOADED", "REVIEWED", "APPROVED", "SCHEDULED"];

export default function VaultPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    const params = filterStatus !== "ALL" ? `?status=${filterStatus}` : "";
    api.get(`/agency/clients/${id}/vault${params}`)
      .then((r) => setMedia(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id, filterStatus]);

  const uploadFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (!arr.length) return;
    setUploading(true);
    try {
      for (const file of arr) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("clientId", id);
        await api.post(`/agency/clients/${id}/vault/upload`, fd);
      }
      toast({ title: `${arr.length} file(s) uploaded`, variant: "success" as any });
      load();
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  }, [id]);

  const advanceStatus = async (mediaId: string, currentStatus: string) => {
    const idx = STATUS_FLOW.indexOf(currentStatus);
    if (idx === STATUS_FLOW.length - 1) return;
    const nextStatus = STATUS_FLOW[idx + 1];
    try {
      await api.patch(`/agency/vault/${mediaId}/status`, { status: nextStatus });
      setMedia((prev) => prev.map((m) => m.id === mediaId ? { ...m, status: nextStatus } : m));
      toast({ title: `Moved to ${nextStatus.toLowerCase()}`, variant: "success" as any });
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const bulkApprove = async () => {
    const ids = Array.from(selected);
    try {
      await api.post(`/agency/vault/bulk-approve`, { mediaIds: ids });
      setMedia((prev) => prev.map((m) => ids.includes(m.id) ? { ...m, status: "APPROVED" } : m));
      setSelected(new Set());
      toast({ title: `${ids.length} items approved`, variant: "success" as any });
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const toggleSelect = (mediaId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(mediaId) ? next.delete(mediaId) : next.add(mediaId);
      return next;
    });
  };

  const filtered = filterStatus === "ALL" ? media : media.filter((m) => m.status === filterStatus);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Media Vault</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload, review, and approve content.</p>
        </div>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <Button onClick={bulkApprove} variant="default" size="sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve {selected.size} selected
            </Button>
          )}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <Filter className="w-3.5 h-3.5 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {STATUS_FLOW.map((s) => <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-xl border-2 border-dashed transition-colors p-8 text-center mb-6 cursor-pointer ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {uploading ? "Uploading..." : "Drag & drop files here or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">Images and videos supported</p>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No media here yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`relative rounded-xl overflow-hidden border-2 transition-colors cursor-pointer group ${selected.has(item.id) ? "border-primary" : "border-border hover:border-muted-foreground/50"}`}
              onClick={() => toggleSelect(item.id)}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-muted relative">
                {item.fileType?.startsWith("video") ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="w-10 h-10 text-muted-foreground" />
                  </div>
                ) : item.thumbnailUrl || item.fileUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.thumbnailUrl || item.fileUrl} alt={item.caption || ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}

                {/* Selected overlay */}
                {selected.has(item.id) && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={STATUS_COLORS[item.status] as any} className="text-[10px]">
                    {item.status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{formatRelativeTime(item.createdAt)}</span>
                </div>
                {item.caption && <p className="text-xs text-muted-foreground line-clamp-1">{item.caption}</p>}

                {/* Advance status button */}
                {item.status !== "SCHEDULED" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full mt-2 h-7 text-xs"
                    onClick={(e) => { e.stopPropagation(); advanceStatus(item.id, item.status); }}
                  >
                    → Move to {STATUS_FLOW[STATUS_FLOW.indexOf(item.status) + 1]?.toLowerCase()}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
