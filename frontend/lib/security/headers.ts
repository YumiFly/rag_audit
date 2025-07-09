// 内容安全策略构建器
export class CSPBuilder {
  private directives: Map<string, string[]> = new Map()

  // 默认源
  defaultSrc(sources: string[]): CSPBuilder {
    this.directives.set("default-src", sources)
    return this
  }

  // 脚本源
  scriptSrc(sources: string[]): CSPBuilder {
    this.directives.set("script-src", sources)
    return this
  }

  // 样式源
  styleSrc(sources: string[]): CSPBuilder {
    this.directives.set("style-src", sources)
    return this
  }

  // 图片源
  imgSrc(sources: string[]): CSPBuilder {
    this.directives.set("img-src", sources)
    return this
  }

  // 字体源
  fontSrc(sources: string[]): CSPBuilder {
    this.directives.set("font-src", sources)
    return this
  }

  // 连接源
  connectSrc(sources: string[]): CSPBuilder {
    this.directives.set("connect-src", sources)
    return this
  }

  // 媒体源
  mediaSrc(sources: string[]): CSPBuilder {
    this.directives.set("media-src", sources)
    return this
  }

  // 对象源
  objectSrc(sources: string[]): CSPBuilder {
    this.directives.set("object-src", sources)
    return this
  }

  // 框架源
  frameSrc(sources: string[]): CSPBuilder {
    this.directives.set("frame-src", sources)
    return this
  }

  // 工作线程源
  workerSrc(sources: string[]): CSPBuilder {
    this.directives.set("worker-src", sources)
    return this
  }

  // 表单动作
  formAction(sources: string[]): CSPBuilder {
    this.directives.set("form-action", sources)
    return this
  }

  // 框架祖先
  frameAncestors(sources: string[]): CSPBuilder {
    this.directives.set("frame-ancestors", sources)
    return this
  }

  // 基础URI
  baseUri(sources: string[]): CSPBuilder {
    this.directives.set("base-uri", sources)
    return this
  }

  // 升级不安全请求
  upgradeInsecureRequests(): CSPBuilder {
    this.directives.set("upgrade-insecure-requests", [])
    return this
  }

  // 阻止混合内容
  blockAllMixedContent(): CSPBuilder {
    this.directives.set("block-all-mixed-content", [])
    return this
  }

  // 构建CSP字符串
  build(): string {
    const policies: string[] = []

    for (const [directive, sources] of this.directives.entries()) {
      if (sources.length === 0) {
        policies.push(directive)
      } else {
        policies.push(`${directive} ${sources.join(" ")}`)
      }
    }

    return policies.join("; ")
  }
}

// 安全头部配置
export interface SecurityHeaders {
  "Content-Security-Policy"?: string
  "X-Content-Type-Options"?: string
  "X-Frame-Options"?: string
  "X-XSS-Protection"?: string
  "Referrer-Policy"?: string
  "Permissions-Policy"?: string
  "Strict-Transport-Security"?: string
  "X-DNS-Prefetch-Control"?: string
  "X-Download-Options"?: string
  "X-Permitted-Cross-Domain-Policies"?: string
}

// 默认安全头部
export function getDefaultSecurityHeaders(): SecurityHeaders {
  const csp = new CSPBuilder()
    .defaultSrc(["'self'"])
    .scriptSrc([
      "'self'",
      "'unsafe-inline'", // 开发环境需要，生产环境应该移除
      "'unsafe-eval'", // 开发环境需要，生产环境应该移除
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
    ])
    .styleSrc(["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"])
    .imgSrc(["'self'", "data:", "https:", "blob:"])
    .fontSrc(["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"])
    .connectSrc(["'self'", "https://api.github.com", "wss:", "ws:"])
    .mediaSrc(["'self'", "blob:", "data:"])
    .objectSrc(["'none'"])
    .frameSrc(["'none'"])
    .frameAncestors(["'none'"])
    .formAction(["'self'"])
    .baseUri(["'self'"])
    .upgradeInsecureRequests()
    .build()

  return {
    "Content-Security-Policy": csp,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-DNS-Prefetch-Control": "off",
    "X-Download-Options": "noopen",
    "X-Permitted-Cross-Domain-Policies": "none",
  }
}

// 开发环境安全头部（较宽松）
export function getDevelopmentSecurityHeaders(): SecurityHeaders {
  const csp = new CSPBuilder()
    .defaultSrc(["'self'"])
    .scriptSrc([
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
      "http://localhost:*",
    ])
    .styleSrc(["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"])
    .imgSrc(["'self'", "data:", "https:", "http:", "blob:"])
    .fontSrc(["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"])
    .connectSrc(["'self'", "https:", "http:", "wss:", "ws:"])
    .mediaSrc(["'self'", "blob:", "data:"])
    .objectSrc(["'none'"])
    .frameSrc(["'self'"])
    .frameAncestors(["'self'"])
    .formAction(["'self'"])
    .baseUri(["'self'"])
    .build()

  return {
    "Content-Security-Policy": csp,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-DNS-Prefetch-Control": "off",
  }
}

