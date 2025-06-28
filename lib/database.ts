import { neon } from "@neondatabase/serverless"

let sql: any = null

// Initialize database connection
if (typeof window === 'undefined') {
  try {
    const connectionString = process.env.DATABASE_URL
    
    if (!connectionString) {
      console.error('DATABASE_URL environment variable is missing')
      throw new Error('Database connection string not configured')
    }
    
    // Validate connection string format
    if (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://')) {
      console.error('Invalid DATABASE_URL format. Expected postgresql:// or postgres://')
      throw new Error('Invalid database connection string format')
    }
    
    console.log('Initializing database connection...')
    console.log('Connection string format:', connectionString.substring(0, 20) + '...')
    
    sql = neon(connectionString)
    console.log('Database connection initialized successfully')
    
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
  if (_schemaInitialized || typeof window !== 'undefined' || !sql) {
    return
  }
  
  _schemaInitialized = true

  try {
    console.log('Testing database connection...')
    
    // Test connection with a simple query first
    await sql`SELECT 1 as test`
    console.log('Database connection test successful')
    
    console.log('Ensuring database schema...')
    
    // Create user_role enum
    await sql`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('admin', 'manager', 'member');
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
        email_verified BOOLEAN DEFAULT true,
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

    // Create other essential tables
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

    await sql`
      CREATE TABLE IF NOT EXISTS lofts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        address TEXT NOT NULL,
        price_per_month DECIMAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'available',
        owner_id UUID REFERENCES loft_owners(id),
        company_percentage DECIMAL NOT NULL DEFAULT 0,
        owner_percentage DECIMAL NOT NULL DEFAULT 100,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `

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

    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'todo',
        due_date TIMESTAMPTZ,
        assigned_to UUID REFERENCES users(id),
        team_id UUID REFERENCES teams(id),
        loft_id UUID REFERENCES lofts(id),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        amount DECIMAL NOT NULL,
        description TEXT,
        transaction_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
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

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token)`
    await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`

    console.log('Database schema ensured successfully')
  } catch (error) {
    console.error('Schema initialization failed:', error)
    
    // Reset the flag so it can be retried
    _schemaInitialized = false
    
    // Provide more specific error information
    if (error instanceof Error) {
      if (error.message.includes('fetch failed')) {
        console.error('Network connection to database failed. Please check:')
        console.error('1. DATABASE_URL is correct in your .env file')
        console.error('2. Your Neon database is active and accessible')
        console.error('3. Network connectivity to neon.tech')
      }
    }
    
    throw error
  }
}

// Helper function to test database connectivity
export async function testDatabaseConnection(): Promise<boolean> {
  if (!sql) {
    console.error('Database not initialized')
    return false
  }
  
  try {
    await sql`SELECT 1 as test`
    console.log('Database connection test passed')
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
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