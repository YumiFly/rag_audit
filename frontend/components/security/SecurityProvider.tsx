"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { Role, type Permission, accessControl, rateLimiter } from "@/lib/security/accessControl"
import { errorHandler, ErrorType, ErrorLevel } from "@/lib/security/errorHandler"
import { secureStorage, memoryStorage } from "@/lib/security/encryption"

interface SecurityContextType {
  // 用户信息
  role: Role
  userId?: string
  sessionId?: string

  // 权限检查
  hasPermission: (permission: Permission) => boolean
  hasRole: (role: Role) => boolean

  // 频率限制
  checkRateLimit: (action: string) => boolean
  getRemainingRequests: (action: string) => number

  // 错误处理
  reportError: (type: ErrorType, level: ErrorLevel, message: string, details?: any) => void

  // 安全操作
  login: (role: Role, userId: string) => void
  logout: () => void

  // 自动登出
  autoLogoutEnabled: boolean
  setAutoLogoutEnabled: (enabled: boolean) => void
  lastActivity: Date
  updateActivity: () => void
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined)

interface SecurityProviderProps {
  children: React.ReactNode
  initialRole?: Role
  autoLogoutEnabled?: boolean
  autoLogoutTimeout?: number // 分钟
  rateLimitEnabled?: boolean
}

