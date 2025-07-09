"use client"

import type React from "react"
import { useApiState } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wifi, WifiOff } from "lucide-react"

export const ApiStatus: React.FC = () => {
  const { loading, error, lastRequestTime } = useApiState()

  const getStatusIcon = () => {
    if (loading) {
      return <Loader2 className="w-4 h-4 animate-spin" />
    }
    if (error) {
      return <WifiOff className="w-4 h-4" />
    }
    return <Wifi className="w-4 h-4" />
  }

  const getStatusText = () => {
    if (loading) return "请求中..."
    if (error) return "连接异常"
    return "连接正常"
  }

  const getStatusVariant = () => {
    if (loading) return "secondary"
    if (error) return "destructive"
    return "default"
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={getStatusVariant()} className="flex items-center space-x-1">
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </Badge>
      {lastRequestTime && (
        <span className="text-xs text-gray-500">最后请求: {new Date(lastRequestTime).toLocaleTimeString()}</span>
      )}
    </div>
  )
}
