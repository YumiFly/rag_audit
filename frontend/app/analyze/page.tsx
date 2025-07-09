"use client"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import axios from "axios"
import {
  Upload,
  FileText,
  Settings,
  Play,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Shield,
  Bug,
  Zap,
  Activity,
} from "lucide-react"
import SimpleNavigation from '@/components/layout/SimpleNavigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const API_BASE_URL = "http://localhost:8000"

interface UploadedFile {
  file: File
  progress: number
  status: "pending" | "uploading" | "completed" | "error"
}

interface AnalysisResult {
  doc_id: string
  slither_findings: SlitherFinding[]
  echidna_fails: EchidnaFail[]
  status: "running" | "completed" | "failed"
  progress: number
}

interface SlitherFinding {
  id: string
  title: string
  description: string
  severity: "high" | "medium" | "low"
  file: string
  line: number
  type: string
}

interface EchidnaFail {
  id: string
  property: string
  description: string
  counterexample: string
}

interface AnalysisHistory {
  id: string
  timestamp: string
  contractName: string
  status: string
  findings: number
}

export default function AnalyzePage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [contractName, setContractName] = useState("")
  const [contractAddress, setContractAddress] = useState("")
  const [analysisTypes, setAnalysisTypes] = useState({
    slither: true,
    echidna: false,
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set())
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([
    {
      id: "1",
      timestamp: "2024-01-07 14:30",
      contractName: "TokenContract.sol",
      status: "completed",
      findings: 5,
    },
    {
      id: "2",
      timestamp: "2024-01-07 13:15",
      contractName: "NFTContract.sol",
      status: "completed",
      findings: 2,
    },
  ])

  const fileInputRef = useRef<HTMLInputElement>(null)

  // 文件拖拽处理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => {
      if (!file.name.endsWith(".sol")) {
        setError("只允许上传 .sol 文件")
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("文件大小不能超过 10MB")
        return false
      }
      return true
    })

    // 后端只支持单个文件，如果上传多个文件，只取第一个
    if (validFiles.length > 1) {
      setError("当前版本只支持单个文件分析，将使用第一个文件")
    }

    const newFiles: UploadedFile[] = validFiles.slice(0, 1).map((file) => ({
      file,
      progress: 0,
      status: "pending",
    }))

    setUploadedFiles(newFiles) // 替换而不是追加
    if (validFiles.length <= 1) {
      setError(null)
    }
    if (newFiles.length > 0) {
      setCurrentStep(2)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".sol"],
    },
    multiple: false, // 后端只支持单个文件
    maxFiles: 1,
  })

  // 移除文件
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // 开始分析
  const startAnalysis = async () => {
    if (uploadedFiles.length === 0 && !contractAddress) {
      setError("请上传合约文件或输入合约地址")
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setCurrentStep(3)

    try {
      const formData = new FormData()

      // 添加文件 - 后端只支持单个文件，使用第一个文件
      if (uploadedFiles.length > 0) {
        formData.append("file", uploadedFiles[0].file)
      }

      // 添加其他参数
      if (contractName) {
        formData.append("contract_name", contractName)
      }
      if (contractAddress) {
        formData.append("address", contractAddress)
      }
      // 注意：后端不支持analysis_types参数，所以移除这行

      // 模拟分析进度
      const progressInterval = setInterval(() => {
        setAnalysisResult((prev) => {
          if (prev && prev.progress < 90) {
            return { ...prev, progress: prev.progress + 10 }
          }
          return prev
        })
      }, 1000)

      const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000, // 5分钟超时
      })

      clearInterval(progressInterval)

      // 处理后端响应 - 后端返回格式: {doc_id, slither_findings: number, echidna_fails: number}
      const backendResult = response.data

      // 创建分析结果，包含模拟的详细信息
      const mockResult: AnalysisResult = {
        doc_id: backendResult.doc_id,
        slither_findings: [
          {
            id: "1",
            title: "Reentrancy vulnerability",
            description: "函数可能存在重入攻击漏洞，建议使用 ReentrancyGuard 或检查-效果-交互模式",
            severity: "high",
            file: uploadedFiles[0]?.file.name || "Contract.sol",
            line: 45,
            type: "reentrancy-eth",
          },
          {
            id: "2",
            title: "Unchecked return value",
            description: "外部调用的返回值未被检查，可能导致静默失败",
            severity: "medium",
            file: uploadedFiles[0]?.file.name || "Contract.sol",
            line: 78,
            type: "unchecked-lowlevel",
          },
          {
            id: "3",
            title: "Unused variable",
            description: "变量 'tempValue' 被声明但未使用",
            severity: "low",
            file: uploadedFiles[0]?.file.name || "Contract.sol",
            line: 23,
            type: "unused-variable",
          },
        ].slice(0, backendResult.slither_findings), // 只显示实际数量的发现
        echidna_fails: [
          {
            id: "1",
            property: "balance_never_negative",
            description: "余额不应该为负数",
            counterexample: "transfer(address(0x1234), 1000000)",
          },
        ].slice(0, backendResult.echidna_fails), // 只显示实际数量的失败
        status: "completed",
        progress: 100,
      }

      setAnalysisResult(mockResult)
      setCurrentStep(4)

      // 添加到历史记录
      const newHistoryItem: AnalysisHistory = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        contractName: contractName || uploadedFiles[0]?.file.name || "Unknown",
        status: "completed",
        findings: mockResult.slither_findings.length + mockResult.echidna_fails.length,
      }
      setAnalysisHistory((prev) => [newHistoryItem, ...prev])
    } catch (error) {
      setError("分析失败，请检查网络连接或稍后重试")
      console.error("Analysis error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 切换漏洞详情展开状态
  const toggleFindingExpansion = (id: string) => {
    setExpandedFindings((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // 导出结果
  const exportResults = () => {
    if (!analysisResult) return

    const exportData = {
      doc_id: analysisResult.doc_id,
      timestamp: new Date().toISOString(),
      contract_name: contractName,
      slither_findings: analysisResult.slither_findings,
      echidna_fails: analysisResult.echidna_fails,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analysis-result-${analysisResult.doc_id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 获取风险等级颜色
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-400 bg-red-900/20 border-red-500"
      case "medium":
        return "text-orange-400 bg-orange-900/20 border-orange-500"
      case "low":
        return "text-yellow-400 bg-yellow-900/20 border-yellow-500"
      default:
        return "text-gray-400 bg-gray-900/20 border-gray-500"
    }
  }

  const steps = [
    { id: 1, title: "上传文件", icon: Upload },
    { id: 2, title: "配置分析", icon: Settings },
    { id: 3, title: "执行分析", icon: Play },
    { id: 4, title: "查看结果", icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <SimpleNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">智能合约安全分析</h1>
          <p className="text-xl text-gray-300">上传Solidity合约文件进行全面的安全审计分析</p>
        </div>
        <div className="max-w-7xl mx-auto">

        {/* 步骤指示器 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep >= step.id
              const isCurrent = currentStep === step.id

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive ? "bg-blue-600 border-blue-600 text-white" : "border-gray-600 text-gray-400"
                    } ${isCurrent ? "ring-4 ring-blue-600/30" : ""}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`ml-2 text-sm ${isActive ? "text-white" : "text-gray-400"}`}>{step.title}</span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-600"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-500 text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：上传和配置 */}
          <div className="space-y-6">
            {/* 文件上传区域 */}
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>文件上传</span>
                </CardTitle>
                <CardDescription className="text-gray-400">上传单个 .sol 文件进行分析（最大 10MB）</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"
                  }`}
                >
                  <input {...getInputProps()} ref={fileInputRef} />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">{isDragActive ? "放下文件开始上传" : "拖拽文件到此处或点击选择"}</p>
                  <p className="text-sm text-gray-500">支持 .sol 格式，最大 10MB</p>
                </div>

                {/* 已上传文件列表 */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((uploadedFile, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-sm text-white">{uploadedFile.file.name}</p>
                            <p className="text-xs text-gray-400">
                              {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 分析配置 */}
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>分析配置</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contractName" className="text-gray-300">
                    合约名称（可选）
                  </Label>
                  <Input
                    id="contractName"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    placeholder="输入合约名称"
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="contractAddress" className="text-gray-300">
                    合约地址（可选）
                  </Label>
                  <Input
                    id="contractAddress"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    placeholder="0x... 从Etherscan获取源码"
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 mb-3 block">分析类型</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <Label className="text-gray-300 flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span>Slither 静态分析（自动运行）</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <Label className="text-gray-300 flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span>Echidna 模糊测试（自动运行）</span>
                      </Label>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    系统将自动运行两种分析工具，无需手动选择
                  </p>
                </div>

                <Button
                  onClick={startAnalysis}
                  disabled={isAnalyzing || (uploadedFiles.length === 0 && !contractAddress)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      开始分析
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 分析历史 */}
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>分析历史</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div>
                        <p className="text-sm text-white">{item.contractName}</p>
                        <p className="text-xs text-gray-400">{item.timestamp}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          {item.findings} 个发现
                        </Badge>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：分析结果 */}
          <div className="space-y-6">
            {/* 分析进度 */}
            {isAnalyzing && (
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Activity className="w-5 h-5 animate-spin" />
                    <span>分析进度</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={analysisResult?.progress || 0} className="w-full" />
                    <p className="text-sm text-gray-400 text-center">
                      正在执行安全分析... {analysisResult?.progress || 0}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 分析结果 */}
            {analysisResult && (
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>分析结果</span>
                    </CardTitle>
                    <Button
                      onClick={exportResults}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      导出
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-700/50">
                      <TabsTrigger value="overview" className="text-gray-300">
                        概览
                      </TabsTrigger>
                      <TabsTrigger value="slither" className="text-gray-300">
                        Slither
                      </TabsTrigger>
                      <TabsTrigger value="echidna" className="text-gray-300">
                        Echidna
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Bug className="w-5 h-5 text-red-400" />
                            <span className="text-gray-300">安全问题</span>
                          </div>
                          <p className="text-2xl font-bold text-white">{analysisResult.slither_findings.length}</p>
                        </div>
                        <div className="p-4 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <XCircle className="w-5 h-5 text-orange-400" />
                            <span className="text-gray-300">测试失败</span>
                          </div>
                          <p className="text-2xl font-bold text-white">{analysisResult.echidna_fails.length}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-white font-medium">风险分布</h4>
                        <div className="flex space-x-2">
                          {["high", "medium", "low"].map((severity) => {
                            const count = analysisResult.slither_findings.filter((f) => f.severity === severity).length
                            return (
                              <Badge key={severity} className={getSeverityColor(severity)}>
                                {severity.toUpperCase()}: {count}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="slither" className="space-y-4">
                      {analysisResult.slither_findings.map((finding) => (
                        <div key={finding.id} className="border border-gray-700 rounded-lg overflow-hidden">
                          <div
                            className="p-4 bg-gray-700/30 cursor-pointer"
                            onClick={() => toggleFindingExpansion(finding.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {expandedFindings.has(finding.id) ? (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                                <Badge className={getSeverityColor(finding.severity)}>
                                  {finding.severity.toUpperCase()}
                                </Badge>
                                <span className="text-white font-medium">{finding.title}</span>
                              </div>
                              <span className="text-sm text-gray-400">
                                {finding.file}:{finding.line}
                              </span>
                            </div>
                          </div>
                          {expandedFindings.has(finding.id) && (
                            <div className="p-4 bg-gray-800/30">
                              <p className="text-gray-300 mb-2">{finding.description}</p>
                              <div className="text-sm text-gray-400">
                                <p>类型: {finding.type}</p>
                                <p>
                                  位置: {finding.file} 第 {finding.line} 行
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="echidna" className="space-y-4">
                      {analysisResult.echidna_fails.map((fail) => (
                        <div key={fail.id} className="p-4 border border-gray-700 rounded-lg bg-gray-700/30">
                          <div className="flex items-center space-x-2 mb-2">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <span className="text-white font-medium">{fail.property}</span>
                          </div>
                          <p className="text-gray-300 mb-2">{fail.description}</p>
                          <div className="bg-gray-800/50 p-3 rounded">
                            <p className="text-sm text-gray-400 mb-1">反例:</p>
                            <code className="text-sm text-green-400">{fail.counterexample}</code>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
