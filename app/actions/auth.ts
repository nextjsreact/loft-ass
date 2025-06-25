import { User, UserRole, Loft, LoftStatus, sql } from "@/lib/database"

export async function ensureAuthTables() {
  try {
    // First attempt to insert dummy data to check if tables exist
    const { error: userError } = await sql`
      INSERT INTO users (email, password_hash, full_name)
      VALUES ('dummy@example.com', 'dummy', 'Dummy')
      ON CONFLICT DO NOTHING
    `

    const { error: ownerError } = await sql`
      INSERT INTO loft_owners (name, email, ownership_type)
      VALUES ('Dummy Owner', 'owner@example.com', 'company')
      ON CONFLICT DO NOTHING
    `

    const { error: loftError } = await sql`
      INSERT INTO lofts (name, address, price_per_month, status)
      VALUES ('Sample Loft', '123 Main St', 1000, 'available')
      ON CONFLICT DO NOTHING
    `

    if (userError || ownerError) {
      // Check if errors indicate missing tables
      // Handle missing users table
      if (userError?.message?.includes?.('relation "users" does not exist')) {
        await sql`
          CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            role TEXT NOT NULL DEFAULT 'member',
            email_verified BOOLEAN DEFAULT false,
            reset_token TEXT,
            reset_token_expires TIMESTAMPTZ,
            last_login TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `
        console.log('Created users table')
      }

      // Handle missing loft_owners table  
      if (ownerError?.message?.includes?.('relation "loft_owners" does not exist')) {
        await sql`
          CREATE TABLE loft_owners (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            address TEXT,
            ownership_type TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `
        console.log('Created loft_owners table')
      }

      if (userError && !userError.message?.includes?.('relation "users" does not exist')) {
        throw userError
      }
      if (ownerError && !ownerError.message?.includes?.('relation "loft_owners" does not exist')) {
        throw ownerError
      }

      // Handle missing lofts table
      if (loftError?.message?.includes?.('relation "lofts" does not exist')) {
        await sql`
          CREATE TABLE lofts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT,
            address TEXT NOT NULL,
            price_per_month DECIMAL NOT NULL,
            status TEXT NOT NULL,
            owner_id UUID REFERENCES loft_owners(id),
            company_percentage DECIMAL NOT NULL,
            owner_percentage DECIMAL NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `
        console.log('Created lofts table')
      }

      if (loftError && !loftError.message?.includes?.('relation "lofts" does not exist')) {
        throw loftError
      }
    }
  } catch (error) {
    console.error('Error ensuring auth tables exist:', error)
    throw error
  }
}

export async function createUser(
  email: string,
  password_hash: string,
  full_name?: string,
  role: UserRole = 'member',
  owner_id?: string
) {
  await ensureAuthTables()
  
  try {
    const { data, error } = await sql`
      INSERT INTO users (email, password_hash, full_name, role, owner_id)
      VALUES (${email}, ${password_hash}, ${full_name}, ${role}, ${owner_id})
      RETURNING *
    `

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function getUserWithRelations(email: string) {
  try {
    const { data, error } = await sql`
      SELECT 
        u.*,
        o.name as owner_name,
        o.ownership_type as owner_type
      FROM users u
      LEFT JOIN loft_owners o ON u.owner_id = o.id
      WHERE u.email = ${email}
    `

    if (error) throw error
    const user = data?.[0] as (User & { owner_name?: string; owner_type?: string }) | undefined
    return user
  } catch (error) {
    console.error('Error getting user by email:', error)
    throw error
  }
}

export async function getUserLofts(userId: string) {
  try {
    const { data, error } = await sql`
      SELECT l.* 
      FROM lofts l
      JOIN users u ON l.owner_id = u.owner_id
      WHERE u.id = ${userId}
    `
    if (error) throw error
    return data as Loft[] | undefined
  } catch (error) {
    console.error('Error getting user lofts:', error)
    throw error
  }
}

export async function getOwnerLofts(ownerId: string) {
  try {
    const { data, error } = await sql`
      SELECT * FROM lofts WHERE owner_id = ${ownerId}
    `
    if (error) throw error
    return data as Loft[] | undefined
  } catch (error) {
    console.error('Error getting owner lofts:', error)
    throw error
  }
}
