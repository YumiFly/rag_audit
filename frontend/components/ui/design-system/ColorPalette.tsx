"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const colorPalettes = {
  primary: {
    name: "主色调 - 蓝色系",
    colors: [
      { name: "primary-50", value: "#EFF6FF", hex: "#EFF6FF" },
      { name: "primary-100", value: "#DBEAFE", hex: "#DBEAFE" },
      { name: "primary-200", value: "#BFDBFE", hex: "#BFDBFE" },
      { name: "primary-300", value: "#93C5FD", hex: "#93C5FD" },
      { name: "primary-400", value: "#60A5FA", hex: "#60A5FA" },
      { name: "primary-500", value: "#3B82F6", hex: "#3B82F6", main: true },
      { name: "primary-600", value: "#2563EB", hex: "#2563EB" },
      { name: "primary-700", value: "#1D4ED8", hex: "#1D4ED8" },
      { name: "primary-800", value: "#1E40AF", hex: "#1E40AF" },
      { name: "primary-900", value: "#1E3A8A", hex: "#1E3A8A" },
    ],
  },
  background: {
    name: "背景色 - 深灰色系",
    colors: [
      { name: "background-primary", value: "#111827", hex: "#111827", main: true },
      { name: "background-secondary", value: "#1F2937", hex: "#1F2937", main: true },
      { name: "background-tertiary", value: "#374151", hex: "#374151", main: true },
    ],
  },
  text: {
    name: "文字颜色",
    colors: [
      { name: "text-primary", value: "#FFFFFF", hex: "#FFFFFF", main: true },
      { name: "text-secondary", value: "#F9FAFB", hex: "#F9FAFB", main: true },
      { name: "text-muted", value: "#9CA3AF", hex: "#9CA3AF", main: true },
    ],
  },
  status: {
    name: "状态颜色",
    colors: [
      { name: "success-500", value: "#22C55E", hex: "#22C55E", main: true },
      { name: "warning-500", value: "#F59E0B", hex: "#F59E0B", main: true },
      { name: "error-500", value: "#EF4444", hex: "#EF4444", main: true },
    ],
  },
}

export const ColorPalette: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">颜色系统</h2>
        <p className="text-gray-400">现代化的颜色方案，确保设计一致性和可访问性</p>
      </div>

      {Object.entries(colorPalettes).map(([key, palette]) => (
        <Card key={key} className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white">{palette.name}</CardTitle>
            <CardDescription className="text-gray-400">点击颜色块复制HEX值</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
              {palette.colors.map((color) => (
                <div key={color.name} className="space-y-2">
                  <div
                    className="w-full h-16 rounded-lg cursor-pointer transition-transform hover:scale-105 border border-gray-600"
                    style={{ backgroundColor: color.value }}
                    onClick={() => copyToClipboard(color.hex)}
                    title={`点击复制 ${color.hex}`}
                  />
                  <div className="text-center">
                    <div className="text-xs text-white font-medium">{color.name}</div>
                    <div className="text-xs text-gray-400">{color.hex}</div>
                    {color.main && <Badge className="mt-1 text-xs bg-primary-500/20 text-primary-400">主色</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
