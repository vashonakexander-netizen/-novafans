"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, DollarSign, ChevronRight, Menu, X,
  Inbox, Calendar, ImageIcon, BarChart2, LogOut, Zap, Video
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

interface Client {
  id: string;
  name: string;
  colorTag: string;
  slug: string;
}

const navItems = [
  { href: "/agency", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/agency/clients", label: "Clients", icon: Users },
  { href: "/agency/revenue", label: "Revenue", icon: DollarSign },
  { href: "/clip-studio/dashboard", label: "Clip Studio", icon: Video, badge: "NEW" },
];

const clientNav = [
  { href: "vault", label: "Vault", icon: ImageIcon },
  { href: "inbox", label: "Inbox", icon: Inbox },
  { href: "schedule", label: "Schedule", icon: Calendar },
  { href: "analytics", label: "Analytics", icon: BarChart2 },
];

export function AgencySidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    api.get("/agency/clients").then((r) => setClients(r.data || [])).catch(() => {});
    api.get("/auth/me").then((r) => setUser(r.data)).catch(() => {});
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-md bg-card border border-border text-foreground shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={cn(
        "border-r border-border bg-card flex flex-col shrink-0 z-50",
        "md:relative md:w-64 md:translate-x-0",
        "fixed inset-y-0 left-0 w-64 transition-transform",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <Link href="/agency" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-foreground">NovaFans</span>
          <Badge variant="secondary" className="text-[10px] py-0 px-1.5">AGENCY</Badge>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="px-3 py-3 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive(item.href, item.exact)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {(item as any).badge && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00ff88] text-black tracking-wider">
                {(item as any).badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-2 border-t border-border">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">
          Clients
        </p>
        <div className="space-y-0.5 max-h-72 overflow-y-auto">
          {clients.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">No clients yet</p>
          )}
          {clients.map((client) => {
            const isClientActive = pathname.startsWith(`/agency/clients/${client.id}`);
            return (
              <div key={client.id}>
                <Link
                  href={`/agency/clients/${client.id}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors w-full",
                    isClientActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: client.colorTag }}
                  />
                  <span className="truncate font-medium">{client.name}</span>
                  {isClientActive && <ChevronRight className="w-3 h-3 ml-auto shrink-0" />}
                </Link>

                {/* Sub-nav for active client */}
                {isClientActive && (
                  <div className="ml-5 mt-0.5 space-y-0.5 border-l border-border pl-3">
                    {clientNav.map((nav) => {
                      const href = `/agency/clients/${client.id}/${nav.href}`;
                      return (
                        <Link
                          key={nav.href}
                          href={href}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors",
                            pathname.startsWith(href)
                              ? "text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <nav.icon className="w-3 h-3" />
                          {nav.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Link
          href="/agency/clients"
          className="flex items-center gap-2 px-3 py-2 mt-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full"
        >
          <span className="text-base leading-none">+</span> Add Client
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-border px-3 py-3">
        {user && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium text-foreground truncate">{user.displayName || user.username}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
      </aside>
    </>
  );
}
