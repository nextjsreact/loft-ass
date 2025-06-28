import { NextResponse } from 'next/server'
import { sql, ensureSchema } from '@/lib/database'
import { hashPassword } from '@/lib/auth'

export async function POST() {
  try {
    await ensureSchema()
    
    // Check if demo users already exist
    const existingUsers = await sql`
      SELECT email FROM users 
      WHERE email IN ('admin@loftmanager.com', 'manager@loftmanager.com', 'member@loftmanager.com')
    `
    
    if (existingUsers.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Demo users already exist',
        users: existingUsers.map(u => u.email)
      })
    }

    // Hash the default password
    const hashedPassword = await hashPassword('password123')
    
    // Insert demo users
    await sql`
      INSERT INTO users (email, full_name, role, password_hash, email_verified) VALUES
      ('admin@loftmanager.com', 'System Admin', 'admin', ${hashedPassword}, true),
      ('manager@loftmanager.com', 'Property Manager', 'manager', ${hashedPassword}, true),
      ('member@loftmanager.com', 'Team Member', 'member', ${hashedPassword}, true)
    `
    
    return NextResponse.json({
      success: true,
      message: 'Demo users created successfully',
      users: [
        { email: 'admin@loftmanager.com', password: 'password123', role: 'admin' },
        { email: 'manager@loftmanager.com', password: 'password123', role: 'manager' },
        { email: 'member@loftmanager.com', password: 'password123', role: 'member' }
      ]
    })
    
  } catch (error: any) {
    console.error('Error creating demo users:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create demo users',
      details: error.message
    }, { status: 500 })
  }
}