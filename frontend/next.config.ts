import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.15.8.59"],
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
  // ✅ Désactiver le cache persistant Turbopack
  cacheHandler: undefined,
}

export default nextConfig