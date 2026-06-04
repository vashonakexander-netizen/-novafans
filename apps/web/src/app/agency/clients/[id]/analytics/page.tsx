"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";

type Period = "daily" | "weekly" | "monthly";

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [period, setPeriod] = useState<Period>("weekly");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/agency/clients/${id}/analytics?period=${period}`)
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, period]);

  const chartProps = {
    style: { fontSize: 11 },
  };

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
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Revenue, fans, and engagement data.</p>
        </div>
        <div className="flex gap-2">
          {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? "default" : "outline"}
              onClick={() => setPeriod(p)}
              className="capitalize"
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Revenue", value: formatCurrency(data?.totalRevenue ?? 0), color: "text-green-400" },
            { label: "Active Fans", value: data?.activeFans ?? 0, color: "text-blue-400" },
            { label: "Messages", value: data?.messageCount ?? 0, color: "text-purple-400" },
            { label: "AI Response Rate", value: `${Math.round((data?.aiResponseRate ?? 0) * 100)}%`, color: "text-primary" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data?.revenueChart || []} {...chartProps}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(271 91% 65%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(271 91% 65%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
                  <XAxis dataKey="label" tick={{ fill: "hsl(0 0% 63.9%)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(0 0% 63.9%)", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [formatCurrency(v), "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(271 91% 65%)" fill="url(#revGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Fan Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fan Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-52" /> : (
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={data?.fanGrowth || []} {...chartProps}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
                  <XAxis dataKey="label" tick={{ fill: "hsl(0 0% 63.9%)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(0 0% 63.9%)", fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="fans" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Message Volume */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Message Volume</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-52" /> : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={data?.messageChart || []} {...chartProps}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
                  <XAxis dataKey="label" tick={{ fill: "hsl(0 0% 63.9%)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(0 0% 63.9%)", fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="inbound" fill="#8B5CF6" name="Inbound" radius={[4,4,0,0]} />
                  <Bar dataKey="outbound" fill="#EC4899" name="Replied" radius={[4,4,0,0]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Content */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : !data?.topContent?.length ? (
              <p className="text-sm text-muted-foreground">No content data yet.</p>
            ) : (
              <div className="space-y-3">
                {data.topContent.map((item: any, i: number) => (
                  <div key={item.id || i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-sm font-mono w-5">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{item.caption || `Media #${i + 1}`}</p>
                        <p className="text-xs text-muted-foreground">{item.fileType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-muted-foreground">{item.views ?? 0} views</span>
                      <span className="text-green-400 font-medium">{formatCurrency(item.revenue ?? 0)}</span>
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
