import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from "axios"

export interface ApiClientConfig {
  baseURL: string
  timeout?: number
  retries?: number
  retryDelay?: number
  onLoadingChange?: (loading: boolean) => void
  onError?: (error: ApiError) => void
}

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
}

export interface RetryConfig {
  retries: number
  retryDelay: number
  retryCondition?: (error: AxiosError) => boolean
}

class ApiClient {
  private client: AxiosInstance
  private config: ApiClientConfig
  private activeRequests = new Set<string>()
  private retryConfig: RetryConfig

  constructor(config: ApiClientConfig) {
    this.config = config
    this.retryConfig = {
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      retryCondition: (error: AxiosError) => {
        return !error.response || error.response.status >= 500
      },
    }

    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        const requestId = this.generateRequestId(config)
        this.activeRequests.add(requestId)
        this.updateLoadingState()

        // 添加认证token
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // 添加请求ID用于追踪
        config.metadata = { requestId }

        return config
      },
      (error) => {
        this.config.onError?.(this.normalizeError(error))
        return Promise.reject(error)
      },
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        const requestId = response.config.metadata?.requestId
        if (requestId) {
          this.activeRequests.delete(requestId)
          this.updateLoadingState()
        }
        return response
      },
      async (error) => {
        const requestId = error.config?.metadata?.requestId
        if (requestId) {
          this.activeRequests.delete(requestId)
          this.updateLoadingState()
        }

        // 重试逻辑
        if (this.shouldRetry(error)) {
          return this.retryRequest(error)
        }

        const apiError = this.normalizeError(error)
        this.config.onError?.(apiError)
        return Promise.reject(apiError)
      },
    )
  }

  private generateRequestId(config: AxiosRequestConfig): string {
    return `${config.method?.toUpperCase()}-${config.url}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private updateLoadingState() {
    const isLoading = this.activeRequests.size > 0
    this.config.onLoadingChange?.(isLoading)
  }

  private getAuthToken(): string | null {
    // 从localStorage或其他地方获取token
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token")
    }
    return null
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!error.config || error.config.__retryCount >= this.retryConfig.retries) {
      return false
    }
    return this.retryConfig.retryCondition?.(error) ?? false
  }

  private async retryRequest(error: AxiosError): Promise<AxiosResponse> {
    const config = error.config!
    config.__retryCount = (config.__retryCount || 0) + 1

    // 指数退避延迟
    const delay = this.retryConfig.retryDelay * Math.pow(2, config.__retryCount - 1)
    await new Promise((resolve) => setTimeout(resolve, delay))

    return this.client.request(config)
  }

  private normalizeError(error: any): ApiError {
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

  // 公共API方法
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  // 文件上传
  async uploadFile<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await this.client.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })

    return response.data
  }

  // 批量上传
  async uploadFiles<T = any>(
    url: string,
    files: File[],
    onProgress?: (progress: number) => void,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files`, file)
    })

    const response = await this.client.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })

    return response.data
  }

  // 取消所有请求
  cancelAllRequests() {
    this.activeRequests.clear()
    this.updateLoadingState()
  }

  // 设置认证token
  setAuthToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  // 清除认证token
  clearAuthToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }
}

// 创建默认实例
export const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
})

export { ApiClient }
