"use client"

import { useCallback } from "react"

import { useState } from "react"

import { apiClient } from "./client"

export interface IngestResponse {
  message: string
  total_processed: number
  successful: number
  failed: number
  doc_ids: string[]
  errors?: Array<{
    file: string
    error: string
  }>
}

export interface IngestProgress {
  total: number
  processed: number
  current_file?: string
  status: "processing" | "completed" | "failed"
}

export interface BatchUploadOptions {
  onProgress?: (progress: IngestProgress) => void
  onFileComplete?: (fileName: string, success: boolean) => void
  maxConcurrent?: number
}

export const ingestFiles = async (files: File[], options?: BatchUploadOptions): Promise<IngestResponse> => {
  try {
    const formData = new FormData()

    files.forEach((file) => {
      formData.append("files", file)
    })

    const response = await apiClient.post<IngestResponse>("/ingest", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 600000, // 10分钟超时
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && options?.onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          options.onProgress({
            total: files.length,
            processed: Math.floor((progress / 100) * files.length),
            status: progress === 100 ? "completed" : "processing",
          })
        }
      },
    })

    return response.data
  } catch (error) {
    throw error
  }
}

export const ingestSingleFile = async (file: File): Promise<IngestResponse> => {
  return ingestFiles([file])
}

// 批量上传（支持并发控制）
export const ingestFilesBatch = async (files: File[], options: BatchUploadOptions = {}): Promise<IngestResponse[]> => {
  const { maxConcurrent = 3, onProgress, onFileComplete } = options
  const results: IngestResponse[] = []
  const errors: Array<{ file: string; error: string }> = []

  // 分批处理文件
  const batches: File[][] = []
  for (let i = 0; i < files.length; i += maxConcurrent) {
    batches.push(files.slice(i, i + maxConcurrent))
  }

  let processedCount = 0

  for (const batch of batches) {
    const batchPromises = batch.map(async (file) => {
      try {
        const result = await ingestSingleFile(file)
        onFileComplete?.(file.name, true)
        return result
      } catch (error: any) {
        errors.push({
          file: file.name,
          error: error.message || "上传失败",
        })
        onFileComplete?.(file.name, false)
        throw error
      } finally {
        processedCount++
        onProgress?.({
          total: files.length,
          processed: processedCount,
          current_file: file.name,
          status: processedCount === files.length ? "completed" : "processing",
        })
      }
    })

    try {
      const batchResults = await Promise.allSettled(batchPromises)
      batchResults.forEach((result) => {
        if (result.status === "fulfilled") {
          results.push(result.value)
        }
      })
    } catch (error) {
      console.error("Batch processing error:", error)
    }
  }

  return results
}

// 获取上传历史
export const getIngestHistory = async (): Promise<
  Array<{
    id: string
    filename: string
    upload_time: string
    status: string
    file_size: number
    doc_id?: string
  }>
> => {
  try {
    const response = await apiClient.get("/ingest/history")
    return response.data
  } catch (error) {
    throw error
  }
}

// 删除上传的文件
export const deleteIngestedFile = async (docId: string): Promise<void> => {
  try {
    await apiClient.delete(`/ingest/${docId}`)
  } catch (error) {
    throw error
  }
}

// 批量上传Hook
export function useBatchUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<IngestProgress | null>(null)
  const [results, setResults] = useState<IngestResponse[]>([])
  const [errors, setErrors] = useState<Array<{ file: string; error: string }>>([])

  const uploadFiles = useCallback(async (filesToUpload: File[], options?: BatchUploadOptions) => {
    try {
      setUploading(true)
      setProgress(null)
      setResults([])
      setErrors([])

      const uploadResults = await ingestFilesBatch(filesToUpload, {
        ...options,
        onProgress: (prog) => {
          setProgress(prog)
          options?.onProgress?.(prog)
        },
        onFileComplete: (fileName, success) => {
          if (!success) {
            setErrors((prev) => [...prev, { file: fileName, error: "上传失败" }])
          }
          options?.onFileComplete?.(fileName, success)
        },
      })

      setResults(uploadResults)
      return uploadResults
    } catch (error: any) {
      throw error
    } finally {
      setUploading(false)
    }
  }, [])

  const addFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearFiles = useCallback(() => {
    setFiles([])
    setResults([])
    setErrors([])
    setProgress(null)
  }, [])

  return {
    files,
    uploading,
    progress,
    results,
    errors,
    uploadFiles,
    addFiles,
    removeFile,
    clearFiles,
  }
}
