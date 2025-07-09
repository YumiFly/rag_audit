"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Menu,
  X,
  Home,
  Upload,
  MessageSquare,
  Settings,
  User,
  Shield,
  BarChart3,
  FileText,
  Bell,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useSecurity } from "@/hooks/useSecurity"
import { Permission, Role } from "@/lib/security/accessControl"

interface NavigationItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  permission?: Permission
  badge?: number
  description?: string
}

const navigationItems: NavigationItem[] = [
  {
    id: "home",
    label: "首页",
    href: "/",
    icon: <Home className="w-5 h-5" />,
    description: "系统概览和快速访问",
  },
  {
    id: "analyze",
    label: "智能分析",
    href: "/analyze",
    icon: <Shield className="w-5 h-5" />,
    permission: Permission.ANALYZE,
    description: "上传合约进行安全分析",
  },
  {
    id: "chat",
    label: "智能问答",
    href: "/chat",
    icon: <MessageSquare className="w-5 h-5" />,
    permission: Permission.READ,
    description: "AI助手回答安全问题",
  },
  {
    id: "batch-upload",
    label: "批量上传",
    href: "/batch-upload",
    icon: <Upload className="w-5 h-5" />,
    permission: Permission.UPLOAD,
    description: "批量上传审计报告",
  },
  {
    id: "dashboard",
    label: "仪表板",
    href: "/dashboard",
    icon: <BarChart3 className="w-5 h-5" />,
    permission: Permission.READ,
    description: "数据可视化和统计",
  },
  {
    id: "api-test",
    label: "API测试",
    href: "/api-test",
    icon: <FileText className="w-5 h-5" />,
    permission: Permission.READ,
    description: "API接口测试工具",
  },
]

// 汉堡菜单组件
export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const pathname = usePathname()
  const { hasPermission, role, userId } = useSecurity()

  // 路径变化时关闭菜单
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // 过滤有权限的导航项
  const filteredItems = navigationItems.filter((item) => !item.permission || hasPermission(item.permission))

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  return (
    <>
      {/* 菜单按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMenu}
        className="relative p-2 text-white hover:bg-gray-700/50 md:hidden"
        aria-label="打开菜单"
      >
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.div>

        {notifications > 0 && !isOpen && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
          >
            {notifications > 9 ? "9+" : notifications}
          </Badge>
        )}
      </Button>

      {/* 遮罩层 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 侧边菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-80 bg-gray-900/95 backdrop-blur-lg border-r border-gray-700/50 z-50 md:hidden"
          >
            {/* 菜单头部 */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">RAG Audit</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* 用户信息 */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">{userId || "访客用户"}</div>
                  <div className="text-sm text-gray-400">
                    {role === Role.ADMIN
                      ? "管理员"
                      : role === Role.MODERATOR
                        ? "版主"
                        : role === Role.USER
                          ? "用户"
                          : "访客"}
                  </div>
                </div>
              </div>
            </div>

            {/* 导航列表 */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-1 px-4">
                {filteredItems.map((item, index) => {
                  const isActive = pathname === item.href

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg transition-colors group",
                          isActive
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                            : "text-gray-300 hover:bg-gray-700/50 hover:text-white",
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={cn(
                              "transition-colors",
                              isActive ? "text-blue-400" : "text-gray-400 group-hover:text-white",
                            )}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <div className="font-medium">{item.label}</div>
                            {item.description && <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {item.badge && item.badge > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>
            </div>

            {/* 菜单底部 */}
            <div className="p-4 border-t border-gray-700/50">
              <div className="space-y-2">
                <Link
                  href="/settings"
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-5 h-5" />
                  <span>设置</span>
                </Link>

                {notifications > 0 && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg text-gray-300">
                    <Bell className="w-5 h-5" />
                    <span>通知</span>
                    <Badge variant="destructive" className="ml-auto">
                      {notifications}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// 底部标签栏组件
export function BottomTabBar() {
  const pathname = usePathname()
  const { hasPermission } = useSecurity()

  // 主要导航项（显示在底部标签栏）
  const mainItems = navigationItems
    .filter(
      (item) =>
        ["home", "analyze", "chat", "dashboard"].includes(item.id) &&
        (!item.permission || hasPermission(item.permission)),
    )
    .slice(0, 4) // 最多显示4个

  // 如果没有足够的导航项，不显示底部标签栏
  if (mainItems.length < 2) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50 z-30 md:hidden">
      <div className="flex items-center justify-around py-2">
        {mainItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 min-w-0 flex-1 transition-colors",
                isActive ? "text-blue-400" : "text-gray-400",
              )}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn("p-2 rounded-lg transition-colors", isActive ? "bg-blue-600/20" : "hover:bg-gray-700/50")}
              >
                {item.icon}
              </motion.div>
              <span className="text-xs mt-1 truncate max-w-full">{item.label}</span>

              {item.badge && item.badge > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute top-1 right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                >
                  {item.badge > 9 ? "9+" : item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </div>

      {/* 安全区域适配 */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  )
}

// 移动端导航容器
export function MobileNavigation() {
  return (
    <>
      <HamburgerMenu />
      <BottomTabBar />
    </>
  )
}
