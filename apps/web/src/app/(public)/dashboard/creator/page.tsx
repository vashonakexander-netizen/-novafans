"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreatorDashboardRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/model"); }, [router]);
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
