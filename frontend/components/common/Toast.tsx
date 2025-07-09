"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "warning" | "error" | "info"
export type ToastPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"

export interface ToastOptions {
  id?: string
  type?: ToastType
  title?: string
  description?: string
  duration?: number
  position?: ToastPosition
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

interface Toast extends Required<Omit<ToastOptions, "action">> {
  action?: ToastOptions["action"]
  createdAt: number
}

interface ToastContextType {
  toasts: Toast[]
  toast: (options: ToastOptions) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const positionClasses: Record<ToastPosition, string> = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "top-center": "top-4 left-1/2 transform -translate-x-1/2",
  "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    className: "bg-green-900/90 border-green-500/50 text-green-100",
    iconClassName: "text-green-400",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-yellow-900/90 border-yellow-500/50 text-yellow-100",
    iconClassName: "text-yellow-400",
  },
  error: {
    icon: XCircle,
    className: "bg-red-900/90 border-red-500/50 text-red-100",
    iconClassName: "text-red-400",
  },
  info: {
    icon: Info,
    className: "bg-blue-900/90 border-blue-500/50 text-blue-100",
    iconClassName: "text-blue-400",
  },
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((options: ToastOptions): string => {
    const id = options.id || Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      type: options.type || "info",
      title: options.title || "",
      description: options.description || "",
      duration: options.duration || 5000,
      position: options.position || "top-right",
      persistent: options.persistent || false,
      action: options.action,
      createdAt: Date.now(),
    }

    setToasts((prev) => [...prev, newToast])
    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  // 自动移除非持久化的toast
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setToasts((prev) => prev.filter((toast) => toast.persistent || now - toast.createdAt < toast.duration))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // 按位置分组toast
  const toastsByPosition = toasts.reduce(
    (acc, toast) => {
      if (!acc[toast.position]) {
        acc[toast.position] = []
      }
      acc[toast.position].push(toast)
      return acc
    },
    {} as Record<ToastPosition, Toast[]>,
  )

  return createPortal(
    <>
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <div
          key={position}
          className={cn("fixed z-50 flex flex-col space-y-2", positionClasses[position as ToastPosition])}
        >
          {positionToasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </div>
      ))}
    </>,
    document.body,
  )
}

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

const ToastItem: React.FC<ToastItemProps> = React.memo(({ toast, onDismiss }) => {
  const config = typeConfig[toast.type]
  const Icon = config.icon

  const handleDismiss = useCallback(() => {
    onDismiss(toast.id)
  }, [toast.id, onDismiss])

  const handleAction = useCallback(() => {
    toast.action?.onClick()
    handleDismiss()
  }, [toast.action, handleDismiss])

  return (
    <div
      className={cn(
        "relative flex items-start space-x-3 p-4 rounded-lg border backdrop-blur-sm shadow-lg max-w-sm w-full",
        "animate-in slide-in-from-top-2 fade-in-0 duration-300",
        config.className,
      )}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.iconClassName)} />

      <div className="flex-1 min-w-0">
        {toast.title && <div className="font-medium text-sm">{toast.title}</div>}
        {toast.description && (
          <div className={cn("text-sm opacity-90", toast.title && "mt-1")}>{toast.description}</div>
        )}
        {toast.action && (
          <button
            onClick={handleAction}
            className="mt-2 text-sm font-medium underline hover:no-underline focus:outline-none"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleDismiss}
        className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
})

ToastItem.displayName = "ToastItem"

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// 便捷方法
export const toast = {
  success: (options: Omit<ToastOptions, "type">) => {
    const { toast: toastFn } = useToast()
    return toastFn({ ...options, type: "success" })
  },
  error: (options: Omit<ToastOptions, "type">) => {
    const { toast: toastFn } = useToast()
    return toastFn({ ...options, type: "error" })
  },
  warning: (options: Omit<ToastOptions, "type">) => {
    const { toast: toastFn } = useToast()
    return toastFn({ ...options, type: "warning" })
  },
  info: (options: Omit<ToastOptions, "type">) => {
    const { toast: toastFn } = useToast()
    return toastFn({ ...options, type: "info" })
  },
}