// 生产环境安全头部（严格）
export function getProductionSecurityHeaders(): SecurityHeaders {
  const csp = new CSPBuilder()
    .defaultSrc(["'self'"])
    .scriptSrc(["'self'", "https://cdn.jsdelivr.net"])
    .styleSrc(["'self'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"])
    .imgSrc(["'self'", "data:", "https:", "blob:"])
    .fontSrc(["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"])
    .connectSrc(["'self'", "https://api.github.com", "wss://your-websocket-domain.com"])
    .mediaSrc(["'self'", "blob:", "data:"])
    .objectSrc(["'none'"])
    .frameSrc(["'none'"])
    .frameAncestors(["'none'"])
    .formAction(["'self'"])
    .baseUri(["'self'"])
    .upgradeInsecureRequests()
    .blockAllMixedContent()
    .build()

  return {
    "Content-Security-Policy": csp,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-DNS-Prefetch-Control": "off",
    "X-Download-Options": "noopen",
    "X-Permitted-Cross-Domain-Policies": "none",
  }
}

// Cookie安全配置
export interface SecureCookieOptions {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: "strict" | "lax" | "none"
  maxAge?: number
  domain?: string
  path?: string
}

// 获取安全Cookie选项
export function getSecureCookieOptions(isProduction = false): SecureCookieOptions {
  return {
    httpOnly: true,
    secure: isProduction, // 生产环境强制HTTPS
    sameSite: "strict",
    maxAge: 24 * 60 * 60, // 24小时
    path: "/",
  }
}

// 设置安全Cookie
export function setSecureCookie(name: string, value: string, options: SecureCookieOptions = {}): string {
  const defaultOptions = getSecureCookieOptions(process.env.NODE_ENV === "production")
  const finalOptions = { ...defaultOptions, ...options }

  let cookieString = `${name}=${encodeURIComponent(value)}`

  if (finalOptions.maxAge) {
    cookieString += `; Max-Age=${finalOptions.maxAge}`
  }

  if (finalOptions.domain) {
    cookieString += `; Domain=${finalOptions.domain}`
  }

  if (finalOptions.path) {
    cookieString += `; Path=${finalOptions.path}`
  }

  if (finalOptions.secure) {
    cookieString += "; Secure"
  }

  if (finalOptions.httpOnly) {
    cookieString += "; HttpOnly"
  }

  if (finalOptions.sameSite) {
    cookieString += `; SameSite=${finalOptions.sameSite}`
  }

  return cookieString
}

// 应用安全头部到响应
export function applySecurityHeaders(headers: Headers, environment: "development" | "production" = "production"): void {
  const securityHeaders =
    environment === "development" ? getDevelopmentSecurityHeaders() : getProductionSecurityHeaders()

  for (const [key, value] of Object.entries(securityHeaders)) {
    if (value) {
      headers.set(key, value)
    }
  }
}

// 检查请求头安全性
export function validateRequestHeaders(headers: Headers): { isValid: boolean; issues: string[] } {
  const issues: string[] = []

  // 检查User-Agent
  const userAgent = headers.get("user-agent")
  if (!userAgent || userAgent.length < 10) {
    issues.push("可疑的User-Agent")
  }

  // 检查Referer
  const referer = headers.get("referer")
  if (referer && !referer.startsWith("https://")) {
    issues.push("不安全的Referer")
  }

  // 检查Origin
  const origin = headers.get("origin")
  if (origin && !origin.startsWith("https://")) {
    issues.push("不安全的Origin")
  }

  // 检查Content-Type
  const contentType = headers.get("content-type")
  if (contentType && contentType.includes("text/html") && !contentType.includes("charset")) {
    issues.push("缺少字符集声明")
  }

  // 检查可疑的头部
  const suspiciousHeaders = ["x-forwarded-for", "x-real-ip", "x-cluster-client-ip"]
  for (const header of suspiciousHeaders) {
    if (headers.get(header)) {
      issues.push(`检测到代理头部: ${header}`)
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}

// CORS配置
export interface CORSOptions {
  origin?: string | string[] | boolean
  methods?: string[]
  allowedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
}

// 获取安全的CORS配置
export function getSecureCORSOptions(): CORSOptions {
  const allowedOrigins =
    process.env.NODE_ENV === "production"
      ? ["https://your-domain.com", "https://www.your-domain.com"]
      : ["http://localhost:3000", "http://127.0.0.1:3000"]

  return {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    credentials: true,
    maxAge: 86400, // 24小时
  }
}

// 验证CORS请求
export function validateCORSRequest(origin: string | null, method: string, allowedOrigins: string[]): boolean {
  if (!origin) return false

  // 检查Origin是否在允许列表中
  if (!allowedOrigins.includes(origin)) {
    return false
  }

  // 检查方法是否允许
  const allowedMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  if (!allowedMethods.includes(method.toUpperCase())) {
    return false
  }

  return true
}
