"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function DashboardRouter() {
  const router = useRouter();
  useEffect(() => {
    api.get("/auth/me")
      .then((res) => {
        const role = res.data.role;
        if (role === "AGENCY") router.replace("/agency");
        else if (role === "MODEL" || role === "CREATOR") router.replace("/model");
        else if (role === "FAN") router.replace("/fan");
        else if (role === "ADMIN") router.replace("/admin");
        else router.replace("/login");
      })
      .catch(() => router.replace("/login"));
  }, [router]);
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  );
}
