"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Zap, Building2, Camera, Heart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

type Role = "AGENCY" | "MODEL" | "FAN";

const ROLES = [
  { id: "AGENCY" as Role, label: "Agency", icon: Building2, description: "Manage multiple creators, AI inbox, vault, scheduler", color: "text-primary", bg: "bg-primary/10", border: "border-primary/60" },
  { id: "MODEL" as Role, label: "Creator", icon: Camera, description: "Upload content, track stats, collaborate with agency", color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/60" },
  { id: "FAN" as Role, label: "Fan", icon: Heart, description: "Subscribe, purchase content, send messages", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/60" },
];

const API_ROLE_MAP: Record<Role, string> = { AGENCY: "AGENCY", MODEL: "CREATOR", FAN: "FAN" };

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const rawParam = searchParams?.get("role")?.toUpperCase() as Role;
  const validInitial: Role = ["AGENCY", "MODEL", "FAN"].includes(rawParam) ? rawParam : "FAN";
  const [role, setRole] = useState<Role>(validInitial);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", username: "", displayName: "", password: "", confirmPassword: "", ageVerified: false, tosAccepted: false });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    if (form.password.length < 8) { toast({ title: "Password must be at least 8 characters", variant: "destructive" }); return; }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tosAccepted || !form.ageVerified) { toast({ title: "Please accept the terms and confirm your age", variant: "destructive" }); return; }
    setLoading(true);
    try {
      await api.post("/auth/register", { email: form.email, username: form.username.toLowerCase().replace(/\s+/g, "_"), displayName: form.displayName || form.username, password: form.password, role: API_ROLE_MAP[role], ageVerified: true, tosAccepted: true, privacyAccepted: true });
      const loginRes = await api.post("/auth/login", { email: form.email, password: form.password });
      const token = loginRes.data.accessToken;
      localStorage.setItem("token", token);
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      toast({ title: "Welcome to NovaFans! 🎉", variant: "success" as any });
      router.push(role === "AGENCY" ? "/agency" : role === "MODEL" ? "/model" : "/fan");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.response?.data?.message || "Please try again.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center"><Zap className="w-5 h-5 text-white" /></div>
            <span className="text-2xl font-bold">NovaFans</span>
          </Link>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Join NovaFans — free to get started</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <>
                <div className="mb-6">
                  <p className="text-sm font-medium text-muted-foreground mb-3">I want to join as a...</p>
                  <div className="grid grid-cols-3 gap-3">
                    {ROLES.map((r) => (
                      <button key={r.id} type="button" onClick={() => setRole(r.id)} className={cn("relative rounded-xl border-2 p-4 text-left transition-all", role === r.id ? `${r.border} ${r.bg}` : "border-border hover:border-muted-foreground/50")}>
                        {role === r.id && <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>}
                        <r.icon className={cn("w-5 h-5 mb-2", role === r.id ? r.color : "text-muted-foreground")} />
                        <p className="font-semibold text-sm">{r.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{r.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <form onSubmit={handleNext} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Display Name</Label><Input value={form.displayName} onChange={e => set("displayName", e.target.value)} placeholder="Your name" required /></div>
                    <div className="space-y-1.5"><Label>Username</Label><Input value={form.username} onChange={e => set("username", e.target.value)} placeholder="@handle" required pattern="[a-zA-Z0-9_]+" /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Password</Label><Input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min 8 chars" required minLength={8} /></div>
                    <div className="space-y-1.5"><Label>Confirm</Label><Input type="password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} placeholder="Repeat" required /></div>
                  </div>
                  <Button type="submit" className="w-full">Continue →</Button>
                </form>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className={cn("rounded-xl p-4 border-2", ROLES.find(r => r.id === role)?.border)}>
                  <div className="flex items-center gap-3">
                    {(() => { const r = ROLES.find(x => x.id === role)!; return <r.icon className={cn("w-5 h-5", r.color)} />; })()}
                    <div><p className="font-medium text-sm">{ROLES.find(r => r.id === role)?.label} account</p><p className="text-xs text-muted-foreground">{form.email}</p></div>
                    <button type="button" onClick={() => setStep(1)} className="ml-auto text-xs text-primary hover:underline">Change</button>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { key: "ageVerified", label: "I confirm I am at least 18 years old" },
                    { key: "tosAccepted", label: null },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-start gap-3 cursor-pointer">
                      <div className={cn("mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0", (form as any)[key] ? "bg-primary border-primary" : "border-input")}>
                        {(form as any)[key] && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <input type="checkbox" className="sr-only" checked={(form as any)[key]} onChange={e => set(key, e.target.checked)} required />
                      <span className="text-sm text-muted-foreground">
                        {label || <>I agree to the <Link href="/terms" target="_blank" className="text-primary hover:underline">Terms</Link> and <Link href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link></>}
                      </span>
                    </label>
                  ))}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating account..." : "Create Account"}</Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setStep(1)}>← Back</Button>
              </form>
            )}
            <p className="mt-5 text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>}>
      <RegisterForm />
    </Suspense>
  );
}
