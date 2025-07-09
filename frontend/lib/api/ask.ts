"use client"

import { useCallback } from "react"

import { useState } from "react"

import { apiClient } from "./client"

export interface AskRequest {
  question: string
  top_k?: number
  context?: string
  conversation_id?: string
}

export interface AskResponse {
  answer: string
  sources?: Array<{
    title: string
    content: string
    score: number
    metadata?: Record<string, any>
  }>
  conversation_id?: string
  tokens_used?: number
  response_time?: number
}

export interface ConversationHistory {
  id: string
  question: string
  answer: string
  timestamp: string
  sources?: AskResponse["sources"]
}

export const askQuestion = async (data: AskRequest): Promise<AskResponse> => {
  try {
    const response = await apiClient.post<AskResponse>("/ask", data, {
      timeout: 60000, // 1分钟超时
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getConversationHistory = async (conversationId: string): Promise<ConversationHistory[]> => {
  try {
    const response = await apiClient.get<ConversationHistory[]>(`/conversations/${conversationId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    await apiClient.delete(`/conversations/${conversationId}`)
  } catch (error) {
    throw error
  }
}

// 流式问答（如果API支持）
export const askQuestionStream = async (
  data: AskRequest,
  onChunk: (chunk: string) => void,
  onComplete: (response: AskResponse) => void,
  onError: (error: any) => void,
): Promise<void> => {
  try {
    const response = await fetch(`${apiClient.defaults.baseURL}/ask/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error("Response body is not readable")
    }

    let buffer = ""
    let fullResponse = ""

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6)
          if (data === "[DONE]") {
            onComplete({ answer: fullResponse })
            return
          }

          try {
            const parsed = JSON.parse(data)
            if (parsed.chunk) {
              fullResponse += parsed.chunk
              onChunk(parsed.chunk)
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } catch (error) {
    onError(error)
  }
}

// AI问答Hook
export function useAIChat() {
  const [messages, setMessages] = useState<ConversationHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string>()

  const sendMessage = useCallback(
    async (question: string, options?: Omit<AskRequest, "question">) => {
      try {
        setLoading(true)
        setError(null)

        // 添加用户消息
        const userMessage: ConversationHistory = {
          id: Date.now().toString(),
          question,
          answer: "",
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, userMessage])

        const response = await askQuestion({
          question,
          conversation_id: conversationId,
          ...options,
        })

        // 添加AI回复
        const aiMessage: ConversationHistory = {
          id: (Date.now() + 1).toString(),
          question: "",
          answer: response.answer,
          timestamp: new Date().toISOString(),
          sources: response.sources,
        }

        setMessages((prev) => [...prev, aiMessage])

        if (response.conversation_id) {
          setConversationId(response.conversation_id)
        }

        return response
      } catch (err: any) {
        setError(err.message || "发送消息失败")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [conversationId],
  )

  const sendMessageStream = useCallback(
    async (question: string, options?: Omit<AskRequest, "question">) => {
      try {
        setLoading(true)
        setError(null)

        // 添加用户消息
        const userMessage: ConversationHistory = {
          id: Date.now().toString(),
          question,
          answer: "",
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, userMessage])

        // 添加空的AI消息用于流式更新
        const aiMessageId = (Date.now() + 1).toString()
        const aiMessage: ConversationHistory = {
          id: aiMessageId,
          question: "",
          answer: "",
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, aiMessage])

        await askQuestionStream(
          {
            question,
            conversation_id: conversationId,
            ...options,
          },
          (chunk) => {
            // 更新AI消息内容
            setMessages((prev) =>
              prev.map((msg) => (msg.id === aiMessageId ? { ...msg, answer: msg.answer + chunk } : msg)),
            )
          },
          (response) => {
            // 流式完成
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId ? { ...msg, answer: response.answer, sources: response.sources } : msg,
              ),
            )
            setLoading(false)
          },
          (error) => {
            setError(error.message || "发送消息失败")
            setLoading(false)
          },
        )
      } catch (err: any) {
        setError(err.message || "发送消息失败")
        setLoading(false)
      }
    },
    [conversationId],
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setConversationId(undefined)
    setError(null)
  }, [])

  return {
    messages,
    loading,
    error,
    conversationId,
    sendMessage,
    sendMessageStream,
    clearMessages,
  }
}
