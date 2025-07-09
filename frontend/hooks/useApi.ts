"use client"

import { useState, useCallback } from "react"
import type { ApiError } from "@/lib/api"
import { checkHealth, analyzeContract, askQuestion, ingestFiles } from "@/lib/api" // Import the undeclared variables

export function useApi<T extends (...args: any[]) => Promise<any>>(apiFunction: T) {
  const [data, setData] = useState<Awaited<ReturnType<T>> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const execute = useCallback(
    async (...args: Parameters<T>) => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiFunction(...args)
        setData(result)
        return result
      } catch (err: any) {
        setError(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [apiFunction],
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}

// 使用示例
export function useHealthApi() {
  return useApi(checkHealth)
}

export function useAnalyzeApi() {
  return useApi(analyzeContract)
}

export function useAskApi() {
  return useApi(askQuestion)
}

export function useIngestApi() {
  return useApi(ingestFiles)
}
