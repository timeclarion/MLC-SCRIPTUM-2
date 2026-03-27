/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['*.ngrok-free.dev', '*.ngrok.io'],
  async rewrites() {
    return [
      {
        source: '/docs/:id/modelo.docx',
        destination: '/api/modelos/:id/download',
      },
    ]
  },
}

export default nextConfig
