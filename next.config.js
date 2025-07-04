/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Cloudflare Pages deployment
  output: 'export',
  
  // Ensure trailing slashes for static export
  trailingSlash: true,
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Disable caching during build for fresh content
  onDemandEntries: {
    maxInactiveAge: 0,
    pagesBufferLength: 0,
  },
  
  // Image optimization configuration for static export
  images: {
    unoptimized: true, // Required for static export
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [
      'firebasestorage.googleapis.com',
      'images.unsplash.com',
      'images.pexels.com',
      'cdn.jsdelivr.net',
      'via.placeholder.com',
      'api.dicebear.com',
      'blogform.netlify.app',
      'ailodixyz.erolledph.workers.dev'
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Webpack optimizations for static export
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size for static export
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    // Ensure compatibility with static export
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    
    return config;
  },
  
  // Enhanced build configuration for fresh content
  generateBuildId: async () => {
    // Use timestamp and random string to ensure fresh builds
    return `build-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  },
};

module.exports = nextConfig;