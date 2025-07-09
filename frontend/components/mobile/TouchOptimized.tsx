"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { motion, type PanInfo, useMotionValue } from "framer-motion"
import { cn } from "@/lib/utils"

// 触摸优化按钮
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "default" | "primary" | "secondary" | "danger"
  size?: "sm" | "md" | "lg"
  hapticFeedback?: boolean
}

export function TouchButton({
  children,
  variant = "default",
  size = "md",
  hapticFeedback = true,
  className,
  onClick,
  ...props
}: TouchButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // 触觉反馈
      if (hapticFeedback && navigator.vibrate) {
        navigator.vibrate(50)
      }

      onClick?.(e)
    },
    [onClick, hapticFeedback],
  )

  const baseClasses =
    "relative overflow-hidden font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95"

  const variantClasses = {
    default: "bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500",
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  }

  const sizeClasses = {
    sm: "px-4 py-2 text-sm rounded-md min-h-[36px]", // 最小触摸区域36px
    md: "px-6 py-3 text-base rounded-lg min-h-[44px]", // 推荐触摸区域44px
    lg: "px-8 py-4 text-lg rounded-xl min-h-[52px]", // 大触摸区域52px
  }

  return (
    <motion.button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      whileTap={{ scale: 0.95 }}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
      onClick={handleClick}
      {...props}
    >
      {/* 按压效果 */}
      <motion.div
        className="absolute inset-0 bg-white/10 rounded-inherit"
        initial={{ opacity: 0 }}
        animate={{ opacity: isPressed ? 1 : 0 }}
        transition={{ duration: 0.1 }}
      />

      {/* 内容 */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

// 滑动手势组件
interface SwipeGestureProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  className?: string
}

export function SwipeGesture({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className,
}: SwipeGestureProps) {
  const handlePanEnd = useCallback(
    (event: any, info: PanInfo) => {
      const { offset, velocity } = info

      // 检查滑动距离和速度
      if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > 500) {
        if (offset.x > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (offset.x < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      }

      if (Math.abs(offset.y) > threshold || Math.abs(velocity.y) > 500) {
        if (offset.y > 0 && onSwipeDown) {
          onSwipeDown()
        } else if (offset.y < 0 && onSwipeUp) {
          onSwipeUp()
        }
      }
    },
    [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold],
  )

  return (
    <motion.div
      className={className}
      onPanEnd={handlePanEnd}
      style={{ touchAction: "pan-y" }} // 允许垂直滚动
    >
      {children}
    </motion.div>
  )
}

// 长按菜单组件
interface LongPressMenuProps {
  children: React.ReactNode
  menuItems: Array<{
    label: string
    icon?: React.ReactNode
    onClick: () => void
    danger?: boolean
  }>
  delay?: number
}

export function LongPressMenu({ children, menuItems, delay = 500 }: LongPressMenuProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const longPressTimer = useRef<NodeJS.Timeout>()
  const elementRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      setMenuPosition({ x: touch.clientX, y: touch.clientY })

      longPressTimer.current = setTimeout(() => {
        setShowMenu(true)
        // 触觉反馈
        if (navigator.vibrate) {
          navigator.vibrate([50, 50, 100])
        }
      }, delay)
    },
    [delay],
  )

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }, [])

  const handleTouchMove = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }, [])

  const handleMenuItemClick = useCallback((onClick: () => void) => {
    onClick()
    setShowMenu(false)
  }, [])

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (elementRef.current && !elementRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMenu])

  return (
    <div
      ref={elementRef}
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      {children}

      {/* 长按菜单 */}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed z-50 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2 min-w-[150px]"
          style={{
            left: Math.min(menuPosition.x, window.innerWidth - 200),
            top: Math.min(menuPosition.y, window.innerHeight - menuItems.length * 50),
          }}
        >
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuItemClick(item.onClick)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-700 transition-colors",
                item.danger ? "text-red-400 hover:text-red-300" : "text-white",
              )}
            >
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

// 双击缩放组件
interface DoubleTapZoomProps {
  children: React.ReactNode
  maxZoom?: number
  minZoom?: number
  className?: string
}

export function DoubleTapZoom({ children, maxZoom = 3, minZoom = 1, className }: DoubleTapZoomProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const lastTap = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const now = Date.now()
      const timeSinceLastTap = now - lastTap.current

      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        // 双击检测
        if (scale === 1) {
          // 放大到双击位置
          const touch = e.changedTouches[0]
          const rect = containerRef.current?.getBoundingClientRect()
          if (rect) {
            const x = touch.clientX - rect.left - rect.width / 2
            const y = touch.clientY - rect.top - rect.height / 2
            setPosition({ x: -x, y: -y })
            setScale(2)
          }
        } else {
          // 重置缩放
          setScale(1)
          setPosition({ x: 0, y: 0 })
        }

        // 触觉反馈
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
      }

      lastTap.current = now
    },
    [scale],
  )

  const x = useMotionValue(position.x)
  const y = useMotionValue(position.y)

  return (
    <div ref={containerRef} className={cn("overflow-hidden", className)}>
      <motion.div
        style={{
          scale,
          x,
          y,
        }}
        animate={{
          scale,
          x: position.x,
          y: position.y,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        onTouchEnd={handleTouchEnd}
        className="origin-center"
      >
        {children}
      </motion.div>
    </div>
  )
}

// 触摸友好的输入组件
interface TouchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export function TouchInput({ label, error, icon, className, ...props }: TouchInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}

      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>}

        <input
          className={cn(
            "w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "min-h-[44px]", // 确保足够的触摸区域
            icon && "pl-10",
            error && "border-red-500 focus:ring-red-500",
            className,
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* 聚焦指示器 */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: isFocused ? "100%" : 0 }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
