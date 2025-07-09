import { toast } from "sonner"

// 错误级别枚举
export enum ErrorLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// 错误类型枚举
export enum ErrorType {
  VALIDATION = "validation",
  NETWORK = "network",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  SERVER = "server",
  CLIENT = "client",
  SECURITY = "security",
  PERFORMANCE = "performance",
}

// 错误接口
export interface SecurityError {
  id: string
  type: ErrorType
  level: ErrorLevel
  message: string
  details?: any
  timestamp: Date
  userId?: string
  sessionId?: string
  userAgent?: string
  url?: string
  stack?: string
}

// 敏感信息模式
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /auth/i,
  /credential/i,
  /session/i,
  /cookie/i,
  /bearer/i,
  /api[_-]?key/i,
]

// 敏感数据清理
function sanitizeErrorData(data: any): any {
  if (typeof data === "string") {
    // 检查是否包含敏感信息
    if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(data))) {
      return "[REDACTED]"
    }
    return data
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeErrorData)
  }

  if (data && typeof data === "object") {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(key))) {
        sanitized[key] = "[REDACTED]"
      } else {
        sanitized[key] = sanitizeErrorData(value)
      }
    }
    return sanitized
  }

  return data
}

// 错误处理器类
export class SecurityErrorHandler {
  private static instance: SecurityErrorHandler
  private errors: SecurityError[] = []
  private maxErrors = 1000
  private reportingEndpoint = "/api/errors"

  static getInstance(): SecurityErrorHandler {
    if (!SecurityErrorHandler.instance) {
      SecurityErrorHandler.instance = new SecurityErrorHandler()
    }
    return SecurityErrorHandler.instance
  }

  // 记录错误
  logError(type: ErrorType, level: ErrorLevel, message: string, details?: any, error?: Error): string {
    const errorId = this.generateErrorId()

    const securityError: SecurityError = {
      id: errorId,
      type,
      level,
      message,
      details: sanitizeErrorData(details),
      timestamp: new Date(),
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      stack: error?.stack,
    }

    // 添加到错误列表
    this.errors.push(securityError)

    // 保持错误数量限制
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // 根据错误级别决定处理方式
    this.handleErrorByLevel(securityError)

    // 存储到本地（用于离线时的错误报告）
    this.storeErrorLocally(securityError)

    return errorId
  }

  // 根据错误级别处理
  private handleErrorByLevel(error: SecurityError) {
    switch (error.level) {
      case ErrorLevel.LOW:
        console.log("Low level error:", error)
        break

      case ErrorLevel.MEDIUM:
        console.warn("Medium level error:", error)
        this.showUserNotification(error, "warning")
        break

      case ErrorLevel.HIGH:
        console.error("High level error:", error)
        this.showUserNotification(error, "error")
        this.reportErrorToServer(error)
        break

      case ErrorLevel.CRITICAL:
        console.error("Critical error:", error)
        this.showUserNotification(error, "error")
        this.reportErrorToServer(error)
        this.triggerEmergencyProtocol(error)
        break
    }
  }

  // 显示用户通知
  private showUserNotification(error: SecurityError, type: "warning" | "error") {
    const userMessage = this.getUserFriendlyMessage(error)

    if (type === "error") {
      toast.error(userMessage, {
        duration: 6000,
        action: {
          label: "详情",
          onClick: () => this.showErrorDetails(error.id),
        },
      })
    } else {
      toast.warning(userMessage, {
        duration: 4000,
      })
    }
  }

