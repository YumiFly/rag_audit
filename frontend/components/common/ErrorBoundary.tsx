"use client"

import type React from "react"
import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // 调用错误回调
    this.props.onError?.(error, errorInfo)

    // 发送错误报告到监控服务
    this.reportError(error, errorInfo)
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // 这里可以集成错误监控服务，如 Sentry
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }

      console.error("Error Report:", errorReport)

      // 发送到错误监控服务
      // await fetch('/api/error-report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // })
    } catch (reportError) {
      console.error("Failed to report error:", reportError)
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  private handleGoHome = () => {
    window.location.href = "/"
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-600/20 rounded-full w-fit">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <CardTitle className="text-white text-2xl">出现了一些问题</CardTitle>
              <CardDescription className="text-gray-400">
                应用程序遇到了意外错误，我们已经记录了这个问题。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 错误信息 */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                  <Bug className="w-4 h-4" />
                  <span>错误详情</span>
                </h4>
                <div className="text-sm text-gray-300 space-y-2">
                  <div>
                    <span className="text-gray-400">错误信息:</span>
                    <div className="bg-red-900/20 border border-red-500/30 rounded p-2 mt-1">
                      <code className="text-red-300 text-xs">{this.state.error?.message}</code>
                    </div>
                  </div>
                  {process.env.NODE_ENV === "development" && this.state.error?.stack && (
                    <details className="mt-2">
                      <summary className="text-gray-400 cursor-pointer hover:text-white">
                        查看技术详情 (开发模式)
                      </summary>
                      <pre className="text-xs text-gray-500 mt-2 p-2 bg-gray-900/50 rounded overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重试
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新页面
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                >
                  <Home className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </div>

              {/* 帮助信息 */}
              <div className="text-center text-sm text-gray-400">
                <p>如果问题持续存在，请联系技术支持</p>
                <p className="mt-1">错误ID: {Date.now().toString(36)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// HOC 版本的错误边界
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
