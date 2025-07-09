"use client"

import { useEffect } from "react"

import { useCallback } from "react"

import { useState } from "react"

import { apiClient } from "./client"

export interface HealthResponse {
  status: string
  message?: string
  timestamp?: string
  version?: string
  uptime?: number
}

export interface HealthCheck {
  database?: boolean
  redis?: boolean
  external_apis?: boolean
}

export const checkHealth = async (): Promise<HealthResponse> => {
  try {
    const response = await apiClient.get<HealthResponse>("/health")
    return response.data
  } catch (error) {
    throw error
  }
}

export const checkDetailedHealth = async (): Promise<HealthResponse & HealthCheck> => {
  try {
    const response = await apiClient.get<HealthResponse & HealthCheck>("/health/detailed")
    return response.data
  } catch (error) {
    throw error
  }
}

// 健康检查Hook
export function useHealthCheck(interval = 30000) {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performHealthCheck = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await checkHealth()
      setHealth(result)
    } catch (err: any) {
      setError(err.message || "健康检查失败")
      setHealth(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    performHealthCheck()

    const intervalId = setInterval(performHealthCheck, interval)
    return () => clearInterval(intervalId)
  }, [performHealthCheck, interval])

  return {
    health,
    loading,
    error,
    refetch: performHealthCheck,
  }
}
