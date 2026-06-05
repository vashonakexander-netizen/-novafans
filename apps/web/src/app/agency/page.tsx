"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Calendar, DollarSign, Upload, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";

interface ClientCard {
  id: string;
  name: string;
  slug: string;
  colorTag: string;
  unreadMessages: number;
  scheduledThisWeek: number;
  revenueThisMonth: number;
  pendingUploads: number;
}

interface AgencyStats {
  totalRevenue: number;
  totalClients: number;
  totalFans: number;
  totalMessages: number;
}

export default function AgencyDashboard() {
  const [clients, setClients] = useState<ClientCard[]>([]);
  const [stats, setStats] = useState<AgencyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/agency/clients/overview").catch(() => ({ data: [] })),
      api.get("/agency/stats").catch(() => ({ data: null })),
    ]).then(([clientsRes, statsRes]) => {
      setClients(clientsRes.data || []);
      setStats(statsRes.data || null);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Agency Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage all your creators from one place.</p>
      </div>

      {/* Top Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} color="text-green-400" />
          <StatCard icon={Users} label="Total Clients" value={String(stats?.totalClients ?? 0)} color="text-primary" />
          <StatCard icon={TrendingUp} label="Total Fans" value={String(stats?.totalFans ?? 0)} color="text-blue-400" />
          <StatCard icon={MessageSquare} label="Messages" value={String(stats?.totalMessages ?? 0)} color="text-purple-400" />
        </div>
      )}

      {/* Client Grid */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">Clients</h2>
        <Link
          href="/agency/clients"
          className="text-sm text-primary hover:underline"
        >
          Manage all →
        </Link>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-12 text-center max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-5">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Welcome to NovaFans! 👋</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Let&apos;s get you set up. Start by adding your first creator client — you can customize their tone profile, payout split, and platform links.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Link
              href="/agency/clients"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Users className="w-4 h-4" />Add Your First Client
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-border text-left">
            {[
              { num: "1", title: "Add clients", desc: "Set up creator profiles with tone & payouts" },
              { num: "2", title: "Upload content", desc: "Use the vault for media management" },
              { num: "3", title: "AI handles fans", desc: "Approve AI drafts in the inbox" },
            ].map((s) => (
              <div key={s.num}>
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mb-2">{s.num}</div>
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {clients.map((client) => (
            <Link key={client.id} href={`/agency/clients/${client.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-10 h-10 rounded-xl flex-shrink-0"
                      style={{ backgroundColor: client.colorTag }}
                    />
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{client.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">@{client.slug}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <MetricChip
                      icon={MessageSquare}
                      value={client.unreadMessages}
                      label="unread"
                      highlight={client.unreadMessages > 0}
                    />
                    <MetricChip
                      icon={Calendar}
                      value={client.scheduledThisWeek}
                      label="this week"
                    />
                    <MetricChip
                      icon={DollarSign}
                      value={formatCurrency(client.revenueThisMonth)}
                      label="this month"
                    />
                    <MetricChip
                      icon={Upload}
                      value={client.pendingUploads}
                      label="pending"
                      highlight={client.pendingUploads > 0}
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function MetricChip({ icon: Icon, value, label, highlight }: {
  icon: React.ElementType; value: string | number; label: string; highlight?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 p-2.5 rounded-lg ${highlight ? "bg-primary/10" : "bg-muted/50"}`}>
      <Icon className={`w-3.5 h-3.5 shrink-0 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
      <div className="min-w-0">
        <p className={`text-sm font-semibold leading-none ${highlight ? "text-primary" : "text-foreground"}`}>
          {value}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}
