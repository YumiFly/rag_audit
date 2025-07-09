"use client"

import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { NotificationCenter } from "@/components/notifications/NotificationCenter"
import { useGlobalShortcuts } from "@/hooks/useKeyboardShortcuts"
import { useWebSocket, useSystemStatus } from "@/hooks/useWebSocket"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, AlertTriangle } from "lucide-react"

export default function DashboardPage() {
  const { isConnected } = useWebSocket()
  const systemStatus = useSystemStatus()

  // 启用全局快捷键
  useGlobalShortcuts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* 系统状态栏 */}
      <div className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700/50 px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge
              variant="outline"
              className={isConnected ? "text-green-400 border-green-500" : "text-red-400 border-red-500"}
            >
              {isConnected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {isConnected ? "已连接" : "连接断开"}
            </Badge>

            <Badge
              variant="outline"
              className={
                systemStatus.status === "online"
                  ? "text-green-400 border-green-500"
                  : "text-orange-400 border-orange-500"
              }
            >
              {systemStatus.status === "online" ? "系统正常" : "系统维护"}
            </Badge>
          </div>

          <div className="text-xs text-gray-400">按 Ctrl+/ 查看快捷键帮助</div>
        </div>
      </div>

      {/* 主要内容 */}
      <DashboardLayout />

      {/* 通知中心 */}
      <NotificationCenter />

      {/* 系统警告 */}
      {systemStatus.status !== "online" && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-orange-900/90 backdrop-blur-lg border border-orange-500/50 rounded-lg p-4 flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <span className="text-orange-100">{systemStatus.message || "系统正在维护中"}</span>
          </div>
        </div>
      )}
    </div>
  )
}
