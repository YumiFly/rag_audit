"use client"

import React, { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, CalendarIcon, X, SlidersHorizontal } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounce"

export interface SearchFilters {
  query: string
  severity: string[]
  dateRange: {
    from: Date | null
    to: Date | null
  }
  contractType: string[]
  status: string[]
  tags: string[]
}

export interface SearchResult {
  id: string
  title: string
  description: string
  severity: "high" | "medium" | "low"
  contractType: string
  status: string
  date: string
  tags: string[]
  score: number
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  onResultSelect: (result: SearchResult) => void
  results: SearchResult[]
  loading?: boolean
}

const severityOptions = [
  { value: "high", label: "高风险", color: "text-red-400 bg-red-900/20 border-red-500" },
  { value: "medium", label: "中风险", color: "text-orange-400 bg-orange-900/20 border-orange-500" },
  { value: "low", label: "低风险", color: "text-green-400 bg-green-900/20 border-green-500" },
]

const contractTypes = [
  { value: "erc20", label: "ERC-20 Token" },
  { value: "erc721", label: "ERC-721 NFT" },
  { value: "defi", label: "DeFi Protocol" },
  { value: "dao", label: "DAO Governance" },
  { value: "bridge", label: "Cross-chain Bridge" },
  { value: "other", label: "其他" },
]

