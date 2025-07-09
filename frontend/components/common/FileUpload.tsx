"use client"

import React, { useCallback, useState, useRef } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { Upload, X, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface FileUploadProps {
  accept?: Record<string, string[]>
  maxSize?: number
  maxFiles?: number
  multiple?: boolean
  disabled?: boolean
  className?: string
  onFilesChange?: (files: File[]) => void
  onUpload?: (files: File[]) => Promise<void>
  onError?: (error: string) => void
  children?: React.ReactNode
}

interface UploadFile {
  file: File
  id: string
  progress: number
  status: "pending" | "uploading" | "completed" | "error"
  error?: string
}

export const FileUpload: React.FC<FileUploadProps> = React.memo(
  ({
    accept = { "*/*": [] },
    maxSize = 10 * 1024 * 1024, // 10MB
    maxFiles = 10,
    multiple = true,
    disabled = false,
    className,
    onFilesChange,
    onUpload,
    onError,
    children,
  }) => {
    const [files, setFiles] = useState<UploadFile[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const fileIdCounter = useRef(0)

    const onDrop = useCallback(
      (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        // 处理被拒绝的文件
        if (rejectedFiles.length > 0) {
          const errors = rejectedFiles.map((rejection) => {
            const reasons = rejection.errors.map((error) => {
              switch (error.code) {
                case "file-too-large":
                  return `文件过大 (最大 ${(maxSize / 1024 / 1024).toFixed(1)}MB)`
                case "file-invalid-type":
                  return "文件类型不支持"
                case "too-many-files":
                  return `文件数量过多 (最多 ${maxFiles} 个)`
                default:
                  return error.message
              }
            })
            return `${rejection.file.name}: ${reasons.join(", ")}`
          })
          onError?.(errors.join("\n"))
        }

        // 处理接受的文件
        if (acceptedFiles.length > 0) {
          const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
            file,
            id: `file-${++fileIdCounter.current}`,
            progress: 0,
            status: "pending",
          }))

          setFiles((prev) => {
            const combined = multiple ? [...prev, ...newFiles] : newFiles
            const limited = combined.slice(0, maxFiles)
            return limited
          })

          onFilesChange?.(acceptedFiles)
        }
      },
      [maxSize, maxFiles, multiple, onError, onFilesChange],
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept,
      maxSize,
      maxFiles: multiple ? maxFiles : 1,
      multiple,
      disabled: disabled || isUploading,
    })

    const removeFile = useCallback((fileId: string) => {
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
    }, [])

    const handleUpload = useCallback(async () => {
      if (!onUpload || files.length === 0) return

      setIsUploading(true)

      try {
        const filesToUpload = files.filter((f) => f.status === "pending").map((f) => f.file)

        // 更新状态为上传中
        setFiles((prev) => prev.map((f) => (f.status === "pending" ? { ...f, status: "uploading" as const } : f)))

        // 模拟上传进度
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) => (f.status === "uploading" ? { ...f, progress: Math.min(f.progress + 10, 90) } : f)),
          )
        }, 200)

        await onUpload(filesToUpload)

        clearInterval(progressInterval)

        // 标记为完成
        setFiles((prev) =>
          prev.map((f) => (f.status === "uploading" ? { ...f, status: "completed", progress: 100 } : f)),
        )
      } catch (error) {
        // 标记为错误
        setFiles((prev) =>
          prev.map((f) =>
            f.status === "uploading"
              ? { ...f, status: "error", error: error instanceof Error ? error.message : "上传失败" }
              : f,
          ),
        )
        onError?.(error instanceof Error ? error.message : "上传失败")
      } finally {
        setIsUploading(false)
      }
    }, [files, onUpload, onError])

    const getStatusIcon = (status: UploadFile["status"]) => {
      switch (status) {
        case "completed":
          return <CheckCircle className="w-4 h-4 text-green-400" />
        case "error":
          return <AlertCircle className="w-4 h-4 text-red-400" />
        case "uploading":
          return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        default:
          return <FileText className="w-4 h-4 text-gray-400" />
      }
    }

    const getStatusColor = (status: UploadFile["status"]) => {
      switch (status) {
        case "completed":
          return "text-green-400"
        case "error":
          return "text-red-400"
        case "uploading":
          return "text-blue-400"
        default:
          return "text-gray-400"
      }
    }

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return "0 Bytes"
      const k = 1024
      const sizes = ["Bytes", "KB", "MB", "GB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    return (
      <div className={cn("space-y-4", className)}>
        {/* 拖拽区域 */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <input {...getInputProps()} />
          {children || (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">{isDragActive ? "放下文件开始上传" : "拖拽文件到此处或点击选择"}</p>
              <p className="text-sm text-gray-500">
                支持 {Object.keys(accept).join(", ")} 格式，最大 {formatFileSize(maxSize)}
                {multiple && `，最多 ${maxFiles} 个文件`}
              </p>
            </>
          )}
        </div>

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">已选择的文件 ({files.length})</h4>
              {onUpload && (
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || files.every((f) => f.status !== "pending")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isUploading ? "上传中..." : "开始上传"}
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                  {getStatusIcon(file.status)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-white text-sm font-medium truncate">{file.file.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(file.file.size)}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={cn("text-xs", getStatusColor(file.status))}>
                        {file.status === "pending" && "等待上传"}
                        {file.status === "uploading" && "上传中..."}
                        {file.status === "completed" && "上传完成"}
                        {file.status === "error" && (file.error || "上传失败")}
                      </span>
                    </div>

                    {file.status === "uploading" && <Progress value={file.progress} className="w-full h-1 mt-2" />}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-400 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  },
)

FileUpload.displayName = "FileUpload"
