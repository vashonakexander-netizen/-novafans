"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    displayName: "",
    role: (searchParams?.get("role")?.toUpperCase() || "FAN") as "FAN" | "CREATOR",
    ageVerified: false,
    tosAccepted: false,
    privacyAccepted: false,
  });

  useEffect(() => {
    // Set role from URL param if present
    const roleParam = searchParams?.get("role");
    if (roleParam && (roleParam.toUpperCase() === "CREATOR" || roleParam.toUpperCase() === "FAN")) {
      setFormData((prev) => ({ ...prev, role: roleParam.toUpperCase() as "FAN" | "CREATOR" }));
    }
  }, [searchParams]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", formData);
      localStorage.setItem("token", res.data.accessToken);
      
      // Track registration
      trackEvent("registration_complete", { role: formData.role });
      
      // Track onboarding start for creators
      if (formData.role === "CREATOR") {
        trackEvent("creator_onboarding_start", {});
      }
      
      // Redirect to dashboard (or onboarding for creators if needed)
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
      trackEvent("registration_failed", { role: formData.role, error: err.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sign Up</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Display Name</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Password (min 8 characters)</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">I want to be a</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="FAN">Fan</option>
              <option value="CREATOR">Creator</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ageVerified}
                onChange={(e) => setFormData({ ...formData, ageVerified: e.target.checked })}
                required
                className="mt-1"
              />
              <span className="text-sm">
                I confirm that I am 18 years or older
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.tosAccepted}
                onChange={(e) => setFormData({ ...formData, tosAccepted: e.target.checked })}
                required
                className="mt-1"
              />
              <span className="text-sm">
                I accept the{" "}
                <Link href="/terms" className="text-blue-600 hover:underline" target="_blank">
                  Terms of Service
                </Link>
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.privacyAccepted}
                onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                required
                className="mt-1"
              />
              <span className="text-sm">
                I accept the{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.ageVerified || !formData.tosAccepted || !formData.privacyAccepted}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}

