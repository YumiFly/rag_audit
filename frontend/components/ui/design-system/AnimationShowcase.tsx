"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Play } from "lucide-react"

export const AnimationShowcase: React.FC = () => {
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const triggerAnimation = (animationName: string) => {
    setActiveAnimation(animationName)
    setTimeout(() => setActiveAnimation(null), 2000)
  }

  const simulateProgress = () => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">动画效果</h2>
        <p className="text-gray-400">现代化的动画效果，提升用户体验</p>
      </div>

      {/* 页面切换动画 */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">页面切换动画</CardTitle>
          <CardDescription className="text-gray-400">平滑的页面过渡效果</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => triggerAnimation("fade-in")}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
            >
              淡入效果
            </Button>
            <Button
              onClick={() => triggerAnimation("slide-in-right")}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
            >
              右滑入
            </Button>
            <Button
              onClick={() => triggerAnimation("slide-in-up")}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
            >
              上滑入
            </Button>
            <Button
              onClick={() => triggerAnimation("bounce-gentle")}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
            >
              轻弹跳
            </Button>
          </div>

          <div className="h-32 bg-gray-900/50 rounded-lg flex items-center justify-center">
            <div
              className={`w-16 h-16 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold ${
                activeAnimation ? `animate-${activeAnimation}` : ""
              }`}
            >
              Demo
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 按钮动画 */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">按钮动画</CardTitle>
          <CardDescription className="text-gray-400">交互式按钮效果</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button className="bg-primary-500 hover:bg-primary-600 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-500/25">
              悬停缩放
            </Button>
            <Button className="bg-success-500 hover:bg-success-600 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              悬停上移
            </Button>
            <Button className="bg-warning-500 hover:bg-warning-600 text-white transition-all duration-300 hover:rotate-3">
              悬停旋转
            </Button>
            <Button className="bg-error-500 hover:bg-error-600 text-white animate-pulse-gentle">脉冲效果</Button>
          </div>
        </CardContent>
      </Card>

      {/* 加载动画 */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">加载动画</CardTitle>
          <CardDescription className="text-gray-400">各种加载状态指示器</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* 旋转加载 */}
            <div className="text-center space-y-2">
              <div className="loading-spinner w-8 h-8 text-primary-500 mx-auto" />
              <p className="text-sm text-gray-400">旋转加载</p>
            </div>

            {/* 点状加载 */}
            <div className="text-center space-y-2">
              <div className="loading-dots mx-auto">
                <div className="bg-primary-500" />
                <div className="bg-primary-500" />
                <div className="bg-primary-500" />
              </div>
              <p className="text-sm text-gray-400">点状加载</p>
            </div>

            {/* 脉冲加载 */}
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full animate-ping mx-auto" />
              <p className="text-sm text-gray-400">脉冲加载</p>
            </div>

            {/* 慢速旋转 */}
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin-slow mx-auto" />
              <p className="text-sm text-gray-400">慢速旋转</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 进度动画 */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">进度动画</CardTitle>
          <CardDescription className="text-gray-400">文件上传和处理进度</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">上传进度</span>
              <Button onClick={simulateProgress} size="sm" className="bg-primary-500 hover:bg-primary-600">
                <Play className="w-4 h-4 mr-1" />
                开始
              </Button>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="text-sm text-gray-400">{progress}% 完成</div>
          </div>

          {/* 不确定进度条 */}
          <div className="space-y-2">
            <span className="text-white">处理中...</span>
            <div className="progress-bar h-2">
              <div className="progress-fill w-1/3 animate-progress-indeterminate" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 通知动画 */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">通知动画</CardTitle>
          <CardDescription className="text-gray-400">消息通知的进入和退出动画</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="animate-toast-in p-4 bg-success-500/20 border border-success-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-500 rounded-full" />
                <span className="text-success-400">成功通知 - 滑入动画</span>
              </div>
            </div>

            <div className="animate-fade-in p-4 bg-primary-500/20 border border-primary-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                <span className="text-primary-400">信息通知 - 淡入动画</span>
              </div>
            </div>

            <div className="animate-slide-in-up p-4 bg-warning-500/20 border border-warning-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-warning-500 rounded-full" />
                <span className="text-warning-400">警告通知 - 上滑动画</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 微交互动画 */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">微交互动画</CardTitle>
          <CardDescription className="text-gray-400">细微的交互反馈动画</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Badge className="badge-primary hover:scale-110 transition-transform cursor-pointer">悬停缩放徽章</Badge>
            <Badge className="badge-success hover:animate-wiggle cursor-pointer">摇摆徽章</Badge>
            <Badge className="badge-warning hover:animate-bounce-gentle cursor-pointer">弹跳徽章</Badge>
            <Badge className="badge-error hover:shadow-glow-error transition-shadow cursor-pointer">发光徽章</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
