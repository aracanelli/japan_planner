/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  output: 'export', // Enable static HTML export for Electron
  distDir: 'out',   // Output to 'out' directory for Electron
  images: {
    unoptimized: true, // Required for static export
  },
}

module.exports = nextConfig 