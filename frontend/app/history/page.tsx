'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  History,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Bug,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import SimpleNavigation from '@/components/layout/SimpleNavigation'

interface AnalysisRecord {
  id: string
  contract_name: string
  file_name: string
  analysis_type: 'slither' | 'echidna' | 'both'
  status: 'completed' | 'failed' | 'running'
  created_at: string
  findings_count: {
    high: number
    medium: number
    low: number
    info: number
  }
  total_issues: number
}

export default function HistoryPage() {
  const [records, setRecords] = useState<AnalysisRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<AnalysisRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockData: AnalysisRecord[] = [
      {
        id: '1',
        contract_name: 'TokenContract',
        file_name: 'Token.sol',
        analysis_type: 'both',
        status: 'completed',
        created_at: '2024-01-15T10:30:00Z',
        findings_count: { high: 2, medium: 3, low: 5, info: 8 },
        total_issues: 18
      },
      {
        id: '2',
        contract_name: 'NFTMarketplace',
        file_name: 'Marketplace.sol',
        analysis_type: 'slither',
        status: 'completed',
        created_at: '2024-01-14T15:45:00Z',
        findings_count: { high: 1, medium: 2, low: 3, info: 4 },
        total_issues: 10
      },
      {
        id: '3',
        contract_name: 'DeFiProtocol',
        file_name: 'Protocol.sol',
        analysis_type: 'echidna',
        status: 'failed',
        created_at: '2024-01-13T09:15:00Z',
        findings_count: { high: 0, medium: 0, low: 0, info: 0 },
        total_issues: 0
      }
    ]
    
    setTimeout(() => {
      setRecords(mockData)
      setFilteredRecords(mockData)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filter records based on search and filters
  useEffect(() => {
    let filtered = records

    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.contract_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.file_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(record => record.analysis_type === typeFilter)
    }

    setFilteredRecords(filtered)
  }, [records, searchTerm, statusFilter, typeFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">已完成</Badge>
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">失败</Badge>
      case 'running':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">运行中</Badge>
      default:
        return <Badge variant="secondary">未知</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'slither':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Slither</Badge>
      case 'echidna':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Echidna</Badge>
      case 'both':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Both</Badge>
      default:
        return <Badge variant="secondary">未知</Badge>
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-orange-400'
      case 'low': return 'text-yellow-400'
      case 'info': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <SimpleNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">分析历史记录</h1>
          <p className="text-xl text-gray-300">查看历史分析记录和结果</p>
        </div>
        {/* Search and Filters */}
        <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>搜索和筛选</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="搜索合约名称或文件名..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="all">所有状态</option>
                  <option value="completed">已完成</option>
                  <option value="failed">失败</option>
                  <option value="running">运行中</option>
                </select>
              </div>
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="all">所有类型</option>
                  <option value="slither">Slither</option>
                  <option value="echidna">Echidna</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        {isLoading ? (
          <div className="text-center py-12">
            <Clock className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">加载历史记录中...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{record.contract_name}</h3>
                        <p className="text-gray-400 text-sm">{record.file_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(record.status)}
                      {getTypeBadge(record.analysis_type)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getSeverityColor('high')}`}>
                        {record.findings_count.high}
                      </div>
                      <div className="text-xs text-gray-400">高危</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getSeverityColor('medium')}`}>
                        {record.findings_count.medium}
                      </div>
                      <div className="text-xs text-gray-400">中危</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getSeverityColor('low')}`}>
                        {record.findings_count.low}
                      </div>
                      <div className="text-xs text-gray-400">低危</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getSeverityColor('info')}`}>
                        {record.findings_count.info}
                      </div>
                      <div className="text-xs text-gray-400">信息</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {record.total_issues}
                      </div>
                      <div className="text-xs text-gray-400">总计</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {new Date(record.created_at).toLocaleString('zh-CN')}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                        <Eye className="w-4 h-4 mr-1" />
                        查看详情
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                        <Download className="w-4 h-4 mr-1" />
                        下载报告
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredRecords.length === 0 && (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">没有找到匹配的记录</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
