"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const COLOR_OPTIONS = [
  "#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B",
  "#EF4444", "#06B6D4", "#F97316", "#84CC16", "#A855F7",
];

export default function ClientsPage() {
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", slug: "", bio: "", colorTag: "#8B5CF6",
    toneProfile: "", payoutSplit: "0.8",
  });

  const load = () => {
    api.get("/agency/clients").then((r) => setClients(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/agency/clients", { ...form, payoutSplit: parseFloat(form.payoutSplit) });
      toast({ title: "Client created", variant: "success" as any });
      setShowForm(false);
      setForm({ name: "", slug: "", bio: "", colorTag: "#8B5CF6", toneProfile: "", payoutSplit: "0.8" });
      load();
    } catch {
      toast({ title: "Failed to create client", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your creator roster.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Add Client Form */}
      {showForm && (
        <Card className="mb-8 border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">New Client</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Creator name" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug (URL)</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} placeholder="creator-slug" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Bio</Label>
                <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Short creator bio..." rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Tone Profile (for AI responses)</Label>
                <Textarea value={form.toneProfile} onChange={(e) => setForm({ ...form, toneProfile: e.target.value })} placeholder="Describe this creator's voice and tone for the AI assistant..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Payout Split (creator share)</Label>
                  <Input type="number" min="0" max="1" step="0.01" value={form.payoutSplit} onChange={(e) => setForm({ ...form, payoutSplit: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Color Tag</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${form.colorTag === c ? "border-white scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setForm({ ...form, colorTag: c })}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Create Client"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Clients Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <p className="text-muted-foreground">No clients yet. Add your first creator to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {clients.map((client) => (
            <Card key={client.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl shrink-0" style={{ backgroundColor: client.colorTag }} />
                    <div>
                      <p className="font-semibold">{client.name}</p>
                      <p className="text-xs text-muted-foreground">@{client.slug}</p>
                    </div>
                  </div>
                  <Badge variant={client.status === "ACTIVE" ? "success" : "secondary"} className="text-xs">
                    {client.status}
                  </Badge>
                </div>
                {client.bio && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{client.bio}</p>}
                <div className="flex gap-2">
                  <Link href={`/agency/clients/${client.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">Open Workspace</Button>
                  </Link>
                  <Link href={`/${client.slug}`} target="_blank">
                    <Button variant="outline" size="icon" className="h-8 w-8"><ExternalLink className="w-3.5 h-3.5" /></Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
