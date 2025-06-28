import { NextResponse } from 'next/server'
import { testDatabaseConnection } from '@/lib/db-test'

export async function GET() {
  try {
    const result = await testDatabaseConnection()
    
    if (result.success) {
      return NextResponse.json({
        status: 'success',
        message: result.message,
        details: result.details
      }, { status: 200 })
    } else {
      return NextResponse.json({
        status: 'error',
        error: result.error,
        details: result.details,
        suggestions: result.suggestions
      }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: 'Failed to test database connection',
      details: error.message
    }, { status: 500 })
  }
}