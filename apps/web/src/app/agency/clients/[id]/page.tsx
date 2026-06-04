"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Inbox, ImageIcon, Calendar, BarChart2, ExternalLink, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const PLATFORMS = ["INSTAGRAM", "REDDIT", "TWITTER", "ONLYFANS", "OTHER"];

const quickLinks = [
  { href: "vault", label: "Media Vault", icon: ImageIcon, description: "Upload and manage media files" },
  { href: "inbox", label: "AI Inbox", icon: Inbox, description: "Messages with AI draft responses" },
  { href: "schedule", label: "Scheduler", icon: Calendar, description: "Content calendar" },
  { href: "analytics", label: "Analytics", icon: BarChart2, description: "Revenue and engagement" },
];

export default function ClientWorkspace() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    api.get(`/agency/clients/${id}`)
      .then((r) => { setClient(r.data); setForm(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/agency/clients/${id}`, {
        name: form.name, bio: form.bio, toneProfile: form.toneProfile,
        payoutSplit: parseFloat(form.payoutSplit), colorTag: form.colorTag,
      });
      toast({ title: "Client updated", variant: "success" as any });
      setClient(form);
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!client) {
    return <div className="p-8 text-muted-foreground">Client not found.</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <span className="w-12 h-12 rounded-xl shrink-0" style={{ backgroundColor: client.colorTag }} />
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-muted-foreground text-sm">@{client.slug}</p>
              <Badge variant={client.status === "ACTIVE" ? "success" : "secondary"}>{client.status}</Badge>
            </div>
          </div>
        </div>
        <Link href={`/${client.slug}`} target="_blank">
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Page
          </Button>
        </Link>
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickLinks.map((link) => (
          <Link key={link.href} href={`/agency/clients/${id}/${link.href}`}>
            <Card className="hover:border-primary/50 cursor-pointer transition-colors h-full">
              <CardContent className="p-5">
                <link.icon className="w-5 h-5 text-primary mb-3" />
                <p className="font-medium text-sm">{link.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Client Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Display Name</Label>
              <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Payout Split (creator %)</Label>
              <Input type="number" min="0" max="1" step="0.01" value={form.payoutSplit || ""} onChange={(e) => setForm({ ...form, payoutSplit: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea value={form.bio || ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
          </div>

          <div className="space-y-1.5">
            <Label>AI Tone Profile</Label>
            <Textarea
              value={form.toneProfile || ""}
              onChange={(e) => setForm({ ...form, toneProfile: e.target.value })}
              rows={4}
              placeholder="Describe how the AI should respond as this creator. Include personality traits, common phrases, topics to avoid, etc."
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Platform Links</Label>
            <div className="grid grid-cols-2 gap-3">
              {PLATFORMS.filter(p => p !== "OTHER").map((platform) => (
                <div key={platform} className="space-y-1">
                  <p className="text-xs text-muted-foreground capitalize">{platform.toLowerCase()}</p>
                  <Input
                    value={form.platformLinks?.[platform] || ""}
                    onChange={(e) => setForm({ ...form, platformLinks: { ...form.platformLinks, [platform]: e.target.value } })}
                    placeholder={`${platform.toLowerCase()} URL`}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
