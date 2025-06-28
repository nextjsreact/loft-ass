import { NextResponse } from 'next/server'
import { testDatabaseConnection, sql } from '@/lib/database'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL environment variable is not set',
        details: 'Please check your .env file'
      }, { status: 500 })
    }
    
    // Test basic connection
    const isConnected = await testDatabaseConnection()
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Database connection test failed',
        details: 'Unable to execute test query'
      }, { status: 500 })
    }
    
    // Test a simple query
    const result = await sql`SELECT NOW() as current_time, version() as db_version`
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        current_time: result[0]?.current_time,
        db_version: result[0]?.db_version?.substring(0, 50) + '...',
        connection_string_format: process.env.DATABASE_URL?.substring(0, 20) + '...'
      }
    })
    
  } catch (error) {
    console.error('Database test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Check server logs for more information'
    }, { status: 500 })
  }
}