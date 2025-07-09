"use client"

// 统一导出所有API
export * from "./client"
export * from "./health"
export * from "./analyze"
export * from "./ask"
export * from "./ingest"

// API状态管理
export interface ApiState {
  loading: boolean
  error: string | null
  lastRequestTime: number | null
}

// 全局API状态Hook
import { requestManager } from "./requestManager" // 声明或导入requestManager变量
import { useState, useEffect, useCallback } from "react"

export function useApiState() {
  const [state, setState] = useState<ApiState>({
    loading: false,
    error: null,
    lastRequestTime: null,
  })

  useEffect(() => {
    // 监听请求状态变化
    const unsubscribe = requestManager.onLoadingChange((loading) => {
      setState((prev) => ({
        ...prev,
        loading,
        lastRequestTime: loading ? Date.now() : prev.lastRequestTime,
      }))
    })

    return unsubscribe
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, error }))
  }, [])

  return {
    ...state,
    clearError,
    setError,
  }
}

// API错误处理Hook
export function useApiError() {
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((err: any) => {
    const message = err?.message || err?.response?.data?.message || "请求失败"
    setError(message)

    // 自动清除错误
    setTimeout(() => {
      setError(null)
    }, 5000)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    handleError,
    clearError,
  }
}
