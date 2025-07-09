"use client"

import { useCallback } from "react"

import { useState } from "react"

import { apiClient } from "./client"

export interface AnalyzeRequest {
  file?: File
  address?: string
  contract_name?: string
}

export interface SlitherFinding {
  id: string
  title: string
  description: string
  severity: "high" | "medium" | "low"
  file: string
  line: number
  type: string
  impact: string
  confidence: string
}

export interface EchidnaFail {
  id: string
  property: string
  description: string
  counterexample: string
  gas_used?: number
}

export interface AnalyzeResponse {
  doc_id: string
  slither_findings: number
  echidna_fails: number
}

export interface AnalysisStatus {
  doc_id: string
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  message?: string
}

export const analyzeContract = async (data: AnalyzeRequest): Promise<AnalyzeResponse> => {
  try {
    const formData = new FormData()

    if (data.file) {
      formData.append("file", data.file)  // 注意：后端期望的参数名是 "file" 不是 "files"
    }

    if (data.address) {
      formData.append("address", data.address)
    }

    if (data.contract_name) {
      formData.append("contract_name", data.contract_name)
    }

    const response = await apiClient.post<AnalyzeResponse>("/analyze", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000, // 5分钟超时
    })

    return response.data
  } catch (error) {
    throw error
  }
}

export const getAnalysisStatus = async (docId: string): Promise<AnalysisStatus> => {
  try {
    const response = await apiClient.get<AnalysisStatus>(`/analyze/${docId}/status`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAnalysisResult = async (docId: string): Promise<AnalyzeResponse> => {
  try {
    const response = await apiClient.get<AnalyzeResponse>(`/analyze/${docId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const cancelAnalysis = async (docId: string): Promise<void> => {
  try {
    await apiClient.delete(`/analyze/${docId}`)
  } catch (error) {
    throw error
  }
}

// 分析Hook
export function useContractAnalysis() {
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const startAnalysis = useCallback(async (data: AnalyzeRequest) => {
    try {
      setLoading(true)
      setError(null)
      setProgress(0)

      const result = await analyzeContract(data)
      setAnalysis(result)

      // 如果分析还在进行中，开始轮询状态
      if (result.status === "pending" || result.status === "running") {
        pollAnalysisStatus(result.doc_id)
      }

      return result
    } catch (err: any) {
      setError(err.message || "分析失败")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const pollAnalysisStatus = useCallback(async (docId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await getAnalysisStatus(docId)
        setProgress(status.progress)

        if (status.status === "completed") {
          const result = await getAnalysisResult(docId)
          setAnalysis(result)
          clearInterval(pollInterval)
          setLoading(false)
        } else if (status.status === "failed") {
          setError(status.message || "分析失败")
          clearInterval(pollInterval)
          setLoading(false)
        }
      } catch (err: any) {
        setError(err.message || "获取分析状态失败")
        clearInterval(pollInterval)
        setLoading(false)
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [])

  const reset = useCallback(() => {
    setAnalysis(null)
    setError(null)
    setProgress(0)
    setLoading(false)
  }, [])

  return {
    analysis,
    loading,
    error,
    progress,
    startAnalysis,
    reset,
  }
}
