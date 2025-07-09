"use client"

import type React from "react"
import { useApiError } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"

export const ApiErrorDisplay: React.FC = () => {
  const { error, clearError } = useApiError()

  if (!error) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        <Button variant="ghost" size="sm" onClick={clearError} className="h-auto p-1">
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}
