"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const typographyScale = [
  { name: "text-xs", size: "12px", class: "text-xs", sample: "Extra Small Text" },
  { name: "text-sm", size: "14px", class: "text-sm", sample: "Small Text" },
  { name: "text-base", size: "16px", class: "text-base", sample: "Base Text" },
  { name: "text-lg", size: "18px", class: "text-lg", sample: "Large Text" },
  { name: "text-xl", size: "20px", class: "text-xl", sample: "Extra Large Text" },
  { name: "text-2xl", size: "24px", class: "text-2xl", sample: "2X Large Text" },
  { name: "text-3xl", size: "30px", class: "text-3xl", sample: "3X Large Text" },
  { name: "text-4xl", size: "36px", class: "text-4xl", sample: "4X Large Text" },
  { name: "text-5xl", size: "48px", class: "text-5xl", sample: "5X Large Text" },
]

const fontWeights = [
  { name: "font-thin", weight: "100", class: "font-thin" },
  { name: "font-light", weight: "300", class: "font-light" },
  { name: "font-normal", weight: "400", class: "font-normal" },
  { name: "font-medium", weight: "500", class: "font-medium" },
  { name: "font-semibold", weight: "600", class: "font-semibold" },
  { name: "font-bold", weight: "700", class: "font-bold" },
  { name: "font-extrabold", weight: "800", class: "font-extrabold" },
]

export const TypographySystem: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">字体系统</h2>
        <p className="text-gray-400">基于Inter字体的现代化字体系统</p>
      </div>

      {/* 字体族 */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">字体族</CardTitle>
          <CardDescription className="text-gray-400">系统使用的字体栈</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-white font-medium mb-2">Sans Serif (font-sans)</h4>
            <p className="font-sans text-gray-300">
              Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Monospace (font-mono)</h4>
            <p className="font-mono text-gray-300">JetBrains Mono, Fira Code, Monaco, Consolas, monospace</p>
          </div>
        </CardContent>
      </Card>

      {/* 字体大小 */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">字体大小</CardTitle>
          <CardDescription className="text-gray-400">响应式字体大小系统</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {typographyScale.map((item) => (
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-gray-700/50">
                <div className="flex items-center space-x-4">
                  <code className="text-primary-400 bg-gray-900/50 px-2 py-1 rounded text-sm">{item.name}</code>
                  <span className="text-gray-400 text-sm">{item.size}</span>
                </div>
                <div className={`text-white ${item.class}`}>{item.sample}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 字体粗细 */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">字体粗细</CardTitle>
          <CardDescription className="text-gray-400">不同的字体粗细选项</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fontWeights.map((item) => (
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-gray-700/50">
                <div className="flex items-center space-x-4">
                  <code className="text-primary-400 bg-gray-900/50 px-2 py-1 rounded text-sm">{item.name}</code>
                  <span className="text-gray-400 text-sm">{item.weight}</span>
                </div>
                <div className={`text-white text-lg ${item.class}`}>Sample Text</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 响应式文字 */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">响应式文字</CardTitle>
          <CardDescription className="text-gray-400">根据屏幕大小自动调整的文字大小</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-responsive-xl text-white">响应式超大标题</div>
          <div className="text-responsive-lg text-white">响应式大标题</div>
          <div className="text-responsive-base text-white">响应式正文</div>
          <div className="text-responsive-sm text-gray-300">响应式小文字</div>
        </CardContent>
      </Card>
    </div>
  )
}
