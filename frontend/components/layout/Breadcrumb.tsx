'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

const pathMap: Record<string, BreadcrumbItem> = {
  '/': { label: '首页', href: '/', icon: Home },
  '/analyze': { label: '智能合约分析', href: '/analyze' },
  '/batch-upload': { label: '批量报告上传', href: '/batch-upload' },
  '/chat': { label: 'AI智能问答', href: '/chat' },
  '/history': { label: '分析历史', href: '/history' },
}

export default function Breadcrumb() {
  const pathname = usePathname()
  
  // 生成面包屑路径
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []
    
    // 总是包含首页
    breadcrumbs.push(pathMap['/'])
    
    // 如果不在首页，添加当前页面
    if (pathname !== '/') {
      const currentPath = pathMap[pathname]
      if (currentPath) {
        breadcrumbs.push(currentPath)
      }
    }
    
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  if (breadcrumbs.length <= 1) {
    return null // 在首页不显示面包屑
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
      {breadcrumbs.map((item, index) => {
        const Icon = item.icon
        const isLast = index === breadcrumbs.length - 1
        
        return (
          <div key={item.href} className="flex items-center space-x-2">
            {index > 0 && <ChevronRight className="w-4 h-4" />}
            
            {isLast ? (
              <span className="flex items-center space-x-1 text-white font-medium">
                {Icon && <Icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </span>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center space-x-1 hover:text-white transition-colors",
                  "hover:underline"
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
