"use client"

// Service Worker 注册和管理
export class ServiceWorkerManager {
  private sw: ServiceWorker | null = null
  private updateAvailable = false
  private callbacks = new Set<(event: string, data?: any) => void>()

  async register() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js")

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                this.updateAvailable = true
                this.notify("update-available")
              }
            })
          }
        })

        this.sw = registration.active
        this.notify("registered")

        return registration
      } catch (error) {
        console.error("Service Worker registration failed:", error)
        throw error
      }
    }
  }

  async update() {
    if (this.updateAvailable) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" })
        window.location.reload()
      }
    }
  }

  onEvent(callback: (event: string, data?: any) => void) {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  private notify(event: string, data?: any) {
    this.callbacks.forEach((callback) => callback(event, data))
  }
}

export const swManager = new ServiceWorkerManager()

// 离线状态管理
export class OfflineManager {
  private isOnline = navigator.onLine
  private callbacks = new Set<(online: boolean) => void>()
  private syncQueue: Array<{ id: string; data: any; timestamp: number }> = []

  constructor() {
    window.addEventListener("online", () => {
      this.isOnline = true
      this.notify(true)
      this.processSyncQueue()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
      this.notify(false)
    })

    // 从localStorage恢复同步队列
    this.loadSyncQueue()
  }

  get online() {
    return this.isOnline
  }

  onStatusChange(callback: (online: boolean) => void) {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  addToSyncQueue(id: string, data: any) {
    const item = {
      id,
      data,
      timestamp: Date.now(),
    }

    this.syncQueue.push(item)
    this.saveSyncQueue()

    if (this.isOnline) {
      this.processSyncQueue()
    }
  }

  private notify(online: boolean) {
    this.callbacks.forEach((callback) => callback(online))
  }

  private async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return

    const itemsToProcess = [...this.syncQueue]
    this.syncQueue = []

    for (const item of itemsToProcess) {
      try {
        // 这里应该调用实际的API
        await this.syncItem(item)
      } catch (error) {
        // 如果同步失败，重新加入队列
        this.syncQueue.push(item)
      }
    }

    this.saveSyncQueue()
  }

  private async syncItem(item: { id: string; data: any; timestamp: number }) {
    // 实现具体的同步逻辑
    console.log("Syncing item:", item)
  }

  private saveSyncQueue() {
    localStorage.setItem("offline-sync-queue", JSON.stringify(this.syncQueue))
  }

  private loadSyncQueue() {
    try {
      const saved = localStorage.getItem("offline-sync-queue")
      if (saved) {
        this.syncQueue = JSON.parse(saved)
      }
    } catch (error) {
      console.error("Failed to load sync queue:", error)
    }
  }
}

export const offlineManager = new OfflineManager()