export function SecurityProvider({
  children,
  initialRole = Role.GUEST,
  autoLogoutEnabled = true,
  autoLogoutTimeout = 30,
  rateLimitEnabled = true,
}: SecurityProviderProps) {
  const [role, setRole] = useState<Role>(initialRole)
  const [userId, setUserId] = useState<string>()
  const [sessionId, setSessionId] = useState<string>()
  const [lastActivity, setLastActivity] = useState<Date>(new Date())
  const [autoLogoutEnabledState, setAutoLogoutEnabledState] = useState(autoLogoutEnabled)

  // 生成会话ID
  const generateSessionId = useCallback((): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // 更新活动时间
  const updateActivity = useCallback(() => {
    setLastActivity(new Date())
  }, [])

  // 权限检查
  const hasPermission = useCallback((permission: Permission): boolean => {
    return accessControl.hasPermission(permission)
  }, [])

  // 角色检查
  const hasRole = useCallback((requiredRole: Role): boolean => {
    return accessControl.hasRoleLevel(requiredRole)
  }, [])

  // 频率限制检查
  const checkRateLimit = useCallback(
    (action: string): boolean => {
      if (!rateLimitEnabled || !userId) return true
      return rateLimiter.isAllowed(userId, action)
    },
    [rateLimitEnabled, userId],
  )

  // 获取剩余请求次数
  const getRemainingRequests = useCallback(
    (action: string): number => {
      if (!rateLimitEnabled || !userId) return 999
      return rateLimiter.getRemainingRequests(userId, action)
    },
    [rateLimitEnabled, userId],
  )

  // 错误报告
  const reportError = useCallback((type: ErrorType, level: ErrorLevel, message: string, details?: any) => {
    errorHandler.logError(type, level, message, details)
  }, [])

  // 登录
  const login = useCallback(
    (newRole: Role, newUserId: string) => {
      const newSessionId = generateSessionId()

      setRole(newRole)
      setUserId(newUserId)
      setSessionId(newSessionId)

      // 更新访问控制
      accessControl.setUserRole(newRole, newUserId, newSessionId)

      // 存储会话信息
      secureStorage.setItem("user_session", {
        role: newRole,
        userId: newUserId,
        sessionId: newSessionId,
        loginTime: new Date().toISOString(),
      })

      // 存储到内存（敏感信息）
      memoryStorage.setItem("session_active", true, 30 * 60 * 1000) // 30分钟

      updateActivity()

      // 记录登录事件
      reportError(ErrorType.AUTHENTICATION, ErrorLevel.LOW, "User logged in", {
        userId: newUserId,
        role: newRole,
      })
    },
    [generateSessionId, updateActivity, reportError],
  )

  // 登出
  const logout = useCallback(() => {
    // 记录登出事件
    reportError(ErrorType.AUTHENTICATION, ErrorLevel.LOW, "User logged out", {
      userId,
      sessionDuration: Date.now() - lastActivity.getTime(),
    })

    // 清理状态
    setRole(Role.GUEST)
    setUserId(undefined)
    setSessionId(undefined)

    // 更新访问控制
    accessControl.setUserRole(Role.GUEST)

    // 清理存储
    secureStorage.removeItem("user_session")
    memoryStorage.removeItem("session_active")

    // 重置频率限制
    if (userId) {
      rateLimiter.reset(userId)
    }
  }, [userId, lastActivity, reportError])

  // 自动登出检查
  useEffect(() => {
    if (!autoLogoutEnabledState || role === Role.GUEST) return

    const checkAutoLogout = () => {
      const now = new Date()
      const timeSinceLastActivity = now.getTime() - lastActivity.getTime()
      const timeoutMs = autoLogoutTimeout * 60 * 1000

      if (timeSinceLastActivity > timeoutMs) {
        reportError(ErrorType.AUTHENTICATION, ErrorLevel.MEDIUM, "Auto logout due to inactivity", {
          timeSinceLastActivity,
          timeoutMs,
        })
        logout()
      }
    }

    const interval = setInterval(checkAutoLogout, 60000) // 每分钟检查一次
    return () => clearInterval(interval)
  }, [autoLogoutEnabledState, role, lastActivity, autoLogoutTimeout, logout, reportError])

  // 活动监听
  useEffect(() => {
    if (role === Role.GUEST) return

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

    const handleActivity = () => {
      updateActivity()
    }

    // 节流处理，避免过于频繁的更新
    let throttleTimer: NodeJS.Timeout | null = null
    const throttledHandleActivity = () => {
      if (throttleTimer) return
      throttleTimer = setTimeout(() => {
        handleActivity()
        throttleTimer = null
      }, 1000) // 1秒内最多更新一次
    }

    events.forEach((event) => {
      document.addEventListener(event, throttledHandleActivity, true)
    })

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, throttledHandleActivity, true)
      })
      if (throttleTimer) {
        clearTimeout(throttleTimer)
      }
    }
  }, [role, updateActivity])

  // 页面可见性变化处理
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateActivity()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [updateActivity])

  // 恢复会话
  useEffect(() => {
    const savedSession = secureStorage.getItem("user_session")
    if (savedSession && savedSession.userId && savedSession.role) {
      // 检查会话是否仍然有效
      const isSessionActive = memoryStorage.getItem("session_active")
      if (isSessionActive) {
        setRole(savedSession.role)
        setUserId(savedSession.userId)
        setSessionId(savedSession.sessionId)
        accessControl.setUserRole(savedSession.role, savedSession.userId, savedSession.sessionId)
        updateActivity()
      } else {
        // 会话已过期，清理
        secureStorage.removeItem("user_session")
      }
    }
  }, [updateActivity])

  // 页面卸载时的清理
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (role !== Role.GUEST) {
        // 更新最后活动时间
        secureStorage.setItem("last_activity", new Date().toISOString())
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [role])

  const contextValue: SecurityContextType = {
    role,
    userId,
    sessionId,
    hasPermission,
    hasRole,
    checkRateLimit,
    getRemainingRequests,
    reportError,
    login,
    logout,
    autoLogoutEnabled: autoLogoutEnabledState,
    setAutoLogoutEnabled: setAutoLogoutEnabledState,
    lastActivity,
    updateActivity,
  }

  return <SecurityContext.Provider value={contextValue}>{children}</SecurityContext.Provider>
}

export function useSecurity() {
  const context = useContext(SecurityContext)
  if (context === undefined) {
    throw new Error("useSecurity must be used within a SecurityProvider")
  }
  return context
}

// 权限守卫组件
interface PermissionGuardProps {
  permission: Permission
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGuard({ permission, fallback = null, children }: PermissionGuardProps) {
  const { hasPermission } = useSecurity()

  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// 角色守卫组件
interface RoleGuardProps {
  role: Role
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function RoleGuard({ role, fallback = null, children }: RoleGuardProps) {
  const { hasRole } = useSecurity()

  if (!hasRole(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// 频率限制守卫组件
interface RateLimitGuardProps {
  action: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function RateLimitGuard({ action, fallback = null, children }: RateLimitGuardProps) {
  const { checkRateLimit } = useSecurity()

  if (!checkRateLimit(action)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
