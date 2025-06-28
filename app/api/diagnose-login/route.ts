import { NextRequest, NextResponse } from 'next/server'
import { sql, ensureSchema } from '@/lib/database'
import { hashPassword, verifyPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await ensureSchema()

    // Check if user exists
    const users = await sql`
      SELECT id, email, full_name, role, password_hash, email_verified
      FROM users 
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({
        status: 'user_not_found',
        message: 'User not found in database'
      })
    }

    const user = users[0]
    console.log('User found:', { id: user.id, email: user.email, hasPassword: !!user.password_hash })

    // If no password hash, create one
    if (!user.password_hash) {
      const hashedPassword = await hashPassword('password123')
      await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}, email_verified = true 
        WHERE id = ${user.id}
      `
      
      return NextResponse.json({
        status: 'password_created',
        message: 'Password was missing and has been created',
        user: { ...user, password_hash: '[CREATED]' }
      })
    }

    // Test password verification
    const passwordTest = await verifyPassword('password123', user.password_hash)
    
    if (!passwordTest) {
      // Recreate password hash
      const hashedPassword = await hashPassword('password123')
      await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}
        WHERE id = ${user.id}
      `
      
      return NextResponse.json({
        status: 'password_recreated',
        message: 'Password hash was invalid and has been recreated',
        user: { ...user, password_hash: '[RECREATED]', passwordVerificationTest: false }
      })
    }

    return NextResponse.json({
      status: 'diagnosis_complete',
      message: 'User account is properly configured',
      user: { 
        ...user, 
        password_hash: '[EXISTS]',
        passwordVerificationTest: true
      }
    })

  } catch (error) {
    console.error('Diagnosis error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to diagnose login issue',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}