'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Shield,
  MessageSquare,
  History,
  Activity,
  TrendingUp,
  Upload,
  Bot,
  BarChart3,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import SimpleNavigation from '@/components/layout/SimpleNavigation'

export default function HomePage() {

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
      {/* Navigation */}
      <SimpleNavigation />

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
              <Link key={index} href={feature.href} className="group">
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer glass-effect h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
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
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      className={`w-full ${feature.color} ${feature.hoverColor} text-white font-medium transition-all duration-300 group-hover:shadow-lg`}
                    >
                      {feature.buttonText}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Quick Start Section */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-lg border-blue-500/30">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">快速开始</h3>
                <p className="text-gray-300">选择最适合您需求的分析方式</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">上传文件</h4>
                  <p className="text-gray-400 text-sm mb-4">直接上传.sol文件进行分析</p>
                  <Link href="/analyze">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      立即上传
                    </Button>
                  </Link>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">AI问答</h4>
                  <p className="text-gray-400 text-sm mb-4">询问智能合约安全问题</p>
                  <Link href="/chat">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      开始对话
                    </Button>
                  </Link>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">批量处理</h4>
                  <p className="text-gray-400 text-sm mb-4">上传多个报告文件</p>
                  <Link href="/batch-upload">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      批量上传
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">实时监控</h3>
              <p className="text-gray-400">24/7系统健康监控</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">安全优先</h3>
              <p className="text-gray-400">企业级安全保障</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
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
          </div>
        </div>
      </footer>
    </div>
  )
}
