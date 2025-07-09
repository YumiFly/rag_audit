"use client"

import { config } from "@/lib/config"

export interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
  id?: string
}

export interface NotificationData {
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}

export interface AnalysisProgressData {
  doc_id: string
  progress: number
  status: "pending" | "running" | "completed" | "failed"
  current_step?: string
  estimated_time?: number
}

export interface SystemStatusData {
  status: "online" | "offline" | "maintenance"
  message?: string
  affected_services?: string[]
}

class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private messageHandlers = new Map<string, Set<(data: any) => void>>()
  private connectionState: "connecting" | "connected" | "disconnected" | "error" = "disconnected"
  private stateChangeHandlers = new Set<(state: string) => void>()

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.setConnectionState("connecting")
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log("🔗 WebSocket connected")
          this.setConnectionState("connected")
          this.reconnectAttempts = 0
          this.startHeartbeat()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error)
          }
        }

        this.ws.onclose = (event) => {
          console.log("🔌 WebSocket disconnected:", event.code, event.reason)
          this.setConnectionState("disconnected")
          this.stopHeartbeat()
          this.attemptReconnect()
        }

        this.ws.onerror = (error) => {
          console.error("❌ WebSocket error:", error)
          this.setConnectionState("error")
          reject(error)
        }
      } catch (error) {
        this.setConnectionState("error")
        reject(error)
      }
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.stopHeartbeat()
    this.setConnectionState("disconnected")
  }

  send(message: Omit<WebSocketMessage, "timestamp" | "id">) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString(),
        id: Math.random().toString(36).substr(2, 9),
      }
      this.ws.send(JSON.stringify(fullMessage))
    } else {
      console.warn("WebSocket is not connected")
    }
  }

  subscribe(messageType: string, handler: (data: any) => void) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set())
    }
    this.messageHandlers.get(messageType)!.add(handler)

    return () => {
      const handlers = this.messageHandlers.get(messageType)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          this.messageHandlers.delete(messageType)
        }
      }
    }
  }

  onStateChange(handler: (state: string) => void) {
    this.stateChangeHandlers.add(handler)
    return () => this.stateChangeHandlers.delete(handler)
  }

  get state() {
    return this.connectionState
  }

  get isConnected() {
    return this.connectionState === "connected"
  }

  private handleMessage(message: WebSocketMessage) {
    const handlers = this.messageHandlers.get(message.type)
    if (handlers) {
      handlers.forEach((handler) => handler(message.data))
    }
  }

  private setConnectionState(state: typeof this.connectionState) {
    this.connectionState = state
    this.stateChangeHandlers.forEach((handler) => handler(state))
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: "ping", data: {} })
    }, 30000) // 30秒心跳
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)

      console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

      setTimeout(() => {
        this.connect().catch(() => {
          // 重连失败，继续尝试
        })
      }, delay)
    } else {
      console.error("❌ Max reconnection attempts reached")
      this.setConnectionState("error")
    }
  }
}

// 创建全局WebSocket客户端实例
const wsUrl = config.api.baseUrl.replace(/^http/, "ws") + "/ws"
export const wsClient = new WebSocketClient(wsUrl)

// 自动连接
if (typeof window !== "undefined") {
  wsClient.connect().catch(console.error)
}
