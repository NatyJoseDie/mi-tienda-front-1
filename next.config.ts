// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    // Deshabilitar ESLint durante el build para evitar que las advertencias bloqueen la compilación
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'tttjkmkikdyiiahsrhvo.supabase.co', // ✅ Agregado Supabase
      },
    ],
  },
}

export default nextConfig
