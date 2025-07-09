"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"

export default function FileTestPage() {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("Files dropped:", acceptedFiles)
    alert(`选择了 ${acceptedFiles.length} 个文件`)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
    },
    multiple: true,
  })

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-8">文件上传测试</h1>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-300 mb-2">
          {isDragActive ? "放下文件开始上传" : "拖拽JSON文件到此处或点击选择"}
        </p>
        <p className="text-sm text-gray-500">支持多文件同时上传</p>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">调试信息</h2>
        <div className="bg-gray-800 p-4 rounded">
          <p>isDragActive: {isDragActive ? "true" : "false"}</p>
          <p>useDropzone loaded: {useDropzone ? "true" : "false"}</p>
        </div>
      </div>
    </div>
  )
}
