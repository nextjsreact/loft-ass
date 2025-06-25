import dotenv from 'dotenv'
import path from 'path'

// Server-side only configuration
if (typeof window === 'undefined') {
  const envPath = path.resolve(process.cwd(), '.env')
  dotenv.config({ path: envPath })

  if (!process.env.DATABASE_URL) {
    console.error('Server Error: DATABASE_URL is required in .env')
    console.log(`Looking for .env file at: ${envPath}`)
    throw new Error('Server configuration error - check server logs')
  }
}

export const dbConfig = {
  // Only expose connection string on server
  connectionString: typeof window === 'undefined' ? process.env.DATABASE_URL : '',
  maxConnections: 5,
  idleTimeoutMillis: 30000
}
