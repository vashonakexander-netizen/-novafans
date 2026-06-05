"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ShoppingBag, MessageCircle, Star, Search, LogOut, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import api from "@/lib/api";

export default function FanDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then(res => {
        if (res.data.role !== "FAN") {
          // Redirect non-fans to their own dashboard
          if (res.data.role === "AGENCY") router.push("/agency");
          else if (res.data.role === "CREATOR" || res.data.role === "MODEL") router.push("/model");
          else router.push("/dashboard");
          return;
        }
        setUser(res.data);
        return Promise.all([
          api.get("/subscriptions/me").catch(() => ({ data: [] })),
          api.get("/fan/orders").catch(() => ({ data: [] })),
        ]).then(([subsRes, ordersRes]) => {
          setSubscriptions(Array.isArray(subsRes.data) ? subsRes.data : []);
          setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        });
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 max-w-3xl mx-auto">
        <Skeleton className="h-12 w-48 mb-8" />
        <div className="grid grid-cols-3 gap-4 mb-8">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Simple top nav */}
      <nav className="border-b border-border bg-background/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold">NovaFans</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.displayName || user.username}</span>
            <button onClick={handleLogout} className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome back, {user.displayName || user.username} 👋</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your fan dashboard</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Link href="/creators">
            <Card className="hover:border-primary/40 transition-colors cursor-pointer h-full">
              <CardContent className="p-4 text-center">
                <Search className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Discover</p>
                <p className="text-xs text-muted-foreground mt-0.5">Find creators</p>
              </CardContent>
            </Card>
          </Link>
          <div>
            <Card className="h-full">
              <CardContent className="p-4 text-center">
                <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                <p className="text-sm font-bold">{subscriptions.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Subscriptions</p>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="h-full">
              <CardContent className="p-4 text-center">
                <ShoppingBag className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-sm font-bold">{orders.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Purchases</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Active subscriptions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" />
              Your Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <div className="py-8 text-center">
                <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground text-sm mb-3">No active subscriptions yet</p>
                <Link href="/creators">
                  <Button size="sm">Discover Creators</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub: any) => (
                  <Link
                    key={sub.id}
                    href={`/${sub.creator?.username || sub.creatorId}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {(sub.creator?.displayName || sub.creator?.username || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{sub.creator?.displayName || sub.creator?.username || "Creator"}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(Number(sub.price))}/month</p>
                    </div>
                    <Badge variant="success" className="text-[10px]">Active</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent purchases */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              Recent Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground text-sm">No purchases yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 10).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{order.product?.title || "Purchase"}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(order.createdAt)}</p>
                    </div>
                    <span className="text-sm font-semibold text-green-400">{formatCurrency(Number(order.amount))}</span>
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
