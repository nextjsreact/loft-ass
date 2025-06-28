"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sql, ensureSchema, type User } from "./database"
import { randomBytes } from "crypto"

export interface AuthSession {
  user: User
  token: string
}

function generateSessionToken(): string {
  return randomBytes(32).toString("hex")
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs")
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const bcrypt = await import("bcryptjs")
  return bcrypt.compare(password, hashedPassword)
}

async function createSession(userId: string): Promise<string> {
  await ensureSchema()
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await sql`
    INSERT INTO user_sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt})
  `

  await sql`
    UPDATE users SET last_login = NOW() WHERE id = ${userId}
  `

  return token
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    await ensureSchema()
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    const result = await sql`
      SELECT u.id, u.email, u.full_name, u.role, u.created_at, u.updated_at
      FROM users u
      JOIN user_sessions s ON u.id = s.user_id
      WHERE s.token = ${token} 
      AND s.expires_at > NOW()
    `

    if (result.length === 0) {
      await sql`DELETE FROM user_sessions WHERE token = ${token}`
      return null
    }

    return { user: result[0] as User, token }
  } catch (error) {
    console.error('Session retrieval error:', error)
    return null
  }
}

async function deleteSession(token: string) {
  try {
    await ensureSchema()
    await sql`DELETE FROM user_sessions WHERE token = ${token}`
    const cookieStore = await cookies()
    cookieStore.delete("auth-token")
  } catch (error) {
    // Silent fail
  }
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session
}

export async function requireRole(allowedRoles: string[]): Promise<AuthSession> {
  const session = await requireAuth()
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized")
  }
  return session
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Login attempt for:', email)
    await ensureSchema()

    // First, let's check if the user exists
    const users = await sql`
      SELECT id, email, full_name, role, password_hash, email_verified
      FROM users 
      WHERE email = ${email}
    `

    console.log('User lookup result:', users.length > 0 ? 'User found' : 'User not found')

    if (users.length === 0) {
      return { success: false, error: "Invalid email or password" }
    }

    const user = users[0]
    console.log('User data:', { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      hasPassword: !!user.password_hash,
      emailVerified: user.email_verified 
    })

    // Check if user has a password hash
    if (!user.password_hash) {
      console.log('User has no password hash, creating one...')
      // If no password hash exists, create one with the default password
      const hashedPassword = await hashPassword('password123')
      await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}, email_verified = true 
        WHERE id = ${user.id}
      `
      user.password_hash = hashedPassword
      user.email_verified = true
      console.log('Password hash created for user')
    }

    if (!user.email_verified) {
      return { success: false, error: "Please verify your email address" }
    }

    console.log('Verifying password...')
    const isValidPassword = await verifyPassword(password, user.password_hash)
    console.log('Password verification result:', isValidPassword)
    
    if (!isValidPassword) {
      return { success: false, error: "Invalid email or password" }
    }

    console.log('Creating session...')
    const token = await createSession(user.id)
    console.log('Session created, setting cookie...')

    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    console.log('Login successful for:', email)
    return { success: true }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: "An error occurred during login" }
  }
}

export async function register(
  email: string,
  password: string,
  fullName: string,
  role = "member",
): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now()
  
  try {
    console.log(`[${Date.now() - startTime}ms] Registration attempt for:`, email, 'with role:', role)
    
    // Test database connection first
    console.log(`[${Date.now() - startTime}ms] Testing database connection...`)
    const connectionTest = await sql`SELECT 1 as test`
    if (!connectionTest || connectionTest[0]?.test !== 1) {
      throw new Error('Database connection failed')
    }
    console.log(`[${Date.now() - startTime}ms] Database connection verified`)
    
    // Ensure database schema exists
    console.log(`[${Date.now() - startTime}ms] Ensuring schema...`)
    await ensureSchema()
    console.log(`[${Date.now() - startTime}ms] Schema ensured`)

    // Check if user already exists
    console.log(`[${Date.now() - startTime}ms] Checking if user exists...`)
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `
    console.log(`[${Date.now() - startTime}ms] User existence check complete: ${existingUsers.length} found`)

    if (existingUsers.length > 0) {
      console.log(`[${Date.now() - startTime}ms] User already exists:`, email)
      return { success: false, error: "User with this email already exists" }
    }

    // Hash the password
    console.log(`[${Date.now() - startTime}ms] Hashing password...`)
    const passwordHash = await hashPassword(password)
    console.log(`[${Date.now() - startTime}ms] Password hashed successfully`)

    // Create the user
    console.log(`[${Date.now() - startTime}ms] Creating user in database...`)
    const newUsers = await sql`
      INSERT INTO users (email, full_name, role, password_hash, email_verified)
      VALUES (${email}, ${fullName}, ${role}, ${passwordHash}, true)
      RETURNING id, email, full_name, role
    `

    if (!newUsers || newUsers.length === 0) {
      console.error(`[${Date.now() - startTime}ms] Failed to create user - no result returned`)
      return { success: false, error: "Failed to create user account" }
    }

    const newUser = newUsers[0]
    console.log(`[${Date.now() - startTime}ms] User created successfully:`, { 
      id: newUser.id, 
      email: newUser.email, 
      role: newUser.role 
    })

    // Create session
    console.log(`[${Date.now() - startTime}ms] Creating session for new user...`)
    const token = await createSession(newUser.id)
    console.log(`[${Date.now() - startTime}ms] Session created successfully`)

    // Set cookie
    console.log(`[${Date.now() - startTime}ms] Setting authentication cookie...`)
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    console.log(`[${Date.now() - startTime}ms] Registration completed successfully for:`, email)
    return { success: true }
  } catch (error) {
    console.error(`[${Date.now() - startTime}ms] Registration error:`, error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        return { success: false, error: "User with this email already exists" }
      }
      if (error.message.includes('connection') || error.message.includes('fetch failed')) {
        return { success: false, error: "Database connection error. Please check your internet connection and try again." }
      }
      if (error.message.includes('timeout')) {
        return { success: false, error: "Request timed out. Please try again." }
      }
      if (error.message.includes('permission') || error.message.includes('authentication')) {
        return { success: false, error: "Database authentication error. Please contact support." }
      }
    }
    
    return { success: false, error: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (token) {
      await deleteSession(token)
    }
  } catch (error) {
    // Silent fail
  }

  redirect("/login")
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureSchema()

    const users = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return { success: true }
    }

    const resetToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await sql`
      UPDATE users 
      SET reset_token = ${resetToken}, reset_token_expires = ${expiresAt}
      WHERE email = ${email}
    `

    return { success: true }
  } catch (error) {
    return { success: false, error: "An error occurred" }
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureSchema()

    const users = await sql`
      SELECT id FROM users 
      WHERE reset_token = ${token} 
      AND reset_token_expires > NOW()
    `

    if (users.length === 0) {
      return { success: false, error: "Invalid or expired reset token" }
    }

    const passwordHash = await hashPassword(newPassword)

    await sql`
      UPDATE users 
      SET password_hash = ${passwordHash}, 
          reset_token = NULL, 
          reset_token_expires = NULL
      WHERE reset_token = ${token}
    `

    return { success: true }
  } catch (error) {
    return { success: false, error: "An error occurred" }
  }
}