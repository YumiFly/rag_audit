// 角色枚举
export enum Role {
  GUEST = "guest",
  USER = "user",
  MODERATOR = "moderator",
  ADMIN = "admin",
}

// 权限枚举
export enum Permission {
  READ = "read",
  WRITE = "write",
  DELETE = "delete",
  UPLOAD = "upload",
  DOWNLOAD = "download",
  MODERATE = "moderate",
  ADMIN = "admin",
  ANALYZE = "analyze",
  EXPORT = "export",
}

// 资源类型枚举
export enum Resource {
  FILE = "file",
  ANALYSIS = "analysis",
  CHAT = "chat",
  USER = "user",
  SYSTEM = "system",
}

// 权限配置
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.GUEST]: [Permission.READ],
  [Role.USER]: [
    Permission.READ,
    Permission.WRITE,
    Permission.UPLOAD,
    Permission.DOWNLOAD,
    Permission.ANALYZE,
    Permission.EXPORT,
  ],
  [Role.MODERATOR]: [
    Permission.READ,
    Permission.WRITE,
    Permission.DELETE,
    Permission.UPLOAD,
    Permission.DOWNLOAD,
    Permission.MODERATE,
    Permission.ANALYZE,
    Permission.EXPORT,
  ],
  [Role.ADMIN]: Object.values(Permission),
}

// 频率限制配置
interface RateLimitConfig {
  windowMs: number // 时间窗口（毫秒）
  maxRequests: number // 最大请求数
  blockDurationMs: number // 阻塞时长（毫秒）
}

const RATE_LIMIT_CONFIG: Record<string, RateLimitConfig> = {
  "file-upload": {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 10,
    blockDurationMs: 5 * 60 * 1000, // 5分钟
  },
  "api-call": {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 100,
    blockDurationMs: 60 * 1000, // 1分钟
  },
  "chat-message": {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 30,
    blockDurationMs: 2 * 60 * 1000, // 2分钟
  },
  "login-attempt": {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 5,
    blockDurationMs: 30 * 60 * 1000, // 30分钟
  },
}

// 访问控制类
export class AccessControl {
  private static instance: AccessControl
  private userRole: Role = Role.GUEST
  private userId?: string
  private sessionId?: string

  static getInstance(): AccessControl {
    if (!AccessControl.instance) {
      AccessControl.instance = new AccessControl()
    }
    return AccessControl.instance
  }

  // 设置用户角色
  setUserRole(role: Role, userId?: string, sessionId?: string): void {
    this.userRole = role
    this.userId = userId
    this.sessionId = sessionId
  }

  // 获取用户角色
  getUserRole(): Role {
    return this.userRole
  }

  // 检查权限
  hasPermission(permission: Permission, resource?: Resource): boolean {
    const userPermissions = ROLE_PERMISSIONS[this.userRole] || []
    return userPermissions.includes(permission)
  }

  // 检查多个权限
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission))
  }

  // 检查所有权限
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every((permission) => this.hasPermission(permission))
  }

  // 检查角色级别
  hasRoleLevel(requiredRole: Role): boolean {
    const roleLevels = {
      [Role.GUEST]: 0,
      [Role.USER]: 1,
      [Role.MODERATOR]: 2,
      [Role.ADMIN]: 3,
    }

    return roleLevels[this.userRole] >= roleLevels[requiredRole]
  }

  // 获取用户权限列表
  getUserPermissions(): Permission[] {
    return ROLE_PERMISSIONS[this.userRole] || []
  }

  // 权限检查装饰器
  requirePermission(permission: Permission) {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value
      descriptor.value = function (...args: any[]) {
        if (!AccessControl.getInstance().hasPermission(permission)) {
          throw new Error(`权限不足：需要 ${permission} 权限`)
        }
        return method.apply(this, args)
      }
    }
  }

  // 角色检查装饰器
  requireRole(role: Role) {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value
      descriptor.value = function (...args: any[]) {
        if (!AccessControl.getInstance().hasRoleLevel(role)) {
          throw new Error(`权限不足：需要 ${role} 角色或更高级别`)
        }
        return method.apply(this, args)
      }
    }
  }
}