const statusOptions = [
  { value: "pending", label: "待处理" },
  { value: "analyzing", label: "分析中" },
  { value: "completed", label: "已完成" },
  { value: "failed", label: "失败" },
]

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, onResultSelect, results, loading }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    severity: [],
    dateRange: { from: null, to: null },
    contractType: [],
    status: [],
    tags: [],
  })

  const [showFilters, setShowFilters] = useState(false)
  const [customTag, setCustomTag] = useState("")

  const debouncedQuery = useDebounce(filters.query, 300)

  // 当搜索条件变化时触发搜索
  React.useEffect(() => {
    onSearch(filters)
  }, [debouncedQuery, filters.severity, filters.dateRange, filters.contractType, filters.status, filters.tags])

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const toggleArrayFilter = useCallback((key: keyof SearchFilters, value: string) => {
    setFilters((prev) => {
      const currentArray = prev[key] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value]
      return { ...prev, [key]: newArray }
    })
  }, [])

  const addCustomTag = useCallback(() => {
    if (customTag.trim() && !filters.tags.includes(customTag.trim())) {
      updateFilter("tags", [...filters.tags, customTag.trim()])
      setCustomTag("")
    }
  }, [customTag, filters.tags, updateFilter])

  const removeTag = useCallback(
    (tag: string) => {
      updateFilter(
        "tags",
        filters.tags.filter((t) => t !== tag),
      )
    },
    [filters.tags, updateFilter],
  )

  const clearFilters = useCallback(() => {
    setFilters({
      query: "",
      severity: [],
      dateRange: { from: null, to: null },
      contractType: [],
      status: [],
      tags: [],
    })
  }, [])

  const hasActiveFilters = useMemo(() => {
    return (
      filters.query ||
      filters.severity.length > 0 ||
      filters.dateRange.from ||
      filters.dateRange.to ||
      filters.contractType.length > 0 ||
      filters.status.length > 0 ||
      filters.tags.length > 0
    )
  }, [filters])

  const highlightText = useCallback((text: string, query: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, "gi")
    return text.replace(regex, "<mark class='bg-yellow-400 text-black'>$1</mark>")
  }, [])

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={filters.query}
                onChange={(e) => updateFilter("query", e.target.value)}
                placeholder="搜索分析结果、合约名称、漏洞描述..."
                className="pl-10 bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent",
                showFilters && "bg-gray-700",
              )}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              筛选
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4 mr-2" />
                清空
              </Button>
            )}
          </div>

          {/* 活跃筛选器显示 */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filters.severity.map((severity) => {
                const option = severityOptions.find((opt) => opt.value === severity)
                return (
                  <Badge key={severity} variant="outline" className={option?.color}>
                    {option?.label}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => toggleArrayFilter("severity", severity)}
                    />
                  </Badge>
                )
              })}
              {filters.contractType.map((type) => {
                const option = contractTypes.find((opt) => opt.value === type)
                return (
                  <Badge key={type} variant="outline" className="text-blue-400 border-blue-500">
                    {option?.label}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => toggleArrayFilter("contractType", type)}
                    />
                  </Badge>
                )
              })}
              {filters.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-purple-400 border-purple-500">
                  {tag}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 高级筛选器 */}
      {showFilters && (
        <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50 animate-slide-in-down">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>高级筛选</span>
            </CardTitle>
            <CardDescription className="text-gray-400">使用多个条件精确筛选分析结果</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 风险等级 */}
            <div>
              <label className="text-white font-medium mb-3 block">风险等级</label>
              <div className="flex flex-wrap gap-2">
                {severityOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`severity-${option.value}`}
                      checked={filters.severity.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter("severity", option.value)}
                    />
                    <label htmlFor={`severity-${option.value}`} className="text-sm text-gray-300 cursor-pointer">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 合约类型 */}
            <div>
              <label className="text-white font-medium mb-3 block">合约类型</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {contractTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.value}`}
                      checked={filters.contractType.includes(type.value)}
                      onCheckedChange={() => toggleArrayFilter("contractType", type.value)}
                    />
                    <label htmlFor={`type-${type.value}`} className="text-sm text-gray-300 cursor-pointer">
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 状态 */}
            <div>
              <label className="text-white font-medium mb-3 block">分析状态</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={filters.status.includes(status.value)}
                      onCheckedChange={() => toggleArrayFilter("status", status.value)}
                    />
                    <label htmlFor={`status-${status.value}`} className="text-sm text-gray-300 cursor-pointer">
                      {status.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 日期范围 */}
            <div>
              <label className="text-white font-medium mb-3 block">日期范围</label>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent",
                        !filters.dateRange.from && "text-gray-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? format(filters.dateRange.from, "PPP") : "开始日期"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from || undefined}
                      onSelect={(date) => updateFilter("dateRange", { ...filters.dateRange, from: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent",
                        !filters.dateRange.to && "text-gray-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.to ? format(filters.dateRange.to, "PPP") : "结束日期"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to || undefined}
                      onSelect={(date) => updateFilter("dateRange", { ...filters.dateRange, to: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* 自定义标签 */}
            <div>
              <label className="text-white font-medium mb-3 block">标签</label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="添加自定义标签"
                  className="bg-gray-700/50 border-gray-600 text-white"
                  onKeyPress={(e) => e.key === "Enter" && addCustomTag()}
                />
                <Button onClick={addCustomTag} disabled={!customTag.trim()}>
                  添加
                </Button>
              </div>
              {filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs text-purple-400 border-purple-500">
                      {tag}
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 搜索结果 */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">搜索结果</CardTitle>
          <CardDescription className="text-gray-400">
            {loading ? "搜索中..." : `找到 ${results.length} 个结果`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>没有找到匹配的结果</p>
              <p className="text-sm mt-2">尝试调整搜索条件或筛选器</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => onResultSelect(result)}
                  className="p-4 bg-gray-700/30 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3
                      className="text-white font-medium"
                      dangerouslySetInnerHTML={{ __html: highlightText(result.title, filters.query) }}
                    />
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={severityOptions.find((opt) => opt.value === result.severity)?.color}
                      >
                        {severityOptions.find((opt) => opt.value === result.severity)?.label}
                      </Badge>
                      <span className="text-xs text-gray-400">{result.date}</span>
                    </div>
                  </div>
                  <p
                    className="text-gray-300 text-sm mb-2"
                    dangerouslySetInnerHTML={{ __html: highlightText(result.description, filters.query) }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {result.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs text-purple-400 border-purple-500">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">匹配度: {Math.round(result.score * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
