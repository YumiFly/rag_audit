import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 性能监控
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // 错误过滤
  beforeSend(event, hint) {
    // 过滤掉开发环境的错误
    if (process.env.NODE_ENV === "development") {
      return null
    }

    // 过滤掉网络错误
    if (event.exception) {
      const error = hint.originalException
      if (error && error.name === "NetworkError") {
        return null
      }
    }

    return event
  },

  // 用户上下文
  initialScope: {
    tags: {
      component: "rag-audit-system",
      environment: process.env.NODE_ENV,
    },
  },

  // 集成配置
  integrations: [
    new Sentry.BrowserTracing({
      // 路由变化追踪
      routingInstrumentation: Sentry.nextRouterInstrumentation,
    }),
  ],

  // 环境配置
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
})
