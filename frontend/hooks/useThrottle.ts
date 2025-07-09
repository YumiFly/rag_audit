"use client"

import { useCallback, useRef } from "react"

export function useThrottle<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const lastRan = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      const now = Date.now()
      const timeSinceLastRan = now - lastRan.current

      if (timeSinceLastRan >= delay) {
        callback(...args)
        lastRan.current = now
      } else {
        timeoutRef.current = setTimeout(() => {
          callback(...args)
          lastRan.current = Date.now()
        }, delay - timeSinceLastRan)
      }
    }) as T,
    [callback, delay],
  )
}
