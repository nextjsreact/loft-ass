import { NextResponse } from 'next/server'
import { testDatabaseConnection, sql, ensureSchema } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Testing Neon database connection...')
    
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL environment variable is not set',
        details: 'Please check your .env file contains the correct DATABASE_URL'
      }, { status: 500 })
    }
    
    // Validate DATABASE_URL format
    if (!process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid DATABASE_URL format',
        details: 'Expected format: postgresql://username:password@host:port/database?sslmode=require'
      }, { status: 500 })
    }
    
    // Test basic connection
    const isConnected = await testDatabaseConnection()
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Database connection test failed',
        details: 'Unable to execute test query on Neon database'
      }, { status: 500 })
    }
    
    // Test schema initialization
    try {
      await ensureSchema()
    } catch (schemaError) {
      return NextResponse.json({
        success: false,
        error: 'Schema initialization failed',
        details: schemaError instanceof Error ? schemaError.message : 'Unknown schema error'
      }, { status: 500 })
    }
    
    // Test a more complex query
    const result = await sql`
      SELECT 
        NOW() as current_time, 
        version() as db_version,
        current_database() as database_name,
        current_user as current_user
    `
    
    // Test table existence
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    return NextResponse.json({
      success: true,
      message: 'Neon database connection successful',
      data: {
        current_time: result[0]?.current_time,
        database_name: result[0]?.database_name,
        current_user: result[0]?.current_user,
        db_version: result[0]?.db_version?.substring(0, 50) + '...',
        connection_host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown',
        tables_found: tableCheck.map(t => t.table_name),
        total_tables: tableCheck.length
      }
    })
    
  } catch (error) {
    console.error('❌ Database test error:', error)
    
    let errorDetails = 'Check server logs for more information'
    let troubleshooting: string[] = []
    
    if (error instanceof Error) {
      if (error.message.includes('fetch failed')) {
        errorDetails = 'Network connection to Neon failed'
        troubleshooting = [
          'Check if your Neon database is active',
          'Verify network connectivity',
          'Ensure DATABASE_URL is correct',
          'Check if Neon project is not suspended'
        ]
      } else if (error.message.includes('password authentication failed')) {
        errorDetails = 'Authentication failed'
        troubleshooting = [
          'Verify username and password in DATABASE_URL',
          'Check database user permissions',
          'Ensure password is URL-encoded if it contains special characters'
        ]
      } else if (error.message.includes('database') && error.message.includes('does not exist')) {
        errorDetails = 'Database does not exist'
        troubleshooting = [
          'Check database name in DATABASE_URL',
          'Verify database was created in Neon console',
          'Ensure you have access to the database'
        ]
      }
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: errorDetails,
      troubleshooting
    }, { status: 500 })
  }
}