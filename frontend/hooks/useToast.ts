'use client'

import { useState, useCallback } from 'react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const success = useCallback((title: string, description?: string, duration?: number) => {
    return addToast({ type: 'success', title, description, duration })
  }, [addToast])

  const error = useCallback((title: string, description?: string, duration?: number) => {
    return addToast({ type: 'error', title, description, duration })
  }, [addToast])

  const warning = useCallback((title: string, description?: string, duration?: number) => {
    return addToast({ type: 'warning', title, description, duration })
  }, [addToast])

  const info = useCallback((title: string, description?: string, duration?: number) => {
    return addToast({ type: 'info', title, description, duration })
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  }
}
