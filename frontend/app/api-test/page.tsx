"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ApiStatus, ApiErrorDisplay } from "@/components/api"
import { useHealthCheck, useContractAnalysis, useAIChat, useBatchUpload } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "@/components/common/FileUpload"

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  // 健康检查测试
  const { health, loading: healthLoading, error: healthError, refetch } = useHealthCheck(0) // 禁用自动检查

  // 合约分析测试
  const { analysis, loading: analysisLoading, error: analysisError, startAnalysis, progress } = useContractAnalysis()

  // AI聊天测试
  const { messages, loading: chatLoading, error: chatError, sendMessage, clearMessages } = useAIChat()

  // 批量上传测试
  const {
    files,
    uploading,
    progress: uploadProgress,
    results,
    errors,
    uploadFiles,
    addFiles,
    clearFiles,
  } = useBatchUpload()

  const [chatInput, setChatInput] = useState("")
  const [contractAddress, setContractAddress] = useState("")
  const [contractName, setContractName] = useState("")

  const testHealthCheck = async () => {
    try {
      await refetch()
      setTestResults((prev) => ({ ...prev, health: "✅ 健康检查成功" }))
    } catch (error) {
      setTestResults((prev) => ({ ...prev, health: "❌ 健康检查失败" }))
    }
  }

  const testContractAnalysis = async () => {
    try {
      await startAnalysis({
        address: contractAddress,
        contract_name: contractName,
        analysis_types: { slither: true, echidna: false },
      })
      setTestResults((prev) => ({ ...prev, analysis: "✅ 合约分析启动成功" }))
    } catch (error) {
      setTestResults((prev) => ({ ...prev, analysis: "❌ 合约分析失败" }))
    }
  }

  const testAIChat = async () => {
    if (!chatInput.trim()) return

    try {
      await sendMessage(chatInput)
      setChatInput("")
      setTestResults((prev) => ({ ...prev, chat: "✅ AI问答成功" }))
    } catch (error) {
      setTestResults((prev) => ({ ...prev, chat: "❌ AI问答失败" }))
    }
  }

  const testBatchUpload = async () => {
    if (files.length === 0) return

    try {
      await uploadFiles(files)
      setTestResults((prev) => ({ ...prev, upload: "✅ 批量上传成功" }))
    } catch (error) {
      setTestResults((prev) => ({ ...prev, upload: "❌ 批量上传失败" }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">API测试页面</h1>
          <p className="text-gray-400">测试所有API接口的功能和性能</p>
          <div className="mt-4">
            <ApiStatus />
          </div>
        </div>

        <ApiErrorDisplay />

        <Tabs defaultValue="health" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 mb-8">
            <TabsTrigger value="health">健康检查</TabsTrigger>
            <TabsTrigger value="analysis">合约分析</TabsTrigger>
            <TabsTrigger value="chat">AI问答</TabsTrigger>
            <TabsTrigger value="upload">批量上传</TabsTrigger>
          </TabsList>

          <TabsContent value="health">
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">健康检查API测试</CardTitle>
                <CardDescription className="text-gray-400">测试系统健康状态检查接口</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button onClick={testHealthCheck} disabled={healthLoading} className="bg-blue-600 hover:bg-blue-700">
                    {healthLoading ? "检查中..." : "执行健康检查"}
                  </Button>
                  {testResults.health && <Badge variant="outline">{testResults.health}</Badge>}
                </div>

                {health && (
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <h4 className="text-white font-medium mb-2">检查结果:</h4>
                    <pre className="text-sm text-gray-300">{JSON.stringify(health, null, 2)}</pre>
                  </div>
                )}

                {healthError && (
                  <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400">错误: {healthError}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">合约分析API测试</CardTitle>
                <CardDescription className="text-gray-400">测试智能合约安全分析接口</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">合约地址</label>
                    <Input
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      placeholder="0x..."
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">合约名称</label>
                    <Input
                      value={contractName}
                      onChange={(e) => setContractName(e.target.value)}
                      placeholder="合约名称"
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    onClick={testContractAnalysis}
                    disabled={analysisLoading || !contractAddress}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {analysisLoading ? "分析中..." : "开始分析"}
                  </Button>
                  {testResults.analysis && <Badge variant="outline">{testResults.analysis}</Badge>}
                </div>

                {analysisLoading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>分析进度</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {analysis && (
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <h4 className="text-white font-medium mb-2">分析结果:</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>文档ID: {analysis.doc_id}</p>
                      <p>状态: {analysis.status}</p>
                      <p>发现问题: {analysis.slither_findings.length}</p>
                      <p>测试失败: {analysis.echidna_fails.length}</p>
                    </div>
                  </div>
                )}

                {analysisError && (
                  <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400">错误: {analysisError}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">AI问答API测试</CardTitle>
                <CardDescription className="text-gray-400">测试智能问答接口</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="输入您的问题..."
                    className="bg-gray-700/50 border-gray-600 text-white"
                    rows={3}
                  />
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={testAIChat}
                      disabled={chatLoading || !chatInput.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {chatLoading ? "发送中..." : "发送"}
                    </Button>
                    <Button onClick={clearMessages} variant="outline" size="sm">
                      清空
                    </Button>
                  </div>
                </div>

                {testResults.chat && <Badge variant="outline">{testResults.chat}</Badge>}

                <div className="max-h-96 overflow-y-auto space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="p-3 bg-gray-900/50 rounded-lg">
                      {message.question && (
                        <div className="mb-2">
                          <span className="text-blue-400 font-medium">问题: </span>
                          <span className="text-white">{message.question}</span>
                        </div>
                      )}
                      {message.answer && (
                        <div>
                          <span className="text-green-400 font-medium">回答: </span>
                          <span className="text-gray-300">{message.answer}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {chatError && (
                  <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400">错误: {chatError}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">批量上传API测试</CardTitle>
                <CardDescription className="text-gray-400">测试文件批量上传接口</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUpload
                  accept={{ "application/json": [".json"] }}
                  multiple={true}
                  onFilesChange={addFiles}
                  className="mb-4"
                />

                <div className="flex items-center space-x-4">
                  <Button
                    onClick={testBatchUpload}
                    disabled={uploading || files.length === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {uploading ? "上传中..." : "开始上传"}
                  </Button>
                  <Button onClick={clearFiles} variant="outline" size="sm">
                    清空文件
                  </Button>
                  {testResults.upload && <Badge variant="outline">{testResults.upload}</Badge>}
                </div>

                {uploading && uploadProgress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>上传进度</span>
                      <span>
                        {uploadProgress.processed}/{uploadProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(uploadProgress.processed / uploadProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {results.length > 0 && (
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <h4 className="text-white font-medium mb-2">上传结果:</h4>
                    <div className="space-y-1 text-sm text-gray-300">
                      {results.map((result, index) => (
                        <p key={index}>
                          处理文件: {result.total_processed}, 成功: {result.successful}, 失败: {result.failed}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {errors.length > 0 && (
                  <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <h4 className="text-red-400 font-medium mb-2">上传错误:</h4>
                    <div className="space-y-1 text-sm">
                      {errors.map((error, index) => (
                        <p key={index} className="text-red-300">
                          {error.file}: {error.error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
