"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface MediaItem {
  id: string;
  title: string;
  thumbnail?: string;
  type: "MOVIE" | "VIDEO" | "IMAGE";
  price?: number;
  creator?: {
    username: string;
  };
}

export default function BrowsePage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadMedia();
  }, [category, search]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts", {
        params: {
          limit: 50,
        },
      });
      // Transform posts to media items
      const posts = response.data || [];
      const mediaItems: MediaItem[] = posts.map((post: any) => ({
        id: post.id,
        title: post.title || "Untitled",
        thumbnail: post.media?.[0]?.fileUrl || post.media?.[0]?.thumbnailUrl,
        type: post.media?.[0]?.mediaType === "VIDEO" ? "VIDEO" : "IMAGE",
        price: post.price ? Number(post.price) : undefined,
        creator: post.creator,
      }));
      
      // Filter by search
      let filtered = mediaItems;
      if (search) {
        filtered = mediaItems.filter((item) =>
          item.title.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      setMedia(filtered);
    } catch (error) {
      console.error("Failed to load media:", error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", name: "All Content", icon: "🎬" },
    { id: "movies", name: "Movies", icon: "🎥" },
    { id: "adult", name: "Adult", icon: "🔥" },
    { id: "live", name: "Live Shows", icon: "📺" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Browse Content</h1>
          
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search movies, videos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-1/2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  category === cat.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-400">Loading content...</p>
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-400 mb-4">No content found</p>
            <Link
              href="/admin/scraper"
              className="text-blue-400 hover:underline"
            >
              Add content with scraper →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {media.map((item) => (
              <Link
                key={item.id}
                href={`/watch/${item.id}`}
                className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer group"
              >
                <div className="aspect-video bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center relative">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">🎬</span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white text-2xl">▶</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</h3>
                  {item.price && (
                    <p className="text-blue-400 text-xs">${item.price}</p>
                  )}
                  {item.creator && (
                    <p className="text-gray-400 text-xs mt-1">by {item.creator.username}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
