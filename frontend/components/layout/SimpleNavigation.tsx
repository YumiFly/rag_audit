'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Shield, 
  Upload, 
  MessageSquare, 
  History, 
  Home,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navigationItems = [
  {
    name: '首页',
    href: '/',
    icon: Home,
    description: '系统概览和快速入口'
  },
  {
    name: '智能合约分析',
    href: '/analyze',
    icon: Shield,
    description: '上传Solidity文件进行安全分析'
  },
  {
    name: '批量报告上传',
    href: '/batch-upload',
    icon: Upload,
    description: '批量上传Slither和Echidna报告'
  },
  {
    name: 'AI智能问答',
    href: '/chat',
    icon: MessageSquare,
    description: '询问智能合约安全相关问题'
  },
  {
    name: '分析历史',
    href: '/history',
    icon: History,
    description: '查看历史分析记录和结果'
  }
]

export default function SimpleNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Shield className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold text-white">RAG Audit System</h1>
              <p className="text-xs text-gray-400 hidden sm:block">智能合约安全分析平台</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-blue-600 text-white shadow-lg" 
                      : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                  )}
                  title={item.description}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700/50 py-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200",
                      isActive 
                        ? "bg-blue-600 text-white" 
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.description}</div>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
