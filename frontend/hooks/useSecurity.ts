"use client"

import { useCallback, useEffect, useState, useContext } from "react"
import { toast } from "sonner"
import {
  validateFileType,
  validateFileSize,
  validateFileContent,
  sanitizeText,
  validationSchemas,
  ALLOWED_FILE_TYPES,
  FILE_SIZE_LIMITS,
} from "@/lib/security/validation"
import { concurrencyController, withRateLimit, withConcurrencyControl } from "@/lib/security/accessControl"
import { errorHandler, ErrorType, ErrorLevel } from "@/lib/security/errorHandler"
import { SecurityContext } from "@/components/security/SecurityProvider"
import type { Permission, Role } from "@/lib/security/types" // Import Permission and Role types

// 安全Hook
export function useSecurity() {
  const context = useContext(SecurityContext)
  if (context === undefined) {
    throw new Error("useSecurity must be used within a SecurityProvider")
  }
  return context
}

// 权限检查Hook
export function usePermission(permission: Permission) {
  const { hasPermission } = useSecurity()
  return hasPermission(permission)
}

// 角色检查Hook
export function useRole(role: Role) {
  const { hasRole } = useSecurity()
  return hasRole(role)
}

// 文件验证Hook
export function useFileValidation() {
  const validateFile = useCallback(
    async (
      file: File,
      category: keyof typeof ALLOWED_FILE_TYPES = "contracts",
    ): Promise<{ isValid: boolean; errors: string[] }> => {
      const errors: string[] = []

      try {
        // 文件类型验证
        if (!validateFileType(file, category)) {
          errors.push(`不支持的文件类型，仅支持: ${ALLOWED_FILE_TYPES[category].join(", ")}`)
        }

        // 文件大小验证
        if (!validateFileSize(file, category as keyof typeof FILE_SIZE_LIMITS)) {
          const maxSize = FILE_SIZE_LIMITS[category as keyof typeof FILE_SIZE_LIMITS]
          errors.push(`文件过大，最大允许 ${(maxSize / 1024 / 1024).toFixed(1)}MB`)
        }

        // 文件内容验证
        const isContentSafe = await validateFileContent(file)
        if (!isContentSafe) {
          errors.push("文件内容包含潜在的安全风险")
        }

        // 记录验证结果
        if (errors.length > 0) {
          errorHandler.logError({
            type: ErrorType.FILE_UPLOAD,
            level: ErrorLevel.MEDIUM,
            message: `File validation failed: ${errors.join(", ")}`,
            details: { fileName: file.name, fileSize: file.size, fileType: file.type },
          })
        }

        return { isValid: errors.length === 0, errors }
      } catch (error) {
        errorHandler.logError({
          type: ErrorType.FILE_UPLOAD,
          level: ErrorLevel.HIGH,
          message: "File validation error",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        })

        return { isValid: false, errors: ["文件验证失败"] }
      }
    },
    [],
  )

  const validateFiles = useCallback(
    async (
      files: File[],
      category: keyof typeof ALLOWED_FILE_TYPES = "contracts",
    ): Promise<{ validFiles: File[]; invalidFiles: Array<{ file: File; errors: string[] }> }> => {
      const validFiles: File[] = []
      const invalidFiles: Array<{ file: File; errors: string[] }> = []

      for (const file of files) {
        const { isValid, errors } = await validateFile(file, category)
        if (isValid) {
          validFiles.push(file)
        } else {
          invalidFiles.push({ file, errors })
        }
      }

      return { validFiles, invalidFiles }
    },
    [validateFile],
  )

  return { validateFile, validateFiles }
}

// 输入验证Hook
export function useInputValidation() {
  const validateInput = useCallback((input: string, type: "message" | "email" | "username" = "message") => {
    try {
      const schema = validationSchemas.userInput.pick({ [type]: true })
      const result = schema.safeParse({ [type]: input })

      if (!result.success) {
        const errors = result.error.errors.map((err) => err.message)
        return { isValid: false, errors, sanitized: sanitizeText(input) }
      }

      return { isValid: true, errors: [], sanitized: sanitizeText(input) }
    } catch (error) {
      errorHandler.logError({
        type: ErrorType.VALIDATION,
        level: ErrorLevel.MEDIUM,
        message: "Input validation error",
        details: { input: sanitizeText(input), error: error instanceof Error ? error.message : "Unknown error" },
      })
      return { isValid: false, errors: ["输入验证失败"], sanitized: sanitizeText(input) }
    }
  }, [])

  return { validateInput }
}

// 频率限制Hook
export function useRateLimit(action: string) {
  const { checkRateLimit, getRemainingRequests } = useSecurity()

  return {
    isAllowed: checkRateLimit(action),
    remaining: getRemainingRequests(action),
  }
}