  // 获取用户友好的错误消息
  private getUserFriendlyMessage(error: SecurityError): string {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return "输入数据验证失败，请检查您的输入"
      case ErrorType.NETWORK:
        return "网络连接出现问题，请检查您的网络连接"
      case ErrorType.AUTHENTICATION:
        return "身份验证失败，请重新登录"
      case ErrorType.AUTHORIZATION:
        return "您没有权限执行此操作"
      case ErrorType.SERVER:
        return "服务器出现问题，请稍后重试"
      case ErrorType.SECURITY:
        return "检测到安全问题，操作已被阻止"
      case ErrorType.PERFORMANCE:
        return "系统响应较慢，请稍后重试"
      default:
        return "操作失败，请稍后重试"
    }
  }

  // 上报错误到服务器
  private async reportErrorToServer(error: SecurityError) {
    try {
      await fetch(this.reportingEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(error),
      })
    } catch (reportError) {
      console.error("Failed to report error to server:", reportError)
    }
  }

  // 触发紧急协议
  private triggerEmergencyProtocol(error: SecurityError) {
    // 清理敏感数据
    this.clearSensitiveData()

    // 记录紧急事件
    console.error("EMERGENCY PROTOCOL TRIGGERED:", error)

    // 可以添加更多紧急处理逻辑
    // 例如：强制登出、禁用某些功能等
  }

  // 清理敏感数据
  private clearSensitiveData() {
    try {
      // 清理localStorage中的敏感数据
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && SENSITIVE_PATTERNS.some((pattern) => pattern.test(key))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key))

      // 清理sessionStorage中的敏感数据
      const sessionKeysToRemove = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && SENSITIVE_PATTERNS.some((pattern) => pattern.test(key))) {
          sessionKeysToRemove.push(key)
        }
      }
      sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key))
    } catch (error) {
      console.error("Failed to clear sensitive data:", error)
    }
  }

  // 本地存储错误
  private storeErrorLocally(error: SecurityError) {
    try {
      const storedErrors = JSON.parse(localStorage.getItem("security_errors") || "[]")
      storedErrors.push(error)

      // 只保留最近的100个错误
      if (storedErrors.length > 100) {
        storedErrors.splice(0, storedErrors.length - 100)
      }

      localStorage.setItem("security_errors", JSON.stringify(storedErrors))
    } catch (error) {
      console.error("Failed to store error locally:", error)
    }
  }

  // 显示错误详情
  private showErrorDetails(errorId: string) {
    const error = this.errors.find((e) => e.id === errorId)
    if (error) {
      console.group(`Error Details: ${errorId}`)
      console.log("Type:", error.type)
      console.log("Level:", error.level)
      console.log("Message:", error.message)
      console.log("Timestamp:", error.timestamp)
      console.log("Details:", error.details)
      console.groupEnd()
    }
  }

  // 生成错误ID
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 获取当前用户ID
  private getCurrentUserId(): string | undefined {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      return user.id
    } catch {
      return undefined
    }
  }

  // 获取会话ID
  private getSessionId(): string | undefined {
    try {
      return sessionStorage.getItem("session_id") || undefined
    } catch {
      return undefined
    }
  }

  // 获取错误统计
  getErrorStats() {
    const stats = {
      total: this.errors.length,
      byType: {} as Record<ErrorType, number>,
      byLevel: {} as Record<ErrorLevel, number>,
      recent: this.errors.filter((e) => Date.now() - e.timestamp.getTime() < 24 * 60 * 60 * 1000).length,
    }

    this.errors.forEach((error) => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
      stats.byLevel[error.level] = (stats.byLevel[error.level] || 0) + 1
    })

    return stats
  }

  // 清理旧错误
  cleanupOldErrors(maxAge: number = 7 * 24 * 60 * 60 * 1000) {
    const cutoff = Date.now() - maxAge
    this.errors = this.errors.filter((error) => error.timestamp.getTime() > cutoff)
  }
}

// 全局错误处理器
export const errorHandler = SecurityErrorHandler.getInstance()

// 便捷函数
export function logError(type: ErrorType, level: ErrorLevel, message: string, details?: any, error?: Error): string {
  return errorHandler.logError(type, level, message, details, error)
}

// React错误边界
export function handleReactError(error: Error, errorInfo: any) {
  logError(ErrorType.CLIENT, ErrorLevel.HIGH, "React component error", { errorInfo }, error)
}

// 网络错误处理
export function handleNetworkError(error: any, url: string) {
  const level = error.status >= 500 ? ErrorLevel.HIGH : ErrorLevel.MEDIUM
  logError(
    ErrorType.NETWORK,
    level,
    `Network error: ${error.status || "Unknown"}`,
    { url, status: error.status, statusText: error.statusText },
    error,
  )
}

// 验证错误处理
export function handleValidationError(field: string, message: string, value?: any) {
  logError(ErrorType.VALIDATION, ErrorLevel.LOW, `Validation error in field: ${field}`, { field, value, message })
}

// 安全错误处理
export function handleSecurityError(message: string, details?: any) {
  logError(ErrorType.SECURITY, ErrorLevel.CRITICAL, message, details)
}
