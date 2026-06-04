"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Heart, Star, Crown, Lock, ShoppingBag, MessageCircle, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";

const TIERS = [
  {
    id: "FREE",
    name: "Free",
    icon: Heart,
    color: "border-border",
    headerColor: "bg-muted/30",
    price: { monthly: 0, yearly: 0 },
    perks: ["Public posts", "Browse content", "Basic profile access"],
  },
  {
    id: "PREMIUM",
    name: "Premium",
    icon: Star,
    color: "border-primary/60",
    headerColor: "bg-primary/10",
    price: { monthly: 9.99, yearly: 89.99 },
    perks: ["All free perks", "Exclusive photos & videos", "Direct messaging", "Early access to content"],
    badge: "Popular",
  },
  {
    id: "VIP",
    name: "VIP",
    icon: Crown,
    color: "border-yellow-600/60",
    headerColor: "bg-yellow-950/30",
    price: { monthly: 24.99, yearly: 199.99 },
    perks: ["All premium perks", "1-on-1 video calls", "Custom content requests", "VIP-only live streams", "Priority replies"],
    badge: "Best Value",
  },
];

export default function ModelPage() {
  const { modelslug } = useParams<{ modelslug: string }>();
  const { toast } = useToast();
  const [client, setClient] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState("");
  const [tipping, setTipping] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get(`/agency/public/${modelslug}`).catch(() => ({ data: null })),
      api.get(`/agency/public/${modelslug}/products`).catch(() => ({ data: [] })),
    ]).then(([clientRes, productsRes]) => {
      setClient(clientRes.data);
      setProducts(productsRes.data || []);
    }).finally(() => setLoading(false));
  }, [modelslug]);

  const subscribe = async (tier: string) => {
    if (tier === "FREE") return;
    setSubscribing(tier);
    try {
      const res = await fetch("/api/stripe/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, billing, modelslug, clientId: client?.id }),
      });
      const data = await res.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      else throw new Error(data.error || "Failed");
    } catch (err: any) {
      toast({ title: "Subscription failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setSubscribing(null);
    }
  };

  const purchase = async (productId: string) => {
    setPurchasing(productId);
    try {
      // First get product details from API
      const info = await api.post(`/agency/public/${modelslug}/purchase`, { productId });
      const res = await fetch("/api/stripe/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...info.data, modelslug }),
      });
      const data = await res.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      else throw new Error(data.error || "Failed");
    } catch (err: any) {
      toast({ title: "Purchase failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setPurchasing(null);
    }
  };

  const sendTip = async () => {
    const amount = parseFloat(tipAmount);
    if (!amount || amount < 1) {
      toast({ title: "Minimum tip is $1", variant: "destructive" });
      return;
    }
    setTipping(true);
    try {
      const res = await fetch("/api/stripe/tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, modelslug, clientId: client?.id }),
      });
      const data = await res.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      else throw new Error(data.error || "Failed");
    } catch (err: any) {
      toast({ title: "Tip failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setTipping(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-48 w-full" />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          <Skeleton className="h-32 rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-2">Creator not found</p>
          <p className="text-muted-foreground">@{modelslug} doesn&apos;t exist on this platform.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header Banner */}
      <div className="h-48 w-full relative" style={{ backgroundColor: client.colorTag + "33" }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${client.colorTag}22 0%, transparent 100%)` }} />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Profile */}
        <div className="flex items-end gap-5 -mt-14 mb-8">
          <div
            className="w-24 h-24 rounded-2xl border-4 border-background shrink-0 flex items-center justify-center text-3xl font-bold text-white"
            style={{ backgroundColor: client.colorTag }}
          >
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div className="pb-2">
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground text-sm">@{client.slug}</p>
          </div>
        </div>

        {client.bio && (
          <p className="text-muted-foreground mb-8 max-w-2xl">{client.bio}</p>
        )}

        {/* ── Subscriptions ─────────────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">Subscribe</h2>
            {/* Billing toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${billing === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Yearly
                <span className="ml-1 text-[10px] text-green-400 font-semibold">-25%</span>
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {TIERS.map((tier) => {
              const price = billing === "yearly" ? tier.price.yearly : tier.price.monthly;
              const Icon = tier.icon;
              return (
                <Card key={tier.id} className={`relative border-2 ${tier.color} overflow-hidden`}>
                  {tier.badge && (
                    <div className="absolute top-3 right-3">
                      <Badge variant={tier.id === "VIP" ? "warning" : "default"} className="text-[10px]">
                        {tier.badge}
                      </Badge>
                    </div>
                  )}
                  <div className={`p-5 ${tier.headerColor}`}>
                    <Icon className="w-6 h-6 mb-2 text-foreground" />
                    <p className="font-bold text-lg">{tier.name}</p>
                    <p className="text-2xl font-bold mt-1">
                      {price === 0 ? "Free" : formatCurrency(price)}
                      {price > 0 && <span className="text-sm font-normal text-muted-foreground">/{billing === "yearly" ? "yr" : "mo"}</span>}
                    </p>
                  </div>
                  <CardContent className="p-5">
                    <ul className="space-y-2 mb-5">
                      {tier.perks.map((perk) => (
                        <li key={perk} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={tier.id === "FREE" ? "outline" : tier.id === "VIP" ? "default" : "default"}
                      onClick={() => subscribe(tier.id)}
                      disabled={subscribing === tier.id || tier.id === "FREE"}
                    >
                      {tier.id === "FREE" ? "Current Plan" : subscribing === tier.id ? "Redirecting..." : `Subscribe ${tier.name}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ── Shop ──────────────────────────────────────────────── */}
        {products.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Shop</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-sm mb-1">{product.title}</p>
                    {product.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">{formatCurrency(Number(product.price))}</span>
                      <Button
                        size="sm"
                        onClick={() => purchase(product.id)}
                        disabled={purchasing === product.id}
                      >
                        {purchasing === product.id ? "..." : "Buy"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <Separator className="mb-12" />

        {/* ── Tip ───────────────────────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <Gift className="w-5 h-5 text-pink-400" />
            <h2 className="text-xl font-bold">Send a Tip</h2>
          </div>
          <Card className="max-w-sm">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-4">
                Show {client.name} some love with a tip 💕
              </p>
              {/* Quick amounts */}
              <div className="flex gap-2 mb-4">
                {["5", "10", "20", "50"].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTipAmount(amt)}
                    className={`flex-1 py-1.5 rounded-md border text-sm font-medium transition-colors ${tipAmount === amt ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"}`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    placeholder="Custom amount"
                    className="w-full h-9 pl-6 pr-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <Button onClick={sendTip} disabled={tipping || !tipAmount}>
                  <Heart className="w-4 h-4 mr-1.5" />
                  {tipping ? "..." : "Tip"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
