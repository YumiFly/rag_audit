"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// 断点定义
export const breakpoints = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const

type Breakpoint = keyof typeof breakpoints

// 响应式Hook
export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>("lg")
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      setWindowSize({ width, height })

      // 确定当前断点
      if (width < breakpoints.xs) {
        setCurrentBreakpoint("xs")
      } else if (width < breakpoints.sm) {
        setCurrentBreakpoint("sm")
      } else if (width < breakpoints.md) {
        setCurrentBreakpoint("md")
      } else if (width < breakpoints.lg) {
        setCurrentBreakpoint("lg")
      } else if (width < breakpoints.xl) {
        setCurrentBreakpoint("xl")
      } else {
        setCurrentBreakpoint("2xl")
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isMobile = currentBreakpoint === "xs" || currentBreakpoint === "sm"
  const isTablet = currentBreakpoint === "md"
  const isDesktop = !isMobile && !isTablet

  return {
    currentBreakpoint,
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isLandscape: windowSize.width > windowSize.height,
    isPortrait: windowSize.width <= windowSize.height,
  }
}

// 响应式容器组件
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  padding?: boolean
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = "xl",
  padding = true,
}: ResponsiveContainerProps) {
  const { isMobile } = useBreakpoint()

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  }

  const paddingClasses = padding ? "p-4" : ""

  return <motion.div className={cn(maxWidthClasses[maxWidth], paddingClasses, className)}>{children}</motion.div>
}
