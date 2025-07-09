"use client"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import axios from "axios"
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  BarChart3,
} from "lucide-react"
import SimpleNavigation from '@/components/layout/SimpleNavigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
// import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

const API_BASE_URL = "http://localhost:8000"
const MAX_CONCURRENT_UPLOADS = 3

interface UploadFile {
  id: string
  file: File
  status: "pending" | "uploading" | "completed" | "failed" | "paused"
  progress: number
  error?: string
  response?: any
  selected: boolean
  preview?: any
}

interface UploadStats {
  totalFiles: number
  completedFiles: number
  failedFiles: number
  totalRecords: number
  uploadTime: number
}

interface FilePreview {
  name: string
  size: number
  content: any
  structure: any[]
  keyInfo: {
    findings?: number
    severity?: string[]
    tools?: string[]
  }
}

export default function BatchUploadPage() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStats, setUploadStats] = useState<UploadStats>({
    totalFiles: 0,
    completedFiles: 0,
    failedFiles: 0,
    totalRecords: 0,
    uploadTime: 0,
  })
  const [selectedPreview, setSelectedPreview] = useState<FilePreview | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  // const [uploadQueue, setUploadQueue] = useState<string[]>([])
  const [activeUploads, setActiveUploads] = useState<Set<string>>(new Set())

  const uploadStartTime = useRef<number>(0)
  const abortControllers = useRef<Map<string, AbortController>>(new Map())

  // 文件拖拽处理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("onDrop called with files:", acceptedFiles)

    const validFiles = acceptedFiles.filter((file) => {
      if (!file.name.endsWith(".json")) {
        console.log("File rejected - not JSON:", file.name)
        return false
      }
      if (file.size > 50 * 1024 * 1024) {
        // 50MB限制
        console.log("File rejected - too large:", file.name, file.size)
        return false
      }
      return true
    })

    console.log("Valid files:", validFiles)

    const newFiles: UploadFile[] = validFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: "pending",
      progress: 0,
      selected: true,
    }))

    setUploadFiles((prev) => [...prev, ...newFiles])

    // 预处理文件内容
    newFiles.forEach((uploadFile) => {
      previewFile(uploadFile)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
    },
    multiple: true,
    onDropAccepted: (files) => {
      console.log("Files accepted:", files)
    },
    onDropRejected: (rejectedFiles) => {
      console.log("Files rejected:", rejectedFiles)
    },
    onError: (error) => {
      console.error("Dropzone error:", error)
    }
  })

  // 预览文件内容
  const previewFile = async (uploadFile: UploadFile) => {
    try {
      const text = await uploadFile.file.text()
      const content = JSON.parse(text)

      // 提取关键信息
      const keyInfo: any = {}

      if (content.results) {
        // Slither报告格式
        keyInfo.findings = content.results.length
        keyInfo.severity = Array.from(new Set(content.results.map((r: any) => r.impact)))
        keyInfo.tools = ["Slither"]
      } else if (content.tests) {
        // Echidna报告格式
        keyInfo.findings = content.tests.filter((t: any) => !t.passed).length
        keyInfo.tools = ["Echidna"]
      }

      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
                ...f,
                preview: {
                  content,
                  keyInfo,
                  structure: generateStructure(content),
                },
              }
            : f,
        ),
      )
    } catch (error) {
      console.error("Failed to preview file:", error)
    }
  }

  // 生成文件结构树
  const generateStructure = (obj: any, path = ""): any[] => {
    if (typeof obj !== "object" || obj === null) {
      return []
    }

    return Object.keys(obj).map((key) => {
      const currentPath = path ? `${path}.${key}` : key
      const value = obj[key]
      const isObject = typeof value === "object" && value !== null
      const isArray = Array.isArray(value)

      return {
        key,
        path: currentPath,
        type: isArray ? "array" : isObject ? "object" : typeof value,
        value: isObject ? null : value,
        children: isObject ? generateStructure(value, currentPath) : [],
        count: isArray ? value.length : isObject ? Object.keys(value).length : null,
      }
    })
  }

  // 单个文件上传
  const uploadSingleFile = async (uploadFile: UploadFile): Promise<void> => {
    const controller = new AbortController()
    abortControllers.current.set(uploadFile.id, controller)

    try {
      setUploadFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "uploading", progress: 0 } : f)),
      )

      const formData = new FormData()
      formData.append("files", uploadFile.file)

      const response = await axios.post(`${API_BASE_URL}/ingest`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal: controller.signal,
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0
          setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f)))
        },
        timeout: 300000, // 5分钟超时
      })

      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: "completed",
                progress: 100,
                response: response.data,
              }
            : f,
        ),
      )

      // 更新统计信息
      setUploadStats((prev) => ({
        ...prev,
        completedFiles: prev.completedFiles + 1,
        totalRecords: prev.totalRecords + (response.data.records_count || 0),
      }))
    } catch (error: any) {
      if (error.name === "CanceledError") {
        setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "paused" } : f)))
      } else {
        setUploadFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? {
                  ...f,
                  status: "failed",
                  error: error.response?.data?.message || error.message || "上传失败",
                }
              : f,
          ),
        )
        setUploadStats((prev) => ({
          ...prev,
          failedFiles: prev.failedFiles + 1,
        }))
      }
    } finally {
      abortControllers.current.delete(uploadFile.id)
      setActiveUploads((prev) => {
        const newSet = new Set(prev)
        newSet.delete(uploadFile.id)
        return newSet
      })
    }
  }

  // 批量上传
  const startBatchUpload = async () => {
    const selectedFiles = uploadFiles.filter((f) => f.selected && f.status === "pending")
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    uploadStartTime.current = Date.now()
    setUploadStats((prev) => ({
      ...prev,
      totalFiles: selectedFiles.length,
      completedFiles: 0,
      failedFiles: 0,
      totalRecords: 0,
    }))

    // 创建上传队列
    const queue = selectedFiles.map((f) => f.id)

    // 并发上传控制
    const processQueue = async () => {
      while (queue.length > 0 && activeUploads.size < MAX_CONCURRENT_UPLOADS) {
        const fileId = queue.shift()
        if (!fileId) break

        const file = uploadFiles.find((f) => f.id === fileId)
        if (!file) continue

        setActiveUploads((prev) => new Set([...Array.from(prev), fileId]))
        uploadSingleFile(file).finally(() => {
          processQueue() // 继续处理队列
        })
      }

      // 检查是否全部完成
      if (queue.length === 0 && activeUploads.size === 0) {
        setIsUploading(false)
        setUploadStats((prev) => ({
          ...prev,
          uploadTime: Date.now() - uploadStartTime.current,
        }))
      }
    }

    processQueue()
  }

  // 暂停上传
  const pauseUpload = (fileId: string) => {
    const controller = abortControllers.current.get(fileId)
    if (controller) {
      controller.abort()
    }
  }

  // 重试上传
  const retryUpload = (fileId: string) => {
    const file = uploadFiles.find((f) => f.id === fileId)
    if (file) {
      setUploadFiles((prev) =>
        prev.map((f) => {
          if (f.id === fileId) {
            const updatedFile = { ...f, status: "pending" as const, progress: 0 }
            delete (updatedFile as any).error
            return updatedFile
          }
          return f
        }),
      )
    }
  }

  // 删除文件
  const removeFile = (fileId: string) => {
    pauseUpload(fileId)
    setUploadFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  // 批量删除
  const removeSelectedFiles = () => {
    const selectedIds = uploadFiles.filter((f) => f.selected).map((f) => f.id)
    selectedIds.forEach(pauseUpload)
    setUploadFiles((prev) => prev.filter((f) => !f.selected))
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    const allSelected = uploadFiles.every((f) => f.selected)
    setUploadFiles((prev) => prev.map((f) => ({ ...f, selected: !allSelected })))
  }

  // 切换单个文件选择
  const toggleFileSelection = (fileId: string) => {
    setUploadFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, selected: !f.selected } : f)))
  }

  // 显示文件预览
  const showFilePreview = (uploadFile: UploadFile) => {
    if (uploadFile.preview) {
      setSelectedPreview({
        name: uploadFile.file.name,
        size: uploadFile.file.size,
        content: uploadFile.preview.content,
        structure: uploadFile.preview.structure,
        keyInfo: uploadFile.preview.keyInfo,
      })
      setShowPreview(true)
    }
  }

  // 切换树节点展开状态
  const toggleNode = (path: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  // 渲染树节点
  const renderTreeNode = (node: any, level = 0) => {
    const isExpanded = expandedNodes.has(node.path)
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={node.path} style={{ marginLeft: level * 16 }}>
        <div className="flex items-center space-x-2 py-1 hover:bg-gray-700/30 rounded px-2">
          {hasChildren ? (
            <button onClick={() => toggleNode(node.path)} className="text-gray-400 hover:text-white">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-4" />
          )}
          <span className="text-blue-400 text-sm">{node.key}</span>
          <span className="text-gray-500 text-xs">({node.type})</span>
          {node.count !== null && (
            <Badge variant="outline" className="text-xs">
              {node.count}
            </Badge>
          )}
          {node.value !== null && (
            <span className="text-gray-300 text-xs truncate max-w-32">
              {typeof node.value === "string" ? `"${node.value}"` : String(node.value)}
            </span>
          )}
        </div>
        {hasChildren && isExpanded && <div>{node.children.map((child: any) => renderTreeNode(child, level + 1))}</div>}
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "failed":
        return <XCircle className="w-5 h-5 text-red-400" />
      case "uploading":
        return <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      case "paused":
        return <Pause className="w-5 h-5 text-yellow-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400"
      case "failed":
        return "text-red-400"
      case "uploading":
        return "text-blue-400"
      case "paused":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  const selectedCount = uploadFiles.filter((f) => f.selected).length
  const overallProgress =
    uploadStats.totalFiles > 0
      ? Math.round(((uploadStats.completedFiles + uploadStats.failedFiles) / uploadStats.totalFiles) * 100)
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <SimpleNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">批量报告上传</h1>
          <p className="text-xl text-gray-300">上传多个JSON格式的Slither和Echidna审计报告</p>
        </div>
        <div className="max-w-7xl mx-auto">
          {/* 统计信息 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Database className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{uploadFiles.length}</p>
                  <p className="text-sm text-gray-400">总文件数</p>
                </div>
              </div>
            </CardContent>
          </Card>

            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{uploadStats.completedFiles}</p>
                  <p className="text-sm text-gray-400">上传成功</p>
                </div>
              </div>
            </CardContent>
          </Card>

            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <XCircle className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{uploadStats.failedFiles}</p>
                  <p className="text-sm text-gray-400">上传失败</p>
                </div>
              </div>
            </CardContent>
          </Card>

            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{uploadStats.totalRecords}</p>
                  <p className="text-sm text-gray-400">审计记录</p>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：文件上传和列表 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 文件上传区域 */}
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>批量文件上传</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  支持JSON格式的Slither和Echidna审计报告（最大50MB）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"
                  }`}
                  onClick={() => {
                    console.log("Dropzone clicked!")
                  }}
                >
                  <input {...getInputProps()} />
                  <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">
                    {isDragActive ? "放下文件开始上传" : "拖拽JSON文件到此处或点击选择"}
                  </p>
                  <p className="text-sm text-gray-500">支持多文件同时上传，单个文件最大50MB</p>

                  {/* 备用文件输入按钮 */}
                  <div className="mt-4">
                    <input
                      type="file"
                      accept=".json"
                      multiple
                      onChange={(e) => {
                        console.log("File input changed:", e.target.files)
                        if (e.target.files) {
                          const files = Array.from(e.target.files)
                          onDrop(files)
                        }
                      }}
                      className="hidden"
                      id="file-input-backup"
                    />
                    <label
                      htmlFor="file-input-backup"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
                    >
                      选择文件
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 独立的文件选择测试区域 */}
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-300 mb-4">🔧 文件选择测试区域</p>

                  {/* 测试用的隐藏文件输入 */}
                  <input
                    type="file"
                    accept=".json"
                    multiple
                    onChange={(e) => {
                      console.log("Test file input changed:", e.target.files)
                      if (e.target.files) {
                        const files = Array.from(e.target.files)
                        console.log("Files selected:", files.map(f => f.name))
                        onDrop(files)
                      }
                    }}
                    className="hidden"
                    id="test-file-input"
                  />

                  {/* 测试按钮1: 使用label */}
                  <label
                    htmlFor="test-file-input"
                    className="inline-block px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700 mr-4"
                    onClick={() => {
                      console.log("Test label clicked!")
                    }}
                  >
                    📁 Label方式选择
                  </label>

                  {/* 测试按钮2: 使用JavaScript触发 */}
                  <button
                    onClick={() => {
                      console.log("Test button clicked!")
                      const input = document.getElementById('test-file-input') as HTMLInputElement
                      if (input) {
                        console.log("Input element found, triggering click")
                        input.click()
                      } else {
                        console.log("Input element not found!")
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mr-4"
                  >
                    🔧 JS触发选择
                  </button>

                  {/* 测试按钮3: 直接显示的文件输入 */}
                  <input
                    type="file"
                    accept=".json"
                    multiple
                    onChange={(e) => {
                      console.log("Direct file input changed:", e.target.files)
                      if (e.target.files) {
                        const files = Array.from(e.target.files)
                        onDrop(files)
                      }
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 批量操作 */}
            {uploadFiles.length > 0 && (
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={uploadFiles.length > 0 && uploadFiles.every((f) => f.selected)}
                        onCheckedChange={toggleSelectAll}
                      />
                      <span className="text-gray-300">
                        已选择 {selectedCount} / {uploadFiles.length} 个文件
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={startBatchUpload}
                        disabled={isUploading || selectedCount === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isUploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            上传中...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            批量上传
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={removeSelectedFiles}
                        variant="outline"
                        disabled={selectedCount === 0}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除选中
                      </Button>
                    </div>
                  </div>

                  {/* 整体进度条 */}
                  {isUploading && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>整体进度</span>
                        <span>{overallProgress}%</span>
                      </div>
                      <Progress value={overallProgress} className="w-full" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 文件列表 */}
            {uploadFiles.length > 0 && (
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">文件列表</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {uploadFiles.map((uploadFile) => (
                        <div key={uploadFile.id} className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg">
                          <Checkbox
                            checked={uploadFile.selected}
                            onCheckedChange={() => toggleFileSelection(uploadFile.id)}
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                              <span className="text-white text-sm font-medium truncate">{uploadFile.file.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                              </Badge>
                            </div>

                            <div className="flex items-center space-x-2 mb-2">
                              {getStatusIcon(uploadFile.status)}
                              <span className={`text-sm ${getStatusColor(uploadFile.status)}`}>
                                {uploadFile.status === "pending" && "等待上传"}
                                {uploadFile.status === "uploading" && "上传中..."}
                                {uploadFile.status === "completed" && "上传完成"}
                                {uploadFile.status === "failed" && "上传失败"}
                                {uploadFile.status === "paused" && "已暂停"}
                              </span>
                              {uploadFile.preview?.keyInfo && (
                                <div className="flex space-x-1">
                                  {uploadFile.preview.keyInfo.findings && (
                                    <Badge variant="outline" className="text-xs text-orange-400 border-orange-400">
                                      {uploadFile.preview.keyInfo.findings} 发现
                                    </Badge>
                                  )}
                                  {uploadFile.preview.keyInfo.tools?.map((tool: string) => (
                                    <Badge
                                      key={tool}
                                      variant="outline"
                                      className="text-xs text-blue-400 border-blue-400"
                                    >
                                      {tool}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            {uploadFile.status === "uploading" && (
                              <Progress value={uploadFile.progress} className="w-full h-2" />
                            )}

                            {uploadFile.error && (
                              <Alert className="mt-2 bg-red-900/20 border-red-500">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-red-400 text-sm">{uploadFile.error}</AlertDescription>
                              </Alert>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {uploadFile.preview && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => showFilePreview(uploadFile)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}

                            {uploadFile.status === "failed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => retryUpload(uploadFile.id)}
                                className="text-gray-400 hover:text-green-400"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            )}

                            {uploadFile.status === "uploading" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => pauseUpload(uploadFile.id)}
                                className="text-gray-400 hover:text-yellow-400"
                              >
                                <Pause className="w-4 h-4" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(uploadFile.id)}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧：上传统计 */}
          <div className="space-y-6">
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">上传统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">总文件数</span>
                    <Badge variant="outline" className="text-blue-400 border-blue-400">
                      {uploadFiles.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">已选择</span>
                    <Badge variant="outline" className="text-purple-400 border-purple-400">
                      {selectedCount}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">上传成功</span>
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      {uploadStats.completedFiles}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">上传失败</span>
                    <Badge variant="outline" className="text-red-400 border-red-400">
                      {uploadStats.failedFiles}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">审计记录</span>
                    <Badge variant="outline" className="text-orange-400 border-orange-400">
                      {uploadStats.totalRecords}
                    </Badge>
                  </div>
                  {uploadStats.uploadTime > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">耗时</span>
                      <Badge variant="outline" className="text-gray-400 border-gray-400">
                        {Math.round(uploadStats.uploadTime / 1000)}s
                      </Badge>
                    </div>
                  )}
                </div>

                {uploadStats.totalFiles > 0 && (
                  <div className="pt-4 border-t border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">{overallProgress}%</div>
                      <div className="text-sm text-gray-400">整体完成度</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 使用说明 */}
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">使用说明</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>支持拖拽多个JSON文件同时上传</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>自动识别Slither和Echidna报告格式</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>支持最多{MAX_CONCURRENT_UPLOADS}个文件并发上传</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>可以暂停、重试失败的上传任务</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>点击眼睛图标预览文件内容</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 文件预览对话框 */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedPreview?.name}</DialogTitle>
            <DialogDescription className="text-gray-400">
              文件大小: {selectedPreview ? (selectedPreview.size / 1024 / 1024).toFixed(2) : 0} MB
            </DialogDescription>
          </DialogHeader>

          {selectedPreview && (
            <Tabs defaultValue="structure" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-700/50">
                <TabsTrigger value="structure" className="text-gray-300">
                  结构
                </TabsTrigger>
                <TabsTrigger value="content" className="text-gray-300">
                  内容
                </TabsTrigger>
                <TabsTrigger value="info" className="text-gray-300">
                  信息
                </TabsTrigger>
              </TabsList>

              <TabsContent value="structure" className="mt-4">
                <ScrollArea className="h-96 bg-gray-900/50 rounded-lg p-4">
                  <div className="space-y-1">{selectedPreview.structure.map((node) => renderTreeNode(node))}</div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="content" className="mt-4">
                <ScrollArea className="h-96">
                  <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-auto">
                    {JSON.stringify(selectedPreview.content, null, 2)}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="info" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">发现问题</div>
                      <div className="text-2xl font-bold text-white">{selectedPreview.keyInfo.findings || 0}</div>
                    </div>
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">分析工具</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedPreview.keyInfo.tools?.map((tool) => (
                          <Badge key={tool} variant="outline" className="text-blue-400 border-blue-400">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {selectedPreview.keyInfo.severity && (
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="text-sm text-gray-400 mb-2">风险等级分布</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedPreview.keyInfo.severity.map((severity) => (
                          <Badge
                            key={severity}
                            className={
                              severity === "High"
                                ? "text-red-400 bg-red-900/20 border-red-500"
                                : severity === "Medium"
                                  ? "text-orange-400 bg-orange-900/20 border-orange-500"
                                  : "text-yellow-400 bg-yellow-900/20 border-yellow-500"
                            }
                          >
                            {severity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
        </div>
      </div>
  )
}
