'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  FileText, 
  MessageSquare, 
  History, 
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Upload,
  Bot,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

interface HealthStatus {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  services: {
    database: boolean
    ai_service: boolean
    vector_store: boolean
  }
}

export default function HomePage() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health')
        const data = await response.json()
        setHealthStatus(data)
      } catch (error) {
        console.error('Health check failed:', error)
        setHealthStatus({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          services: {
            database: false,
            ai_service: false,
            vector_store: false
          }
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      title: '智能合约分析',
      description: '上传Solidity文件进行安全分析',
      icon: Shield,
      href: '/analyze',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      buttonText: '开始分析'
    },
    {
      title: '批量报告上传',
      description: '上传Slither和Echidna分析报告',
      icon: Upload,
      href: '/batch-upload',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      buttonText: '批量上传'
    },
    {
      title: 'AI智能问答',
      description: '询问智能合约安全相关问题',
      icon: Bot,
      href: '/chat',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      buttonText: '开始问答'
    },
    {
      title: '分析历史记录',
      description: '查看历史分析记录和结果',
      icon: History,
      href: '/history',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      buttonText: '查看历史'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-white">RAG Audit System</h1>
            </div>
            
            {/* Health Status */}
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400 animate-spin" />
                  <span className="text-gray-400">检查中...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {healthStatus?.status === 'healthy' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <Badge 
                    variant={healthStatus?.status === 'healthy' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {healthStatus?.status === 'healthy' ? '在线' : '离线'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            智能合约安全
            <span className="text-gradient bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              分析平台
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            基于AI的智能合约安全分析系统，支持Slither和Echidna工具集成，
            提供全面的安全漏洞检测和智能问答服务
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="group bg-gray-800/50 backdrop-blur-lg border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer glass-effect">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 ${feature.color} ${feature.hoverColor} rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-white text-xl mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-gray-400 text-sm">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href={feature.href}>
                    <Button 
                      className={`w-full ${feature.color} ${feature.hoverColor} text-white font-medium transition-all duration-300 group-hover:shadow-lg`}
                    >
                      {feature.buttonText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50 glass-effect">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">实时监控</h3>
              <p className="text-gray-400">24/7系统健康监控</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50 glass-effect">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">安全优先</h3>
              <p className="text-gray-400">企业级安全保障</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50 glass-effect">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">持续改进</h3>
              <p className="text-gray-400">AI驱动的智能分析</p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-lg mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 RAG Audit System. All rights reserved.</p>
            <p className="mt-2 text-sm">
              系统状态: {healthStatus?.timestamp && new Date(healthStatus.timestamp).toLocaleString('zh-CN')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
