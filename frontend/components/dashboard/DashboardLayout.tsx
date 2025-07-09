"use client"

import type React from "react"
import { useState } from "react"
import { DragDropProvider, SortableItem } from "@/components/dnd/DragDropProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  VulnerabilityBarChart,
  RiskDistributionPie,
  TrendChart,
  RealTimeChart,
} from "@/components/charts/SecurityChart"
import { GripVertical, Settings, Plus, X, BarChart3, PieChart, TrendingUp, Activity } from "lucide-react"

interface DashboardWidget {
  id: string
  type: "chart" | "metric" | "list" | "custom"
  title: string
  component: React.ComponentType<any>
  props?: any
  size: "small" | "medium" | "large"
  position: { x: number; y: number }
}

const defaultWidgets: DashboardWidget[] = [
  {
    id: "vulnerability-chart",
    type: "chart",
    title: "漏洞统计",
    component: VulnerabilityBarChart,
    size: "large",
    position: { x: 0, y: 0 },
    props: {
      data: [
        { name: "ERC-20", high: 2, medium: 5, low: 8, total: 15 },
        { name: "ERC-721", high: 1, medium: 3, low: 4, total: 8 },
        { name: "DeFi", high: 4, medium: 7, low: 12, total: 23 },
        { name: "DAO", high: 0, medium: 2, low: 3, total: 5 },
      ],
    },
  },
  {
    id: "risk-distribution",
    type: "chart",
    title: "风险分布",
    component: RiskDistributionPie,
    size: "medium",
    position: { x: 1, y: 0 },
    props: {
      data: [
        { name: "高风险", value: 7, color: "#EF4444" },
        { name: "中风险", value: 17, color: "#F59E0B" },
        { name: "低风险", value: 27, color: "#10B981" },
      ],
    },
  },
  {
    id: "trend-chart",
    type: "chart",
    title: "分析趋势",
    component: TrendChart,
    size: "large",
    position: { x: 0, y: 1 },
    props: {
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        analyses: Math.floor(Math.random() * 20) + 5,
        vulnerabilities: Math.floor(Math.random() * 15) + 2,
        resolved: Math.floor(Math.random() * 10) + 1,
      })),
    },
  },
  {
    id: "realtime-monitor",
    type: "chart",
    title: "实时监控",
    component: RealTimeChart,
    size: "medium",
    position: { x: 1, y: 1 },
    props: {
      data: Array.from({ length: 20 }, (_, i) => ({
        time: new Date(Date.now() - (19 - i) * 60000).toLocaleTimeString(),
        value: Math.floor(Math.random() * 100) + 20,
      })),
    },
  },
]

export const DashboardLayout: React.FC = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(defaultWidgets)
  const [editMode, setEditMode] = useState(false)

  const handleWidgetsChange = (newWidgets: DashboardWidget[]) => {
    setWidgets(newWidgets)
  }

  const removeWidget = (widgetId: string) => {
    setWidgets((prev) => prev.filter((widget) => widget.id !== widgetId))
  }

  const addWidget = (type: string) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: "custom",
      title: "新组件",
      component: Card,
      size: "medium",
      position: { x: 0, y: 0 },
    }
    setWidgets((prev) => [...prev, newWidget])
  }

  const getGridClass = (size: string) => {
    switch (size) {
      case "small":
        return "col-span-1 row-span-1"
      case "medium":
        return "col-span-1 row-span-1 md:col-span-2"
      case "large":
        return "col-span-1 row-span-2 md:col-span-2 lg:col-span-3"
      default:
        return "col-span-1 row-span-1"
    }
  }

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case "chart":
        return <BarChart3 className="w-4 h-4" />
      case "metric":
        return <Activity className="w-4 h-4" />
      case "list":
        return <PieChart className="w-4 h-4" />
      default:
        return <TrendingUp className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6">
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">仪表板</h1>
          <p className="text-gray-400">拖拽组件自定义您的工作区布局</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={editMode ? "default" : "outline"}
            onClick={() => setEditMode(!editMode)}
            className={
              editMode
                ? "bg-blue-600 hover:bg-blue-700"
                : "border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
            }
          >
            <Settings className="w-4 h-4 mr-2" />
            {editMode ? "完成编辑" : "编辑布局"}
          </Button>
          {editMode && (
            <Button onClick={() => addWidget("custom")} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              添加组件
            </Button>
          )}
        </div>
      </div>

      {/* 仪表板网格 */}
      <DragDropProvider items={widgets} onItemsChange={handleWidgetsChange}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-min">
          {widgets.map((widget) => {
            const Component = widget.component
            return (
              <SortableItem
                key={widget.id}
                id={widget.id}
                className={`${getGridClass(widget.size)} ${editMode ? "cursor-move" : ""}`}
              >
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50 h-full relative group">
                  {editMode && (
                    <div className="absolute top-2 right-2 z-10 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeWidget(widget.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <div className="cursor-move p-1">
                        <GripVertical className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center space-x-2 text-lg">
                      {getWidgetIcon(widget.type)}
                      <span>{widget.title}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                        {widget.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                        {widget.size}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <Component {...(widget.props || {})} />
                  </CardContent>
                </Card>
              </SortableItem>
            )
          })}
        </div>
      </DragDropProvider>

      {/* 编辑模式提示 */}
      {editMode && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="bg-blue-900/90 backdrop-blur-lg border-blue-500/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 text-blue-100">
                <GripVertical className="w-5 h-5" />
                <span className="text-sm">拖拽组件重新排列布局，点击 X 删除组件</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
