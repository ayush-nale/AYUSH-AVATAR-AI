import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.APP_NAME || process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_AVATAR_PATH: process.env.AVATAR_PATH || process.env.NEXT_PUBLIC_AVATAR_PATH,
  }
};

export default nextConfig;
