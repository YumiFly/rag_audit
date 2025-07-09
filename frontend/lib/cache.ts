"use client"

import { useEffect } from "react"

import { useState } from "react"

// 客户端缓存策略
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttl = 300000): void {
    // 默认5分钟
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const cacheManager = new CacheManager()

// 定期清理过期缓存
if (typeof window !== "undefined") {
  setInterval(() => {
    cacheManager.cleanup()
  }, 60000) // 每分钟清理一次
}

// React Hook for caching
export function useCache<T>(key: string, fetcher: () => Promise<T>, ttl?: number) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const cachedData = cacheManager.get(key)

    if (cachedData) {
      setData(cachedData)
      return
    }

    setLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        setData(result)
        cacheManager.set(key, result, ttl)
      })
      .catch((err) => {
        setError(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [key, ttl])

  return { data, loading, error }
}
