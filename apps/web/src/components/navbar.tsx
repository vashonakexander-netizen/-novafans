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
              NovaFans
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
            NovaFans
          </Link>

          <div className="flex gap-4 items-center">
            {user ? (
              <>
                {user.role === "CREATOR" && (
                  <>
                    <Link
                      href="/dashboard/creator"
                      className={`px-3 py-2 rounded ${
                        pathname === "/dashboard/creator" ? "bg-blue-100" : ""
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/creator/live"
                      className={`px-3 py-2 rounded ${
                        pathname === "/dashboard/creator/live" ? "bg-blue-100" : ""
                      }`}
                    >
                      Live
                    </Link>
                  </>
                )}
                {user.role === "FAN" && (
                  <Link
                    href="/dashboard"
                    className={`px-3 py-2 rounded ${
                      pathname === "/dashboard" ? "bg-blue-100" : ""
                    }`}
                  >
                    My Subscriptions
                  </Link>
                )}
                <Link
                  href="/creators"
                  className={`px-3 py-2 rounded ${pathname === "/creators" ? "bg-blue-100" : ""}`}
                >
                  Creators
                </Link>
                <Link
                  href="/live"
                  className={`px-3 py-2 rounded ${pathname === "/live" ? "bg-blue-100" : ""}`}
                >
                  Live
                </Link>
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
                  href="/creators"
                  className={`px-3 py-2 rounded ${pathname === "/creators" ? "bg-blue-100" : ""}`}
                >
                  Browse
                </Link>
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
                {/* Creator Dropdown - Subtle */}
                <div className="relative">
                  <button
                    onClick={() => setShowCreatorMenu(!showCreatorMenu)}
                    className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    onBlur={() => setTimeout(() => setShowCreatorMenu(false), 200)}
                  >
                    ⋯
                  </button>
                  {showCreatorMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                      <Link
                        href="/for-creators"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                        onClick={() => setShowCreatorMenu(false)}
                      >
                        For Creators
                      </Link>
                      <Link
                        href="/register?role=CREATOR"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                        onClick={() => setShowCreatorMenu(false)}
                      >
                        Become a Creator
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

