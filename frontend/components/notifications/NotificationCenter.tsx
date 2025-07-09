"use client"

import type React from "react"
import { useNotifications } from "@/hooks/useWebSocket"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Bell, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const notificationIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

const notificationColors = {
  info: "text-blue-400 bg-blue-900/20 border-blue-500/30",
  success: "text-green-400 bg-green-900/20 border-green-500/30",
  warning: "text-orange-400 bg-orange-900/20 border-orange-500/30",
  error: "text-red-400 bg-red-900/20 border-red-500/30",
}

export const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification, clearAll } = useNotifications()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-gray-400" />
          <Badge variant="outline" className="text-gray-400">
            {notifications.length} 条通知
          </Badge>
        </div>
        {notifications.length > 1 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-gray-400 hover:text-white">
            清空全部
          </Button>
        )}
      </div>

      {notifications.map((notification) => {
        const Icon = notificationIcons[notification.type]
        return (
          <Card
            key={notification.id}
            className={cn("animate-slide-in-right backdrop-blur-lg border", notificationColors[notification.type])}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <p className="text-sm opacity-90 mt-1">{notification.message}</p>
                  {notification.actions && (
                    <div className="flex space-x-2 mt-3">
                      {notification.actions.map((action, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="outline"
                          onClick={action.action}
                          className="text-xs bg-transparent"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNotification(notification.id!)}
                  className="p-1 h-auto opacity-70 hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