// 并发控制Hook
export function useConcurrencyControl(identifier: string, maxConcurrent = 5) {
  const [activeTasks, setActiveTasks] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)

  const executeWithControl = useCallback(
    async (fn: () => Promise<any>): Promise<any> => {
      let requestId: string | null = null

      try {
        requestId = await concurrencyController.acquire(identifier)
        setActiveTasks(concurrencyController.getCurrentConcurrency(identifier))
        setIsBlocked(false)
        return await fn()
      } catch (error) {
        if (error instanceof Error && error.message.includes("并发请求数量超限")) {
          setIsBlocked(true)
          toast.error(`并发请求过多，最多允许 ${maxConcurrent} 个并发请求`)

          errorHandler.logError({
            type: ErrorType.RATE_LIMIT,
            level: ErrorLevel.MEDIUM,
            message: "Concurrency limit exceeded",
            details: { identifier, maxConcurrent },
          })
        }
        throw error
      } finally {
        if (requestId) {
          concurrencyController.release(identifier, requestId)
          setActiveTasks(concurrencyController.getCurrentConcurrency(identifier))
        }
      }
    },
    [identifier, maxConcurrent],
  )

  return {
    activeTasks,
    isBlocked,
    executeWithControl,
  }
}

// 安全API调用Hook
export function useSecureApiCall() {
  const { validateInput } = useInputValidation()
  const rateLimitHook = useRateLimit("api-calls") // 每分钟50次
  const concurrencyHook = useConcurrencyControl("api-calls", 3) // 最多3个并发

  const secureCall = useCallback(
    async (
      apiCall: () => Promise<any>,
      options: {
        validateParams?: Record<string, any>
        identifier?: string
        skipRateLimit?: boolean
        skipConcurrency?: boolean
      } = {},
    ): Promise<any | null> => {
      const { validateParams, identifier = "default", skipRateLimit = false, skipConcurrency = false } = options

      try {
        // 参数验证
        if (validateParams) {
          for (const [key, value] of Object.entries(validateParams)) {
            if (typeof value === "string") {
              const { isValid, errors } = validateInput(value)
              if (!isValid) {
                toast.error(`参数验证失败: ${errors.join(", ")}`)
                return null
              }
            }
          }
        }

        // 构建安全的API调用
        let secureApiCall = apiCall

        // 应用频率限制
        if (!skipRateLimit) {
          secureApiCall = withRateLimit(secureApiCall, identifier)
        }

        // 应用并发控制
        if (!skipConcurrency) {
          secureApiCall = withConcurrencyControl(secureApiCall, identifier)
        }

        // 执行API调用
        const result = await secureApiCall()

        // 记录成功调用
        errorHandler.logError({
          type: ErrorType.UNKNOWN,
          level: ErrorLevel.LOW,
          message: "API call successful",
          details: { identifier, timestamp: Date.now() },
        })

        return result
      } catch (error) {
        // 记录API调用错误
        errorHandler.logError({
          type: ErrorType.NETWORK,
          level: ErrorLevel.HIGH,
          message: "Secure API call failed",
          details: {
            identifier,
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: Date.now(),
          },
        })

        // 显示用户友好的错误信息
        if (error instanceof Error) {
          if (error.message.includes("请求过于频繁")) {
            toast.warning(error.message)
          } else if (error.message.includes("并发请求数量超限")) {
            toast.error(error.message)
          } else {
            toast.error("API调用失败，请稍后重试")
          }
        }

        throw error
      }
    },
    [validateInput],
  )

  return {
    secureCall,
    rateLimitStatus: rateLimitHook,
    concurrencyStatus: concurrencyHook,
  }
}

// 安全状态管理Hook
export function useSecureState<T>(
  initialValue: T,
  options: {
    encrypt?: boolean
    ttl?: number
    key?: string
  } = {},
) {
  const { encrypt = false, ttl, key } = options
  const [state, setState] = useState<T>(initialValue)

  // 安全设置状态
  const setSecureState = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      try {
        const value = typeof newValue === "function" ? (newValue as (prev: T) => T)(state) : newValue

        setState(value)

        // 如果需要加密存储
        if (encrypt && key) {
          const { sensitiveDataManager } = require("@/lib/security/encryption")
          if (ttl) {
            sensitiveDataManager.storeSensitive(key, value, ttl)
          } else {
            sensitiveDataManager.storeNonSensitive(key, value)
          }
        }
      } catch (error) {
        errorHandler.logError({
          type: ErrorType.UNKNOWN,
          level: ErrorLevel.MEDIUM,
          message: "Secure state update failed",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        })
      }
    },
    [state, encrypt, key, ttl],
  )

  // 从加密存储恢复状态
  useEffect(() => {
    if (encrypt && key) {
      try {
        const { sensitiveDataManager } = require("@/lib/security/encryption")
        const stored = ttl ? sensitiveDataManager.getSensitive(key) : sensitiveDataManager.getNonSensitive(key)

        if (stored !== null) {
          setState(stored)
        }
      } catch (error) {
        errorHandler.logError({
          type: ErrorType.UNKNOWN,
          level: ErrorLevel.LOW,
          message: "Failed to restore secure state",
          details: { key, error: error instanceof Error ? error.message : "Unknown error" },
        })
      }
    }
  }, [encrypt, key, ttl])

  return [state, setSecureState] as const
}
