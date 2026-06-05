"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";

export default function CreatorsPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/agency/public/creators").catch(() => ({ data: [] }))
      .then((r: any) => setCreators(r.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = creators.filter((c: any) =>
    !q || c.name?.toLowerCase().includes(q.toLowerCase()) || c.slug?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Discover Creators</h1>
          <p className="text-muted-foreground">Find your favorite creators and subscribe for exclusive content.</p>
        </div>
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search creators..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">{q ? "No creators match your search" : "No creators yet — check back soon!"}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filtered.map((c: any) => (
              <Link key={c.id} href={`/${c.slug}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: c.colorTag || "#8B5CF6" }}>
                        {c.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold group-hover:text-primary transition-colors">{c.name}</p>
                        <p className="text-xs text-muted-foreground">@{c.slug}</p>
                      </div>
                    </div>
                    {c.bio && <p className="text-sm text-muted-foreground line-clamp-2">{c.bio}</p>}
                    <div className="mt-3 text-xs text-primary font-medium">View profile →</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
