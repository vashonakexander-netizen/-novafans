"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Zap, Menu, X, LayoutDashboard, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
    setUser(null);
    router.push("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "AGENCY") return "/agency";
    if (user.role === "MODEL") return "/model";
    if (user.role === "FAN") return "/fan";
    if (user.role === "CREATOR") return "/dashboard/creator";
    if (user.role === "ADMIN") return "/admin";
    return "/dashboard";
  };

  const navLinks = [
    { href: "/creators", label: "Creators" },
    { href: "/for-creators", label: "For Creators" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <nav className="border-b border-border bg-background/90 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3.5">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">NovaFans</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm transition-colors",
                  pathname === link.href
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
            ) : user ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 pl-3 border-l border-border">
                  <span className="text-sm text-muted-foreground">{user.displayName || user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pt-3 pb-2 border-t border-border mt-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border mt-2 space-y-1">
              {user ? (
                <>
                  <Link href={getDashboardLink()} onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent">Dashboard</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent">Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent">Log in</Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium text-center">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
