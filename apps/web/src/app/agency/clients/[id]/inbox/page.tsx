"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Bot, CheckCircle, XCircle, Edit2, Send, AlertTriangle, BookOpen, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeTime } from "@/lib/utils";
import api from "@/lib/api";

interface AiDraft {
  id: string;
  draftContent: string;
  confidenceScore: number;
  approved: boolean;
  rejected: boolean;
  editedContent?: string;
}

interface Message {
  id: string;
  fanName: string;
  platform: string;
  content: string;
  status: string;
  direction: string;
  createdAt: string;
  aiDrafts: AiDraft[];
}

interface Template {
  id: string;
  title: string;
  content: string;
}

export default function InboxPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: "", content: "" });

  const load = () => {
    Promise.all([
      api.get(`/agency/clients/${id}/inbox`),
      api.get(`/agency/templates`).catch(() => ({ data: [] })),
    ]).then(([msgRes, tplRes]) => {
      setMessages(msgRes.data || []);
      setTemplates(tplRes.data || []);
      if (msgRes.data?.[0]) setSelected(msgRes.data[0]);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const generateDraft = async (messageId: string) => {
    setGenerating(true);
    try {
      await api.post(`/agency/messages/${messageId}/generate-draft`);
      const updated = await api.get(`/agency/clients/${id}/inbox`);
      setMessages(updated.data || []);
      const sel = updated.data?.find((m: Message) => m.id === messageId);
      if (sel) setSelected(sel);
      toast({ title: "Draft generated", variant: "success" as any });
    } catch {
      toast({ title: "Failed to generate draft", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const approveDraft = async (draftId: string, content: string) => {
    try {
      await api.post(`/agency/drafts/${draftId}/approve`, { content });
      toast({ title: "Draft approved and sent", variant: "success" as any });
      load();
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const rejectDraft = async (draftId: string) => {
    try {
      await api.post(`/agency/drafts/${draftId}/reject`);
      toast({ title: "Draft rejected" });
      load();
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const saveTemplate = async () => {
    try {
      await api.post("/agency/templates", newTemplate);
      setNewTemplate({ title: "", content: "" });
      const res = await api.get("/agency/templates");
      setTemplates(res.data || []);
      toast({ title: "Template saved", variant: "success" as any });
    } catch {
      toast({ title: "Failed to save template", variant: "destructive" });
    }
  };

  const confidenceColor = (score: number) =>
    score >= 0.7 ? "text-green-400" : "text-red-400";

  const platformBadge: Record<string, string> = {
    INSTAGRAM: "bg-pink-600", REDDIT: "bg-orange-600",
    TWITTER: "bg-blue-600", ONLYFANS: "bg-blue-400", OTHER: "bg-muted",
  };

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden">
      {/* Message List */}
      <div className="w-80 border-r border-border flex flex-col shrink-0">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Inbox</h2>
          <Button size="sm" variant="outline" onClick={() => setShowTemplates(!showTemplates)}>
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Templates
          </Button>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-3 space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
            </div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No messages yet.</div>
          ) : (
            messages.map((msg) => {
              const draft = msg.aiDrafts?.[0];
              const needsReview = draft && draft.confidenceScore < 0.7 && !draft.approved;
              return (
                <div
                  key={msg.id}
                  onClick={() => setSelected(msg)}
                  className={`p-3 border-b border-border cursor-pointer transition-colors ${selected?.id === msg.id ? "bg-accent" : "hover:bg-accent/50"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm truncate">{msg.fanName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded text-white ${platformBadge[msg.platform] || "bg-muted"}`}>
                      {msg.platform}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">{msg.content}</p>
                  <div className="flex items-center gap-1.5">
                    {needsReview && (
                      <Badge variant="destructive" className="text-[9px] py-0 px-1">
                        <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                        Review
                      </Badge>
                    )}
                    {draft?.approved && (
                      <Badge variant="success" className="text-[9px] py-0 px-1">Sent</Badge>
                    )}
                    {!draft && msg.status === "UNREAD" && (
                      <Badge variant="secondary" className="text-[9px] py-0 px-1">No draft</Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto">{formatRelativeTime(msg.createdAt)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showTemplates ? (
          <div className="p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Response Templates</h2>
              <Button size="sm" variant="ghost" onClick={() => setShowTemplates(false)}><X className="w-4 h-4" /></Button>
            </div>
            {/* New template */}
            <Card className="mb-5 border-primary/30">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-medium">New Template</p>
                <input
                  className="w-full px-3 py-1.5 rounded-md border border-input bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Template title"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                />
                <Textarea
                  placeholder="Template content..."
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  rows={3}
                />
                <Button size="sm" onClick={saveTemplate} disabled={!newTemplate.title || !newTemplate.content}>
                  <Plus className="w-4 h-4 mr-1.5" />Save Template
                </Button>
              </CardContent>
            </Card>
            <div className="space-y-3">
              {templates.length === 0 && <p className="text-sm text-muted-foreground">No templates saved yet.</p>}
              {templates.map((tpl) => (
                <Card key={tpl.id}>
                  <CardContent className="p-4">
                    <p className="font-medium text-sm mb-1">{tpl.title}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tpl.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : selected ? (
          <div className="p-6 overflow-y-auto space-y-5">
            {/* Fan message */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                  {selected.fanName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{selected.fanName}</p>
                  <p className="text-xs text-muted-foreground">{selected.platform} · {formatRelativeTime(selected.createdAt)}</p>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border">
                <p className="text-sm whitespace-pre-wrap">{selected.content}</p>
              </div>
            </div>

            <Separator />

            {/* AI Draft */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary" />
                  <h3 className="font-medium text-sm">AI Draft Response</h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateDraft(selected.id)}
                  disabled={generating}
                >
                  {generating ? "Generating..." : selected.aiDrafts?.length ? "Regenerate" : "Generate Draft"}
                </Button>
              </div>

              {selected.aiDrafts?.length ? (
                (() => {
                  const draft = selected.aiDrafts[0];
                  const lowConfidence = draft.confidenceScore < 0.7;
                  return (
                    <Card className={`border ${lowConfidence ? "border-red-800/50 bg-red-950/10" : "border-border"}`}>
                      <CardContent className="p-4">
                        {/* Confidence */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs text-muted-foreground">Confidence</span>
                          <Progress value={draft.confidenceScore * 100} className="flex-1 h-1.5" />
                          <span className={`text-sm font-bold ${confidenceColor(draft.confidenceScore)}`}>
                            {Math.round(draft.confidenceScore * 100)}%
                          </span>
                          {lowConfidence && (
                            <Badge variant="destructive" className="text-[10px]">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Manual review required
                            </Badge>
                          )}
                        </div>

                        {draft.approved ? (
                          <div className="flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Approved and sent
                          </div>
                        ) : draft.rejected ? (
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <XCircle className="w-4 h-4" />
                            Rejected
                          </div>
                        ) : editingDraftId === draft.id ? (
                          <div className="space-y-3">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={5}
                              className="text-sm"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => { approveDraft(draft.id, editContent); setEditingDraftId(null); }}>
                                <Send className="w-3.5 h-3.5 mr-1.5" />Approve & Send
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingDraftId(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm whitespace-pre-wrap mb-4">{draft.draftContent}</p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => approveDraft(draft.id, draft.draftContent)}
                                disabled={lowConfidence}
                                title={lowConfidence ? "Edit required — confidence too low" : ""}
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => { setEditingDraftId(draft.id); setEditContent(draft.draftContent); }}>
                                <Edit2 className="w-3.5 h-3.5 mr-1.5" />Edit
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => rejectDraft(draft.id)}>
                                <XCircle className="w-3.5 h-3.5 mr-1.5" />Reject
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  );
                })()
              ) : (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No draft yet. Click "Generate Draft" to create one.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a message to view
          </div>
        )}
      </div>
    </div>
  );
}
