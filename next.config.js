/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Leaflet requires window object, ensure proper handling
  transpilePackages: ['react-leaflet', 'leaflet'],
}

module.exports = nextConfig
