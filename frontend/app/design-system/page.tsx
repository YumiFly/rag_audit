"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColorPalette } from "@/components/ui/design-system/ColorPalette"
import { TypographySystem } from "@/components/ui/design-system/TypographySystem"
import { SpacingSystem } from "@/components/ui/design-system/SpacingSystem"
import { AnimationShowcase } from "@/components/ui/design-system/AnimationShowcase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Palette, Type, AlignVerticalSpaceBetweenIcon as SpacingIcon, Zap, Smartphone, Eye } from "lucide-react"

export default function DesignSystemPage() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg")

  const breakpoints = [
    { name: "xs", size: "475px", class: "max-w-xs" },
    { name: "sm", size: "640px", class: "max-w-sm" },
    { name: "md", size: "768px", class: "max-w-md" },
    { name: "lg", size: "1024px", class: "max-w-lg" },
    { name: "xl", size: "1280px", class: "max-w-xl" },
    { name: "2xl", size: "1536px", class: "max-w-2xl" },
  ]

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container-responsive py-8">
        {/* 页面标题 */}
        <div className="mb-12 text-center">
          <h1 className="text-responsive-xl font-bold gradient-text mb-4">设计系统</h1>
          <p className="text-responsive-base text-gray-400 max-w-2xl mx-auto">
            现代化的UI设计系统，确保整个应用的视觉一致性和用户体验
          </p>
        </div>

        {/* 设计系统概览 */}
        <div className="grid-responsive-2 mb-12">
          <Card className="card card-hover">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Palette className="w-5 h-5 text-primary-400" />
                <span>颜色系统</span>
              </CardTitle>
              <CardDescription className="text-gray-400">基于蓝色主色调的现代化颜色方案</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-primary-500 rounded" />
                <div className="w-8 h-8 bg-success-500 rounded" />
                <div className="w-8 h-8 bg-warning-500 rounded" />
                <div className="w-8 h-8 bg-error-500 rounded" />
              </div>
            </CardContent>
          </Card>

          <Card className="card card-hover">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Type className="w-5 h-5 text-primary-400" />
                <span>字体系统</span>
              </CardTitle>
              <CardDescription className="text-gray-400">基于Inter字体的响应式字体系统</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-xs text-gray-400">12px - 48px</div>
                <div className="text-sm text-gray-300">响应式缩放</div>
                <div className="text-base text-white font-medium">现代化设计</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容 */}
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 bg-gray-800/50 mb-8">
            <TabsTrigger value="colors" className="text-gray-300 data-[state=active]:text-white">
              <Palette className="w-4 h-4 mr-2" />
              颜色
            </TabsTrigger>
            <TabsTrigger value="typography" className="text-gray-300 data-[state=active]:text-white">
              <Type className="w-4 h-4 mr-2" />
              字体
            </TabsTrigger>
            <TabsTrigger value="spacing" className="text-gray-300 data-[state=active]:text-white">
              <SpacingIcon className="w-4 h-4 mr-2" />
              间距
            </TabsTrigger>
            <TabsTrigger value="animations" className="text-gray-300 data-[state=active]:text-white">
              <Zap className="w-4 h-4 mr-2" />
              动画
            </TabsTrigger>
            <TabsTrigger value="responsive" className="text-gray-300 data-[state=active]:text-white">
              <Smartphone className="w-4 h-4 mr-2" />
              响应式
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="text-gray-300 data-[state=active]:text-white">
              <Eye className="w-4 h-4 mr-2" />
              可访问性
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="animate-fade-in">
            <ColorPalette />
          </TabsContent>

          <TabsContent value="typography" className="animate-fade-in">
            <TypographySystem />
          </TabsContent>

          <TabsContent value="spacing" className="animate-fade-in">
            <SpacingSystem />
          </TabsContent>

          <TabsContent value="animations" className="animate-fade-in">
            <AnimationShowcase />
          </TabsContent>

          <TabsContent value="responsive" className="animate-fade-in">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">响应式设计</h2>
                <p className="text-gray-400">移动端优先的响应式设计系统</p>
              </div>

              {/* 断点系统 */}
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">断点系统</CardTitle>
                  <CardDescription className="text-gray-400">基于内容的响应式断点</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {breakpoints.map((bp) => (
                      <div key={bp.name} className="p-4 bg-gray-700/30 rounded-lg text-center">
                        <div className="text-primary-400 font-mono text-lg">{bp.name}</div>
                        <div className="text-gray-300 text-sm">{bp.size}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 网格系统 */}
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">网格系统</CardTitle>
                  <CardDescription className="text-gray-400">灵活的响应式网格布局</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">自适应网格 (grid-responsive)</h4>
                    <div className="grid-responsive">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                        <div
                          key={item}
                          className="p-3 bg-primary-500/20 border border-primary-500/30 rounded text-center text-primary-400"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-3">两列网格 (grid-responsive-2)</h4>
                    <div className="grid-responsive-2">
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={item}
                          className="p-4 bg-success-500/20 border border-success-500/30 rounded text-center text-success-400"
                        >
                          Column {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 移动端导航 */}
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">移动端适配</CardTitle>
                  <CardDescription className="text-gray-400">移动端友好的界面设计</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <h4 className="text-white font-medium mb-2">移动端特性</h4>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>• 触摸友好的按钮大小 (最小44px)</li>
                      <li>• 安全区域适配 (safe-area-inset)</li>
                      <li>• 移动端导航菜单</li>
                      <li>• 手势支持</li>
                      <li>• 性能优化</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accessibility" className="animate-fade-in">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">可访问性</h2>
                <p className="text-gray-400">确保所有用户都能使用的无障碍设计</p>
              </div>

              {/* ARIA支持 */}
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">ARIA标签支持</CardTitle>
                  <CardDescription className="text-gray-400">语义化的HTML和ARIA属性</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button className="bg-primary-500 hover:bg-primary-600" aria-label="主要操作按钮" role="button">
                      带ARIA标签的按钮
                    </Button>

                    <div role="alert" className="p-3 bg-error-500/20 border border-error-500/30 rounded text-error-400">
                      这是一个警告消息 (role="alert")
                    </div>

                    <div
                      role="status"
                      className="p-3 bg-success-500/20 border border-success-500/30 rounded text-success-400"
                    >
                      操作成功完成 (role="status")
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 键盘导航 */}
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">键盘导航</CardTitle>
                  <CardDescription className="text-gray-400">完整的键盘操作支持</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="keyboard-navigation p-3 bg-gray-700/30 rounded">
                      <p className="text-white mb-2">使用Tab键导航到此区域</p>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
                          按钮1
                        </Button>
                        <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
                          按钮2
                        </Button>
                        <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
                          按钮3
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 高对比度模式 */}
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">高对比度支持</CardTitle>
                  <CardDescription className="text-gray-400">适配高对比度模式的设计</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button className="high-contrast bg-primary-500 hover:bg-primary-600">高对比度按钮</Button>
                    <div className="high-contrast card p-4">
                      <p className="text-white">高对比度卡片内容</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 屏幕阅读器 */}
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">屏幕阅读器友好</CardTitle>
                  <CardDescription className="text-gray-400">优化的屏幕阅读器体验</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <span className="sr-only">这是只有屏幕阅读器能读到的文本</span>
                      <p className="text-white">可见文本内容</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge className="badge-primary">状态</Badge>
                      <span className="sr-only">当前状态为活跃</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
