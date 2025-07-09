import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 服务端性能监控
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // 环境配置
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // 服务端特定配置
  debug: process.env.NODE_ENV === "development",
})
