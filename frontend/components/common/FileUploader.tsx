'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react'

interface FileUploaderProps {
  accept?: string
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  onFilesChange: (files: File[]) => void
  onUploadProgress?: (progress: number) => void
  onUploadComplete?: (response: any) => void
  onError?: (error: string) => void
  disabled?: boolean
  className?: string
}

interface UploadedFile {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

export default function FileUploader({
  accept = '.json,.sol',
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  onFilesChange,
  onUploadProgress,
  onUploadComplete,
  onError,
  disabled = false,
  className = ''
}: FileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => 
        `${file.name}: ${errors.map((e: any) => e.message).join(', ')}`
      ).join('\n')
      onError?.(errors)
      return
    }

    // Check file count limit
    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      onError?.(`最多只能上传 ${maxFiles} 个文件`)
      return
    }

    // Add files to upload list
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
    onFilesChange(acceptedFiles)
  }, [uploadedFiles, maxFiles, onFilesChange, onError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, ext) => {
      const mimeType = getMimeType(ext.trim())
      if (mimeType) {
        acc[mimeType] = [ext.trim()]
      }
      return acc
    }, {} as Record<string, string[]>),
    multiple,
    maxSize,
    disabled
  })

  const getMimeType = (extension: string): string | null => {
    const mimeTypes: Record<string, string> = {
      '.json': 'application/json',
      '.sol': 'text/plain',
      '.txt': 'text/plain',
      '.md': 'text/markdown'
    }
    return mimeTypes[extension] || null
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const retryUpload = (index: number) => {
    setUploadedFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, status: 'pending', error: undefined } : file
    ))
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'json':
        return <File className="w-4 h-4 text-blue-400" />
      case 'sol':
        return <File className="w-4 h-4 text-purple-400" />
      default:
        return <File className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      case 'uploading':
        return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
      default:
        return null
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
              ${isDragActive 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-blue-400' : 'text-gray-400'}`} />
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">
                {isDragActive ? '释放文件到此处' : '拖拽文件到此处或点击上传'}
              </p>
              <p className="text-sm text-gray-400">
                支持格式: {accept} | 最大大小: {formatFileSize(maxSize)} | 最多 {maxFiles} 个文件
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">上传文件列表</h3>
            <div className="space-y-3">
              {uploadedFiles.map((uploadedFile, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getFileIcon(uploadedFile.file.name)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-white truncate">
                        {uploadedFile.file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={uploadedFile.status === 'completed' ? 'default' : 
                                  uploadedFile.status === 'error' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {uploadedFile.status === 'pending' && '等待中'}
                          {uploadedFile.status === 'uploading' && '上传中'}
                          {uploadedFile.status === 'completed' && '已完成'}
                          {uploadedFile.status === 'error' && '失败'}
                        </Badge>
                        {getStatusIcon(uploadedFile.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{formatFileSize(uploadedFile.file.size)}</span>
                      {uploadedFile.status === 'uploading' && (
                        <span>{uploadedFile.progress}%</span>
                      )}
                    </div>
                    
                    {uploadedFile.status === 'uploading' && (
                      <Progress value={uploadedFile.progress} className="mt-2 h-1" />
                    )}
                    
                    {uploadedFile.error && (
                      <p className="text-xs text-red-400 mt-1">{uploadedFile.error}</p>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 flex space-x-1">
                    {uploadedFile.status === 'error' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryUpload(index)}
                        className="h-8 w-8 p-0 border-gray-600 hover:bg-gray-700"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0 border-gray-600 hover:bg-gray-700 hover:border-red-500 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
