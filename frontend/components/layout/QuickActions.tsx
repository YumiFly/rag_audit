'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Plus, 
  Upload, 
  MessageSquare, 
  History, 
  Shield,
  X,
  ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuickAction {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  description: string
}

const quickActions: QuickAction[] = [
  {
    label: '分析合约',
    href: '/analyze',
    icon: Shield,
    color: 'bg-blue-600 hover:bg-blue-700',
    description: '上传Solidity文件进行安全分析'
  },
  {
    label: '批量上传',
    href: '/batch-upload',
    icon: Upload,
    color: 'bg-green-600 hover:bg-green-700',
    description: '批量上传分析报告'
  },
  {
    label: 'AI问答',
    href: '/chat',
    icon: MessageSquare,
    color: 'bg-purple-600 hover:bg-purple-700',
    description: '询问智能合约安全问题'
  },
  {
    label: '查看历史',
    href: '/history',
    icon: History,
    color: 'bg-orange-600 hover:bg-orange-700',
    description: '查看分析历史记录'
  }
]

export default function QuickActions() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // 过滤掉当前页面的快速操作
  const availableActions = quickActions.filter(action => action.href !== pathname)

  if (availableActions.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 快速操作列表 */}
      <div className={cn(
        "flex flex-col space-y-3 mb-4 transition-all duration-300 transform",
        isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2 pointer-events-none"
      )}>
        {availableActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.href} href={action.href}>
              <div className="group relative">
                <Button
                  className={cn(
                    "w-14 h-14 rounded-full shadow-lg transition-all duration-300",
                    action.color,
                    "hover:scale-110 hover:shadow-xl"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-6 h-6" />
                </Button>
                
                {/* 工具提示 */}
                <div className="absolute right-16 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs text-gray-300">{action.description}</div>
                    {/* 箭头 */}
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* 主按钮 */}
      <Button
        className={cn(
          "w-16 h-16 rounded-full shadow-lg transition-all duration-300",
          "bg-blue-600 hover:bg-blue-700 hover:scale-110 hover:shadow-xl",
          isOpen && "rotate-45"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </Button>

      {/* 背景遮罩 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
