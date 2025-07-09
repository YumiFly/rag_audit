const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 性能优化
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },

  // 压缩配置
  compress: true,

  // 图片优化
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true, // 新增
  },

  // 静态资源优化
  assetPrefix: process.env.NODE_ENV === "production" ? process.env.CDN_URL : "",

  // 代码分割
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 代码分割优化
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            priority: 5,
            reuseExistingChunk: true,
          },
          ui: {
            test: /[\\/]components[\\/]ui[\\/]/,
            name: "ui",
            chunks: "all",
            priority: 8,
          },
        },
      }
    }

    // Bundle分析
    if (process.env.ANALYZE === "true") {
      config.plugins.push(
        new webpack.DefinePlugin({
          "process.env.BUNDLE_ANALYZE": JSON.stringify("true"),
        }),
      )
    }

    return config
  },

  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    BUILD_TIME: new Date().toISOString(),
  },

  // 安全头
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ]
  },

  // 重定向
  async redirects() {
    return [
      {
        source: "/old-path",
        destination: "/new-path",
        permanent: true,
      },
    ]
  },

  // 重写
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${process.env.API_BASE_URL}/:path*`,
      },
    ]
  },

  // ESLint 配置
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript 配置
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = withBundleAnalyzer(nextConfig)
