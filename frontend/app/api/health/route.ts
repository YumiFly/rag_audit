import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock health check - in production this would check actual services
    const healthStatus = {
      status: 'healthy' as const,
      timestamp: new Date().toISOString(),
      services: {
        database: true,
        ai_service: true,
        vector_store: true
      }
    }

    return NextResponse.json(healthStatus)
  } catch (error) {
    console.error('Health check failed:', error)
    
    const healthStatus = {
      status: 'unhealthy' as const,
      timestamp: new Date().toISOString(),
      services: {
        database: false,
        ai_service: false,
        vector_store: false
      }
    }

    return NextResponse.json(healthStatus, { status: 500 })
  }
}
