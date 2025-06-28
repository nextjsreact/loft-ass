import { NextResponse } from 'next/server'
import { sql } from '@/lib/database'

export async function GET() {
  try {
    // Test basic database connection
    const connectionTest = await sql`SELECT 1 as test, NOW() as current_time`
    
    // Check if users table exists and has data
    const usersCheck = await sql`
      SELECT COUNT(*) as user_count 
      FROM users 
      WHERE email IN ('admin@loftmanager.com', 'manager@loftmanager.com', 'member@loftmanager.com')
    `
    
    // Check if user_sessions table exists
    const sessionsCheck = await sql`
      SELECT COUNT(*) as session_count 
      FROM user_sessions 
      WHERE expires_at > NOW()
    `
    
    return NextResponse.json({
      status: 'success',
      database: {
        connected: true,
        serverTime: connectionTest[0].current_time
      },
      users: {
        demoUsersCount: parseInt(usersCheck[0].user_count),
        hasDemoUsers: parseInt(usersCheck[0].user_count) > 0
      },
      sessions: {
        activeSessions: parseInt(sessionsCheck[0].session_count)
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: 'Database check failed',
      details: error.message
    }, { status: 500 })
  }
}