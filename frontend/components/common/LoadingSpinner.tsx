"use client"

import React from "react"
import { cn } from "@/lib/utils"

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "spinner" | "dots" | "pulse" | "bars" | "ring"
  color?: "primary" | "secondary" | "success" | "warning" | "error"
  text?: string
  className?: string
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
}

const colorClasses = {
  primary: "text-blue-500",
  secondary: "text-gray-500",
  success: "text-green-500",
  warning: "text-yellow-500",
  error: "text-red-500",
}

const SpinnerVariant: React.FC<{ size: string; color: string }> = ({ size, color }) => (
  <div className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", size, color)} />
)

const DotsVariant: React.FC<{ size: string; color: string }> = ({ size, color }) => (
  <div className="flex space-x-1">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={cn("rounded-full animate-bounce", size, color, "bg-current")}
        style={{ animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </div>
)

const PulseVariant: React.FC<{ size: string; color: string }> = ({ size, color }) => (
  <div className={cn("rounded-full animate-pulse bg-current", size, color)} />
)

const BarsVariant: React.FC<{ size: string; color: string }> = ({ size, color }) => (
  <div className="flex space-x-1 items-end">
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className={cn("bg-current animate-pulse", color)}
        style={{
          width: "3px",
          height: `${12 + i * 2}px`,
          animationDelay: `${i * 0.1}s`,
          animationDuration: "0.8s",
        }}
      />
    ))}
  </div>
)

const RingVariant: React.FC<{ size: string; color: string }> = ({ size, color }) => (
  <div className={cn("relative", size)}>
    <div className={cn("absolute inset-0 rounded-full border-2 border-current opacity-25", color)} />
    <div
      className={cn("absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin", color)}
    />
  </div>
)

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(
  ({ size = "md", variant = "spinner", color = "primary", text, className }) => {
    const sizeClass = sizeClasses[size]
    const colorClass = colorClasses[color]

    const renderVariant = () => {
      switch (variant) {
        case "dots":
          return <DotsVariant size={sizeClass} color={colorClass} />
        case "pulse":
          return <PulseVariant size={sizeClass} color={colorClass} />
        case "bars":
          return <BarsVariant size={sizeClass} color={colorClass} />
        case "ring":
          return <RingVariant size={sizeClass} color={colorClass} />
        default:
          return <SpinnerVariant size={sizeClass} color={colorClass} />
      }
    }

    return (
      <div className={cn("flex flex-col items-center justify-center space-y-2", className)}>
        {renderVariant()}
        {text && <span className={cn("text-sm font-medium", colorClass)}>{text}</span>}
      </div>
    )
  },
)

LoadingSpinner.displayName = "LoadingSpinner"
