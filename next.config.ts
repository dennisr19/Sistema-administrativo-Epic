import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  devIndicators: false,
}

// Da acceso a los bindings de Cloudflare (D1) durante `next dev`.
initOpenNextCloudflareForDev()

export default nextConfig
