import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ensure API URLs are properly configured
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || "http://localhost:3001",
    NEXT_PUBLIC_AI_SERVICE_URL: process.env.NEXT_PUBLIC_AI_SERVICE_URL || process.env.AI_SERVICE_URL || "http://localhost:3002",
  },
  // TODO: For Vercel deployment, these env vars should be set in Vercel dashboard
  // TODO: For container-based hosting (Railway/Render/Fly), ensure NEXT_PUBLIC_* vars are set at build time
};

export default nextConfig;

