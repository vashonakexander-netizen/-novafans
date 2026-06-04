"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { Upload, X, CheckCircle, Image as ImageIcon, Video, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface FilePreview {
  file: File;
  preview: string;
  type: "image" | "video";
  caption: string;
  status: "pending" | "uploading" | "done" | "error";
}

export default function ModelUploadPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const newFiles: FilePreview[] = arr.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      type: f.type.startsWith("video") ? "video" : "image",
      caption: "",
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const removeFile = (idx: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const updateCaption = (idx: number, caption: string) => {
    setFiles((prev) => prev.map((f, i) => i === idx ? { ...f, caption } : f));
  };

  const uploadAll = async () => {
    if (!files.length) return;
    setUploading(true);
    let success = 0;
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "done") continue;
      setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "uploading" } : f));
      try {
        const fd = new FormData();
        fd.append("file", files[i].file);
        fd.append("caption", files[i].caption);
        await api.post("/model/upload", fd);
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "done" } : f));
        success++;
      } catch {
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "error" } : f));
      }
    }
    setUploading(false);
    if (success > 0) toast({ title: `${success} file(s) uploaded for review`, variant: "success" as any });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/model">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Upload Content</h1>
            <p className="text-muted-foreground text-sm">Files go to the agency vault for review.</p>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-colors mb-6",
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"
          )}
        >
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">Drop files here or click to browse</p>
          <p className="text-muted-foreground text-sm mt-1">Images and videos · Any size</p>
          <input ref={inputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
        </div>

        {/* File Previews */}
        {files.length > 0 && (
          <div className="space-y-4 mb-6">
            {files.map((f, i) => (
              <div key={i} className={cn("rounded-xl border p-4", f.status === "done" ? "border-green-800/50 bg-green-950/10" : f.status === "error" ? "border-red-800/50 bg-red-950/10" : "border-border")}>
                <div className="flex gap-4">
                  {/* Preview */}
                  <div className="w-20 h-20 rounded-lg bg-muted shrink-0 overflow-hidden flex items-center justify-center">
                    {f.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Video className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium truncate">{f.file.name}</p>
                        <p className="text-xs text-muted-foreground">{(f.file.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        {f.status === "done" && <CheckCircle className="w-5 h-5 text-green-400" />}
                        {f.status === "uploading" && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                        {f.status !== "done" && (
                          <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <Textarea
                      value={f.caption}
                      onChange={(e) => updateCaption(i, e.target.value)}
                      placeholder="Add a caption (optional)..."
                      rows={2}
                      disabled={f.status === "done" || f.status === "uploading"}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {files.length > 0 && (
          <div className="flex gap-3">
            <Button onClick={uploadAll} disabled={uploading || files.every(f => f.status === "done")} className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : `Upload ${files.filter(f => f.status !== "done").length} file(s)`}
            </Button>
            <Button variant="outline" onClick={() => setFiles([])} disabled={uploading}>Clear All</Button>
          </div>
        )}
      </div>
    </div>
  );
}
