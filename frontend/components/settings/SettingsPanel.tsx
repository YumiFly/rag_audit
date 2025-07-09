"use client"

import type React from "react"
import { useState } from "react"
import { useSettingsStore, type Theme, type Language } from "@/lib/settings/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Settings,
  Palette,
  Bell,
  Zap,
  Monitor,
  Keyboard,
  Download,
  Upload,
  RotateCcw,
  Save,
  Globe,
  Moon,
  Sun,
  Laptop,
} from "lucide-react"

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, resetSettings, exportSettings, importSettings } = useSettingsStore()
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importText, setImportText] = useState("")
  const [shortcutEditing, setShortcutEditing] = useState<string | null>(null)

  const handleThemeChange = (theme: Theme) => {
    updateSettings({ theme })
  }

  const handleLanguageChange = (language: Language) => {
    updateSettings({ language })
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    })
  }

  const handleAnalysisChange = (key: string, value: any) => {
    updateSettings({
      analysis: {
        ...settings.analysis,
        [key]: value,
      },
    })
  }

  const handleInterfaceChange = (key: string, value: any) => {
    updateSettings({
      interface: {
        ...settings.interface,
        [key]: value,
      },
    })
  }

  const handleShortcutChange = (key: string, value: string) => {
    updateSettings({
      shortcuts: {
        ...settings.shortcuts,
        [key]: value,
      },
    })
    setShortcutEditing(null)
  }

  const handleAdvancedChange = (key: string, value: any) => {
    updateSettings({
      advanced: {
        ...settings.advanced,
        [key]: value,
      },
    })
  }

  const handleExportSettings = () => {
    const settingsJson = exportSettings()
    const blob = new Blob([settingsJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "rag-audit-settings.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportSettings = () => {
    if (importSettings(importText)) {
      setImportDialogOpen(false)
      setImportText("")
    }
  }

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Laptop,
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">设置</h1>
        <p className="text-gray-400">自定义您的使用体验</p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-gray-800/50 mb-8">
          <TabsTrigger value="appearance" className="text-gray-300 data-[state=active]:text-white">
            <Palette className="w-4 h-4 mr-2" />
            外观
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-gray-300 data-[state=active]:text-white">
            <Bell className="w-4 h-4 mr-2" />
            通知
          </TabsTrigger>
          <TabsTrigger value="analysis" className="text-gray-300 data-[state=active]:text-white">
            <Zap className="w-4 h-4 mr-2" />
            分析
          </TabsTrigger>
          <TabsTrigger value="interface" className="text-gray-300 data-[state=active]:text-white">
            <Monitor className="w-4 h-4 mr-2" />
            界面
          </TabsTrigger>
          <TabsTrigger value="shortcuts" className="text-gray-300 data-[state=active]:text-white">
            <Keyboard className="w-4 h-4 mr-2" />
            快捷键
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-gray-300 data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" />
            高级
          </TabsTrigger>
        </TabsList>

        {/* 外观设置 */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">主题设置</CardTitle>
              <CardDescription className="text-gray-400">选择您喜欢的界面主题</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white font-medium mb-3 block">主题模式</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["light", "dark", "system"] as Theme[]).map((theme) => {
                    const Icon = themeIcons[theme]
                    return (
                      <Button
                        key={theme}
                        variant={settings.theme === theme ? "default" : "outline"}
                        onClick={() => handleThemeChange(theme)}
                        className="flex flex-col items-center space-y-2 h-auto py-4"
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm">
                          {theme === "light" && "浅色"}
                          {theme === "dark" && "深色"}
                          {theme === "system" && "跟随系统"}
                        </span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-white font-medium mb-3 block">语言设置</label>
                <Select value={settings.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="zh">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4" />
                        <span>中文</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="en">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4" />
                        <span>English</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white font-medium mb-3 block">字体大小</label>
                <Select value={settings.fontSize} onValueChange={(value: any) => updateSettings({ fontSize: value })}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="small">小</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="large">大</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">紧凑模式</label>
                  <p className="text-sm text-gray-400">减少界面元素间距</p>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateSettings({ compactMode: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">通知偏好</CardTitle>
              <CardDescription className="text-gray-400">管理各种通知的接收方式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-white font-medium">
                      {key === "desktop" && "桌面通知"}
                      {key === "email" && "邮件通知"}
                      {key === "push" && "推送通知"}
                      {key === "sound" && "声音提醒"}
                      {key === "analysisComplete" && "分析完成"}
                      {key === "systemAlerts" && "系统警告"}
                      {key === "securityWarnings" && "安全警告"}
                    </label>
                    <p className="text-sm text-gray-400">
                      {key === "desktop" && "在桌面显示通知"}
                      {key === "email" && "通过邮件接收通知"}
                      {key === "push" && "接收推送消息"}
                      {key === "sound" && "播放通知声音"}
                      {key === "analysisComplete" && "分析完成时通知"}
                      {key === "systemAlerts" && "系统状态变化通知"}
                      {key === "securityWarnings" && "安全相关警告"}
                    </p>
                  </div>
                  <Switch checked={value} onCheckedChange={(checked) => handleNotificationChange(key, checked)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 分析设置 */}
        <TabsContent value="analysis" className="space-y-6">
          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">分析偏好</CardTitle>
              <CardDescription className="text-gray-400">配置默认的分析参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white font-medium mb-3 block">默认分析工具</label>
                <div className="flex flex-wrap gap-2">
                  {["slither", "echidna", "mythril", "securify"].map((tool) => (
                    <Badge
                      key={tool}
                      variant={settings.analysis.defaultTools.includes(tool) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const newTools = settings.analysis.defaultTools.includes(tool)
                          ? settings.analysis.defaultTools.filter((t) => t !== tool)
                          : [...settings.analysis.defaultTools, tool]
                        handleAnalysisChange("defaultTools", newTools)
                      }}
                    >
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">自动开始分析</label>
                  <p className="text-sm text-gray-400">文件上传后自动开始分析</p>
                </div>
                <Switch
                  checked={settings.analysis.autoStart}
                  onCheckedChange={(checked) => handleAnalysisChange("autoStart", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">保存历史记录</label>
                  <p className="text-sm text-gray-400">保存分析历史记录</p>
                </div>
                <Switch
                  checked={settings.analysis.saveHistory}
                  onCheckedChange={(checked) => handleAnalysisChange("saveHistory", checked)}
                />
              </div>

              <div>
                <label className="text-white font-medium mb-3 block">
                  最大历史记录数: {settings.analysis.maxHistoryItems}
                </label>
                <Slider
                  value={[settings.analysis.maxHistoryItems]}
                  onValueChange={([value]) => handleAnalysisChange("maxHistoryItems", value)}
                  max={500}
                  min={10}
                  step={10}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 界面设置 */}
        <TabsContent value="interface" className="space-y-6">
          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">界面布局</CardTitle>
              <CardDescription className="text-gray-400">自定义界面显示选项</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.interface).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-white font-medium">
                      {key === "showSidebar" && "显示侧边栏"}
                      {key === "sidebarCollapsed" && "折叠侧边栏"}
                      {key === "showMinimap" && "显示小地图"}
                      {key === "showLineNumbers" && "显示行号"}
                      {key === "wordWrap" && "自动换行"}
                    </label>
                    <p className="text-sm text-gray-400">
                      {key === "showSidebar" && "在界面左侧显示导航栏"}
                      {key === "sidebarCollapsed" && "默认折叠侧边栏"}
                      {key === "showMinimap" && "在代码编辑器中显示小地图"}
                      {key === "showLineNumbers" && "在代码中显示行号"}
                      {key === "wordWrap" && "长行自动换行显示"}
                    </p>
                  </div>
                  <Switch checked={value} onCheckedChange={(checked) => handleInterfaceChange(key, checked)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 快捷键设置 */}
        <TabsContent value="shortcuts" className="space-y-6">
          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">键盘快捷键</CardTitle>
              <CardDescription className="text-gray-400">自定义键盘快捷键</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(settings.shortcuts).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <label className="text-white font-medium">
                      {key === "upload-file" && "上传文件"}
                      {key === "send-message" && "发送消息"}
                      {key === "show-help" && "显示帮助"}
                      {key === "close-modal" && "关闭弹窗"}
                      {key === "save-file" && "保存文件"}
                      {key === "search" && "搜索"}
                      {key === "new-analysis" && "新建分析"}
                      {key === "toggle-sidebar" && "切换侧边栏"}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    {shortcutEditing === key ? (
                      <Input
                        value={value}
                        onChange={(e) => handleShortcutChange(key, e.target.value)}
                        onBlur={() => setShortcutEditing(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setShortcutEditing(null)
                          }
                        }}
                        className="w-32 bg-gray-600 border-gray-500 text-white text-sm"
                        autoFocus
                      />
                    ) : (
                      <Badge
                        variant="outline"
                        className="cursor-pointer text-gray-300 border-gray-500"
                        onClick={() => setShortcutEditing(key)}
                      >
                        {value}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 高级设置 */}
        <TabsContent value="advanced" className="space-y-6">
          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">高级选项</CardTitle>
              <CardDescription className="text-gray-400">实验性功能和性能设置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">实验性功能</label>
                  <p className="text-sm text-gray-400">启用正在开发中的新功能</p>
                </div>
                <Switch
                  checked={settings.advanced.enableExperimentalFeatures}
                  onCheckedChange={(checked) => handleAdvancedChange("enableExperimentalFeatures", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">调试模式</label>
                  <p className="text-sm text-gray-400">显示详细的调试信息</p>
                </div>
                <Switch
                  checked={settings.advanced.debugMode}
                  onCheckedChange={(checked) => handleAdvancedChange("debugMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">性能模式</label>
                  <p className="text-sm text-gray-400">优化性能，减少动画效果</p>
                </div>
                <Switch
                  checked={settings.advanced.performanceMode}
                  onCheckedChange={(checked) => handleAdvancedChange("performanceMode", checked)}
                />
              </div>

              <div>
                <label className="text-white font-medium mb-3 block">缓存大小: {settings.advanced.cacheSize} MB</label>
                <Slider
                  value={[settings.advanced.cacheSize]}
                  onValueChange={([value]) => handleAdvancedChange("cacheSize", value)}
                  max={1000}
                  min={50}
                  step={50}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* 设置管理 */}
          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">设置管理</CardTitle>
              <CardDescription className="text-gray-400">导入、导出或重置设置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button onClick={handleExportSettings} variant="outline" className="flex-1 bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  导出设置
                </Button>
                <Button onClick={() => setImportDialogOpen(true)} variant="outline" className="flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  导入设置
                </Button>
                <Button onClick={resetSettings} variant="outline" className="flex-1 bg-transparent">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  重置设置
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 导入设置对话框 */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">导入设置</DialogTitle>
            <DialogDescription className="text-gray-400">粘贴设置JSON文件内容</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="粘贴设置JSON内容..."
              className="bg-gray-700/50 border-gray-600 text-white min-h-[200px]"
            />
            <div className="flex space-x-2">
              <Button onClick={handleImportSettings} disabled={!importText.trim()} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                导入
              </Button>
              <Button onClick={() => setImportDialogOpen(false)} variant="outline" className="flex-1">
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
