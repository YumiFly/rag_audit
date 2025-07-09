import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from "axios"
import { config } from "@/lib/config"

// API错误类型
export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
}

// 请求状态管理
class RequestManager {
  private activeRequests = new Set<string>()
  private loadingCallbacks = new Set<(loading: boolean) => void>()

  addRequest(id: string) {
    this.activeRequests.add(id)
    this.notifyLoading(true)
  }

  removeRequest(id: string) {
    this.activeRequests.delete(id)
    if (this.activeRequests.size === 0) {
      this.notifyLoading(false)
    }
  }

  onLoadingChange(callback: (loading: boolean) => void) {
    this.loadingCallbacks.add(callback)
    return () => this.loadingCallbacks.delete(callback)
  }

  private notifyLoading(loading: boolean) {
    this.loadingCallbacks.forEach((callback) => callback(loading))
  }

  get isLoading() {
    return this.activeRequests.size > 0
  }
}

const requestManager = new RequestManager()

// 创建API客户端
const API_BASE_URL = config.api.baseUrl

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: config.api.timeout,
  headers: {
    "Content-Type": "application/json",
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 生成请求ID
    const requestId = `${config.method?.toUpperCase()}-${config.url}-${Date.now()}`
    config.metadata = { requestId }

    // 添加到活跃请求列表
    requestManager.addRequest(requestId)

    // 添加认证token
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加请求时间戳
    config.headers["X-Request-Time"] = new Date().toISOString()

    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)

    return config
  },
  (error) => {
    console.error("❌ Request Error:", error)
    return Promise.reject(normalizeError(error))
  },
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 从活跃请求列表中移除
    const requestId = response.config.metadata?.requestId
    if (requestId) {
      requestManager.removeRequest(requestId)
    }

    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status)

    return response
  },
  (error: AxiosError) => {
    // 从活跃请求列表中移除
    const requestId = error.config?.metadata?.requestId
    if (requestId) {
      requestManager.removeRequest(requestId)
    }

    const normalizedError = normalizeError(error)
    console.error("❌ API Error:", normalizedError)

    // 统一错误处理
    handleApiError(normalizedError)

    return Promise.reject(normalizedError)
  },
)

// 获取认证token
function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token")
  }
  return null
}

// 错误标准化
function normalizeError(error: any): ApiError {
  if (error.response) {
    // 服务器响应错误
    return {
      message: error.response.data?.message || error.message || "请求失败",
      status: error.response.status,
      code: error.response.data?.code,
      details: error.response.data,
    }
  } else if (error.request) {
    // 网络错误
    return {
      message: "网络连接失败，请检查网络设置",
      code: "NETWORK_ERROR",
    }
  } else {
    // 其他错误
    return {
      message: error.message || "未知错误",
      code: "UNKNOWN_ERROR",
    }
  }
}

// 统一错误处理
function handleApiError(error: ApiError) {
  // 根据错误状态码进行不同处理
  switch (error.status) {
    case 401:
      // 未授权，清除token并跳转登录
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
        window.location.href = "/login"
      }
      break
    case 403:
      // 禁止访问
      console.warn("Access forbidden:", error.message)
      break
    case 404:
      // 资源不存在
      console.warn("Resource not found:", error.message)
      break
    case 429:
      // 请求过于频繁
      console.warn("Too many requests:", error.message)
      break
    case 500:
    case 502:
    case 503:
    case 504:
      // 服务器错误
      console.error("Server error:", error.message)
      break
    default:
      console.error("API error:", error.message)
  }
}

// 导出请求管理器
export { requestManager }

// 类型声明扩展
declare module "axios" {
  interface AxiosRequestConfig {
    metadata?: {
      requestId: string
    }
  }
}
