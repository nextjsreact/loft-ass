import { NextResponse } from 'next/server'
import { sql, ensureSchema } from '@/lib/database'
import { hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
  const startTime = Date.now()
  const logs: string[] = []
  
  function log(message: string) {
    const timestamp = Date.now() - startTime
    const logEntry = `[${timestamp}ms] ${message}`
    logs.push(logEntry)
    console.log(logEntry)
  }

  try {
    log('Starting registration debug')
    
    const { email, password, fullName, role } = await request.json()
    log(`Received data: email=${email}, role=${role}, fullName=${fullName}`)

    // Test 1: Database connection
    log('Testing database connection...')
    const connectionTest = await sql`SELECT 1 as test`
    log(`Database connection: ${connectionTest[0]?.test === 1 ? 'SUCCESS' : 'FAILED'}`)

    // Test 2: Schema initialization
    log('Ensuring schema...')
    await ensureSchema()
    log('Schema ensured successfully')

    // Test 3: Check if user exists
    log('Checking if user exists...')
    const existingUsers = await sql`SELECT id FROM users WHERE email = ${email}`
    log(`Existing users found: ${existingUsers.length}`)

    if (existingUsers.length > 0) {
      log('User already exists - stopping here')
      return NextResponse.json({
        success: false,
        error: 'User already exists',
        logs,
        timing: `${Date.now() - startTime}ms`
      })
    }

    // Test 4: Password hashing
    log('Hashing password...')
    const passwordHash = await hashPassword(password)
    log(`Password hashed successfully (length: ${passwordHash.length})`)

    // Test 5: User creation
    log('Creating user in database...')
    const newUsers = await sql`
      INSERT INTO users (email, full_name, role, password_hash, email_verified)
      VALUES (${email}, ${fullName}, ${role}, ${passwordHash}, true)
      RETURNING id, email, full_name, role
    `
    log(`User created successfully: ${newUsers[0]?.id}`)

    // Test 6: Session creation simulation (without actual session)
    log('Registration process completed successfully')

    return NextResponse.json({
      success: true,
      message: 'Registration debug completed successfully',
      user: newUsers[0],
      logs,
      timing: `${Date.now() - startTime}ms`
    })

  } catch (error: any) {
    log(`ERROR: ${error.message}`)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      logs,
      timing: `${Date.now() - startTime}ms`,
      stack: error.stack
    }, { status: 500 })
  }
}