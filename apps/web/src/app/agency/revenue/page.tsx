"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";

type Period = "daily" | "weekly" | "monthly";

export default function AgencyRevenuePage() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/agency/revenue?period=${period}`)
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const tooltipStyle = {
    backgroundColor: "hsl(0 0% 7%)",
    border: "1px solid hsl(0 0% 14.9%)",
    borderRadius: 8,
    color: "hsl(0 0% 98%)",
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Revenue</h1>
          <p className="text-muted-foreground mt-1">Total earnings across all clients.</p>
        </div>
        <div className="flex gap-2">
          {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
            <Button key={p} size="sm" variant={period === p ? "default" : "outline"} onClick={() => setPeriod(p)} className="capitalize">{p}</Button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Revenue", value: formatCurrency(data?.totalRevenue ?? 0) },
            { label: "Agency Cut", value: formatCurrency(data?.agencyCut ?? 0) },
            { label: "Creator Payouts", value: formatCurrency(data?.creatorPayouts ?? 0) },
            { label: "Pending Payouts", value: formatCurrency(data?.pendingPayouts ?? 0) },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Revenue chart */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Revenue Over Time</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-64" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data?.revenueChart || []}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(271 91% 65%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(271 91% 65%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
                <XAxis dataKey="label" tick={{ fill: "hsl(0 0% 63.9%)", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(0 0% 63.9%)", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [formatCurrency(v), "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(271 91% 65%)" fill="url(#totalGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Per client breakdown */}
      <Card>
        <CardHeader><CardTitle className="text-base">Revenue by Client</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : !data?.byClient?.length ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {data.byClient.map((client: any) => (
                <div key={client.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: client.colorTag }} />
                  <p className="font-medium text-sm flex-1">{client.name}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-muted-foreground">{client.orders} orders</span>
                    <span className="text-muted-foreground">{client.subs} subs</span>
                    <span className="font-semibold text-green-400">{formatCurrency(client.revenue)}</span>
                    <Badge variant="secondary" className="text-[10px]">{Math.round(client.split * 100)}% split</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
