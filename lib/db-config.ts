// Server-side only configuration
if (typeof window === 'undefined') {
  if (!process.env.DATABASE_URL) {
    console.error('Server Error: DATABASE_URL is required in .env')
    console.log(`Looking for .env file at: ${process.cwd()}/.env`)
    throw new Error('Server configuration error - check server logs')
  }
}

export const dbConfig = {
  // Only expose connection string on server
  connectionString: typeof window === 'undefined' ? process.env.DATABASE_URL : '',
  maxConnections: 5,
  idleTimeoutMillis: 30000
}