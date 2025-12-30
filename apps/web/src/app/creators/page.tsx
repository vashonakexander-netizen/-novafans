"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function CreatorsPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we'll need to implement a /creators endpoint or fetch users with CREATOR role
    // This is a placeholder
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading creators...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Creators</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Discover amazing creators and subscribe to their exclusive content.
      </p>

      {creators.length === 0 ? (
        <div className="text-center py-12">
          <p>No creators found. Be the first to sign up as a creator!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <Link
              key={creator.id}
              href={`/u/${creator.username}`}
              className="border rounded-lg p-6 hover:shadow-lg transition"
            >
              <div className="aspect-square bg-gray-200 rounded mb-4"></div>
              <h3 className="text-xl font-semibold">{creator.displayName}</h3>
              <p className="text-gray-600">@{creator.username}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


