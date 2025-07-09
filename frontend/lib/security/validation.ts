import DOMPurify from "dompurify"
import { z } from "zod"

// 文件类型验证配置
export const FILE_VALIDATION_CONFIG = {
  allowedTypes: {
    json: {
      extensions: [".json"],
      mimeTypes: ["application/json"],
      maxSize: 50 * 1024 * 1024, // 50MB
    },
    image: {
      extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      maxSize: 10 * 1024 * 1024, // 10MB
    },
    document: {
      extensions: [".pdf", ".doc", ".docx", ".txt"],
      mimeTypes: ["application/pdf", "application/msword", "text/plain"],
      maxSize: 25 * 1024 * 1024, // 25MB
    },
  },
  maxTotalSize: 100 * 1024 * 1024, // 100MB
  maxFiles: 10,
}

// 危险文件扩展名黑名单
const DANGEROUS_EXTENSIONS = [
  ".exe",
  ".bat",
  ".cmd",
  ".com",
  ".pif",
  ".scr",
  ".vbs",
  ".js",
  ".jar",
  ".app",
  ".deb",
  ".pkg",
  ".dmg",
  ".iso",
  ".msi",
  ".run",
  ".sh",
  ".ps1",
]

// SQL注入模式
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  /(--|\/\*|\*\/|;|'|"|`)/g,
  /(\bOR\b|\bAND\b).*?[=<>]/gi,
  /\b(WAITFOR|DELAY)\b/gi,
  /\b(XP_|SP_)\w+/gi,
]

// XSS攻击模式
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /<link\b[^>]*>/gi,
  /<meta\b[^>]*>/gi,
]

// 文件验证函数
export function validateFile(file: File): { isValid: boolean; error?: string } {
  // 检查文件名
  if (!file.name || file.name.length > 255) {
    return { isValid: false, error: "文件名无效或过长" }
  }

  // 检查危险扩展名
  const extension = "." + file.name.split(".").pop()?.toLowerCase()
  if (DANGEROUS_EXTENSIONS.includes(extension)) {
    return { isValid: false, error: "不允许的文件类型" }
  }

  // 检查文件大小
  if (file.size === 0) {
    return { isValid: false, error: "文件为空" }
  }

  // 根据文件类型验证
  const fileType = getFileType(file)
  const config = FILE_VALIDATION_CONFIG.allowedTypes[fileType as keyof typeof FILE_VALIDATION_CONFIG.allowedTypes]

  if (!config) {
    return { isValid: false, error: "不支持的文件类型" }
  }

  if (file.size > config.maxSize) {
    return { isValid: false, error: `文件大小超过限制 (${formatFileSize(config.maxSize)})` }
  }

  if (!config.extensions.includes(extension)) {
    return { isValid: false, error: "文件扩展名不匹配" }
  }

  if (!config.mimeTypes.includes(file.type)) {
    return { isValid: false, error: "MIME类型不匹配" }
  }

  return { isValid: true }
}

// 批量文件验证
export function validateFiles(files: File[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (files.length > FILE_VALIDATION_CONFIG.maxFiles) {
    errors.push(`文件数量超过限制 (${FILE_VALIDATION_CONFIG.maxFiles})`)
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  if (totalSize > FILE_VALIDATION_CONFIG.maxTotalSize) {
    errors.push(`总文件大小超过限制 (${formatFileSize(FILE_VALIDATION_CONFIG.maxTotalSize)})`)
  }

  files.forEach((file, index) => {
    const validation = validateFile(file)
    if (!validation.isValid) {
      errors.push(`文件 ${index + 1}: ${validation.error}`)
    }
  })

  return { isValid: errors.length === 0, errors }
}

// 获取文件类型
function getFileType(file: File): string {
  const extension = "." + file.name.split(".").pop()?.toLowerCase()

  if ([".json"].includes(extension)) return "json"
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(extension)) return "image"
  if ([".pdf", ".doc", ".docx", ".txt"].includes(extension)) return "document"

  return "unknown"
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// HTML内容清理
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "code", "pre", "blockquote", "h1", "h2", "h3", "h4", "h5", "h6"],
    ALLOWED_ATTR: ["class", "id"],
    KEEP_CONTENT: true,
    ALLOW_DATA_ATTR: false,
  })
}

// 输入内容清理
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return ""

  // 移除控制字符
  let cleaned = input.replace(/[\x00-\x1F\x7F]/g, "")

  // 检查SQL注入
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(cleaned)) {
      throw new Error("检测到潜在的SQL注入攻击")
    }
  }

  // 检查XSS攻击
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, "")
    }
  }

  // 限制长度
  if (cleaned.length > 10000) {
    cleaned = cleaned.substring(0, 10000)
  }

  return cleaned.trim()
}

// URL验证
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    // 只允许HTTP和HTTPS协议
    return ["http:", "https:"].includes(urlObj.protocol)
  } catch {
    return false
  }
}

// 邮箱验证
export const emailSchema = z.string().email("请输入有效的邮箱地址")

// 密码验证
export const passwordSchema = z
  .string()
  .min(8, "密码至少8位")
  .regex(/[A-Z]/, "密码必须包含大写字母")
  .regex(/[a-z]/, "密码必须包含小写字母")
  .regex(/[0-9]/, "密码必须包含数字")
  .regex(/[^A-Za-z0-9]/, "密码必须包含特殊字符")

// 用户名验证
export const usernameSchema = z
  .string()
  .min(3, "用户名至少3位")
  .max(20, "用户名最多20位")
  .regex(/^[a-zA-Z0-9_-]+$/, "用户名只能包含字母、数字、下划线和连字符")

// 文件内容验证（异步）
export async function validateFileContent(file: File): Promise<{ isValid: boolean; error?: string }> {
  try {
    if (file.type === "application/json") {
      const text = await file.text()
      JSON.parse(text) // 验证JSON格式

      // 检查JSON内容是否包含恶意代码
      if (XSS_PATTERNS.some((pattern) => pattern.test(text))) {
        return { isValid: false, error: "文件内容包含潜在的恶意代码" }
      }
    }

    return { isValid: true }
  } catch (error) {
    return { isValid: false, error: "文件内容格式错误" }
  }
}

// 表单验证Schema
export const contactFormSchema = z.object({
  name: z.string().min(1, "请输入姓名").max(50, "姓名过长"),
  email: emailSchema,
  subject: z.string().min(1, "请输入主题").max(100, "主题过长"),
  message: z.string().min(10, "消息至少10个字符").max(1000, "消息过长"),
})

export const uploadFormSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, "请选择至少一个文件"),
  description: z.string().max(500, "描述过长").optional(),
  tags: z.array(z.string()).max(10, "标签过多").optional(),
})

// 实时验证Hook
export function useValidation<T>(schema: z.ZodSchema<T>) {
  return {
    validate: (data: unknown) => {
      try {
        const result = schema.parse(data)
        return { success: true, data: result, errors: [] }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            success: false,
            data: null,
            errors: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          }
        }
        return {
          success: false,
          data: null,
          errors: [{ field: "unknown", message: "验证失败" }],
        }
      }
    },

    validateField: (field: string, value: unknown) => {
      try {
        const fieldSchema = schema.shape?.[field as keyof typeof schema.shape]
        if (fieldSchema) {
          fieldSchema.parse(value)
          return { success: true, error: null }
        }
        return { success: true, error: null }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return { success: false, error: error.errors[0]?.message || "验证失败" }
        }
        return { success: false, error: "验证失败" }
      }
    },
  }
}
