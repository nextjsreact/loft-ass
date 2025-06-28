import { NextResponse } from 'next/server'
import { sql, ensureSchema } from '@/lib/database'
import { hashPassword, verifyPassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    console.log('=== LOGIN DIAGNOSIS START ===')
    console.log('Email to diagnose:', email)
    
    // Ensure schema exists
    await ensureSchema()
    console.log('Schema ensured')
    
    // Check if user exists
    const users = await sql`
      SELECT id, email, full_name, role, password_hash, email_verified, created_at
      FROM users 
      WHERE email = ${email}
    `
    
    console.log('User query result:', users.length)
    
    if (users.length === 0) {
      return NextResponse.json({
        status: 'user_not_found',
        message: 'User does not exist in database',
        suggestion: 'Create the user first or check the email address'
      })
    }
    
    const user = users[0]
    console.log('User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasPasswordHash: !!user.password_hash,
      emailVerified: user.email_verified,
      createdAt: user.created_at
    })
    
    // Check password hash
    if (!user.password_hash) {
      console.log('No password hash found, creating one...')
      
      // Create password hash for 'password123'
      const hashedPassword = await hashPassword('password123')
      
      await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}, email_verified = true 
        WHERE id = ${user.id}
      `
      
      console.log('Password hash created and user updated')
      
      return NextResponse.json({
        status: 'password_created',
        message: 'Password hash was missing and has been created',
        user: {
          email: user.email,
          role: user.role,
          emailVerified: true
        },
        suggestion: 'Try logging in again with password: password123'
      })
    }
    
    // Test password verification
    try {
      const isValidPassword = await verifyPassword('password123', user.password_hash)
      console.log('Password verification test result:', isValidPassword)
      
      return NextResponse.json({
        status: 'diagnosis_complete',
        user: {
          email: user.email,
          role: user.role,
          emailVerified: user.email_verified,
          hasPasswordHash: true,
          passwordVerificationTest: isValidPassword
        },
        message: isValidPassword 
          ? 'User is properly configured and password verification works'
          : 'Password hash exists but verification failed',
        suggestion: isValidPassword 
          ? 'Login should work with password: password123'
          : 'Password hash may be corrupted, will recreate it'
      })
      
    } catch (verifyError) {
      console.error('Password verification error:', verifyError)
      
      // If verification fails, recreate the password hash
      const hashedPassword = await hashPassword('password123')
      
      await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}
        WHERE id = ${user.id}
      `
      
      return NextResponse.json({
        status: 'password_recreated',
        message: 'Password verification failed, hash has been recreated',
        suggestion: 'Try logging in again with password: password123'
      })
    }
    
  } catch (error: any) {
    console.error('Diagnosis error:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Diagnosis failed',
      details: error.message
    }, { status: 500 })
  }
}