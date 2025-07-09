"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const spacingScale = [
  { name: "0.5", value: "2px", class: "w-0.5 h-0.5" },
  { name: "1", value: "4px", class: "w-1 h-1" },
  { name: "2", value: "8px", class: "w-2 h-2" },
  { name: "3", value: "12px", class: "w-3 h-3" },
  { name: "4", value: "16px", class: "w-4 h-4" },
  { name: "5", value: "20px", class: "w-5 h-5" },
  { name: "6", value: "24px", class: "w-6 h-6" },
  { name: "8", value: "32px", class: "w-8 h-8" },
  { name: "10", value: "40px", class: "w-10 h-10" },
  { name: "12", value: "48px", class: "w-12 h-12" },
  { name: "16", value: "64px", class: "w-16 h-16" },
  { name: "20", value: "80px", class: "w-20 h-20" },
]

export const SpacingSystem: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">间距系统</h2>
        <p className="text-gray-400">基于8px网格的一致性间距系统</p>
      </div>

      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">间距标尺</CardTitle>
          <CardDescription className="text-gray-400">所有间距值都基于8px的倍数</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {spacingScale.map((item) => (
              <div key={item.name} className="flex items-center space-x-6">
                <div className="flex items-center space-x-4 w-32">
                  <code className="text-primary-400 bg-gray-900/50 px-2 py-1 rounded text-sm">{item.name}</code>
                  <span className="text-gray-400 text-sm">{item.value}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`bg-primary-500 ${item.class}`} />
                  <div className="text-gray-300 text-sm">
                    padding: {item.value} | margin: {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 组件间距示例 */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">组件间距示例</CardTitle>
          <CardDescription className="text-gray-400">常用的组件内边距和外边距</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 小间距 */}
          <div>
            <h4 className="text-white font-medium mb-3">小间距 (p-2, p-3, p-4)</h4>
            <div className="flex space-x-4">
              <div className="p-2 bg-primary-500/20 border border-primary-500/30 rounded">p-2 (8px)</div>
              <div className="p-3 bg-primary-500/20 border border-primary-500/30 rounded">p-3 (12px)</div>
              <div className="p-4 bg-primary-500/20 border border-primary-500/30 rounded">p-4 (16px)</div>
            </div>
          </div>

          {/* 中等间距 */}
          <div>
            <h4 className="text-white font-medium mb-3">中等间距 (p-6, p-8)</h4>
            <div className="flex space-x-4">
              <div className="p-6 bg-success-500/20 border border-success-500/30 rounded">p-6 (24px)</div>
              <div className="p-8 bg-success-500/20 border border-success-500/30 rounded">p-8 (32px)</div>
            </div>
          </div>

          {/* 大间距 */}
          <div>
            <h4 className="text-white font-medium mb-3">大间距 (p-12, p-16)</h4>
            <div className="flex space-x-4">
              <div className="p-12 bg-warning-500/20 border border-warning-500/30 rounded">p-12 (48px)</div>
              <div className="p-16 bg-warning-500/20 border border-warning-500/30 rounded">p-16 (64px)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 网格布局示例 */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">响应式网格布局</CardTitle>
          <CardDescription className="text-gray-400">基于间距系统的网格布局示例</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid-responsive">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="p-4 bg-gray-700/30 rounded-lg text-center text-white">
                Grid Item {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
