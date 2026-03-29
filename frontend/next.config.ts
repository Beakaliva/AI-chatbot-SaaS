import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
  // ✅ Désactiver le cache persistant Turbopack
  cacheHandler: undefined,
}

export default nextConfig