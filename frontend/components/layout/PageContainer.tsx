'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'
import Breadcrumb from './Breadcrumb'

interface PageContainerProps {
  children: ReactNode
  title?: string
  description?: string
  showBackButton?: boolean
  backHref?: string
  backLabel?: string
  showBreadcrumb?: boolean
  className?: string
}

export default function PageContainer({
  children,
  title,
  description,
  showBackButton = false,
  backHref = '/',
  backLabel = '返回首页',
  showBreadcrumb = true,
  className = ''
}: PageContainerProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ${className}`}>
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        {showBreadcrumb && <Breadcrumb />}

        {/* Page Header */}
        {(title || showBackButton) && (
          <div className="mb-8">
            {showBackButton && (
              <div className="mb-4">
                <Link href={backHref}>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {backLabel}
                  </Button>
                </Link>
              </div>
            )}

            {title && (
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
                {description && (
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto">{description}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Page Content */}
        {children}
      </main>
    </div>
  )
}
