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
    await ensureSchema()

    const users = await sql`
      SELECT id, email, full_name, role, password_hash, email_verified
      FROM users 
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return { success: false, error: "Invalid email or password" }
    }

    const user = users[0]

    if (!user.email_verified) {
      return { success: false, error: "Please verify your email address" }
    }

    if (!user.password_hash) {
      return { success: false, error: "Account not properly configured. Please contact support." }
    }

    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return { success: false, error: "Invalid email or password" }
    }

    const token = await createSession(user.id)

    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: "An error occurred during login" }
  }
}

export async function register(
  email: string,
  password: string,
  fullName: string,
  role = "member",
): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureSchema()

    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return { success: false, error: "User with this email already exists" }
    }

    const passwordHash = await hashPassword(password)

    const newUsers = await sql`
      INSERT INTO users (email, full_name, role, password_hash, email_verified)
      VALUES (${email}, ${fullName}, ${role}, ${passwordHash}, true)
      RETURNING id
    `

    const userId = newUsers[0].id
    const token = await createSession(userId)

    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: "An error occurred during registration" }
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
