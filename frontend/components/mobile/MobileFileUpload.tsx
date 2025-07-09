"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, Upload, File, X } from "lucide-react"
import { TouchButton } from "./TouchOptimized"
import { cn } from "@/lib/utils"

interface MobileFileUploadProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxSize?: number
  className?: string
}

export function MobileFileUpload({
  onFilesSelected,
  accept = ".json,image/*",
  multiple = true,
  maxSize = 50 * 1024 * 1024, // 50MB
  className,
}: MobileFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return

      const fileArray = Array.from(files)
      const validFiles = fileArray.filter((file) => {
        if (file.size > maxSize) {
          alert(`文件 ${file.name} 超过大小限制`)
          return false
        }
        return true
      })

      setSelectedFiles((prev) => [...prev, ...validFiles])
      onFilesSelected(validFiles)
    },
    [maxSize, onFilesSelected],
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files)
      // 清空input以允许重复选择同一文件
      e.target.value = ""
    },
    [handleFileSelect],
  )

  const handleCameraCapture = useCallback(() => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click()
    }
  }, [])

  const handleFileUpload = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 文件选择区域 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 相机拍照 */}
        <TouchButton
          variant="secondary"
          size="lg"
          onClick={handleCameraCapture}
          className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-600 bg-gray-800/50"
        >
          <Camera className="w-8 h-8 mb-2 text-blue-400" />
          <span className="text-sm text-center">拍照上传</span>
        </TouchButton>

        {/* 文件选择 */}
        <TouchButton
          variant="secondary"
          size="lg"
          onClick={handleFileUpload}
          className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-600 bg-gray-800/50"
        >
          <Upload className="w-8 h-8 mb-2 text-green-400" />
          <span className="text-sm text-center">选择文件</span>
        </TouchButton>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* 隐藏的相机输入 */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* 已选择的文件列表 */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h3 className="text-sm font-medium text-gray-300">已选择 {selectedFiles.length} 个文件</h3>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex-shrink-0">
                    {file.type.startsWith("image/") ? (
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <File className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                  </div>

                  <TouchButton
                    variant="danger"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0 p-2"
                  >
                    <X className="w-4 h-4" />
                  </TouchButton>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
