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
  return sql;
}

export { sql }

let _schemaInitialized = false

export async function ensureSchema() {
  if (_schemaInitialized || typeof window !== 'undefined') return
  _schemaInitialized = true

  try {
    // Create user_role enum if it doesn't exist
    await sql`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('admin', 'manager', 'member');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

    // Create task_status enum if it doesn't exist
    await sql`
      DO $$ BEGIN
        CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

    // Create loft_status enum if it doesn't exist
    await sql`
      DO $$ BEGIN
        CREATE TYPE loft_status AS ENUM ('available', 'occupied', 'maintenance');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

    // Create transaction_status enum if it doesn't exist
    await sql`
      DO $$ BEGIN
        CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        full_name TEXT,
        role user_role NOT NULL DEFAULT 'member',
        password_hash TEXT,
        email_verified BOOLEAN DEFAULT false,
        reset_token TEXT,
        reset_token_expires TIMESTAMPTZ,
        last_login TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `

    // Create user_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    // Create teams table
    await sql`
      CREATE TABLE IF NOT EXISTS teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `

    // Create team_members table
    await sql`
      CREATE TABLE IF NOT EXISTS team_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'member',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(team_id, user_id)
      )
    `

    // Create loft_owners table
    await sql`
      CREATE TABLE IF NOT EXISTS loft_owners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        ownership_type TEXT NOT NULL DEFAULT 'third_party',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `

    // Create lofts table
    await sql`
      CREATE TABLE IF NOT EXISTS lofts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        address TEXT NOT NULL,
        price_per_month DECIMAL NOT NULL,
        status loft_status NOT NULL DEFAULT 'available',
        owner_id UUID REFERENCES loft_owners(id),
        company_percentage DECIMAL NOT NULL DEFAULT 0,
        owner_percentage DECIMAL NOT NULL DEFAULT 100,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `

    // Create tasks table
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        status task_status NOT NULL DEFAULT 'todo',
        due_date TIMESTAMPTZ,
        assigned_to UUID REFERENCES users(id),
        team_id UUID REFERENCES teams(id),
        loft_id UUID REFERENCES lofts(id),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `

    // Create transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        amount DECIMAL NOT NULL,
        description TEXT,
        transaction_type TEXT NOT NULL,
        status transaction_status NOT NULL DEFAULT 'pending',
        date TIMESTAMPTZ DEFAULT NOW(),
        category TEXT,
        task_id UUID REFERENCES tasks(id),
        loft_id UUID REFERENCES lofts(id),
        user_id UUID REFERENCES users(id),
        processed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `

    // Create categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token)`
    await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to)`
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks(team_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_loft_id ON tasks(loft_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_loft_id ON transactions(loft_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`

    console.log('Database schema initialized successfully')
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