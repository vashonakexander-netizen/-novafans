"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreatorMenu, setShowCreatorMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/auth/me")
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
  };

  if (loading) {
    return (
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              Savage House
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Savage House
          </Link>

          <div className="flex gap-4 items-center">
            <Link
              href="/browse"
              className={`px-3 py-2 rounded ${pathname === "/browse" ? "bg-blue-100" : ""}`}
            >
              Browse
            </Link>
            <Link
              href="/admin/scraper"
              className={`px-3 py-2 rounded ${pathname === "/admin/scraper" ? "bg-blue-100" : ""}`}
            >
              Scraper
            </Link>
            {user ? (
              <>
                {user.role === "CREATOR" && (
                  <Link
                    href="/dashboard/creator"
                    className={`px-3 py-2 rounded ${
                      pathname === "/dashboard/creator" ? "bg-blue-100" : ""
                    }`}
                  >
                    Dashboard
                  </Link>
                )}
                <span className="text-sm">{user.username}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 border rounded hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`px-3 py-2 rounded ${pathname === "/login" ? "bg-blue-100" : ""}`}
                >
                  Login
                </Link>
                <Link
                  href="/register?role=FAN"
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

