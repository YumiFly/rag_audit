"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { cn } from "@/lib/utils"

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  placeholder?: string
  blurDataURL?: string
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = "/placeholder.svg",
  blurDataURL,
  priority = false,
  className,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(priority ? src : placeholder)

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    skip: priority,
  })

  useEffect(() => {
    if (inView && !priority && imageSrc === placeholder) {
      setImageSrc(src)
    }
  }, [inView, priority, src, imageSrc, placeholder])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setImageSrc(placeholder)
    onError?.()
  }

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {blurDataURL && !isLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-sm scale-110"
          style={{ backgroundImage: `url(${blurDataURL})` }}
        />
      )}

      <img
        src={imageSrc || "/placeholder.svg"}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          hasError && "opacity-50",
        )}
        {...props}
      />

      {!isLoaded && !hasError && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
    </div>
  )
}
