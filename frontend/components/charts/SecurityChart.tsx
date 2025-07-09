"use client"

import type React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SecurityData {
  name: string
  high: number
  medium: number
  low: number
  total: number
}

interface TrendData {
  date: string
  analyses: number
  vulnerabilities: number
  resolved: number
}

interface RiskDistribution {
  name: string
  value: number
  color: string
}

const COLORS = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#10B981",
  primary: "#3B82F6",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
}

export const VulnerabilityBarChart: React.FC<{ data: SecurityData[] }> = ({ data }) => {
  return (
    <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white">漏洞统计</CardTitle>
        <CardDescription className="text-gray-400">按风险等级分类的漏洞数量</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#F9FAFB",
              }}
            />
            <Legend />
            <Bar dataKey="high" stackId="a" fill={COLORS.high} name="高风险" />
            <Bar dataKey="medium" stackId="a" fill={COLORS.medium} name="中风险" />
            <Bar dataKey="low" stackId="a" fill={COLORS.low} name="低风险" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export const RiskDistributionPie: React.FC<{ data: RiskDistribution[] }> = ({ data }) => {
  return (
    <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white">风险分布</CardTitle>
        <CardDescription className="text-gray-400">当前系统风险等级分布</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#F9FAFB",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export const TrendChart: React.FC<{ data: TrendData[] }> = ({ data }) => {
  return (
    <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white">分析趋势</CardTitle>
        <CardDescription className="text-gray-400">过去30天的分析和漏洞趋势</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#F9FAFB",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="analyses"
              stackId="1"
              stroke={COLORS.primary}
              fill={COLORS.primary}
              fillOpacity={0.6}
              name="分析次数"
            />
            <Area
              type="monotone"
              dataKey="vulnerabilities"
              stackId="2"
              stroke={COLORS.error}
              fill={COLORS.error}
              fillOpacity={0.6}
              name="发现漏洞"
            />
            <Area
              type="monotone"
              dataKey="resolved"
              stackId="3"
              stroke={COLORS.success}
              fill={COLORS.success}
              fillOpacity={0.6}
              name="已修复"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export const RealTimeChart: React.FC<{ data: Array<{ time: string; value: number }> }> = ({ data }) => {
  return (
    <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white">实时监控</CardTitle>
        <CardDescription className="text-gray-400">系统实时性能指标</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#F9FAFB",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={COLORS.primary}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: COLORS.primary }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
