import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-foreground">NovaFans</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The all-in-one platform for creator agencies and their fans.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-foreground">Platform</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/for-creators", label: "For Creators" },
                { href: "/for-fans", label: "For Fans" },
                { href: "/pricing", label: "Pricing" },
                { href: "/creators", label: "Browse Creators" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-foreground">Support</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/help", label: "Help & FAQ" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/dmca", label: "DMCA" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-foreground">Account</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/login", label: "Sign In" },
                { href: "/register?role=AGENCY", label: "Agency Sign Up" },
                { href: "/register?role=MODEL", label: "Creator Sign Up" },
                { href: "/register?role=FAN", label: "Fan Sign Up" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© {year} NovaFans. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/acceptable-use" className="hover:text-foreground transition-colors">Acceptable Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
