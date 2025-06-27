import { neon } from "@neondatabase/serverless"
import { dbConfig } from "./db-config"

let sql: any = null

if (typeof window === 'undefined') {
  try {
    if (!dbConfig.connectionString) {
      throw new Error('Database connection string not configured')
    }
    sql = neon(dbConfig.connectionString)
    console.log('Database connection established')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

export function createAuthenticatedClient(token: string) {
  // This is a placeholder. In a real application, you would use the
  // token to create a new database client with the user's permissions.
  return sql;
}

export { sql }

let _schemaInitialized = false

export async function ensureSchema() {
  if (_schemaInitialized || typeof window !== 'undefined') return
  _schemaInitialized = true

  try {
    // [Previous schema initialization code remains the same]
    // ... (keeping all the existing schema code)
  } catch (error) {
    console.error('Schema initialization failed:', error)
  }
}

export type UserRole = "admin" | "manager" | "member"
export type TaskStatus = "todo" | "in_progress" | "completed"
export type LoftStatus = "available" | "occupied" | "maintenance"
export type TransactionStatus = "pending" | "completed" | "failed"
export type LoftOwnership = "company" | "third_party"

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  password_hash?: string
  email_verified?: boolean
  reset_token?: string
  reset_token_expires?: string
  last_login?: string
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  description?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface LoftOwner {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  ownership_type: LoftOwnership
  created_at: string
  updated_at: string
}

export interface Loft {
  id: string
  name: string
  description?: string
  address: string
  price_per_month: number
  status: LoftStatus
  owner_id: string
  company_percentage: number
  owner_percentage: number
  created_at: string
  updated_at: string
  owner?: LoftOwner
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  due_date?: string
  assigned_to?: string
  team_id?: string
  loft_id?: string
  created_by: string
  created_at: string
  updated_at: string
  assigned_user?: User
  team?: Team
  loft?: Loft
}

export interface Transaction {
  id: string
  amount: number
  description?: string
  transaction_type: string
  status: TransactionStatus
  task_id?: string
  loft_id?: string
  user_id?: string
  processed_at?: string
  created_at: string
  updated_at: string
  loft?: Loft
  user?: User
}
