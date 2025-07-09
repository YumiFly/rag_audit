// 环境配置管理
export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "RAG Audit System",
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
    timeout: Number.parseInt(process.env.API_TIMEOUT || "30000"),
  },

  upload: {
    maxSize: Number.parseInt(process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE || "10485760"), // 10MB
    allowedTypes: process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES?.split(",") || [".sol", ".json"],
  },

  features: {
    analytics: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS === "true",
    chat: process.env.NEXT_PUBLIC_FEATURE_CHAT === "true",
    batchUpload: process.env.NEXT_PUBLIC_FEATURE_BATCH_UPLOAD === "true",
    debug: process.env.NEXT_PUBLIC_FEATURE_DEBUG === "true",
  },

  cdn: {
    url: process.env.NEXT_PUBLIC_CDN_URL || "",
  },

  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  },

  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "",
  },

  cache: {
    ttl: Number.parseInt(process.env.CACHE_TTL || "3600"),
    prefix: process.env.REDIS_CACHE_PREFIX || "rag_audit:",
  },

  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
}

// 功能开关
export const featureFlags = {
  isEnabled: (feature: keyof typeof config.features): boolean => {
    return config.features[feature] || false
  },
}
