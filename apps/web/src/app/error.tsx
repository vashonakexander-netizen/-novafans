"use client";
import { useEffect } from "react";
import { Zap, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-destructive" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-3">Something went wrong</h2>
        <p className="text-muted-foreground mb-8 text-sm">An unexpected error occurred. Please try again or go back home.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <RefreshCw className="w-4 h-4" />Try again
          </button>
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors">
            <Home className="w-4 h-4" />Home
          </Link>
        </div>
      </div>
    </div>
  );
}
