"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import {
  Send,
  Trash2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Settings,
  MessageSquare,
  Lightbulb,
  Code,
  Shield,
  Zap,
  Bot,
  User,
} from "lucide-react"
import SimpleNavigation from '@/components/layout/SimpleNavigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

const API_BASE_URL = "http://localhost:8000"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  isTyping?: boolean
  feedback?: "like" | "dislike" | null
}

interface PresetQuestion {
  id: string
  title: string
  question: string
  category: string
  icon: React.ReactNode
}

const presetQuestions: PresetQuestion[] = [
  {
    id: "1",
    title: "重入攻击防范",
    question: "什么是重入攻击？如何在智能合约中防范重入攻击？请提供具体的代码示例。",
    category: "安全漏洞",
    icon: <Shield className="w-4 h-4" />,
  },
  {
    id: "2",
    title: "整数溢出问题",
    question: "智能合约中的整数溢出问题是什么？Solidity 0.8.0之后如何处理？",
    category: "安全漏洞",
    icon: <Code className="w-4 h-4" />,
  },
  {
    id: "3",
    title: "访问控制检查",
    question: "如何在智能合约中实现安全的访问控制？有哪些最佳实践？",
    category: "最佳实践",
    icon: <Shield className="w-4 h-4" />,
  },
  {
    id: "4",
    title: "DeFi安全漏洞",
    question: "DeFi协议中常见的安全漏洞有哪些？如何进行安全审计？",
    category: "DeFi安全",
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: "5",
    title: "NFT合约安全",
    question: "NFT智能合约开发中需要注意哪些安全问题？有什么最佳实践？",
    category: "NFT安全",
    icon: <Code className="w-4 h-4" />,
  },
  {
    id: "6",
    title: "Gas优化技巧",
    question: "智能合约Gas优化有哪些技巧？如何降低交易成本？",
    category: "优化技巧",
    icon: <Zap className="w-4 h-4" />,
  },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [topK, setTopK] = useState([5])
  const [showSettings, setShowSettings] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 从localStorage加载对话历史
  useEffect(() => {
    const savedMessages = localStorage.getItem("chat-messages")
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        setMessages(parsed.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) })))
      } catch (error) {
        console.error("Failed to load chat history:", error)
      }
    }
  }, [])

  // 保存对话历史到localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chat-messages", JSON.stringify(messages))
    }
  }, [messages])

  // 发送消息
  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: question.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // 添加AI思考中的消息
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "ai",
      content: "",
      timestamp: new Date(),
      isTyping: true,
    }
    setMessages((prev) => [...prev, thinkingMessage])

    try {
      const response = await axios.post(
        `${API_BASE_URL}/ask`,
        {
          question: question.trim(),
          top_k: topK[0],
        },
        {
          timeout: 60000, // 60秒超时
        },
      )

      // 移除思考中的消息
      setMessages((prev) => prev.filter((msg) => msg.id !== thinkingMessage.id))

      // 模拟打字机效果
      const aiResponse = response.data.answer || "抱歉，我无法回答这个问题。请尝试重新表述或联系技术支持。"
      await typewriterEffect(aiResponse)
    } catch (error) {
      console.error("Failed to send message:", error)

      // 移除思考中的消息并显示错误
      setMessages((prev) => prev.filter((msg) => msg.id !== thinkingMessage.id))

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: "ai",
        content: "抱歉，服务暂时不可用。请检查网络连接或稍后重试。",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // 打字机效果
  const typewriterEffect = async (text: string) => {
    const aiMessage: Message = {
      id: Date.now().toString(),
      type: "ai",
      content: "",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, aiMessage])

    for (let i = 0; i <= text.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20))
      setMessages((prev) => prev.map((msg) => (msg.id === aiMessage.id ? { ...msg, content: text.slice(0, i) } : msg)))
    }
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  // 清空对话
  const clearChat = () => {
    setMessages([])
    localStorage.removeItem("chat-messages")
  }

  // 复制消息内容
  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      // 可以添加toast提示
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  // 反馈处理
  const handleFeedback = (messageId: string, feedback: "like" | "dislike") => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedback: msg.feedback === feedback ? null : feedback } : msg,
      ),
    )
  }

  // 使用预设问题
  const usePresetQuestion = (question: string) => {
    setInputValue(question)
    textareaRef.current?.focus()
  }

  // 获取问题建议
  const getSuggestions = (input: string) => {
    if (input.length < 2) {
      setSuggestions([])
      return
    }

    const filtered = presetQuestions
      .filter(
        (q) =>
          q.question.toLowerCase().includes(input.toLowerCase()) || q.title.toLowerCase().includes(input.toLowerCase()),
      )
      .slice(0, 3)
      .map((q) => q.question)

    setSuggestions(filtered)
  }

  // 输入变化处理
  const handleInputChange = (value: string) => {
    setInputValue(value)
    getSuggestions(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <SimpleNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">AI智能问答</h1>
          <p className="text-xl text-gray-300">基于Google Gemini的智能合约安全咨询助手</p>
        </div>
        <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧：预设问题和设置 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 预设问题 */}
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  <span>常见问题</span>
                </CardTitle>
                <CardDescription className="text-gray-400">点击快速提问</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {presetQuestions.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => usePresetQuestion(preset.question)}
                      className="p-3 bg-gray-700/30 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {preset.icon}
                        <span className="text-sm font-medium text-white">{preset.title}</span>
                      </div>
                      <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                        {preset.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 设置面板 */}
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>设置</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300 mb-2 block">相关性设置 (Top-K)</Label>
                  <Slider value={topK} onValueChange={setTopK} max={10} min={1} step={1} className="w-full" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>精确</span>
                    <span>{topK[0]}</span>
                    <span>广泛</span>
                  </div>
                </div>
                <Button
                  onClick={clearChat}
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  清空对话
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：聊天界面 */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50 h-[calc(100vh-200px)]">
              <CardHeader className="border-b border-gray-700/50">
                <CardTitle className="text-white flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>智能合约安全咨询</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {messages.length > 0 ? `${messages.length} 条消息` : "开始您的安全咨询"}
                </CardDescription>
              </CardHeader>

              {/* 消息列表 */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-400px)]">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <Bot className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-lg mb-2">欢迎使用RAG智能问答</p>
                    <p className="text-sm">请选择预设问题或输入您的问题开始咨询</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-700/50 text-gray-100"
                        }`}
                      >
                        {/* 消息头部 */}
                        <div className="flex items-center space-x-2 mb-2">
                          {message.type === "user" ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4 text-blue-400" />
                          )}
                          <span className="text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</span>
                        </div>

                        {/* 消息内容 */}
                        {message.isTyping ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-400">AI正在思考...</span>
                          </div>
                        ) : (
                          <div className="prose prose-invert max-w-none">
                            {message.type === "ai" ? (
                              <ReactMarkdown
                                components={{
                                  code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || "")
                                    return !inline && match ? (
                                      <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                                        {String(children).replace(/\n$/, "")}
                                      </SyntaxHighlighter>
                                    ) : (
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    )
                                  },
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            ) : (
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            )}
                          </div>
                        )}

                        {/* AI消息操作按钮 */}
                        {message.type === "ai" && !message.isTyping && (
                          <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-600/30">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyMessage(message.content)}
                              className="text-gray-400 hover:text-white p-1 h-auto"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(message.id, "like")}
                              className={`p-1 h-auto ${
                                message.feedback === "like" ? "text-green-400" : "text-gray-400 hover:text-green-400"
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(message.id, "dislike")}
                              className={`p-1 h-auto ${
                                message.feedback === "dislike" ? "text-red-400" : "text-gray-400 hover:text-red-400"
                              }`}
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* 输入区域 */}
              <div className="border-t border-gray-700/50 p-4">
                {/* 建议列表 */}
                {suggestions.length > 0 && (
                  <div className="mb-3 space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => usePresetQuestion(suggestion)}
                        className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer p-2 bg-gray-700/30 rounded truncate"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="输入您的智能合约安全问题..."
                      className="bg-gray-700/50 border-gray-600 text-white resize-none min-h-[60px] pr-16"
                      disabled={isLoading}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400">{inputValue.length}/2000</div>
                  </div>
                  <Button
                    onClick={() => sendMessage(inputValue)}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