// 频率限制类
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private blocked: Map<string, number> = new Map()

  // 检查是否允许请求
  isAllowed(identifier: string, action = "default"): boolean {
    const config = RATE_LIMIT_CONFIG[action] || RATE_LIMIT_CONFIG["api-call"]
    const key = `${identifier}:${action}`
    const now = Date.now()

    // 检查是否被阻塞
    const blockedUntil = this.blocked.get(key)
    if (blockedUntil && now < blockedUntil) {
      return false
    }

    // 清理过期的阻塞记录
    if (blockedUntil && now >= blockedUntil) {
      this.blocked.delete(key)
    }

    // 获取请求历史
    const requests = this.requests.get(key) || []

    // 清理过期的请求记录
    const validRequests = requests.filter((time) => now - time < config.windowMs)

    // 检查是否超过限制
    if (validRequests.length >= config.maxRequests) {
      // 阻塞用户
      this.blocked.set(key, now + config.blockDurationMs)
      return false
    }

    // 记录新请求
    validRequests.push(now)
    this.requests.set(key, validRequests)

    return true
  }

  // 获取剩余请求次数
  getRemainingRequests(identifier: string, action = "default"): number {
    const config = RATE_LIMIT_CONFIG[action] || RATE_LIMIT_CONFIG["api-call"]
    const key = `${identifier}:${action}`
    const now = Date.now()

    const requests = this.requests.get(key) || []
    const validRequests = requests.filter((time) => now - time < config.windowMs)

    return Math.max(0, config.maxRequests - validRequests.length)
  }

  // 获取重置时间
  getResetTime(identifier: string, action = "default"): number {
    const config = RATE_LIMIT_CONFIG[action] || RATE_LIMIT_CONFIG["api-call"]
    const key = `${identifier}:${action}`
    const now = Date.now()

    const requests = this.requests.get(key) || []
    if (requests.length === 0) return now

    const oldestRequest = Math.min(...requests)
    return oldestRequest + config.windowMs
  }

  // 清理过期数据
  cleanup(): void {
    const now = Date.now()

    // 清理过期的请求记录
    for (const [key, requests] of this.requests.entries()) {
      const action = key.split(":")[1] || "default"
      const config = RATE_LIMIT_CONFIG[action] || RATE_LIMIT_CONFIG["api-call"]
      const validRequests = requests.filter((time) => now - time < config.windowMs)

      if (validRequests.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, validRequests)
      }
    }

    // 清理过期的阻塞记录
    for (const [key, blockedUntil] of this.blocked.entries()) {
      if (now >= blockedUntil) {
        this.blocked.delete(key)
      }
    }
  }

  // 重置用户限制
  reset(identifier: string, action?: string): void {
    if (action) {
      const key = `${identifier}:${action}`
      this.requests.delete(key)
      this.blocked.delete(key)
    } else {
      // 重置所有相关记录
      for (const key of this.requests.keys()) {
        if (key.startsWith(`${identifier}:`)) {
          this.requests.delete(key)
        }
      }
      for (const key of this.blocked.keys()) {
        if (key.startsWith(`${identifier}:`)) {
          this.blocked.delete(key)
        }
      }
    }
  }
}

// 并发控制类
export class ConcurrencyControl {
  private activeRequests: Map<string, Set<string>> = new Map()
  private maxConcurrent: Map<string, number> = new Map()

  constructor() {
    // 设置默认并发限制
    this.maxConcurrent.set("file-upload", 3)
    this.maxConcurrent.set("api-call", 10)
    this.maxConcurrent.set("analysis", 2)
  }

  // 获取许可
  async acquire(identifier: string, action = "default"): Promise<string> {
    const key = `${identifier}:${action}`
    const maxConcurrent = this.maxConcurrent.get(action) || 5

    return new Promise((resolve, reject) => {
      const check = () => {
        const activeSet = this.activeRequests.get(key) || new Set()

        if (activeSet.size < maxConcurrent) {
          const requestId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          activeSet.add(requestId)
          this.activeRequests.set(key, activeSet)
          resolve(requestId)
        } else {
          // 等待一段时间后重试
          setTimeout(check, 100)
        }
      }

      check()
    })
  }

  // 释放许可
  release(identifier: string, requestId: string, action = "default"): void {
    const key = `${identifier}:${action}`
    const activeSet = this.activeRequests.get(key)

    if (activeSet) {
      activeSet.delete(requestId)
      if (activeSet.size === 0) {
        this.activeRequests.delete(key)
      }
    }
  }

  // 获取当前并发数
  getCurrentConcurrency(identifier: string, action = "default"): number {
    const key = `${identifier}:${action}`
    const activeSet = this.activeRequests.get(key)
    return activeSet ? activeSet.size : 0
  }

  // 设置最大并发数
  setMaxConcurrency(action: string, max: number): void {
    this.maxConcurrent.set(action, max)
  }
}

// 全局实例
export const accessControl = AccessControl.getInstance()
export const rateLimiter = new RateLimiter()
export const concurrencyControl = new ConcurrencyControl()

// 定期清理
setInterval(() => {
  rateLimiter.cleanup()
}, 60000) // 每分钟清理一次

// 便捷函数
export function checkPermission(permission: Permission): boolean {
  return accessControl.hasPermission(permission)
}

export function requirePermission(permission: Permission): void {
  if (!accessControl.hasPermission(permission)) {
    throw new Error(`权限不足：需要 ${permission} 权限`)
  }
}

export function checkRateLimit(identifier: string, action = "default"): boolean {
  return rateLimiter.isAllowed(identifier, action)
}

export function requireRateLimit(identifier: string, action = "default"): void {
  if (!rateLimiter.isAllowed(identifier, action)) {
    const resetTime = rateLimiter.getResetTime(identifier, action)
    const waitTime = Math.ceil((resetTime - Date.now()) / 1000)
    throw new Error(`请求过于频繁，请等待 ${waitTime} 秒后重试`)
  }
}
