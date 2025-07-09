"use client"

import { useEffect, useState, useCallback } from "react"
import {
  wsClient,
  type NotificationData,
  type AnalysisProgressData,
  type SystemStatusData,
} from "@/lib/websocket/client"

export function useWebSocket() {
  const [connectionState, setConnectionState] = useState(wsClient.state)

  useEffect(() => {
    const unsubscribe = wsClient.onStateChange(setConnectionState)
    return unsubscribe
  }, [])

  const subscribe = useCallback((messageType: string, handler: (data: any) => void) => {
    return wsClient.subscribe(messageType, handler)
  }, [])

  const send = useCallback((type: string, data: any) => {
    wsClient.send({ type, data })
  }, [])

  return {
    connectionState,
    isConnected: wsClient.isConnected,
    subscribe,
    send,
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const { subscribe } = useWebSocket()

  useEffect(() => {
    const unsubscribe = subscribe("notification", (data: NotificationData) => {
      setNotifications((prev) => [...prev, { ...data, id: Date.now().toString() }])

      // 自动移除通知
      if (data.duration !== 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== data.id))
        }, data.duration || 5000)
      }
    })

    return unsubscribe
  }, [subscribe])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    removeNotification,
    clearAll,
  }
}

export function useAnalysisProgress() {
  const [progressData, setProgressData] = useState<Record<string, AnalysisProgressData>>({})
  const { subscribe } = useWebSocket()

  useEffect(() => {
    const unsubscribe = subscribe("analysis_progress", (data: AnalysisProgressData) => {
      setProgressData((prev) => ({
        ...prev,
        [data.doc_id]: data,
      }))
    })

    return unsubscribe
  }, [subscribe])

  const getProgress = useCallback(
    (docId: string) => {
      return progressData[docId]
    },
    [progressData],
  )

  return {
    progressData,
    getProgress,
  }
}

export function useSystemStatus() {
  const [systemStatus, setSystemStatus] = useState<SystemStatusData>({ status: "online" })
  const { subscribe } = useWebSocket()

  useEffect(() => {
    const unsubscribe = subscribe("system_status", (data: SystemStatusData) => {
      setSystemStatus(data)
    })

    return unsubscribe
  }, [subscribe])

  return systemStatus
}
